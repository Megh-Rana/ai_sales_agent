from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class DiscoveryScanRequest(BaseModel):
    keyword: str = Field(..., min_length=1, description="Target search keyword or commercial requirement term")
    industry: Optional[str] = Field(None, description="Industry filter, e.g. 'IT Services', 'Healthcare', 'Logistics'")
    location: Optional[str] = Field(None, description="Location filter, e.g. 'Global', 'North America', 'India'")
    sources: Optional[List[str]] = Field(
        default_factory=lambda: ["LinkedIn", "Public B2B RFP Directories", "Freelance Job Boards"],
        description="Public sources to query for requirement signals"
    )


class DiscoveredLeadEnrichment(BaseModel):
    id: UUID
    name: str = Field(..., description="Contact name, or 'unavailable'")
    business_email: str = Field(..., description="Business email, or 'unavailable'")
    phone: str = Field(..., description="Contact phone, or 'unavailable'")
    linkedin_profile: str = Field(..., description="LinkedIn profile URL, or 'unavailable'")
    company_name: str = Field(..., description="Prospect company name")
    website: str = Field(..., description="Company website URL, or 'unavailable'")
    job_title: str = Field(..., description="Job title or executive role, or 'unavailable'")
    industry: str = Field(..., description="Prospect industry")
    location: str = Field(..., description="Prospect location")
    company_size: str = Field(..., description="Estimated employee size range, or 'unavailable'")
    original_post_url: str = Field(..., description="Verified clickable source post URL")
    source_platform: str = Field(..., description="Source platform name (e.g. LinkedIn, Public B2B RFP)")
    discovery_date: str = Field(..., description="Discovery capture date")
    intent_score: float = Field(..., ge=0.0, le=100.0, description="Calculated commercial intent score")
    requirement: str = Field(..., description="Extracted requirement description")
    signal_type: Optional[str] = Field("direct_requirement", description="'direct_requirement' or 'inferred_hiring_signal'")
    is_inferred_from_hiring: bool = Field(False, description="True if requirement was inferred from job posting")
    inferred_need_basis: Optional[str] = Field(None, description="Explanation of inferred hiring signal")

    model_config = ConfigDict(from_attributes=True)


class DiscoveryScanResponse(BaseModel):
    total_discovered: int
    query: DiscoveryScanRequest
    leads: List[DiscoveredLeadEnrichment]
