"""
Pydantic schemas for voice provider webhook ingestion and responses.
"""
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class CallWebhookPayload(BaseModel):
    event_id: str = Field(..., min_length=1, max_length=255, description="Unique provider event ID for idempotency")
    event_type: str = Field(..., min_length=1, max_length=100, description="Event action (e.g., call.started, call.completed, call.failed)")
    provider: str = Field(default="generic", max_length=50, description="Voice provider name (e.g., vapi, bland, twilio, generic)")
    provider_call_id: Optional[str] = Field(None, max_length=255, description="External telephony provider call session ID")
    status: Optional[str] = Field(None, max_length=50, description="New call status (scheduled, in_progress, completed, failed, etc.)")
    duration: Optional[int] = Field(None, ge=0, description="Call duration in seconds")
    transcript: Optional[str] = Field(None, description="Raw call transcript text")
    outcome: Optional[str] = Field(None, max_length=100, description="Call outcome category")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Arbitrary provider event metadata")


class CallWebhookResponse(BaseModel):
    status: str = Field(..., description="'processed' or 'ignored' (due to duplicate event)")
    call_id: UUID = Field(..., description="ID of the affected call")
    current_status: str = Field(..., description="Current status of the call after processing")
    message: str = Field(..., description="Execution status summary")
