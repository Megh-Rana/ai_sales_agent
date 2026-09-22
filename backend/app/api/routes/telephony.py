"""
Telephony API Routes for Vidur AI Sales Agent.
Exposes outbound PSTN dialing, Answering Machine Detection (AMD),
automated voicemail drop, and retry/callback scheduling endpoints.
"""

from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.call import CallResponse
from app.services.telephony_service import TelephonyService


router = APIRouter(prefix="/telephony", tags=["Telephony"])


class DialRequest(BaseModel):
    lead_id: UUID = Field(..., description="ID of the lead to dial")
    to_phone: Optional[str] = Field(None, description="Destination phone number")
    from_phone: Optional[str] = Field(None, description="Caller ID phone number")
    language: str = Field(default="en", description="Conversation language (en, hi, mr, gu)")
    carrier: str = Field(default="twilio", description="Carrier backend: 'twilio' or 'exotel'")
    enable_amd: bool = Field(default=True, description="Enable answering machine detection")


class AMDCheckRequest(BaseModel):
    carrier_answered_by: Optional[str] = Field(None, description="Twilio/Exotel AnsweredBy signal")
    initial_transcript: Optional[str] = Field(None, description="Greeting transcript text")
    greeting_duration_seconds: Optional[float] = Field(None, description="Length of greeting in seconds")


class VoicemailDropRequest(BaseModel):
    call_id: UUID = Field(..., description="Active call ID")
    language: str = Field(default="en", description="Voicemail audio language")
    custom_message: Optional[str] = Field(None, description="Optional custom voicemail text")


class RetryCheckRequest(BaseModel):
    call_id: UUID = Field(..., description="Unanswered call ID")
    max_retries: int = Field(default=3, ge=1, le=10)
    retry_interval_minutes: int = Field(default=15, ge=1, le=1440)


class CallbackScheduleRequest(BaseModel):
    lead_id: UUID = Field(..., description="Lead ID")
    callback_time_iso: str = Field(..., description="ISO 8601 timestamp for callback")
    prospect_timezone: str = Field(default="Asia/Kolkata", description="Prospect's local timezone")
    notes: Optional[str] = Field(None, description="Context or notes for the callback")


@router.get("/config", summary="Get carrier trunking configuration")
def get_carrier_config(current_user: AuthenticatedUser = Depends(get_current_user)):
    return TelephonyService.get_carrier_config()


@router.post("/dial", response_model=CallResponse, status_code=status.HTTP_201_CREATED, summary="Place outbound PSTN carrier call")
def dial_outbound(
    request: DialRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        call = TelephonyService.dial_outbound(
            db=db,
            lead_id=request.lead_id,
            owner_id=current_user.id,
            to_phone=request.to_phone,
            from_phone=request.from_phone,
            language=request.language,
            carrier=request.carrier,
            enable_amd=request.enable_amd,
        )
        return call
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


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
