"""
Company Research Schemas.

Defines Pydantic models for structured, evidence-backed company research.
Every meaningful fact is traceable to a source with provenance metadata.
UNKNOWN is used consistently where information is absent.
"""

from typing import List, Optional, Literal, Any, Dict
from pydantic import BaseModel, Field, field_validator
from ai.core.schemas.base import BaseAIServiceOutput


class ResearchSource(BaseModel):
    """Represents the origin of research information."""

    source_id: str = Field(
        description="Unique identifier for this source"
    )
    source_type: Literal[
        "USER_PROVIDED", "COMPANY_WEBSITE", "PUBLIC_PAGE", "CAREERS_PAGE",
        "NEWS_OR_PR", "JOB_LISTING", "RESEARCH_DOCUMENT", "UNKNOWN"
    ] = Field(
        default="UNKNOWN",
        description="Classification of the source origin"
    )
    title: Optional[str] = Field(
        default=None,
        description="Title or label for the source document"
    )
    url_or_locator: Optional[str] = Field(
        default=None,
        description="URL or locator reference for the source (not invented)"
    )
    retrieved_at: Optional[str] = Field(
        default=None,
        description="ISO timestamp or date when the source was retrieved"
    )
    publisher_or_domain: Optional[str] = Field(
        default=None,
        description="Publisher name or domain of the source"
    )
    reliability: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Reliability score of the source (0.0 to 1.0)"
    )
    content_reference: Optional[str] = Field(
        default=None,
        description="Brief reference or excerpt from the source content"
    )

    @field_validator("source_type", mode="before")
    @classmethod
    def normalize_source_type(cls, v: Any) -> str:
        valid = {
            "USER_PROVIDED", "COMPANY_WEBSITE", "PUBLIC_PAGE", "CAREERS_PAGE",
            "NEWS_OR_PR", "JOB_LISTING", "RESEARCH_DOCUMENT", "UNKNOWN"
        }
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        if cleaned in valid:
            return cleaned
        if "DOC" in cleaned or "FILE" in cleaned or "TEXT" in cleaned:
            return "RESEARCH_DOCUMENT"
        if "WEB" in cleaned or "SITE" in cleaned:
            return "COMPANY_WEBSITE"
        if "CAREER" in cleaned or "JOB" in cleaned:
            return "CAREERS_PAGE"
        if "NEWS" in cleaned or "PR" in cleaned:
            return "NEWS_OR_PR"
        if "USER" in cleaned:
            return "USER_PROVIDED"
        return "UNKNOWN"

    @field_validator("reliability", mode="before")
    @classmethod
    def clamp_reliability(cls, v: Any) -> float:
        if v is None:
            return 0.5
        try:
            val = float(v)
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.5


class ResearchFact(BaseModel):
    """Represents one normalized, evidence-backed company fact."""

    fact_type: str = Field(
        description=(
            "Type of fact (e.g. 'company_description', 'industry', "
            "'products_services', 'company_size', 'location', 'website', "
            "'hiring_activity', 'technology_signals', 'business_events', "
            "'public_requirements', 'relevant_initiatives', "
            "'potential_business_problems', 'buying_signals')"
        )
    )
    value: str = Field(
        description="The factual value. Use UNKNOWN if information is absent."
    )
    evidence: Optional[str] = Field(
        default=None,
        description="Supporting evidence text for this fact"
    )
    source_id: Optional[str] = Field(
        default=None,
        description="ID of the ResearchSource backing this fact"
    )
    provenance: Literal[
        "USER_PROVIDED", "RESEARCHED", "INFERRED", "UNKNOWN"
    ] = Field(
        default="UNKNOWN",
        description="How this fact was obtained"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence in this fact (0.0 to 1.0)"
    )

    @field_validator("provenance", mode="before")
    @classmethod
    def normalize_provenance(cls, v: Any) -> str:
        valid = {"USER_PROVIDED", "RESEARCHED", "INFERRED", "UNKNOWN"}
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        if cleaned in valid:
            return cleaned
        return "UNKNOWN"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            val = float(v)
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.0


class CompanyProfile(BaseModel):
    """Structured company profile summary with UNKNOWN defaults."""

    description: str = Field(
        default="UNKNOWN",
        description="Company description"
    )
    industry: str = Field(
        default="UNKNOWN",
        description="Primary industry"
    )
    products_or_services: str = Field(
        default="UNKNOWN",
        description="Main products or services"
    )
    company_size: str = Field(
        default="UNKNOWN",
        description="Company size (employees, revenue range, etc.)"
    )
    location: str = Field(
        default="UNKNOWN",
        description="Headquarters or primary location"
    )
    website: str = Field(
        default="UNKNOWN",
        description="Company website"
    )


class CompanyResearchInput(BaseModel):
    """Input to company research. Accepts pre-gathered research context."""

    company_name: str = Field(
        description="Name of the company to research"
    )
    website: Optional[str] = Field(
        default=None,
        description="Company website URL"
    )
    known_domain: Optional[str] = Field(
        default=None,
        description="Known domain or industry"
    )
    known_description: Optional[str] = Field(
        default=None,
        description="Known description or summary of the company"
    )
    existing_lead_context: Optional[str] = Field(
        default=None,
        description="Pre-existing lead or prospect context"
    )
    research_documents: Optional[List[str]] = Field(
        default=None,
        description="List of research document texts (e.g. website text, job listings, news)"
    )
    sources: Optional[List[ResearchSource]] = Field(
        default=None,
        description="Pre-defined source metadata for research documents"
    )


class CompanyResearchOutput(BaseAIServiceOutput):
    """
    Structured output from company research.

    Contains evidence-backed facts, source metadata, and a profile summary.
    Inherits timestamp, provider, model, latency_ms, raw_response from BaseAIServiceOutput.
    """

    company_name: str = Field(
        description="Name of the researched company"
    )
    company_profile: CompanyProfile = Field(
        default_factory=CompanyProfile,
        description="Structured company profile summary"
    )
    facts: List[ResearchFact] = Field(
        default_factory=list,
        description="List of normalized, evidence-backed research facts"
    )
    sources: List[ResearchSource] = Field(
        default_factory=list,
        description="List of research sources used"
    )
    research_summary: str = Field(
        default="UNKNOWN",
        description="Brief narrative summary of research findings"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Overall research confidence (0.0 to 1.0)"
    )
    provenance: str = Field(
        default="UNKNOWN",
        description="Overall provenance classification"
    )
    researched_at: Optional[str] = Field(
        default=None,
        description="ISO timestamp when research was performed"
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            val = float(v)
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.0
