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
import logging
from typing import Any, Dict, Optional, Tuple, Union
from uuid import UUID
from datetime import datetime, timezone

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Request, Response, WebSocket, WebSocketDisconnect, status, Query
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
from app.services.calendly_service import CalendlyService
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


def is_human_transfer_requested(text: str) -> bool:
    """Detects if lead requests to speak with a human agent, team member, or Calendly booking link."""
    from app.services.calendly_service import is_human_transfer_requested as _detect_transfer
    return _detect_transfer(text)


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


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# REQUEST MODELS
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# CONFIG & VERIFICATION
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

@router.get("/config", summary="Get carrier trunking configuration & Twilio readiness")
def get_carrier_config(current_user: AuthenticatedUser = Depends(get_current_user)):
    return TelephonyService.get_carrier_config()


@router.post("/twilio/verify", summary="Verify Twilio credentials against Twilio REST API")
def verify_twilio_credentials(current_user: AuthenticatedUser = Depends(get_current_user)):
    return TwilioService.verify_credentials()


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# SERVE INTERNAL TTS AUDIO TO TWILIO VIA <PLAY>
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# PSTN OUTBOUND DIALING
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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


class SendSmsRequest(BaseModel):
    call_id: Optional[str] = None
    message: str


class CallLanguageUpdateRequest(BaseModel):
    language: str


@router.post("/calls/{call_id}/language", summary="Update active call language")
def update_call_language(
    call_id: str,
    request: CallLanguageUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Dynamically switches the active spoken language for an ongoing Twilio PSTN call.
    Subsequent conversation turns and STT speech gather will instantly adapt to this language.
    """
    call = None
    try:
        call_uuid = uuid.UUID(str(call_id))
        call = db.scalars(select(Call).where(Call.id == call_uuid)).first()
    except Exception:
        call = db.scalars(select(Call).where(Call.provider_call_id == str(call_id))).first()

    clean_lang = request.language.lower()
    if call:
        call.language = clean_lang
        meta = dict(call.metadata_json or {})
        meta["language"] = clean_lang
        call.metadata_json = meta
        db.commit()
        logger.info(f"[Telephony] Switched active call {call.id} language to {clean_lang}")
        return {"status": "success", "call_id": str(call.id), "language": clean_lang}

    return {"status": "success", "call_id": str(call_id), "language": clean_lang}


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


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# TWILIO VOICE WEBHOOK (TWIML) 窶� POWERED BY YOUR INTERNAL AI & TTS
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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

    # Resolve base_url: prioritize the incoming host header that Twilio reached us on
    host_header = request.headers.get("host", "").strip()
    if host_header and "localhost" not in host_header and "127.0.0.1" not in host_header:
        base_url = f"https://{host_header}"
        try:
            with open("/home/megh/working/ai_sales_agent/logs/tunnel_url.txt", "w") as f:
                f.write(base_url)
        except Exception:
            pass
    else:
        base_url = TwilioService.get_public_base_url(fallback_url=str(request.base_url))

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


# ──────────────────────────────────────────────────────────────────────────────
# TWILIO SPEECH GATHER (CONVERSATION LOOP) — POWERED BY YOUR INTERNAL LLM & TTS
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/twilio/gather", summary="Twilio Speech Gather conversation turn webhook", operation_id="twilio_gather_turn")
@router.get("/twilio/gather", include_in_schema=False)
async def twilio_gather_webhook(
    request: Request,
    call_id: Optional[str] = Query(None),
    lang: str = Query("en"),
    db: Session = Depends(get_db),
):
    """
    Invoked by Twilio when prospect speaks on their phone.
    Passes prospect utterance to YOUR internal AIBrain (Ollama / Sarvam LLM),
    synthesizes response audio with YOUR internal TTSEngine,
    and returns TwiML <Play> to stream back into the call.
    """
    form_data = {}
    try:
        form_data = await request.form()
    except Exception:
        pass

    speech_result = (form_data.get("SpeechResult") or "").strip()
    call_sid = form_data.get("CallSid")

    # Resolve base_url: prioritize the incoming host header that Twilio reached us on
    host_header = request.headers.get("host", "").strip()
    if host_header and "localhost" not in host_header and "127.0.0.1" not in host_header:
        base_url = f"https://{host_header}"
    else:
        base_url = TwilioService.get_public_base_url(fallback_url=str(request.base_url))

    call = None
    if call_id:
        try:
            call_uuid = uuid.UUID(str(call_id))
            call = db.scalars(select(Call).where(Call.id == call_uuid)).first()
        except Exception:
            call = db.scalars(select(Call).where(Call.provider_call_id == str(call_id))).first()
    if not call and call_sid:
        call = db.scalars(select(Call).where(Call.provider_call_id == call_sid)).first()

    # 1. Determine active call language: check call.language, then query param, default 'en'
    current_lang = "en"
    if call and call.language:
        current_lang = call.language.lower()
    elif lang:
        current_lang = lang.lower()

    # 2. Check if prospect text indicates a dynamic language switch (Unicode script or explicit request)
    lower_speech = speech_result.lower()
    gujarati_chars = sum(1 for c in speech_result if "\u0A80" <= c <= "\u0AFF")
    devanagari_chars = sum(1 for c in speech_result if "\u0900" <= c <= "\u097F")
    total_chars = max(len(speech_result), 1)

    if gujarati_chars / total_chars > 0.15 or any(w in lower_speech for w in ["in gujarati", "gujarati ma", "gujarati please", "爼伶ｫ≒ｪ憫ｪｰ爼ｾ爼､爿"]):
        current_lang = "gu"
    elif devanagari_chars / total_chars > 0.15:
        current_lang = "mr" if current_lang == "mr" else "hi"
    elif any(w in lower_speech for w in ["in hindi", "hindi mein", "hindi please", "爨ｹ爨ｿ爨も､ｦ爭"]):
        current_lang = "hi"
    elif any(w in lower_speech for w in ["in marathi", "marathi madhe", "marathi please", "爨ｮ爨ｰ爨ｾ爨�爭"]):
        current_lang = "mr"
    elif any(w in lower_speech for w in ["in english", "english please", "speak english"]):
        current_lang = "en"

    if call and call.language != current_lang:
        call.language = current_lang
        db.commit()

    next_gather_url = f"{base_url}/api/telephony/twilio/gather?call_id={call.id if call else ''}&lang={current_lang}"

    # Helper to detect concluding farewell from the AI agent
    def is_agent_farewell(text: str) -> bool:
        if not text:
            return False
        import re
        t_low = text.lower().strip()
        farewell_phrases = [
            "have a great day", "have a wonderful day", "have a good day", "goodbye", "good bye", "take care",
            "thank you so much for your time", "thank you for your time", "enjoy the rest of your day", "talk to you soon",
            "alvida", "aapka din shubh ho", "shubh din", "aavjo", "dhanyavaad", "namaste",
            "\u0906\u092a\u0915\u093e \u0926\u093f\u0928 \u0936\u0941\u092d \u0939\u094b",
            "\u0905\u0932\u0935\u093f\u0926\u093e",
            "\u0927\u0928\u094d\u092f\u0935\u093e\u0926",
            "\u0a86\u0ab5\u0a9c\u0acb",
            "\u0aa4\u0aae\u0abe\u0ab0\u0acb \u0aa6\u0abf\u0ab5\u0ab8 \u0ab8\u0abe\u0ab0\u0acb \u0ab0\u0ab9\u0acb",
            "\u0926\u093f\u0935\u0938 \u091a\u093e\u0902\u0917\u0932\u093e \u091c\u093e\u0913",
            "\u0915\u093e\u0933\u091c\u0940 \u0918\u094d\u092f\u093e"
        ]
        return any(p in t_low or p in text for p in farewell_phrases)

    # Handle silence / no speech captured
    if not speech_result:
        fallback_prompts = {
            "en": "I didn't quite hear that. Would you like me to send you our solution brief and schedule a demo?",
            "hi": "\u092e\u0941\u091d\u0947 \u0906\u092a\u0915\u0940 \u0906\u0935\u093e\u091c\u093c \u0938\u094d\u092a\u0937\u094d\u091f \u0928\u0939\u0940\u0902 \u0906\u0908\u0964 \u0915\u094d\u092f\u093e \u092e\u0948\u0902 \u0906\u092a\u0915\u094b \u0908\u092e\u0947\u0932 \u092a\u0930 \u091c\u093e\u0928\u0915\u093e\u0930\u0940 \u092d\u0947\u091c \u0938\u0915त\u093e \u0939\u0942\u0901?",
            "gu": "\u0aae\u0aa8\u0ac7 \u0aa4\u0aae\u0abe\u0ab0\u0acb \u0a85\u0ab5\u0abe\u0a9c \u0aac\u0ab0\u0abe\u0aac\u0ab0 \u0ab8\u0a82\u0aad\u0ab3\u0abe\u0aaf\u0acb \u0aa8\u0aa5\u0ac0. \u0ab6\u0ac1\u0a82 \u0ab9\u0ac1\u0a82 \u0aa4\u0aae\u0aa8\u0ac7 \u0a88\u0aae\u0ac7\u0a87\u0ab2 \u0aae\u0acb\u0a95\u0ab2\u0ac0 \u0a86\u0aaa\u0ac1\u0a82?",
            "mr": "\u092e\u0932\u093e \u0924\u0941\u092eचा \u0906\u0935\u093e\u091c \u0938\u094d\u092a\u0937\u094d\u091f \u0906ला \u0928ाही. \u092e\u0940 \u0908\u092e\u0947लवर \u092eाहिती \u092aाठवू \u0915ा?",
        }
        fallback_prompt = fallback_prompts.get(current_lang, fallback_prompts["en"])

        audio_id, _ = synthesize_speech_to_wav(fallback_prompt, language=current_lang)
        audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"
        twiml = TwilioService.generate_audio_response_twiml(
            audio_url=audio_url,
            next_gather_url=next_gather_url,
            hangup=False,
            language=current_lang,
        )
        return Response(content=twiml, media_type="application/xml")

    # 3. Check if user requested to cut/end/hangup the call
    cut_call_keywords = [
        # English
        "cut the call", "cut call", "cut this call", "cut it", "cut phone", "cut the phone", "cut",
        "hang up", "hangup", "hang the call", "disconnect", "disconnect the call",
        "end the call", "end call", "stop the call", "stop call", "stop calling", "i have to go",
        "bye", "goodbye", "good bye", "byebye", "see you", "not interested", "dont call", "don't call",
        "leave me alone", "wrong number", "remove my number",
        # Hindi / Hinglish
        "call kaat do", "call kato", "call kaato", "call kaat", "phone kaat do", "phone kato", "phone kaato",
        "phone rakho", "phone rakh do", "phone rakh", "call cut", "phone cut", "call cut karo", "phone cut karo",
        "band karo", "call band karo", "alvida", "chalo bye", "baad mein baat",
        "\u0905\u0932\u0935\u093f\u0926\u093e", "\u092c\u093e\u092f", "\u092b\u094b\u0928 \u0930\u0916\u094b", "\u092b\u094b\u0928 \u0930\u0916 \u0926\u094b",
        "\u0915\u0949\u0932 \u0915\u093e\u091f\u094b", "\u0915\u0949\u0932 \u0915\u093e\u091f \u0926\u094b", "\u0915\u093e\u091f \u0926\u094b",
        "\u092b\u094b\u0928 \u0915\u093e\u091f \u0926\u094b", "\u092c\u0902\u0926 \u0915\u0930\u094b", "\u0928\u0939\u0940\u0902 \u091a\u093e\u0939\u093f\u090f",
        # Gujarati / Gujlish
        "phone muko", "phone muki dyo", "phone muki do", "call kato", "call kaapo", "call cut", "call cut karo",
        "bandh karo", "aavjo", "chalo aavjo", "nathi joitu",
        "\u0aab\u0acb\u0aa8 \u0aae\u0ac2\u0a95\u0acb", "\u0aab\u0acb\u0aa8 \u0aae\u0ac2\u0a95\u0ac0 \u0aa6\u0acb", "\u0a95\u0acd\u0a95\u0ac9\u0ab2 \u0a95\u0abe\u0aaa\u0acb",
        "\u0a95\u0acd\u0a95\u0ac9\u0ab2 \u0a95\u0a9f \u0a95\u0ab0\u0acb", "\u0a95\u0a9f \u0a95\u0ab0\u0acb", "\u0a95\u0abe\u0aaa\u0acb",
        "\u0aac\u0a82\u0aa7 \u0a95\u0ab0\u0acb", "\u0a86\u0ab5\u0a9c\u0acb", "\u0aac\u0abe\u0aaf", "\u0aa8\u0aa5\u0ac0 \u0a9c\u0acb\u0a88\u0aa4\u0ac1\u0a82",
        # Marathi / Marathlish
        "phone theva", "phone thev", "call thambva", "call cut kara", "call band kara", "nirop",
        "\u092b\u094b\u0928 \u0920\u0947\u0935\u093e", "\u0915\u0949\u0932 \u0925\u093e\u0902\u092c\u0935\u093e", "\u0915\u0949\u0932 \u0915\u091f \u0915\u0930\u093e",
        "\u0915\u0949\u0932 \u092c\u0902\u0926 \u0915\u0930\u093e", "\u0928\u093f\u0930\u094b\u092a", "\u092c\u093e\u092f",
    ]
    is_cut_call = any(k in lower_speech for k in cut_call_keywords)
    if not is_cut_call:
        import re
        patterns = [
            r"\b(cut|hang\s*up|disconnect|end|close|stop)\b.*\b(call|phone|line)\b",
            r"\b(call|phone)\b.*\b(cut|kaat|kato|kaato|rakh|rakho|muko|muki|kaapo|end|band|disconnect|stop)\b",
            r"\b(cut\s*the\s*call|cut\s*call|cut\s*it|hang\s*up|disconnect)\b",
            r"\b(please|can you|just)\b.*\b(cut|hang up|disconnect|end)\b",
            r"\b(bye|goodbye|byebye|alvida|aavjo)\b",
        ]
        is_cut_call = any(re.search(pat, lower_speech) for pat in patterns)

    if is_cut_call:
        logger.info(f"[Twilio Gather] User requested to cut call: '{speech_result}'. Disconnecting gracefully.")
        should_hangup = True
        outcome = "call_ended_by_user"

        if current_lang == "hi":
            ai_reply = "\u091c\u0940 \u092c\u093f\u0932\u094d\u0915\u0941\u0932, \u0906\u092a\u0915\u0947 \u0938\u092e\u092f \u0915\u0947 \u0932\u093f\u090f \u0927\u0928\u094d\u092f\u0935\u093e\u0926, \u0928\u092e\u0938\u094d\u0915\u093e\u0930!"
        elif current_lang == "gu":
            ai_reply = "\u0a9a\u0acb\u0a95\u0acd\u0a95\u0ab8, \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0ab8\u0aae\u0aaf \u0aac\u0aa6\u0ab2 \u0a96\u0ac2\u0aac \u0a86\u0aad\u0abe\u0ab0. \u0a86\u0ab5\u0a9c\u0acb!"
        elif current_lang == "mr":
            ai_reply = "\u0928\u0915\u094d\u0915\u0940\u091a, \u0906\u092a\u0932\u094d\u092f\u093e \u0935\u0947\u0933\u093e\u092c\u0926\u094d\u0926\u0932 \u0927\u0928\u094d\u092f\u0935\u093e\u0926. \u0928\u092e\u0938\u094d\u0915\u093e\u0930!"
        else:
            ai_reply = "Understood. Thank you for your time, have a great day. Goodbye!"

    # 4. Check for human agent request (Calendly Link Dispatch)
    elif is_human_transfer_requested(speech_result):
        logger.info(f"[Twilio Gather] Human transfer requested by prospect: '{speech_result}'. Dispatching Calendly link SMS.")
        should_hangup = True
        outcome = "human_transfer_requested"

        if current_lang == "hi":
            ai_reply = "\u092e\u0948\u0902 \u092c\u093f\u0932\u094d\u0915\u0941\u0932 \u0938\u092e\u091d\u0924\u093e \u0939\u0942\u0901! \u092e\u0948\u0902\u0928\u0947 \u0905\u092d\u0940 \u0906\u092a\u0915\u0947 \u092b\u093c\u094b\u0928 \u092a\u0930 \u090f\u0938\u090f\u092e\u090f\u0938 \u0914\u0930 \u0908\u092e\u0947\u0932 \u0926\u094d\u0935\u093e\u0930\u093e \u0939\u092e\u093e\u0930\u0940 \u091f\u0940\u092e \u0915\u093e \u0938\u0940\u0927\u093e \u0915\u0948\u0932\u0947\u0902\u0921\u0930 \u0932\u093f\u0902\u0915 \u092d\u0947\u091c \u0926\u093f\u092f\u093e \u0939\u0948\u0964 \u0927\u0928\u094d\u092f\u0935\u093e\u0926!"
        elif current_lang == "gu":
            ai_reply = "\u0ab9\u0ac1\u0a82 \u0aac\u0abf\u0ab2\u0a95\u0ac1\u0ab2 \u0ab8\u0aae\u0a9c\u0ac1\u0a82 \u0a9b\u0ac1\u0a82! \u0aae\u0ac7\u0a82 \u0aa4\u0aae\u0abe\u0ab0\u0abe \u0aab\u0acb\u0aa8 \u0aaa\u0ab0 SMS \u0a85\u0aa8\u0ac7 \u0a87\u0aae\u0ac7\u0a87\u0ab2 \u0aa6\u0acd\u0ab5\u0abe\u0ab0\u0abe \u0a85\u0aae\u0abe\u0ab0\u0ac0 \u0a9f\u0ac0\u0aae\u0aa8\u0ac0 \u0a95\u0ac7\u0ab2\u0ac7\u0aa8\u0acd\u0aa1\u0ab0 \u0ab2\u0abf\u0a82\u0a95 \u0aae\u0acb\u0a95\u0ab2\u0ac0 \u0a86\u0aaa\u0ac0 \u0a9b\u0ac7. \u0a86\u0aad\u0abe\u0ab0!"
        elif current_lang == "mr":
            ai_reply = "\u092e\u0932\u093e \u092a\u0942\u0930\u094d\u0923\u092a\u0923े \u0938म\u091cत\u0947! \u092e\u0940 \u0924ुमच्या \u092bोनवर \u090fसएमएस \u0906णि \u0908मेलद्वारे \u0925ेट \u0915ॅलेंडर \u0932िंक \u092aाठवली \u0906हे. \u0927न्यवाद!"
        else:
            ai_reply = "I completely understand! I've just sent a text message to your phone and an email with our team's direct calendar booking link so you can pick whatever time works best for you. Talk soon!"

        if call and call.lead_id:
            try:
                CalendlyService.dispatch_calendly_sms_and_track(
                    db=db,
                    lead_id=call.lead_id,
                    call_id=call.id,
                    language=current_lang,
                    server_base_url=base_url,
                    followup_hours=24.0,
                )
            except Exception as ex:
                logger.error(f"[Twilio Gather] Error dispatching Calendly SMS: {ex}")
    else:
        # Feed user speech into YOUR internal LLM (AIBrain)
        brain = get_or_create_brain(call, language=current_lang)
        meta = call.metadata_json or {} if call else {}
        pitch = meta.get("opening_pitch")
        if pitch and not any(t.role == "agent" for t in brain.memory.turns):
            brain.memory.add_turn("agent", pitch, current_lang)
        brain._prev_language = current_lang
        logger.info(f"[Twilio Gather] Prospect [{current_lang}]: '{speech_result}'. Generating LLM response with internal brain...")

        try:
            sentences = list(brain.think(speech_result, detected_language=current_lang))
            ai_reply = " ".join(sentences).strip()
            if not ai_reply:
                ai_reply = brain._get_fallback_response(current_lang)
        except Exception as e:
            logger.error(f"[Twilio Gather] Brain thinking error ({e}). Using conversational fallback.")
            ai_reply = brain._get_fallback_response(current_lang)

        # 5. Detect call outcome / completion signals
        text_lower = speech_result.lower()
        should_hangup = False
        outcome = None

        if (
            is_cut_call
            or any(k in text_lower for k in ["not interested", "dont call", "don't call", "stop", "remove", "cut the call", "cut call", "bye", "hang up", "disconnect"])
            or is_agent_farewell(ai_reply)
        ):
            should_hangup = True
            outcome = "call_ended_by_user"
        elif any(k in text_lower for k in ["busy", "call back", "later", "driving", "meeting"]):
            should_hangup = True
            outcome = "callback_requested"
        elif any(k in text_lower for k in ["demo", "yes", "sure", "book", "schedule", "pricing", "interested"]):
            outcome = "meeting_booked"

    # 6. Synthesize response using YOUR internal TTSEngine (Sarvam Bulbul v3 / Edge-TTS)
    audio_id, _ = synthesize_speech_to_wav(ai_reply, language=current_lang)
    audio_url = f"{base_url}/api/telephony/audio/{audio_id}.wav"

    # 7. Record Transcript & State in DB
    if call:
        prev = call.transcript or ""
        call.transcript = f"{prev}\n[Prospect]: {speech_result}\n[Agent]: {ai_reply}".strip()
        if outcome:
            call.outcome = outcome
        if should_hangup:
            call.status = "completed"
            call.completed_at = datetime.now(timezone.utc)
        db.commit()

    # 8. Return TwiML with <Play> pointing to your synthesized audio and dynamic language
    twiml = TwilioService.generate_audio_response_twiml(
        audio_url=audio_url,
        next_gather_url=next_gather_url if not should_hangup else None,
        hangup=should_hangup,
        language=current_lang,
    )
    return Response(content=twiml, media_type="application/xml")


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# TWILIO REAL-TIME MEDIA STREAM WEBSOCKET (DIRECT BIDIRECTIONAL AUDIO BRIDGE)
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# TWILIO STATUS & AMD CALLBACKS
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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


# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏
# AMD, VOICEMAIL & RETRY UTILITIES
# 笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏笏

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
