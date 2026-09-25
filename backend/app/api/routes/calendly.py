"""
Calendly API Routes for Vidur AI Sales Agent:
- Smart redirect & click tracking (/api/calendly/b/{tracking_id})
- Calendly webhook receiver (/api/calendly/webhook)
- Active tracking management & simulation endpoints
"""

import uuid
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.db.models.calendly_tracking import CalendlyTracking
from app.db.models.lead import Lead
from app.services.calendly_service import CalendlyService
from app.services.twilio_service import TwilioService

logger = logging.getLogger("sales_platform.calendly_api")
router = APIRouter(prefix="/calendly", tags=["Calendly Tracking & Booking"])


class ManualDispatchCalendlyRequest(BaseModel):
    lead_id: UUID = Field(..., description="Lead ID to receive Calendly booking SMS")
    call_id: Optional[UUID] = Field(None, description="Optional associated Call ID")
    language: str = Field(default="en", description="Language for SMS text")


class SimulateBookingRequest(BaseModel):
    event_start_time: Optional[str] = Field(None, description="ISO timestamp of scheduled demo")
    notes: Optional[str] = Field(None, description="Booking notes or agenda")


@router.get("/b/{tracking_id}", summary="Smart Calendly Link Click & Redirect Handler")
def tracking_redirect(
    tracking_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Called when a prospect taps the link received in their SMS.
    Records link click in database and redirects immediately (307)
    to the organization's real free-tier Calendly booking page with pre-filled name/email.
    """
    tracking = CalendlyService.record_link_clicked(db, tracking_id)
    if not tracking:
        logger.warning(f"[Calendly Redirect] Tracking ID {tracking_id} not found. Fallback to default.")
        return RedirectResponse(url="https://calendly.com", status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    logger.info(f"[Calendly Redirect] Prospect clicked link for lead {tracking.lead_id}. Redirecting to {tracking.calendly_url}")
    return RedirectResponse(url=tracking.calendly_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.post("/webhook", summary="Calendly Native Webhook Receiver (invitee.created)")
async def calendly_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Receives real-time booking events from Calendly (e.g. invitee.created).
    Automatically matches the booking with the lead and halts all future follow-up re-dials.
    Works with both direct Calendly webhooks and free Zapier / Make webhooks.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    event_type = body.get("event") or body.get("event_type")
    payload = body.get("payload", {})

    logger.info(f"[Calendly Webhook] Received event: {event_type}")

    if event_type in ("invitee.created", "calendly.invitee_created", None):
        email = payload.get("email") or body.get("email")
        name = payload.get("name") or body.get("name")
        event_uri = payload.get("scheduled_event", {}).get("uri") or body.get("event_uri")
        start_time_raw = (
            payload.get("scheduled_event", {}).get("start_time")
            or body.get("start_time")
        )

        tracking_id_val = None
        # Check custom question answers or tracking params
        tracking_info = payload.get("tracking", {})
        tracking_slug = tracking_info.get("utm_content") or tracking_info.get("salesforce_uuid")
        if tracking_slug:
            try:
                tracking_id_val = uuid.UUID(str(tracking_slug))
            except Exception:
                pass

        if not tracking_id_val:
            questions_and_answers = payload.get("questions_and_answers", [])
            for q in questions_and_answers:
                ans = q.get("answer", "")
                try:
                    tracking_id_val = uuid.UUID(str(ans))
                    break
                except Exception:
                    pass

        start_dt = None
        if start_time_raw:
            try:
                start_dt = datetime.fromisoformat(start_time_raw.replace("Z", "+00:00"))
            except Exception:
                pass

        matched = CalendlyService.mark_as_booked(
            db=db,
            tracking_id=tracking_id_val,
            email=email,
            event_uri=event_uri,
            start_time=start_dt,
            notes=f"Booked by {name or 'Invitee'} ({email or 'no-email'}) via Calendly Webhook",
        )

        if matched:
            return {
                "status": "success",
                "message": f"Booking recorded for lead {matched.lead_id}",
                "tracking_id": str(matched.id),
            }
        else:
            return {
                "status": "received",
                "message": "Webhook processed, no matching pending tracking record found",
            }

    elif event_type in ("invitee.canceled", "calendly.invitee_canceled"):
        logger.info(f"[Calendly Webhook] Booking cancelled: {payload.get('email')}")
        return {"status": "success", "message": "Cancellation noted"}

    return {"status": "ignored", "event": event_type}


@router.get("/trackings", summary="List active Calendly booking tracking sessions")
def list_calendly_trackings(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (pending, booked, recalled, expired)"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Lists all active and historical Calendly tracking sessions for the dashboard."""
    query = select(CalendlyTracking).order_by(desc(CalendlyTracking.created_at))
    if status_filter:
        query = query.where(CalendlyTracking.status == status_filter.lower())

    trackings = db.scalars(query.limit(100)).all()

    results = []
    now = datetime.now(timezone.utc)
    for t in trackings:
        lead = db.scalars(select(Lead).where(Lead.id == t.lead_id)).first()

        # Calculate time remaining until 24-hour recall
        seconds_remaining = 0
        if t.status in ("pending", "recalled") and t.followup_due_at:
            due_at = t.followup_due_at
            if due_at.tzinfo is None:
                due_at = due_at.replace(tzinfo=timezone.utc)
            diff = (due_at - now).total_seconds()
            seconds_remaining = max(0, int(diff))

        results.append({
            "id": str(t.id),
            "lead_id": str(t.lead_id),
            "lead_name": lead.contact_name if lead else "Unknown",
            "company_name": lead.company_name if lead else "Unknown",
            "contact_email": t.email or (lead.contact_email if lead else None),
            "phone_number": t.phone_number,
            "calendly_url": t.calendly_url,
            "sms_sid": t.sms_sid,
            "email": t.email or (lead.contact_email if lead else None),
            "email_delivery_id": t.email_delivery_id,
            "status": t.status,
            "link_clicked": t.link_clicked,
            "link_clicked_at": t.link_clicked_at.isoformat() if t.link_clicked_at else None,
            "retry_count": t.retry_count,
            "max_retries": t.max_retries,
            "followup_due_at": t.followup_due_at.isoformat() if t.followup_due_at else None,
            "seconds_until_recall": seconds_remaining,
            "is_recall_due": seconds_remaining == 0 and t.status in ("pending", "recalled"),
            "booked_at": t.booked_at.isoformat() if t.booked_at else None,
            "event_start_time": t.event_start_time.isoformat() if t.event_start_time else None,
            "last_recalled_at": t.last_recalled_at.isoformat() if t.last_recalled_at else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })

    return {"items": results, "total": len(results)}


@router.post("/trackings/{tracking_id}/simulate-booking", summary="Simulate instant Calendly booking (Zero-cost testing)")
def simulate_booking(
    tracking_id: UUID,
    payload: Optional[SimulateBookingRequest] = None,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Zero-cost verification endpoint:
    Immediately marks the tracking session as booked, updates lead status,
    and halts all future follow-up re-dials. Allows complete end-to-end testing
    without having to wait for a real Calendly appointment.
    """
    tracking = db.scalars(select(CalendlyTracking).where(CalendlyTracking.id == tracking_id)).first()
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracking record not found")

    start_dt = None
    if payload and payload.event_start_time:
        try:
            start_dt = datetime.fromisoformat(payload.event_start_time.replace("Z", "+00:00"))
        except Exception:
            start_dt = datetime.now(timezone.utc)
    else:
        start_dt = datetime.now(timezone.utc)

    booked_tracking = CalendlyService.mark_as_booked(
        db=db,
        tracking_id=tracking_id,
        event_uri=f"https://calendly.com/simulated-event/{tracking_id}",
        start_time=start_dt,
        notes=payload.notes if payload else "Simulated via Dashboard Test Action",
    )

    return {
        "success": True,
        "message": f"Tracking {tracking_id} successfully marked as BOOKED",
        "status": booked_tracking.status if booked_tracking else "booked",
        "booked_at": booked_tracking.booked_at.isoformat() if booked_tracking else None,
    }


@router.post("/trackings/{tracking_id}/trigger-recall", summary="Trigger follow-up PSTN re-call immediately (Test re-dial)")
def trigger_recall_now(
    tracking_id: UUID,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Immediately triggers the follow-up PSTN re-call for unbooked leads
    without waiting for the 24-hour timeout window to elapse.
    """
    try:
        result = CalendlyService.trigger_recall(
            db=db,
            tracking_id=tracking_id,
            owner_id=current_user.id,
            force=True,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"[Calendly API] Failed to trigger recall: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/dispatch-sms", summary="Manually dispatch Calendly link SMS to a lead")
def manual_dispatch_calendly_sms(
    request: ManualDispatchCalendlyRequest,
    req: Request,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """Dispatches a Calendly booking link SMS to the lead on demand and starts tracking."""
    base_url = TwilioService.get_public_base_url(fallback_url=str(req.base_url))
    try:
        return CalendlyService.dispatch_calendly_sms_and_track(
            db=db,
            lead_id=request.lead_id,
            call_id=request.call_id,
            language=request.language,
            server_base_url=base_url,
            followup_hours=24.0,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
