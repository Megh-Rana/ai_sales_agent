"""
Calendly Booking Link Dispatch, Lead Tracking, and Automated 24-Hour Follow-Up Re-call Engine.
Supports free-tier Calendly integration with zero subscription requirements:
- Dispatches personalized Calendly link via Twilio SMS
- Smart redirect click tracking
- Webhook receiver (Calendly invitee.created)
- Automated 24-hour follow-up PSTN re-call (up to 3 attempts)
"""

import os
import re
import uuid
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.models.calendly_tracking import CalendlyTracking
from app.db.models.lead import Lead
from app.db.models.call import Call
from app.db.models.business import Business
from app.services.twilio_service import TwilioService
from app.services.telephony_service import TelephonyService
from app.core.logging import logger

DEFAULT_CALENDLY_URL = os.getenv("DEFAULT_CALENDLY_URL", "https://calendly.com/meghrana2007/30min")


def is_human_transfer_requested(text: str) -> bool:
    """
    Detects if lead requests to speak with a human agent, team member, or request booking link.
    Supports broad natural language variations, short voice bails, scheduling phrases, and regional languages.
    """
    if not text:
        return False
    lower = text.lower().strip()

    # 1. Clean punctuation for tokenized matching
    cleaned = re.sub(r"[^\w\s\u0900-\u097F\u0A80-\u0AFF\u0D80-\u0DFF]", " ", lower)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # 2. Short single-utterance direct bailout words
    short_bails = {
        "human", "human please", "a human", "a human please", "real person",
        "agent", "agent please", "live agent", "real agent", "representative",
        "representative please", "operator", "operator please", "transfer",
        "transfer please", "transfer call", "transfer the call", "transfer me", "connect me",
        "calendly", "calendly link", "booking link", "calendar link",
    }
    if cleaned in short_bails:
        return True

    # 3. Direct booking/scheduling link requests
    booking_patterns = [
        r"\b(send|text|email|give|share)\b.*\b(link|calendly|calendar|invite)\b",
        r"\b(calendly|booking|schedule|calendar)\s+link\b",
        r"\bbook\b.*\b(timeslot|time slot|slot|calendar|calendly)\b",
        r"\b(schedule|book)\b.*\b(with (a |the |your )?(team|human|person|rep|representative|executive|sales))\b",
    ]
    for p in booking_patterns:
        if re.search(p, cleaned):
            return True

    # 4. Transfer phrasing
    transfer_patterns = [
        r"\btransfer\b.*\b(call|me|to someone|to a human|to an agent|to your team)\b",
        r"\btransfer (the |this )?call\b",
    ]
    for p in transfer_patterns:
        if re.search(p, cleaned):
            return True

    # 5. Want to talk/speak/connect with human/person/agent/team
    talk_patterns = [
        # talk/speak/connect/transfer + human/person/someone/agent/rep/team/manager
        r"\b(talk|speak|connect|transfer|patch|put|reach|discuss|meet)\b.*\b(human|person|someone|somebody|agent|rep|representative|manager|team|executive|specialist|operator|real person|actual person|live person)\b",
        # inverted: person/human/someone + to talk/speak to (e.g. "actual person I can talk to")
        r"\b(human|person|someone|agent|representative|manager)\b.*\b(talk|speak)\b",
        # i want / can i / let me / please + human/person/agent/someone
        r"\b(want|like|need|can i|could i|let me|please|prefer|wish|have to)\b.*\b(human|real person|live person|live agent|representative|operator|someone else|your team)\b",
        # put me through / connect me / transfer me
        r"\b(put me through|transfer me|connect me|switch me|patch me)\b",
        # anti-bot phrases: not a bot / are you an ai / real person
        r"\b(not (an? )?(ai|bot|robot)|are you (an? )?(ai|bot|robot)|real person|actual human|stop (talking|bot|ai))\b",
    ]
    for p in talk_patterns:
        if re.search(p, cleaned):
            return True

    # 6. Regional languages (Hindi, Gujarati, Marathi)
    regional_keywords = [
        # Hindi
        "इंसान से बात", "किसी इंसान", "असली इंसान", "कॉल ट्रांसफर", "ट्रांसफर करो", "ट्रांसफर कर",
        "टीम से बात", "एजेंट से बात", "मैनेजर से बात", "किसी से बात", "बात कराओ", "बात करनी है",
        "कैलेंडर लिंक", "लिंक भेजो", "लिंक भेज", "रोबोट से बात नहीं", "क्या आप रोबोट",
        # Gujarati
        "માણસ સાથે વાત", "કોઈ વ્યક્તિ સાથે વાત", "કૉલ ટ્રાન્સફર", "ટીમ સાથે વાત", "મેનેજર સાથે વાત",
        "કોઈ સાથે વાત", "વાત કરાવો", "વાત કરવી છે", "લિંક મોકલો", "કેલેન્ડર લિંક",
        # Marathi
        "माणसाशी बोलायचे", "व्यक्तीशी बोलायचे", "कॉल ट्रान्सफर", "टीमशी बोलायचे", "मॅनेजरशी बोलायचे",
        "कोणाशी तरी बोलायचे", "बोलणे करून द्या", "लिंक पाठवा",
    ]
    if any(k in lower for k in regional_keywords):
        return True

    return False


class CalendlyService:
    @staticmethod
    def resolve_base_calendly_url(business: Optional[Business] = None) -> str:
        """Determines the active Calendly URL for the organization or default."""
        try:
            from dotenv import load_dotenv
            load_dotenv(override=False)
        except Exception:
            pass

        # 1. Check if business has a valid customized Calendly URL (not dummy placeholder)
        if business and business.calendly_url and "vidur-sales" not in business.calendly_url:
            return business.calendly_url.strip()

        # 2. Check environment variable
        env_url = os.getenv("DEFAULT_CALENDLY_URL", "").strip()
        if env_url and "vidur-sales" not in env_url:
            return env_url

        return "https://calendly.com/meghrana2007/30min"

    @staticmethod
    def build_direct_calendly_url(base_url: str, lead: Lead, tracking_id: UUID) -> str:
        """
        Appends pre-fill parameters and tracking metadata to a standard free-tier Calendly URL.
        Calendly supports: ?name=...&email=...&a1=...
        """
        params = {
            "name": lead.contact_name or "Valued Partner",
            "email": lead.contact_email or os.getenv("DEFAULT_DESTINATION_EMAIL", "meghrana2007@gmail.com"),
            "a1": str(tracking_id),
            "utm_source": "vidur_ai_voice_agent",
            "utm_campaign": "in_call_human_transfer",
            "utm_content": str(tracking_id),
        }
        # Filter out empty parameters
        filtered = {k: v for k, v in params.items() if v}
        query_string = urllib.parse.urlencode(filtered)
        separator = "&" if "?" in base_url else "?"
        return f"{base_url}{separator}{query_string}"

    @staticmethod
    def build_sms_message(lead: Lead, company_name: str, booking_url: str, language: str = "en") -> str:
        """Generates friendly, personalized SMS text containing the booking link."""
        name = lead.contact_name or "there"
        comp = company_name or "our team"
        lang = (language or "en").lower()

        if lang == "hi":
            return (
                f"नमस्ते {name}, {comp} की टीम के साथ अपनी पसंद का समय बुक करने के लिए "
                f"यहाँ क्लिक करें: {booking_url}"
            )
        elif lang == "gu":
            return (
                f"નમસ્તે {name}, {comp} ટીમ સાથે તમારી અનુકૂળતા મુજબ કૉલ શિડ્યુલ કરવા માટે "
                f"આ લિંક પર ક્લિક કરો: {booking_url}"
            )
        elif lang == "mr":
            return (
                f"नमस्कार {name}, {comp} टीमसोबत आपल्या सोयीनुसार कॉल बुक करण्यासाठी "
                f"या लिंकवर क्लिक करा: {booking_url}"
            )
        else:
            return (
                f"Hi {name}, here is the link to schedule a direct call with {comp} "
                f"at your convenience: {booking_url}"
            )

    @classmethod
    def dispatch_calendly_sms_and_track(
        cls,
        db: Session,
        lead_id: Any,
        call_id: Optional[Any] = None,
        language: str = "en",
        server_base_url: Optional[str] = None,
        followup_hours: float = 24.0,
        contact_phone: Optional[str] = None,
        contact_email: Optional[str] = None,
        contact_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Dispatches SMS with the Calendly link to lead and creates CalendlyTracking record.
        """
        default_phone = os.getenv("DEFAULT_DESTINATION_PHONE", "+918320441189")
        default_email = os.getenv("DEFAULT_DESTINATION_EMAIL", "meghrana2007@gmail.com")

        lead = None
        if lead_id:
            try:
                lead_uuid = uuid.UUID(str(lead_id))
                lead = db.scalars(select(Lead).where(Lead.id == lead_uuid)).first()
            except (ValueError, TypeError):
                lead = None

        if not lead:
            # Fallback 1: Find the most recent lead in database
            lead = db.scalars(select(Lead).order_by(Lead.created_at.desc())).first()

        if not lead:
            # Fallback 2: Generate an ad-hoc lead record
            lead = Lead(
                id=uuid.uuid4(),
                company_name="Acme Logistics Solutions",
                contact_name=contact_name or "Megh Rana",
                contact_phone=default_phone,
                contact_email=default_email,
                status="contacted",
                preferred_language=language,
            )
            db.add(lead)
            db.flush()

        # Resolve phone: prioritized contact_phone -> lead phone -> default_phone
        raw_phone = contact_phone or (lead.contact_phone if lead else None) or default_phone
        if any(d in raw_phone for d in ("98765 43210", "9876543210", "555-0", "5550")):
            phone = default_phone
        else:
            phone = raw_phone

        # Resolve email: prioritized contact_email -> lead email -> default_email
        raw_email = contact_email or (lead.contact_email if lead else None) or default_email
        if any(d in raw_email for d in ("example.internal", "acmelogistics", "cloudscalesystems", "apexdynamics")):
            target_email = default_email
        else:
            target_email = raw_email

        if contact_name and lead and (not lead.contact_name or "Acme" in lead.contact_name):
            lead.contact_name = contact_name

        business = None
        if lead.business_id:
            business = db.scalars(select(Business).where(Business.id == lead.business_id)).first()

        tracking_id = uuid.uuid4()
        base_calendly = cls.resolve_base_calendly_url(business)
        target_calendly_url = cls.build_direct_calendly_url(base_calendly, lead, tracking_id)

        # Smart redirect tracking link if public server URL is known, else direct Calendly URL
        is_public_tunnel = False
        if server_base_url:
            clean = server_base_url.strip().lower()
            if clean.startswith("https://") and not any(h in clean for h in ("localhost", "127.0.0.1", "0.0.0.0", "app.vidur.in", "vidur.in")):
                is_public_tunnel = True

        if is_public_tunnel:
            clean_server = server_base_url.rstrip("/")
            dispatch_link = f"{clean_server}/api/calendly/b/{tracking_id}"
        else:
            dispatch_link = target_calendly_url

        company_name = business.name if business else "Vidur AI"
        sms_text = cls.build_sms_message(lead, company_name, dispatch_link, language=language)

        # Dispatch real Twilio SMS
        sms_res = TwilioService.send_sms(to_phone=phone, body=sms_text)
        logger.info(f"[Calendly Service] Sent SMS to {phone} (SID: {sms_res.get('sid')}): {dispatch_link}")

        # Dispatch Calendly Invite via Email
        target_email = (lead.contact_email if lead and lead.contact_email else None) or os.getenv("DEFAULT_DESTINATION_EMAIL", "meghrana2007@gmail.com")
        email_delivery_id = None
        email_mode = None
        if target_email:
            try:
                from app.services.email_service import email_service
                email_subject = f"Direct Calendar Booking Link: Connect with {company_name}"
                email_body = (
                    f"Hi {lead.contact_name or 'there'},\n\n"
                    f"Thank you for speaking with our team today regarding {company_name}.\n\n"
                    f"As requested during our call, here is the direct link to choose a preferred date and time to speak directly with our team:\n\n"
                    f"{dispatch_link}\n\n"
                    f"Feel free to pick any slot that fits your schedule, and our team will automatically receive your booking details.\n\n"
                    f"We look forward to connecting with you!\n\n"
                    f"Best regards,\n\n"
                    f"{company_name} Sales Team\n"
                    f"support@vidur.in | https://vidur.in"
                )
                pitch_snippet = f"Schedule direct 1-on-1 team discussion via Calendly: {dispatch_link}"
                email_res = email_service.send_pitch_email(
                    recipient_email=target_email,
                    company_name=company_name,
                    subject=email_subject,
                    body=email_body,
                    recipient_name=lead.contact_name or "Valued Partner",
                    pitch_snippet=pitch_snippet,
                    language=language,
                    lead_id=str(lead.id),
                )
                if email_res:
                    email_delivery_id = email_res.delivery_id
                    email_mode = email_res.mode
                    logger.info(f"[Calendly Service] Sent Calendar invite email to {target_email} (Delivery ID: {email_delivery_id}, Mode: {email_mode})")
            except Exception as e:
                logger.warning(f"[Calendly Service] Failed to dispatch Calendar invite email to {target_email}: {e}")

        # Parsed call UUID
        parsed_call_uuid = None
        if call_id:
            try:
                parsed_call_uuid = uuid.UUID(str(call_id))
            except Exception:
                pass

        followup_due_at = datetime.now(timezone.utc) + timedelta(hours=followup_hours)

        tracking = CalendlyTracking(
            id=tracking_id,
            lead_id=lead.id,
            call_id=parsed_call_uuid,
            phone_number=phone,
            calendly_url=target_calendly_url,
            sms_sid=sms_res.get("sid"),
            email=target_email,
            email_delivery_id=email_delivery_id,
            status="pending",
            link_clicked=False,
            followup_due_at=followup_due_at,
            retry_count=0,
            max_retries=3,
            notes=f"Link sent via SMS & Email: {sms_text[:60]}...",
        )
        db.add(tracking)

        # Update Call outcome if call exists
        if parsed_call_uuid:
            call = db.scalars(select(Call).where(Call.id == parsed_call_uuid)).first()
            if call:
                meta = dict(call.metadata_json or {})
                meta["calendly_tracking_id"] = str(tracking_id)
                meta["calendly_link"] = dispatch_link
                meta["calendly_sms_sent"] = True
                meta["calendly_email_sent"] = bool(email_delivery_id)
                meta["calendly_email_recipient"] = target_email
                call.metadata_json = meta
                call.outcome = "human_transfer_requested"
                from sqlalchemy.orm.attributes import flag_modified
                flag_modified(call, "metadata_json")

        db.commit()
        db.refresh(tracking)

        return {
            "success": True,
            "tracking_id": str(tracking.id),
            "lead_id": str(lead.id),
            "phone_number": phone,
            "email": target_email,
            "email_delivery_id": email_delivery_id,
            "email_mode": email_mode,
            "booking_url": dispatch_link,
            "target_calendly_url": target_calendly_url,
            "sms_sid": sms_res.get("sid"),
            "status": tracking.status,
            "followup_due_at": tracking.followup_due_at.isoformat(),
        }

    @classmethod
    def mark_as_booked(
        cls,
        db: Session,
        tracking_id: Optional[UUID] = None,
        lead_id: Optional[UUID] = None,
        email: Optional[str] = None,
        event_uri: Optional[str] = None,
        start_time: Optional[datetime] = None,
        notes: Optional[str] = None,
    ) -> Optional[CalendlyTracking]:
        """
        Marks tracking session as booked and updates lead status to 'meeting_booked' / 'converted'.
        Halts all future follow-up re-dials.
        """
        tracking = None
        if tracking_id:
            tracking = db.scalars(select(CalendlyTracking).where(CalendlyTracking.id == tracking_id)).first()

        if not tracking and lead_id:
            tracking = (
                db.scalars(
                    select(CalendlyTracking)
                    .where(CalendlyTracking.lead_id == lead_id, CalendlyTracking.status != "booked")
                    .order_by(CalendlyTracking.created_at.desc())
                )
                .first()
            )

        if not tracking and email:
            lead = db.scalars(select(Lead).where(Lead.contact_email == email.strip().lower())).first()
            if lead:
                tracking = (
                    db.scalars(
                        select(CalendlyTracking)
                        .where(CalendlyTracking.lead_id == lead.id, CalendlyTracking.status != "booked")
                        .order_by(CalendlyTracking.created_at.desc())
                    )
                    .first()
                )

        if not tracking:
            logger.warning(f"[Calendly Service] No pending tracking found for ID {tracking_id} or email {email}")
            return None

        tracking.status = "booked"
        tracking.booked_at = datetime.now(timezone.utc)
        tracking.scheduled_event_uri = event_uri
        tracking.event_start_time = start_time
        if notes:
            tracking.notes = f"{tracking.notes or ''}\n[Booking Confirmed]: {notes}".strip()

        # Update Lead status
        lead = db.scalars(select(Lead).where(Lead.id == tracking.lead_id)).first()
        if lead:
            lead.status = "meeting_booked"

        # Update linked call outcome if available
        if tracking.call_id:
            call = db.scalars(select(Call).where(Call.id == tracking.call_id)).first()
            if call:
                call.outcome = "meeting_booked"

        db.commit()
        db.refresh(tracking)
        logger.info(f"[Calendly Service] Tracking {tracking.id} marked as BOOKED for lead {tracking.lead_id}")
        return tracking

    @classmethod
    def record_link_clicked(cls, db: Session, tracking_id: UUID) -> Optional[CalendlyTracking]:
        """Records that the prospect opened the Calendly booking link."""
        tracking = db.scalars(select(CalendlyTracking).where(CalendlyTracking.id == tracking_id)).first()
        if tracking and not tracking.link_clicked:
            tracking.link_clicked = True
            tracking.link_clicked_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(tracking)
        return tracking

    @classmethod
    def trigger_recall(
        cls,
        db: Session,
        tracking_id: UUID,
        owner_id: Optional[UUID] = None,
        force: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes follow-up PSTN re-call if lead has not booked on Calendly.
        - Checks retry count (max 3)
        - Dials lead via TelephonyService with personalized re-call pitch
        - Increments retry_count and sets last_recalled_at
        """
        tracking = db.scalars(select(CalendlyTracking).where(CalendlyTracking.id == tracking_id)).first()
        if not tracking:
            raise ValueError(f"Calendly tracking {tracking_id} not found.")

        if tracking.status == "booked":
            return {
                "should_retry": False,
                "reason": "Lead already booked a meeting via Calendly.",
                "status": "booked",
            }

        if tracking.retry_count >= tracking.max_retries and not force:
            tracking.status = "expired"
            db.commit()
            return {
                "should_retry": False,
                "reason": f"Maximum retry limit of {tracking.max_retries} attempts reached.",
                "status": "expired",
                "retry_count": tracking.retry_count,
            }

        lead = db.scalars(select(Lead).where(Lead.id == tracking.lead_id)).first()
        target_phone = tracking.phone_number or (lead.contact_phone if lead else None) or os.getenv("DEFAULT_DESTINATION_PHONE", "+918320441189")

        business = None
        if lead.business_id:
            business = db.scalars(select(Business).where(Business.id == lead.business_id)).first()

        resolved_owner_id = owner_id or (business.owner_id if business else None)
        if not resolved_owner_id:
            first_business = db.scalars(select(Business)).first()
            resolved_owner_id = first_business.owner_id if first_business else uuid.uuid4()

        contact_name = lead.contact_name or "there"
        company_name = business.name if business else "Vidur AI"
        lang = (lead.preferred_language or "en").lower()

        # Tailored Follow-Up Pitch
        if lang == "hi":
            recall_pitch = (
                f"नमस्ते {contact_name}, मैं {company_name} से एलेक्स बात कर रहा हूँ। "
                f"मैंने पहले आपको हमारी टीम से बात करने के लिए कैलेंडर लिंक भेजा था, "
                f"पर शायद आपको समय नहीं मिल पाया। क्या मैं अभी आपके लिए स्लॉट बुक कर दूँ?"
            )
        elif lang == "gu":
            recall_pitch = (
                f"નમસ્તે {contact_name}, હું {company_name} તરફથી એલેક્સ વાત કરું છું. "
                f"મેં અગાઉ તમને કૅલેન્ડર લિંક મોકલી હતી, પણ કદાચ સમય ના મળ્યો. "
                f"શું હું અત્યારે જ તમારી વાત કરાવી આપું?"
            )
        elif lang == "mr":
            recall_pitch = (
                f"नमस्कार {contact_name}, मी {company_name} कडून अ‍ॅलेक्स बोलतोय. "
                f"मी आधी आपल्याला कॅलेंडर लिंक पाठवली होती. आपण आत्ता कॉल शेड्यूल करू इच्छिता का?"
            )
        else:
            recall_pitch = (
                f"Hi {contact_name}, Alex here following up from {company_name}. "
                f"I sent you a calendar link earlier to book a time with our team, but noticed "
                f"you haven't had a chance to pick a slot yet. Did that link reach you, "
                f"or would you like to set up a time right now?"
            )

        # Place the outbound follow-up call via TelephonyService
        call = TelephonyService.dial_outbound(
            db=db,
            lead_id=lead.id,
            owner_id=resolved_owner_id,
            to_phone=tracking.phone_number,
            language=lang,
            carrier="twilio",
            enable_amd=True,
            custom_pitch=recall_pitch,
        )

        tracking.retry_count += 1
        tracking.last_recalled_at = datetime.now(timezone.utc)
        tracking.recall_call_id = call.id
        tracking.status = "recalled"

        # Schedule next retry window if attempts remain
        if tracking.retry_count < tracking.max_retries:
            tracking.followup_due_at = datetime.now(timezone.utc) + timedelta(hours=24)
        else:
            tracking.status = "expired"

        db.commit()
        db.refresh(tracking)

        logger.info(
            f"[Calendly Recall] Dispatched re-call attempt {tracking.retry_count}/{tracking.max_retries} "
            f"for lead {lead.id} (Call ID: {call.id})"
        )

        return {
            "success": True,
            "tracking_id": str(tracking.id),
            "call_id": str(call.id),
            "retry_count": tracking.retry_count,
            "max_retries": tracking.max_retries,
            "status": tracking.status,
            "last_recalled_at": tracking.last_recalled_at.isoformat(),
            "pitch_used": recall_pitch,
        }

    @classmethod
    def check_and_process_due_recalls(cls, db: Session) -> List[Dict[str, Any]]:
        """
        Background worker method: finds all pending/recalled trackings whose 24-hour window
        has passed, and triggers the re-call automatically.
        """
        now = datetime.now(timezone.utc)
        due_trackings = db.scalars(
            select(CalendlyTracking).where(
                CalendlyTracking.status.in_(["pending", "recalled"]),
                CalendlyTracking.followup_due_at <= now,
                CalendlyTracking.retry_count < CalendlyTracking.max_retries,
            )
        ).all()

        results = []
        for t in due_trackings:
            try:
                res = cls.trigger_recall(db, t.id)
                results.append(res)
            except Exception as e:
                logger.error(f"[Calendly Worker] Error processing re-call for tracking {t.id}: {e}")
        return results
