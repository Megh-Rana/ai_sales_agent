from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SegmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the lead segment")
    description: Optional[str] = Field(None, description="Optional notes or description for this segment")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Filter criteria state dictionary")
    lead_count: int = Field(default=0, ge=0, description="Total matching lead count at creation")


class SegmentCreate(SegmentBase):
    business_id: Optional[UUID] = Field(None, description="Optional business ID to associate with")


class SegmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    lead_count: Optional[int] = Field(None, ge=0)


class SegmentResponse(SegmentBase):
    id: UUID
    owner_id: Optional[UUID] = None
    business_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
