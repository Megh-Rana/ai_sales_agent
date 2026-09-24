"""
Telephony API Routes for Vidur AI Sales Agent.
Bridges Twilio PSTN carrier trunking directly to YOUR OWN internal AI infrastructure:
- TTS: Sarvam Bulbul v3 / Edge-TTS (backend/tts/engine.py)
- LLM: Local Ollama Gemma 3 4B / Sarvam (backend/ai/brain.py)
- STT: Sarvam Saaras v3 / Faster-Whisper (backend/stt/engine.py)
- PSTN: Twilio is strictly the carrier pipe (dialer, media streaming & audio delivery)
"""

import os
import json
import uuid
import base64
import asyncio
import logging
from typing import Any, Dict, Optional, Tuple, Union
from uuid import UUID
from datetime import datetime, timezone

from pydantic import BaseModel, Field
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response, WebSocket, WebSocketDisconnect, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.db.models.call import Call
from app.db.models.lead import Lead
from app.schemas.call import CallResponse
from app.services.telephony_service import TelephonyService
from app.services.twilio_service import TwilioService
from app.services.call_service import CallService
from app.services.telephony_audio import (
    synthesize_speech_to_wav,
    get_audio_bytes,
    store_audio_bytes,
)
from app.services.twilio_service import VOICEMAIL_SCRIPTS
from ai.brain import AIBrain

logger = logging.getLogger("sales_platform.telephony_api")
router = APIRouter(prefix="/telephony", tags=["Telephony"])

# Active brain instances per call session for conversational memory
_CALL_BRAINS: Dict[str, AIBrain] = {}

# ── Async gather-response job store ───────────────────────────────────────────
# Maps job_id -> {"audio_url": str, "next_gather_url": str, "hangup": bool}
# Populated by the background task; polled by /twilio/gather-response/{job_id}
_GATHER_JOBS: Dict[str, Optional[Dict]] = {}

# Filler audio cache: { "lang:type" -> audio_id }
# "type" is "first" (longer, buys ~6s) or one of the short retry variants
_FILLER_CACHE: Dict[str, str] = {}
_FILLER_LOCK = asyncio.Lock()

# First-time fillers — longer phrases (~5-6s of audio) so LLM+TTS can finish
FILLER_FIRST: Dict[str, str] = {
    "en": "Great, let me look into that for you. Just a moment.",
    "hi": "बिल्कुल, मैं अभी देखता हूँ। एक पल।",
    "gu": "ચોક્કસ, હું જોઉં છું. એક ક્ષણ.",
    "mr": "नक्की, मी बघतो. एक क्षण.",
}

# Retry fillers — short natural-sounding thinking phrases, cycled through on polls
FILLER_RETRIES: Dict[str, list] = {
    "en": [
        "Hmm, let me check.",
        "Ummm, one sec.",
        "Hold on.",
        "Let me think.",
        "Wait a moment.",
    ],
    "hi": [
        "हम्म, देखता हूँ।",
        "एक सेकंड।",
        "रुकिए।",
        "सोच रहा हूँ।",
    ],
    "gu": [
        "હમ્મ, જોઉં.",
        "એક સેકન્ડ.",
        "રાહ જુઓ.",
    ],
    "mr": [
        "हम्म, बघतो.",
        "एक सेकंद.",
        "थांबा.",
    ],
}


async def get_filler_audio(lang: str, variant: str) -> str:
    """
    Returns a cached audio_id for the given filler variant, synthesising on first use.
    variant: "first" → long opening filler
             "0","1","2",... → short retry fillers cycled by index
    """
    cache_key = f"{lang}:{variant}"
    async with _FILLER_LOCK:
        if cache_key in _FILLER_CACHE and get_audio_bytes(_FILLER_CACHE[cache_key]):
            return _FILLER_CACHE[cache_key]

        if variant == "first":
            text = FILLER_FIRST.get(lang, FILLER_FIRST["en"])
        else:
            retries = FILLER_RETRIES.get(lang, FILLER_RETRIES["en"])
            idx = int(variant) % len(retries)
            text = retries[idx]

        loop = asyncio.get_event_loop()
        audio_id, _ = await loop.run_in_executor(None, synthesize_speech_to_wav, text, lang)
        _FILLER_CACHE[cache_key] = audio_id
        return audio_id


def get_or_create_brain(call: Optional[Call], language: str = "en") -> AIBrain:
    """Instantiates or retrieves conversational memory brain for a call session."""
    call_id_str = str(call.id) if call else "default"
    if call_id_str in _CALL_BRAINS:
        return _CALL_BRAINS[call_id_str]

    company_name = "your company"
    company_info = "Leading enterprise technology provider"
    products_services = "AI sales voice automation and autonomous telephony workflows"
    campaign_goal = "Qualify enterprise requirements and book a 20-min technical architecture demo"

    if call and call.lead:
        lead = call.lead
        company_name = lead.company_name or company_name
        if hasattr(lead, "business") and lead.business:
            company_info = lead.business.description or company_info
            products_services = lead.business.description or products_services
        if lead.requirement:
            campaign_goal = f"Understand requirement for '{lead.requirement}' and schedule demonstration"

    brain = AIBrain(
        company_info=company_info,
        products_services=products_services,
        campaign_goal=campaign_goal,
        agent_name="Alex",
        company_name=company_name,
        default_language=language,
    )
    try:
        brain.warm_up()
    except Exception as e:
        logger.warning(f"[Telephony Brain] Brain warm-up notice: {e}")

    _CALL_BRAINS[call_id_str] = brain
    return brain


def get_base_url_from_request(request: Request) -> str:
    """
    Resolves the correct public-facing base URL from an incoming Twilio webhook request.

    Cloudflare Tunnel and localhost.run both terminate TLS and forward requests to
    localhost:8000. They preserve the original public host in X-Forwarded-Host and the
    original scheme in X-Forwarded-Proto (or X-Forwarded-Ssl). The raw `Host` header
    on the socket-level request is the internal host (localhost:8000), NOT the tunnel
    domain — so reading `Host` directly misidentifies the request as local and falls back
    to localhost, causing all subsequent TwiML webhook URLs to be unreachable by Twilio.

    Priority order:
    1. X-Forwarded-Host (set by cloudflared, localhost.run, ngrok)
    2. Host header — only if it is NOT a local address
    3. TWILIO_WEBHOOK_BASE_URL env var
    4. TwilioService.get_public_base_url() (reads logs/tunnel_url.txt etc.)
    """
    # 1. X-Forwarded-Host takes priority — this is what tunnel proxies set
    forwarded_host = request.headers.get("x-forwarded-host", "").strip()
    if forwarded_host and "localhost" not in forwarded_host and "127.0.0.1" not in forwarded_host:
        proto = request.headers.get("x-forwarded-proto", "https").strip().rstrip(",").split(",")[0].strip()
        base = f"{proto}://{forwarded_host}"
        # Persist for later get_public_base_url() calls
        try:
            import os as _os
            with open("/home/megh/working/ai_sales_agent/logs/tunnel_url.txt", "w") as f:
                f.write(base)
        except Exception:
            pass
        return base.rstrip("/")

    # 2. Direct Host header (only if genuinely public)
    host_header = request.headers.get("host", "").strip()
    if host_header and "localhost" not in host_header and "127.0.0.1" not in host_header:
        proto = request.headers.get("x-forwarded-proto", "https").strip().rstrip(",").split(",")[0].strip()
        base = f"{proto}://{host_header}"
        try:
            import os as _os
            with open("/home/megh/working/ai_sales_agent/logs/tunnel_url.txt", "w") as f:
                f.write(base)
        except Exception:
            pass
        return base.rstrip("/")

    # 3 & 4. Fall through to env var / tunnel log / fallback
    return TwilioService.get_public_base_url(fallback_url=str(request.base_url))


# ──────────────────────────────────────────────────────────────────────────────
# REQUEST MODELS
# ──────────────────────────────────────────────────────────────────────────────

class DialRequest(BaseModel):
    lead_id: Union[UUID, str] = Field(..., description="ID of the lead to dial (UUID or string)")
    to_phone: Optional[str] = Field(None, description="Destination phone number")
    from_phone: Optional[str] = Field(None, description="Caller ID phone number")
    language: str = Field(default="en", description="Conversation language (en, hi, mr, gu)")
    carrier: str = Field(default="twilio", description="Carrier backend: 'twilio' or 'exotel'")
    enable_amd: bool = Field(default=True, description="Enable answering machine detection")
    custom_pitch: Optional[str] = Field(None, description="Pre-generated dynamic opening pitch")


class AMDCheckRequest(BaseModel):
    carrier_answered_by: Optional[str] = Field(None, description="Twilio/Exotel AnsweredBy signal")
    initial_transcript: Optional[str] = Field(None, description="Greeting transcript text")
    greeting_duration_seconds: Optional[float] = Field(None, description="Length of greeting in seconds")


class VoicemailDropRequest(BaseModel):
    call_id: Union[UUID, str] = Field(..., description="Active call ID")
    language: str = Field(default="en", description="Voicemail audio language")
    custom_message: Optional[str] = Field(None, description="Optional custom voicemail text")


class RetryCheckRequest(BaseModel):
    call_id: Union[UUID, str] = Field(..., description="Unanswered call ID")
    max_retries: int = Field(default=3, ge=1, le=10)
    retry_interval_minutes: int = Field(default=15, ge=1, le=1440)


class CallbackScheduleRequest(BaseModel):
    lead_id: Union[UUID, str] = Field(..., description="Lead ID")
    callback_time_iso: str = Field(..., description="ISO 8601 timestamp for callback")
    prospect_timezone: str = Field(default="Asia/Kolkata", description="Prospect's local timezone")
    notes: Optional[str] = Field(None, description="Context or notes for the callback")


class SendSmsRequest(BaseModel):
    call_id: Union[UUID, str] = Field(..., description="Call ID to associate with SMS")
    message: str = Field(..., max_length=1600, description="SMS message body")


# ──────────────────────────────────────────────────────────────────────────────
# CONFIG & VERIFICATION
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/config", summary="Get carrier trunking configuration & Twilio readiness")
def get_carrier_config(current_user: AuthenticatedUser = Depends(get_current_user)):
    return TelephonyService.get_carrier_config()


@router.post("/twilio/verify", summary="Verify Twilio credentials against Twilio REST API")
def verify_twilio_credentials(current_user: AuthenticatedUser = Depends(get_current_user)):
    return TwilioService.verify_credentials()


# ──────────────────────────────────────────────────────────────────────────────
# SERVE INTERNAL TTS AUDIO TO TWILIO VIA <PLAY>
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/audio/{audio_id}.wav", summary="Serve synthesized TTS audio for Twilio carrier playback", operation_id="get_telephony_audio_file")
@router.head("/audio/{audio_id}.wav", include_in_schema=False)
def get_telephony_audio(audio_id: str, request: Request):
    """
    Twilio fetches this endpoint to play audio generated by YOUR internal TTS engine
    (Sarvam Bulbul v3 / Edge-TTS) into the prospect's telephone call.
    """
    wav_bytes = get_audio_bytes(audio_id)
    if not wav_bytes:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio file not found or expired")

    headers = {
        "Content-Length": str(len(wav_bytes)),
        "Accept-Ranges": "bytes",
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=3600",
    }
    if request.method == "HEAD":
        return Response(content=b"", media_type="audio/wav", headers=headers)
    return Response(content=wav_bytes, media_type="audio/wav", headers=headers)


# ──────────────────────────────────────────────────────────────────────────────
# PSTN OUTBOUND DIALING
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/dial", response_model=CallResponse, status_code=status.HTTP_201_CREATED, summary="Place outbound PSTN carrier call")
def dial_outbound(
    request: DialRequest,
    req: Request,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        base_url = TwilioService.get_public_base_url(fallback_url=str(req.base_url))

        call = TelephonyService.dial_outbound(
            db=db,
            lead_id=request.lead_id,
            owner_id=current_user.id,
            to_phone=request.to_phone,
            from_phone=request.from_phone,
            language=request.language,
            carrier=request.carrier,
            enable_amd=request.enable_amd,
            webhook_base_url=base_url,
            custom_pitch=request.custom_pitch,
        )
        return call
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/calls/{call_id}/hangup", response_model=CallResponse, summary="Terminate active call session")
def hangup_call(
    call_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return TelephonyService.hangup_call(db=db, call_id=call_id, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/twilio/sms", summary="Send SMS follow-up via Twilio")
def send_twilio_sms(
    request: SendSmsRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return TelephonyService.send_sms(
            db=db,
            call_id=request.call_id,
            owner_id=current_user.id,
            message=request.message,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ──────────────────────────────────────────────────────────────────────────────
# TWILIO VOICE WEBHOOK (TWIML) — POWERED BY YOUR INTERNAL AI & TTS
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/twilio/voice", summary="Twilio Voice connect webhook", operation_id="twilio_voice_connect")
@router.get("/twilio/voice", include_in_schema=False)
async def twilio_voice_webhook(
    request: Request,
    call_id: Optional[str] = Query(None),
    lang: str = Query("en"),
    db: Session = Depends(get_db),
):
    """
    Invoked by Twilio when the outbound call connects.
    Generates dynamic opening pitch using YOUR internal AIBrain (Ollama / Sarvam),
    synthesizes audio using YOUR internal TTSEngine (Sarvam Bulbul v3 / Edge-TTS),
    and instructs Twilio to <Play> it over the telephone.
    """
    form_data = {}
    if request.method == "POST":
        try:
            form_data = await request.form()
        except Exception:
            pass

    call_sid = form_data.get("CallSid")
    answered_by = form_data.get("AnsweredBy", "")

    # Resolve base_url using X-Forwarded-Host first (set by cloudflared / localhost.run),
    # then fall back through Host header and env/tunnel-log detection.
    base_url = get_base_url_from_request(request)

    # Look up call session in database
    call = None
    if call_id:
        try:
            call_uuid = uuid.UUID(str(call_id))
            call = db.scalars(select(Call).where(Call.id == call_uuid)).first()
        except Exception:
            call = db.scalars(select(Call).where(Call.provider_call_id == str(call_id))).first()
    if not call and call_sid:
        call = db.scalars(select(Call).where(Call.provider_call_id == call_sid)).first()

    # 1. Answering Machine Detection (AMD) Handling
    if answered_by and any(m in answered_by.lower() for m in ["machine", "voicemail"]):
        logger.info(f"[Twilio AMD] Machine detected on call {call_id} ('{answered_by}'). Synthesizing voicemail drop.")
        voicemail_text = VOICEMAIL_SCRIPTS.get(lang.lower(), VOICEMAIL_SCRIPTS.get("en", "Hello, following up from Vidur AI."))
        audio_id, _ = synthesize_speech_to_wav(voicemail_text, language=lang)
        audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"

        if call:
            meta = dict(call.metadata_json or {})
            meta["voicemail_dropped"] = True
            meta["carrier_answered_by"] = answered_by
            call.metadata_json = meta
            call.outcome = "voicemail left"
            call.status = "completed"
            call.transcript = f"[Answering Machine Tone]\n[Agent Voicemail Drop]: {voicemail_text}"
            db.commit()

        twiml = TwilioService.generate_audio_voicemail_twiml(audio_url=audio_url)
        return Response(content=twiml, media_type="application/xml")

    # 2. Human Pickup — Check for pre-synthesized opening pitch
    meta = dict(call.metadata_json or {}) if call else {}
    cached_audio_id = meta.get("opening_audio_id")
    opening_pitch = meta.get("opening_pitch")

    if cached_audio_id and get_audio_bytes(cached_audio_id):
        audio_id = cached_audio_id
        logger.info(f"[Twilio Voice] Instant dispatch: Serving pre-synthesized audio ({audio_id}) in 1ms for call {call_id}")
    else:
        # Fallback only if not pre-synthesized
        company_name = "your company"
        prospect_name = "there"
        requirement = ""
        if call and call.lead:
            company_name = call.lead.company_name or company_name
            prospect_name = call.lead.contact_name or prospect_name
            requirement = call.lead.requirement or ""

        if not opening_pitch:
            brain = get_or_create_brain(call, language=lang)
            opening_pitch = brain.generate_dynamic_opening_pitch(
                prospect_name=prospect_name,
                company_name=company_name,
                requirement=requirement,
                language=lang,
            )

        audio_id, _ = synthesize_speech_to_wav(opening_pitch, language=lang)

    audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"
    gather_url = f"{base_url}/api/telephony/twilio/gather?call_id={call.id if call else ''}&lang={lang}"

    # 4. Update Database Transcript
    if call:
        call.status = "in_progress"
        call.transcript = f"[Agent]: {opening_pitch}"
        db.commit()

    logger.info(f"[Twilio Voice] Serving opening pitch via internal TTS ({audio_url}) for call {call_id}")
    twiml = TwilioService.generate_audio_greeting_twiml(
        audio_url=audio_url,
        gather_action_url=gather_url,
        fallback_text=opening_pitch,
        language=lang,
    )
    return Response(content=twiml, media_type="application/xml")


# ──────────────────────────────────────────────────────────────────────────────
# TWILIO SPEECH GATHER (CONVERSATION LOOP) — POWERED BY YOUR INTERNAL LLM & TTS
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/twilio/gather", summary="Twilio Recording callback — Sarvam STT conversation turn", operation_id="twilio_gather_turn")
@router.get("/twilio/gather", include_in_schema=False)
async def twilio_gather_webhook(
    request: Request,
    call_id: Optional[str] = Query(None),
    lang: str = Query("en"),
    db: Session = Depends(get_db),
):
    """
    Invoked by Twilio when a <Record> completes (caller spoke or timeout fired).
    Downloads the recording WAV from Twilio, runs it through Sarvam STT internally
    (no Twilio speech recognition used — bypasses unreliable Indian PSTN STT),
    then feeds transcription into AIBrain + TTS in a background task.
    Returns instantly with filler audio + <Redirect> to the polling endpoint.
    """
    form_data = {}
    try:
        form_data = await request.form()
    except Exception:
        pass

    recording_url = (form_data.get("RecordingUrl") or "").strip()
    call_sid = form_data.get("CallSid") or ""
    recording_duration = form_data.get("RecordingDuration") or "0"

    base_url = get_base_url_from_request(request)

    call = None
    if call_id:
        try:
            call_uuid = uuid.UUID(str(call_id))
            call = db.scalars(select(Call).where(Call.id == call_uuid)).first()
        except Exception:
            call = db.scalars(select(Call).where(Call.provider_call_id == str(call_id))).first()
    if not call and call_sid:
        call = db.scalars(select(Call).where(Call.provider_call_id == call_sid)).first()

    next_gather_url = f"{base_url}/api/telephony/twilio/gather?call_id={call.id if call else ''}&lang={lang}"

    # No recording or caller was silent — ask to repeat
    if not recording_url or str(recording_duration) == "0":
        fallback_texts = {
            "en": "I didn't quite catch that. Could you say that again?",
            "hi": "मुझे आपकी आवाज़ स्पष्ट नहीं आई। क्या आप दोबारा बोल सकते हैं?",
            "gu": "મને સ્પષ્ટ સંભળાયું નહીં. શું તમે ફરી બોલી શકો?",
            "mr": "मला नीट ऐकू आले नाही. पुन्हा सांगाल का?",
        }
        txt = fallback_texts.get(lang.lower(), fallback_texts["en"])
        loop = asyncio.get_event_loop()
        audio_id, _ = await loop.run_in_executor(None, synthesize_speech_to_wav, txt, lang)
        audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"
        twiml = TwilioService.generate_audio_response_twiml(
            audio_url=audio_url,
            next_gather_url=next_gather_url,
            hangup=False,
            language=lang,
        )
        return Response(content=twiml, media_type="application/xml")

    # ── Non-blocking: download recording + STT + LLM + TTS in background ──────
    job_id = str(uuid.uuid4())
    _GATHER_JOBS[job_id] = None

    call_id_str = str(call.id) if call else ""
    call_db_id = call.id if call else None
    brain = get_or_create_brain(call, language=lang)

    async def _run_stt_llm_tts():
        loop = asyncio.get_event_loop()
        speech_result = ""
        try:
            # 1. Download the Twilio recording (WAV/MP3) using Twilio credentials
            import tempfile, httpx
            twilio_creds = TwilioService.get_credentials()
            account_sid = twilio_creds.get("account_sid") or ""
            auth_token = twilio_creds.get("auth_token") or ""
            # Twilio appends .wav to get WAV format
            wav_url = recording_url if recording_url.endswith(".wav") else recording_url + ".wav"
            async with httpx.AsyncClient(auth=(account_sid, auth_token), timeout=15) as client:
                resp = await client.get(wav_url)
                audio_bytes = resp.content

            # 2. Save to temp file and run Sarvam STT
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            try:
                from stt.engine import STTEngine
                stt = STTEngine()
                result = await loop.run_in_executor(None, stt.transcribe_file, tmp_path)
                speech_result = (result.get("text") or "").strip()
            finally:
                import os as _os
                _os.unlink(tmp_path)

            logger.info(f"[Twilio Gather] Sarvam STT transcribed: '{speech_result}'")
        except Exception as e:
            logger.error(f"[Twilio Gather] STT failed ({e}), using empty transcript")
            speech_result = ""

        if not speech_result:
            _GATHER_JOBS[job_id] = {
                "audio_url": None,
                "next_gather_url": f"{base_url}/api/telephony/twilio/gather?call_id={call_id_str}&lang={lang}",
                "hangup": False,
            }
            return

        # 3. LLM
        try:
            sentences = await loop.run_in_executor(
                None,
                lambda: list(brain.think(speech_result, detected_language=lang))
            )
            ai_reply = " ".join(sentences).strip()
        except Exception as e:
            logger.error(f"[Twilio Gather] LLM error ({e})")
            ai_reply = "Thank you for sharing. Would you have 15 minutes for a quick demo this week?"

        # 4. Detect hangup signals
        text_lower = speech_result.lower()
        should_hangup = any(k in text_lower for k in [
            "not interested", "dont call", "don't call", "stop", "remove",
            "busy", "call back", "later", "driving", "meeting",
        ])
        outcome = None
        if any(k in text_lower for k in ["not interested", "dont call", "don't call", "stop", "remove"]):
            outcome = "not_interested"
        elif any(k in text_lower for k in ["busy", "call back", "later", "driving", "meeting"]):
            outcome = "callback_requested"
        elif any(k in text_lower for k in ["demo", "yes", "sure", "book", "schedule", "pricing", "interested"]):
            outcome = "meeting_booked"

        # 5. TTS
        audio_id, _ = await loop.run_in_executor(
            None, lambda: synthesize_speech_to_wav(ai_reply, language=lang)
        )
        audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"
        next_url = f"{base_url}/api/telephony/twilio/gather?call_id={call_id_str}&lang={lang}"

        # 6. Persist transcript
        if call_db_id is not None:
            from app.db.database import SessionLocal
            db2 = SessionLocal()
            try:
                c = db2.scalars(select(Call).where(Call.id == call_db_id)).first()
                if c:
                    prev = c.transcript or ""
                    c.transcript = f"{prev}\n[Prospect]: {speech_result}\n[Agent]: {ai_reply}".strip()
                    if outcome:
                        c.outcome = outcome
                    if should_hangup:
                        c.status = "completed"
                        c.completed_at = datetime.now(timezone.utc)
                    db2.commit()
            finally:
                db2.close()

        _GATHER_JOBS[job_id] = {
            "audio_url": audio_url,
            "next_gather_url": next_url if not should_hangup else None,
            "hangup": should_hangup,
        }
        logger.info(f"[Twilio Gather] Job {job_id} ready — audio: {audio_url}")

    asyncio.ensure_future(_run_stt_llm_tts())

    filler_audio_id = await get_filler_audio(lang, "first")
    filler_url = f"{base_url}/api/telephony/audio/{filler_audio_id}.wav"
    poll_url = f"{base_url}/api/telephony/twilio/gather-response/{job_id}?call_id={call_id_str}&lang={lang}&retry=0"
    twiml = TwilioService.generate_filler_redirect_twiml(filler_url=filler_url, redirect_url=poll_url)
    return Response(content=twiml, media_type="application/xml")


# ──────────────────────────────────────────────────────────────────────────────
# TWILIO GATHER RESPONSE POLLER — serves real AI reply once background job done
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/twilio/gather-response/{job_id}", include_in_schema=False)
@router.get("/twilio/gather-response/{job_id}", include_in_schema=False)
async def twilio_gather_response(
    request: Request,
    job_id: str,
    call_id: Optional[str] = Query(None),
    lang: str = Query("en"),
    retry: int = Query(0),
):
    """
    Called once by Twilio via <Redirect> after the filler audio plays.
    Waits (async sleep loop) for the background LLM+TTS job to finish — up to 25s —
    then returns the real <Play>+<Gather> TwiML in a single response.
    This avoids Twilio's redirect chain limit entirely: one redirect, one response.

    If the job takes longer than 25s (very unlikely), plays one more filler and
    redirects a single additional time, resetting the wait budget.
    """
    base_url = get_base_url_from_request(request)

    # Async-wait for job completion: check every 0.3s for up to 25s
    waited = 0.0
    poll_interval = 0.3
    max_wait = 25.0

    while waited < max_wait:
        job = _GATHER_JOBS.get(job_id)
        if job is not None:
            break
        await asyncio.sleep(poll_interval)
        waited += poll_interval

    job = _GATHER_JOBS.get(job_id)

    if job is not None:
        # Job complete — clean up and serve the real response
        _GATHER_JOBS.pop(job_id, None)
        audio_url = job.get("audio_url")
        next_gather_url = job.get("next_gather_url")
        hangup = job.get("hangup", False)

        if not audio_url:
            next_gather_url = f"{base_url}/api/telephony/twilio/gather?call_id={call_id or ''}&lang={lang}"
            loop = asyncio.get_event_loop()
            fallback_texts = {
                "en": "Sorry, I had a moment of trouble. Could you repeat that?",
                "hi": "माफ़ कीजिए, एक तकनीकी समस्या हुई। क्या आप दोबारा बोल सकते हैं?",
                "gu": "માફ કરો, ટેક્નિકલ સમસ્યા આવી. ફરી બોલો.",
                "mr": "माफ करा, तांत्रिक अडचण आली. पुन्हा सांगा.",
            }
            txt = fallback_texts.get(lang, fallback_texts["en"])
            audio_id, _ = await loop.run_in_executor(None, synthesize_speech_to_wav, txt, lang)
            audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"
            hangup = False

        logger.info(f"[Twilio Gather Response] Job {job_id} ready after {waited:.1f}s — serving real audio")
        twiml = TwilioService.generate_audio_response_twiml(
            audio_url=audio_url,
            next_gather_url=next_gather_url,
            hangup=hangup,
            language=lang,
        )
        return Response(content=twiml, media_type="application/xml")

    # Timed out (>25s) — very rare. Play one more filler and redirect once more to reset budget.
    logger.warning(f"[Twilio Gather Response] Job {job_id} timed out after {waited:.1f}s — single retry redirect")
    next_retry = retry + 1
    variant = str(retry % len(FILLER_RETRIES.get(lang, FILLER_RETRIES["en"])))
    filler_audio_id = await get_filler_audio(lang, variant)
    filler_url = f"{base_url}/api/telephony/audio/{filler_audio_id}.wav"
    poll_url = f"{base_url}/api/telephony/twilio/gather-response/{job_id}?call_id={call_id or ''}&lang={lang}&retry={next_retry}"
    twiml = TwilioService.generate_filler_redirect_twiml(filler_url=filler_url, redirect_url=poll_url)
    return Response(content=twiml, media_type="application/xml")


# ──────────────────────────────────────────────────────────────────────────────
# TWILIO REAL-TIME MEDIA STREAM WEBSOCKET (DIRECT BIDIRECTIONAL AUDIO BRIDGE)
# ──────────────────────────────────────────────────────────────────────────────

@router.websocket("/twilio/stream/{call_id}")
async def twilio_media_stream_websocket(websocket: WebSocket, call_id: str):
    """
    Twilio Media Stream bidirectional WebSocket endpoint.
    Twilio streams raw mulaw 8000Hz audio from the prospect's telephone in real time.
    Your internal VAD, STT (Faster-Whisper / Sarvam Saaras), LLM (AIBrain),
    and TTS (Sarvam Bulbul v3 / Edge-TTS) run the entire conversation.
    """
    await websocket.accept()
    logger.info(f"[Twilio Stream] WebSocket connected for call session: {call_id}")

    stream_sid = None
    try:
        while True:
            message = await websocket.receive_text()
            data = json.loads(message)
            event = data.get("event")

            if event == "start":
                stream_sid = data.get("start", {}).get("streamSid")
                logger.info(f"[Twilio Stream] Stream started: {stream_sid}")

            elif event == "media":
                # Raw audio payload from caller's phone (base64 mulaw 8000Hz)
                payload_b64 = data.get("media", {}).get("payload")
                # Ready for internal VAD/STT buffer processing

            elif event == "stop":
                logger.info(f"[Twilio Stream] Stream stopped for call: {call_id}")
                break

    except WebSocketDisconnect:
        logger.info(f"[Twilio Stream] WebSocket disconnected for call: {call_id}")
    except Exception as e:
        logger.error(f"[Twilio Stream] WebSocket stream error: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# TWILIO STATUS & AMD CALLBACKS
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/twilio/status-callback", summary="Twilio Call Status Lifecycle webhook")
async def twilio_status_callback(
    request: Request,
    call_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
):
    form_data = {}
    try:
        form_data = await request.form()
    except Exception:
        pass

    call_sid = form_data.get("CallSid")
    call_status = (form_data.get("CallStatus") or "").lower()
    call_duration = form_data.get("CallDuration")

    call = None
    if call_id:
        call = db.scalars(select(Call).where(Call.id == call_id)).first()
    elif call_sid:
        call = db.scalars(select(Call).where(Call.provider_call_id == call_sid)).first()

    if not call:
        return {"status": "ignored", "reason": "call_not_found"}

    logger.info(f"[Twilio Status] Call {call.id} (SID {call_sid}): {call_status}")

    # Synchronize state machine
    if call_status in ("completed",):
        if call.status != "completed":
            call.status = "completed"
            call.completed_at = datetime.now(timezone.utc)
        if call_duration:
            try:
                call.duration = int(call_duration)
            except (ValueError, TypeError):
                pass
        db.commit()

        # Trigger Next Best Action analysis
        try:
            TelephonyService.generate_call_analysis(db, call.id, call.lead.business.owner_id)
        except Exception as e:
            logger.warning(f"[Twilio] Post-call analysis notice: {e}")

    elif call_status in ("busy", "no-answer"):
        if call.status in ("in_progress", "scheduled"):
            call.status = "no_answer"
            call.outcome = "no_answer"
            db.commit()
            try:
                TelephonyService.process_unanswered_retry(db, call.id, call.lead.business.owner_id)
            except Exception as e:
                logger.warning(f"[Twilio] Retry schedule notice: {e}")

    elif call_status in ("failed", "canceled"):
        if call.status in ("in_progress", "scheduled"):
            call.status = "failed"
            db.commit()

    elif call_status in ("in-progress",):
        if call.status == "scheduled":
            call.status = "in_progress"
            db.commit()

    return {"status": "ok", "call_id": str(call.id), "current_status": call.status}


@router.post("/twilio/amd-callback", summary="Twilio AMD Answering Machine Detection webhook")
async def twilio_amd_callback(
    request: Request,
    call_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    form_data = {}
    try:
        form_data = await request.form()
    except Exception:
        pass

    answered_by = form_data.get("AnsweredBy", "")
    call_sid = form_data.get("CallSid")

    call = None
    if call_id:
        try:
            call_uuid = uuid.UUID(str(call_id))
            call = db.scalars(select(Call).where(Call.id == call_uuid)).first()
        except Exception:
            call = db.scalars(select(Call).where(Call.provider_call_id == str(call_id))).first()
    if not call and call_sid:
        call = db.scalars(select(Call).where(Call.provider_call_id == call_sid)).first()

    if call and answered_by:
        meta = dict(call.metadata_json or {})
        meta["carrier_answered_by"] = answered_by
        call.metadata_json = meta

        if any(m in answered_by.lower() for m in ["machine", "voicemail"]):
            call.outcome = "voicemail left"
            call.status = "completed"
            meta["voicemail_dropped"] = True

        db.commit()

    return {"status": "ok", "answered_by": answered_by}


# ──────────────────────────────────────────────────────────────────────────────
# AMD, VOICEMAIL & RETRY UTILITIES
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/amd-detect", summary="Analyze Answering Machine Detection (AMD) signal")
def check_amd(request: AMDCheckRequest):
    result = TelephonyService.detect_answering_machine(
        carrier_answered_by=request.carrier_answered_by,
        initial_transcript=request.initial_transcript,
        greeting_duration_seconds=request.greeting_duration_seconds,
    )
    return result.to_dict()


@router.post("/voicemail-drop", response_model=CallResponse, summary="Execute automated voicemail drop")
def drop_voicemail(
    request: VoicemailDropRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        call = TelephonyService.drop_voicemail(
            db=db,
            call_id=request.call_id,
            owner_id=current_user.id,
            language=request.language,
            custom_message=request.custom_message,
        )
        return call
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/retry-check", summary="Process unanswered call retry policy")
def process_retry(
    request: RetryCheckRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return TelephonyService.process_unanswered_retry(
            db=db,
            call_id=request.call_id,
            owner_id=current_user.id,
            max_retries=request.max_retries,
            retry_interval_minutes=request.retry_interval_minutes,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/schedule-callback", response_model=CallResponse, status_code=status.HTTP_201_CREATED, summary="Schedule callback in prospect timezone")
def schedule_callback(
    request: CallbackScheduleRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        call = TelephonyService.schedule_callback(
            db=db,
            lead_id=request.lead_id,
            owner_id=current_user.id,
            callback_time_iso=request.callback_time_iso,
            prospect_timezone=request.prospect_timezone,
            notes=request.notes,
        )
        return call
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
