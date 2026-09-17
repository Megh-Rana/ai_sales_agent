from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    IN_PROGRESS = "in_progress"
    QUALIFIED = "qualified"
    UNQUALIFIED = "unqualified"
    CONVERTED = "converted"
    LOST = "lost"


class LeadBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255, description="Prospect company name")
    contact_name: Optional[str] = Field(None, max_length=255, description="Contact person name")
    contact_email: Optional[EmailStr] = Field(None, description="Contact email address")
    contact_phone: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    requirement: Optional[str] = Field(None, description="Client requirement or interest description")
    industry: Optional[str] = Field(None, max_length=100, description="Lead industry")
    location: Optional[str] = Field(None, max_length=255, description="Lead location/region")
    source: Optional[str] = Field(None, max_length=100, description="Acquisition source (e.g. website, inbound, referral)")
    source_url: Optional[str] = Field(None, max_length=500, description="Origin URL or referral link")
    status: LeadStatus = Field(default=LeadStatus.NEW, description="Current lead lifecycle status")
    intent_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Stored intent score between 0 and 100 (pure storage, no AI scoring computed here)"
    )


class LeadCreate(LeadBase):
    business_id: UUID = Field(..., description="ID of the business this lead belongs to")


class LeadUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=255)
    contact_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = Field(None, max_length=50)
    requirement: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)
    source: Optional[str] = Field(None, max_length=100)
    source_url: Optional[str] = Field(None, max_length=500)
    status: Optional[LeadStatus] = None
    intent_score: Optional[float] = Field(None, ge=0.0, le=100.0)


class LeadResponse(LeadBase):
    id: UUID
    business_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
