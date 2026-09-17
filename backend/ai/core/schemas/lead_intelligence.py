"""
Lead Intelligence Schemas.

Defines Pydantic models for Lead Profile Input, Lead Intelligence Output, Provenance/Source Metadata,
Sub-profiles (Company, Prospect, Requirement), Buyer Persona Matches, and Raw Intent Signals.
"""

from typing import List, Optional, Literal, Any
from pydantic import BaseModel, Field, field_validator
from ai.core.schemas.base import BaseAIServiceOutput
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput


class SourceMetadata(BaseModel):
    """Provenance and source metadata for lead intelligence."""

    source_type: Literal[
        "USER_PROVIDED", "EXPLICIT_REQUIREMENT", "RESEARCH_CONTEXT", "INFERRED", "UNKNOWN"
    ] = Field(
        default="UNKNOWN", description="Primary source classification of lead information"
    )
    source_url: Optional[str] = Field(
        default=None, description="URL where lead/prospect information was sourced"
    )
    source_date: Optional[str] = Field(
        default=None, description="Date or timestamp of lead source information"
    )
    notes: Optional[str] = Field(
        default=None, description="Additional provenance or attribution notes"
    )

    @field_validator("source_type", mode="before")
    @classmethod
    def validate_source_type(cls, v: Any) -> str:
        valid = {"USER_PROVIDED", "EXPLICIT_REQUIREMENT", "RESEARCH_CONTEXT", "INFERRED", "UNKNOWN"}
        if isinstance(v, str):
            v_upper = v.upper().strip()
            if v_upper in valid:
                return v_upper
            return "USER_PROVIDED"
        return "UNKNOWN"


class LeadProfileInput(BaseModel):
    """Structured input model for raw lead and prospect context."""

    company_name: Optional[str] = Field(
        default=None, description="Target or lead company name"
    )
    company_domain: Optional[str] = Field(
        default=None, description="Company website domain (e.g. 'acme.com')"
    )
    company_description: Optional[str] = Field(
        default=None, description="Description of lead company"
    )
    prospect_name: Optional[str] = Field(
        default=None, description="Name of prospect or contact person"
    )
    prospect_role: Optional[str] = Field(
        default=None, description="Job title or role of prospect"
    )
    prospect_company: Optional[str] = Field(
        default=None, description="Company name associated with prospect"
    )
    prospect_location: Optional[str] = Field(
        default=None, description="Geographic location of prospect"
    )
    prospect_linkedin_or_source: Optional[str] = Field(
        default=None, description="LinkedIn profile or social source link"
    )
    industry: Optional[str] = Field(
        default=None, description="Lead industry category"
    )
    company_size: Optional[str] = Field(
        default=None, description="Lead company size or headcount range"
    )
    raw_requirement: Optional[str] = Field(
        default=None, description="Raw requirement or inquiry text submitted by lead"
    )
    source: Optional[str] = Field(
        default=None, description="Lead acquisition source (e.g. 'web_form', 'inbound_call')"
    )
    source_url: Optional[str] = Field(
        default=None, description="Source URL where lead was captured"
    )
    source_date: Optional[str] = Field(
        default=None, description="Source date string"
    )
    research_context: Optional[str] = Field(
        default=None, description="Additional research or web background context"
    )
    business_intelligence_context: Optional[BusinessIntelligenceOutput] = Field(
        default=None, description="Contextual Business Intelligence profile from Phase 3"
    )


class LeadCompanyProfile(BaseModel):
    """Structured company profile extracted from lead context."""

    company_name: Optional[str] = Field(
        default=None, description="Extracted lead company name"
    )
    domain: Optional[str] = Field(
        default=None, description="Company domain"
    )
    industry: Optional[str] = Field(
        default=None, description="Industry domain"
    )
    company_size: Optional[str] = Field(
        default=None, description="Company headcount or size range"
    )
    geography: Optional[str] = Field(
        default=None, description="Company geographic headquarters or presence"
    )
    description: Optional[str] = Field(
        default=None, description="Summary description of company operations"
    )
    likely_needs: List[str] = Field(
        default_factory=list, description="Inferred or explicit company needs"
    )
    technologies: List[str] = Field(
        default_factory=list, description="Known or inferred tech stack components"
    )
    business_characteristics: List[str] = Field(
        default_factory=list, description="Key business traits or characteristics"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting evidence or context"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0"
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


class ProspectProfile(BaseModel):
    """Structured prospect contact profile."""

    name: Optional[str] = Field(
        default=None, description="Prospect full name"
    )
    role: Optional[str] = Field(
        default=None, description="Job title or role"
    )
    department: Optional[str] = Field(
        default=None, description="Department or functional area"
    )
    seniority: Optional[str] = Field(
        default=None, description="Seniority level (e.g. 'C-Level', 'VP', 'Manager', 'UNKNOWN')"
    )
    responsibilities: List[str] = Field(
        default_factory=list, description="Key job responsibilities"
    )
    likely_goals: List[str] = Field(
        default_factory=list, description="Likely professional or operational goals"
    )
    likely_pain_points: List[str] = Field(
        default_factory=list, description="Likely pain points experienced by prospect"
    )
    decision_authority: str = Field(
        default="UNKNOWN",
        description="Level of decision authority ('DECISION_MAKER', 'INFLUENCER', 'END_USER', 'UNKNOWN')"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting evidence for prospect profile"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


class LeadRequirement(BaseModel):
    """Structured breakdown of explicit lead requirements and needs."""

    summary: Optional[str] = Field(
        default=None, description="Summary of stated lead requirement"
    )
    explicit_needs: List[str] = Field(
        default_factory=list, description="Explicitly stated needs"
    )
    pain_points: List[str] = Field(
        default_factory=list, description="Stated pain points"
    )
    requested_capabilities: List[str] = Field(
        default_factory=list, description="Requested features or capabilities"
    )
    urgency_signals: List[str] = Field(
        default_factory=list, description="Language indicating urgency"
    )
    timeline_signals: List[str] = Field(
        default_factory=list, description="Timeline or schedule mentions"
    )
    budget_signals: List[str] = Field(
        default_factory=list, description="Budget or pricing mentions"
    )
    constraints: List[str] = Field(
        default_factory=list, description="Stated constraints or dealbreakers"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting quotes or evidence"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


class BuyerPersonaMatch(BaseModel):
    """Match assessment between prospect and defined target buyer persona."""

    persona_role: str = Field(
        default="UNKNOWN", description="Matched buyer persona role name"
    )
    match_score: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Persona match score between 0.0 and 1.0"
    )
    matching_reasons: List[str] = Field(
        default_factory=list, description="Reasons supporting persona match"
    )
    mismatches: List[str] = Field(
        default_factory=list, description="Aspects contradicting or missing from persona match"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting evidence for match"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )

    @field_validator("match_score", "confidence", mode="before")
    @classmethod
    def clamp_score(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


class RawIntentSignal(BaseModel):
    """Raw buying/intent signal extracted from lead context."""

    signal: str = Field(
        default="", description="Identified raw intent signal name or phrase"
    )
    category: str = Field(
        default="EXPLICIT_REQUIREMENT",
        description="Category (e.g. 'EXPLICIT_REQUIREMENT', 'URGENCY', 'BUDGET', 'TIMELINE', 'SWITCHING', 'PRICING_REQUEST', 'DEMO_REQUEST', 'PAIN')"
    )
    description: str = Field(
        default="", description="Explanation of why this indicates raw intent"
    )
    strength: float = Field(
        default=0.5, ge=0.0, le=1.0, description="Raw signal strength between 0.0 and 1.0"
    )
    evidence: Optional[str] = Field(
        default=None, description="Direct quote or snippet serving as evidence"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )

    @field_validator("strength", "confidence", mode="before")
    @classmethod
    def clamp_score(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


class LeadIntelligenceOutput(BaseAIServiceOutput):
    """Complete structured Lead Intelligence Output."""

    company_profile: LeadCompanyProfile = Field(
        default_factory=LeadCompanyProfile, description="Extracted company profile"
    )
    prospect_profile: ProspectProfile = Field(
        default_factory=ProspectProfile, description="Extracted prospect contact profile"
    )
    requirement: LeadRequirement = Field(
        default_factory=LeadRequirement, description="Extracted requirement breakdown"
    )
    buyer_persona_matches: List[BuyerPersonaMatch] = Field(
        default_factory=list, description="Matching against target buyer personas"
    )
    raw_intent_signals: List[RawIntentSignal] = Field(
        default_factory=list, description="Extracted raw intent signal indicators"
    )
    missing_information: List[str] = Field(
        default_factory=list, description="List of key missing or unknown information items"
    )
    source_metadata: SourceMetadata = Field(
        default_factory=SourceMetadata, description="Provenance and attribution metadata"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Overall lead intelligence confidence score"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Summary reasoning or context"
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0
