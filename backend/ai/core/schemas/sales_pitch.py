"""
Sales Pitch Schemas — Phase 7.

Defines Pydantic models for Personalized Sales Pitch input and output contracts.
Enforces component breakdown, complete assembled pitch, explicit personalization
points with evidence provenance, and internal scoring privacy.
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field, field_validator, model_validator

from ai.core.schemas.base import BaseAIServiceOutput
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.intent_scoring import IntentDetectionOutput, LeadScoreOutput, WhyNowOutput
from ai.core.schemas.company_research import CompanyResearchOutput
from ai.core.schemas.retrieval import RetrievedEvidence


class PersonalizationPoint(BaseModel):
    """An individual point of personalization with supporting evidence."""

    point: str = Field(
        default="",
        description="Feature, need, or trigger being personalized (e.g. 'Automated Route Scheduling')"
    )
    claim: str = Field(
        default="",
        description="Specific statement made in the pitch about the prospect or solution"
    )
    source: str = Field(
        default="UNKNOWN",
        description="Origin of this point (e.g. 'Lead Requirement', 'Company Research', 'Why Now', 'Retrieved Evidence')"
    )
    evidence_text: Optional[str] = Field(
        default=None,
        description="Supporting quote or excerpt from the supplied intelligence"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for this personalization claim (0.0 to 1.0)"
    )
    provenance: str = Field(
        default="INFERRED",
        description="Provenance classification: 'USER_PROVIDED', 'RESEARCHED', 'INFERRED', 'UNKNOWN'"
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


class PersonalizedSalesPitchOutput(BaseAIServiceOutput):
    """Structured output for personalized sales pitch generation."""

    opening: str = Field(
        default="",
        description="Natural, tailored opening addressing the prospect"
    )
    relevance: str = Field(
        default="",
        description="Why the seller's offering is relevant to this specific prospect"
    )
    pain_point: str = Field(
        default="",
        description="The specific problem or need supported by intelligence"
    )
    value_proposition: str = Field(
        default="",
        description="How the seller's product/service solves the identified problem"
    )
    why_now: str = Field(
        default="",
        description="Timing or urgency hook (populated ONLY when supported by Why Now evidence)"
    )
    proof_or_evidence: str = Field(
        default="",
        description="Concrete supporting proof or evidence from context (no fabricated claims)"
    )
    call_to_action: str = Field(
        default="",
        description="Low-friction next step tailored to intent level"
    )
    full_pitch: str = Field(
        default="",
        description="Complete assembled conversational sales pitch"
    )
    personalization_points: List[PersonalizationPoint] = Field(
        default_factory=list,
        description="List of explicit personalization points and their evidence provenance"
    )
    evidence_used: List[str] = Field(
        default_factory=list,
        description="Summary of evidence snippets used to craft the pitch"
    )
    style_tone: str = Field(
        default="professional",
        description="Pitch style/tone adopted: 'direct', 'exploratory', 'educational', 'discovery'"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in pitch grounding and validity"
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Internal strategic reasoning for pitch formulation"
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


class SalesPitchInput(BaseModel):
    """Input contract aggregating all intelligence layers for sales pitch generation."""

    business_intelligence: Optional[BusinessIntelligenceOutput] = Field(
        default=None,
        description="Phase 3 Business Intelligence output defining seller offerings, ICP, and value props"
    )
    lead_intelligence: Optional[LeadIntelligenceOutput] = Field(
        default=None,
        description="Phase 4 Lead Intelligence output defining prospect role, company, and raw requirements"
    )
    intent_detection: Optional[IntentDetectionOutput] = Field(
        default=None,
        description="Phase 5 Intent Detection output providing intent level and observable buying signals"
    )
    lead_score: Optional[LeadScoreOutput] = Field(
        default=None,
        description="Phase 5 Lead Scoring output providing internal deterministic score (NEVER exposed to prospect)"
    )
    why_now: Optional[WhyNowOutput] = Field(
        default=None,
        description="Phase 5 Why Now output providing urgency level and time-sensitive triggers"
    )
    company_research: Optional[CompanyResearchOutput] = Field(
        default=None,
        description="Phase 6 Company Research output providing grounded company facts"
    )
    retrieved_evidence: List[RetrievedEvidence] = Field(
        default_factory=list,
        description="Phase 6 Semantic retrieval results serving as passive evidence context"
    )
    seller_name: Optional[str] = Field(
        default=None,
        description="Optional seller/company name override"
    )
    seller_offering: Optional[str] = Field(
        default=None,
        description="Optional summary of seller products or services"
    )
    target_prospect_name: Optional[str] = Field(
        default=None,
        description="Optional target prospect name override"
    )
    target_company_name: Optional[str] = Field(
        default=None,
        description="Optional target company name override"
    )
    custom_instructions: Optional[str] = Field(
        default=None,
        description="Optional high-level sales guidance (e.g. 'focus on speed to launch')"
    )

    @model_validator(mode="before")
    @classmethod
    def normalize_inputs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "business_intel" in data and "business_intelligence" not in data:
                data["business_intelligence"] = data.pop("business_intel")
            if "lead_intel" in data and "lead_intelligence" not in data:
                data["lead_intelligence"] = data.pop("lead_intel")
            if data.get("retrieved_evidence") is None:
                data["retrieved_evidence"] = []
        return data
