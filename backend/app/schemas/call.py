from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CallStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    NO_ANSWER = "no_answer"


class CallBase(BaseModel):
    status: CallStatus = Field(default=CallStatus.SCHEDULED, description="Call session status")
    language: Optional[str] = Field("en", max_length=20, description="Call language code")
    duration: Optional[int] = Field(None, ge=0, description="Call duration in seconds")
    transcript: Optional[str] = Field(None, description="Call transcript text (storage only, no AI analysis)")
    outcome: Optional[str] = Field(None, max_length=100, description="Call outcome summary or category")
    provider: Optional[str] = Field(None, max_length=50, description="Voice provider name (e.g., generic, vapi, bland)")
    provider_call_id: Optional[str] = Field(None, max_length=255, description="External provider call identifier")


class CallCreate(CallBase):
    lead_id: UUID = Field(..., description="ID of the lead this call is associated with")
    metadata_json: Optional[Dict[str, Any]] = Field(None, description="Initial provider or session metadata")


class CallUpdate(BaseModel):
    status: Optional[CallStatus] = None
    language: Optional[str] = Field(None, max_length=20)
    duration: Optional[int] = Field(None, ge=0)
    transcript: Optional[str] = None
    outcome: Optional[str] = Field(None, max_length=100)
    provider: Optional[str] = Field(None, max_length=50)
    provider_call_id: Optional[str] = Field(None, max_length=255)
    metadata_json: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None
    completed_at: Optional[datetime] = None


class CallResponse(CallBase):
    id: UUID
    lead_id: UUID
    metadata_json: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
