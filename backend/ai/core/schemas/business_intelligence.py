"""
Business Intelligence Schemas.

Defines Pydantic models for Business Profile Input and Business Intelligence Output,
including ICP profiles, Buyer Personas, Value Propositions, Buying Signals, Disqualifying Signals,
Customer Pain Points, Likely Use Cases, and Discovery Questions.
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field, field_validator
from ai.core.schemas.base import BaseAIServiceOutput


class BusinessProfileInput(BaseModel):
    """Structured input model for business and product context."""

    business_name: Optional[str] = Field(
        default=None, description="Name of the business or company"
    )
    business_description: str = Field(
        default="", description="Detailed description of the business, product, or service"
    )
    products_or_services: Optional[List[str]] = Field(
        default_factory=list, description="List of products or services offered"
    )
    target_market: Optional[str] = Field(
        default=None, description="Target market segment or industry focus"
    )
    target_geography: Optional[str] = Field(
        default=None, description="Geographic regions served"
    )
    industry: Optional[str] = Field(
        default=None, description="Primary industry domain"
    )
    company_size: Optional[str] = Field(
        default=None, description="Target or subject company size"
    )
    pricing_information: Optional[str] = Field(
        default=None, description="Pricing structure, model, or details"
    )
    differentiators: Optional[List[str]] = Field(
        default_factory=list, description="Key differentiators or competitive advantages"
    )
    existing_sales_context: Optional[str] = Field(
        default=None, description="Current sales pipeline context or pitch background"
    )
    additional_context: Optional[str] = Field(
        default=None, description="Any additional relevant business information"
    )


class ICPProfile(BaseModel):
    """Ideal Customer Profile (ICP) structure."""

    industries: List[str] = Field(
        default_factory=list, description="Target industry verticals"
    )
    company_size: Optional[str] = Field(
        default=None, description="Ideal company size range (e.g. '50-200 employees')"
    )
    geography: Optional[str] = Field(
        default=None, description="Target geographic locations"
    )
    business_stage: Optional[str] = Field(
        default=None, description="Target company growth stage (e.g. 'Growth', 'Enterprise')"
    )
    technology_characteristics: List[str] = Field(
        default_factory=list, description="Tech stack or infrastructure characteristics"
    )
    common_needs: List[str] = Field(
        default_factory=list, description="Shared customer requirements"
    )
    common_pain_points: List[str] = Field(
        default_factory=list, description="Shared customer pain points"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Evidence or reasoning behind this profile"
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


class BuyerPersona(BaseModel):
    """Structured buyer persona."""

    role: str = Field(
        default="UNKNOWN", description="Job role or title (e.g. 'CTO', 'Founder', 'Operations Head')"
    )
    responsibilities: List[str] = Field(
        default_factory=list, description="Key job responsibilities"
    )
    goals: List[str] = Field(
        default_factory=list, description="Primary business goals"
    )
    pain_points: List[str] = Field(
        default_factory=list, description="Persona-specific pain points"
    )
    buying_motivations: List[str] = Field(
        default_factory=list, description="Factors driving purchase decision"
    )
    likely_objections: List[str] = Field(
        default_factory=list, description="Common objections from this persona"
    )
    decision_authority: str = Field(
        default="UNKNOWN", description="Authority level (e.g. 'DECISION_MAKER', 'INFLUENCER', 'END_USER', 'UNKNOWN')"
    )
    preferred_value_message: str = Field(
        default="", description="Tailored value message for this persona"
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


class ValueProposition(BaseModel):
    """Structured value proposition mapping problem to outcome."""

    customer_problem: str = Field(
        default="", description="Core customer problem addressed"
    )
    proposed_value: str = Field(
        default="", description="Proposed solution or value offered"
    )
    business_outcome: str = Field(
        default="", description="Expected business outcome or result"
    )
    supporting_differentiator: str = Field(
        default="", description="Differentiator supporting this value proposition"
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


class KeyDifferentiator(BaseModel):
    """Key competitive differentiator."""

    differentiator: str = Field(
        default="", description="Core differentiator capability or aspect"
    )
    description: str = Field(
        default="", description="Detailed description"
    )
    competitor_comparison: Optional[str] = Field(
        default=None, description="Comparison with existing market alternatives"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting evidence or context"
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


class BuyingSignal(BaseModel):
    """Positive buying signal candidate."""

    signal: str = Field(
        default="", description="Identified signal or event (e.g. 'asking for quote')"
    )
    description: str = Field(
        default="", description="Why this indicates purchase intent"
    )
    importance: str = Field(
        default="MEDIUM", description="Importance level: 'HIGH', 'MEDIUM', 'LOW'"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )
    evidence: Optional[str] = Field(
        default=None, description="Reasoning or source evidence"
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


class DisqualifyingSignal(BaseModel):
    """Disqualifying signal candidate."""

    signal: str = Field(
        default="", description="Identified signal indicating bad fit"
    )
    description: str = Field(
        default="", description="Why this signal disqualifies prospect"
    )
    severity: str = Field(
        default="HIGH", description="Severity level: 'CRITICAL', 'HIGH', 'MEDIUM'"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Reasoning or evidence behind disqualification"
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


class CustomerPainPoint(BaseModel):
    """Extracted customer pain point."""

    pain_point: str = Field(
        default="", description="Description of the pain point"
    )
    affected_persona: str = Field(
        default="UNKNOWN", description="Role or persona affected by this pain point"
    )
    severity: str = Field(
        default="MEDIUM", description="Severity level: 'HIGH', 'MEDIUM', 'LOW'"
    )
    business_impact: str = Field(
        default="", description="Impact on the customer's business"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score"
    )
    evidence: Optional[str] = Field(
        default=None, description="Evidence or reasoning"
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


class LikelyUseCase(BaseModel):
    """Likely use case for product/service."""

    use_case: str = Field(
        default="", description="Name or title of the use case"
    )
    description: str = Field(
        default="", description="Detailed scenario description"
    )
    target_segment: Optional[str] = Field(
        default=None, description="Target industry or customer segment"
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


class DiscoveryQuestion(BaseModel):
    """Recommended discovery question for sales calls."""

    question: str = Field(
        default="", description="Discovery question text"
    )
    target_problem: str = Field(
        default="", description="Problem or gap this question uncovers"
    )
    category: str = Field(
        default="CURRENT_SOLUTION",
        description="Category: 'CURRENT_SOLUTION', 'PROBLEM_SEVERITY', 'URGENCY', 'BUDGET', 'DECISION_PROCESS', 'TIMELINE', 'DESIRED_OUTCOME'"
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


class BusinessIntelligenceOutput(BaseAIServiceOutput):
    """Complete structured Business Intelligence Output."""

    icp: ICPProfile = Field(
        default_factory=ICPProfile, description="Ideal Customer Profile analysis"
    )
    buyer_personas: List[BuyerPersona] = Field(
        default_factory=list, description="Target buyer personas"
    )
    value_propositions: List[ValueProposition] = Field(
        default_factory=list, description="Core value propositions"
    )
    key_differentiators: List[KeyDifferentiator] = Field(
        default_factory=list, description="Key product/service differentiators"
    )
    positive_buying_signals: List[BuyingSignal] = Field(
        default_factory=list, description="Positive buying signal indicators"
    )
    disqualifying_signals: List[DisqualifyingSignal] = Field(
        default_factory=list, description="Disqualifying signal indicators"
    )
    customer_pain_points: List[CustomerPainPoint] = Field(
        default_factory=list, description="Common customer pain points"
    )
    likely_use_cases: List[LikelyUseCase] = Field(
        default_factory=list, description="Likely customer use cases"
    )
    target_industries: List[str] = Field(
        default_factory=list, description="List of target industries"
    )
    target_company_characteristics: List[str] = Field(
        default_factory=list, description="List of target company characteristics"
    )
    recommended_discovery_questions: List[DiscoveryQuestion] = Field(
        default_factory=list, description="Recommended discovery questions"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Overall intelligence confidence score"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Summary reasoning or evidence context"
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
