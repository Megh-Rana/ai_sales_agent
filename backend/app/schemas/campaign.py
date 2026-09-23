from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CampaignLeadCreate(BaseModel):
    lead_id: UUID = Field(..., description="Foreign key reference to real Lead.id in database")
    custom_opening_hook: Optional[str] = Field(None, description="Personalized opening pitch hook")
    custom_value_prop: Optional[str] = Field(None, description="Personalized value proposition")
    status: Optional[str] = Field("QUEUED", description="Initial lead outreach status")


class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Campaign display name")
    objective: str = Field("REQUIREMENT_RESPONSE", description="Campaign objective type")
    primary_channel: str = Field("AI_VOICE_CALL", description="Primary communication channel")
    status: str = Field("RUNNING", description="Initial campaign execution status")
    estimated_pipeline_value: Optional[str] = Field(None, description="Estimated total pipeline value")
    business_id: Optional[UUID] = Field(None, description="Optional business ID")
    timezone: Optional[str] = Field("UTC", description="IANA timezone for scheduling (e.g., Asia/Kolkata)")
    business_hours_start: Optional[str] = Field("09:00", description="Business hours start time (HH:MM)")
    business_hours_end: Optional[str] = Field("18:00", description="Business hours end time (HH:MM)")
    repeat_enabled: Optional[str] = Field("false", description="Enable repeat campaign (true/false)")
    repeat_schedule: Optional[str] = Field(None, description="Repeat frequency: daily, weekly, monthly")
    lead_ids: Optional[List[UUID]] = Field(default_factory=list, description="List of real lead IDs to attach")
    leads: Optional[List[CampaignLeadCreate]] = Field(default_factory=list, description="Detailed lead hooks to attach")


class CampaignLeadResponse(BaseModel):
    id: UUID
    campaign_id: UUID
    lead_id: UUID
    status: str
    custom_opening_hook: Optional[str] = None
    custom_value_prop: Optional[str] = None
    created_at: datetime

    # Denormalized/joined fields from Lead model for UI rendering
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_role: Optional[str] = None
    industry: Optional[str] = None
    intent_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class CampaignResponse(BaseModel):
    id: UUID
    owner_id: UUID
    business_id: Optional[UUID] = None
    name: str
    objective: str
    objective_label: Optional[str] = None
    primary_channel: str
    status: str
    estimated_pipeline_value: Optional[str] = None
    timezone: str = "UTC"
    business_hours_start: str = "09:00"
    business_hours_end: str = "18:00"
    repeat_enabled: str = "false"
    repeat_schedule: Optional[str] = None
    target_audience_count: int = 0
    contacted_count: int = 0
    qualified_count: int = 0
    meetings_booked_count: int = 0
    conversion_rate: float = 0.0
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    leads: List[CampaignLeadResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
