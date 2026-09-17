from datetime import datetime
from typing import Any, List, Optional, Union
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class LeadIntelligenceBase(BaseModel):
    company_description: Optional[str] = Field(None, description="Detailed company profile")
    pain_points: Optional[Union[List[str], List[dict], dict]] = Field(
        None,
        description="Identified business pain points"
    )
    buying_signals: Optional[Union[List[str], List[dict], dict]] = Field(
        None,
        description="Buying signals and purchasing indicators"
    )
    why_now: Optional[str] = Field(None, description="Why now urgency factors")
    technology: Optional[Union[List[str], List[dict], dict]] = Field(
        None,
        description="Detected technology stack and tooling"
    )
    hiring_signals: Optional[Union[List[str], List[dict], dict]] = Field(
        None,
        description="Hiring patterns and role expansions"
    )
    funding_signals: Optional[Union[List[str], List[dict], dict]] = Field(
        None,
        description="Funding rounds and capital indicators"
    )
    competitors: Optional[Union[List[str], List[dict], dict]] = Field(
        None,
        description="Competitive landscape and alternatives"
    )
    research_summary: Optional[str] = Field(None, description="Comprehensive research summary")
    qualification: Optional[Union[List[dict], dict]] = Field(
        None,
        description="Structured qualification criteria (BANT/MEDDIC facts, never fabricated)"
    )
    raw_analysis: Optional[Union[List[dict], dict]] = Field(
        None,
        description="Extended structured AI analysis storage preserving source facts"
    )


class LeadIntelligenceCreate(LeadIntelligenceBase):
    pass


class LeadIntelligenceUpdate(LeadIntelligenceBase):
    pass


class LeadIntelligenceResponse(LeadIntelligenceBase):
    id: UUID
    lead_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
