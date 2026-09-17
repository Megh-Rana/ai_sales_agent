"""
Qualification Schemas — AI-08.

Defines Pydantic models for Qualification input and output contracts.
Produces transparent, evidence-backed qualification assessments across 6 core dimensions:
1. NEED
2. FIT
3. AUTHORITY
4. TIMELINE
5. BUDGET
6. DECISION_PROCESS

Strict Scope Boundary:
AI-08 answers whether the prospect meets defined qualification criteria.
It does NOT perform buying-signal classification (AI-09), objection classification (AI-09),
or Next Best Action recommendations (AI-10).
"""

from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, field_validator

from ai.core.schemas.base import BaseAIServiceOutput, Evidence
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.intent_scoring import IntentDetectionOutput, LeadScoreOutput
from ai.core.schemas.company_research import CompanyResearchOutput
from ai.core.schemas.sales_pitch import PersonalizedSalesPitchOutput
from ai.core.schemas.conversation_intelligence import ConversationIntelligenceOutput

QualificationDimensionName = Literal[
    "NEED",
    "FIT",
    "AUTHORITY",
    "TIMELINE",
    "BUDGET",
    "DECISION_PROCESS",
]

DimensionStatus = Literal[
    "CONFIRMED",
    "PARTIAL",
    "UNKNOWN",
    "DISQUALIFIED",
]

OverallQualificationStatus = Literal[
    "QUALIFIED",
    "PARTIALLY_QUALIFIED",
    "NOT_QUALIFIED",
    "UNKNOWN",
]


class QualificationCriterion(BaseModel):
    """Evaluation of an individual qualification dimension."""

    dimension: QualificationDimensionName = Field(
        description="The qualification dimension being evaluated"
    )
    status: DimensionStatus = Field(
        default="UNKNOWN",
        description="Status: 'CONFIRMED', 'PARTIAL', 'UNKNOWN', or 'DISQUALIFIED'"
    )
    evidence: Optional[str] = Field(
        default=None,
        description="Verbatim quote or grounded factual snippet supporting this status"
    )
    explanation: str = Field(
        default="",
        description="Brief narrative explanation of why this status was assigned"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0)"
    )
    provenance: str = Field(
        default="UNKNOWN",
        description="Origin source indicator: 'CONVERSATION', 'LEAD_INTELLIGENCE', 'BUSINESS_INTELLIGENCE', 'COMPANY_RESEARCH', 'USER_PROVIDED', 'UNKNOWN'"
    )

    @field_validator("dimension", mode="before")
    @classmethod
    def normalize_dimension(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "NEED"
        cleaned = v.strip().upper()
        valid = {"NEED", "FIT", "AUTHORITY", "TIMELINE", "BUDGET", "DECISION_PROCESS"}
        if cleaned in valid:
            return cleaned
        if "DECIS" in cleaned or "PROCESS" in cleaned:
            return "DECISION_PROCESS"
        if "TIME" in cleaned or "URGEN" in cleaned:
            return "TIMELINE"
        if "AUTH" in cleaned or "DECISION_MAKER" in cleaned:
            return "AUTHORITY"
        if "BUDG" in cleaned or "PRICE" in cleaned or "COST" in cleaned:
            return "BUDGET"
        if "FIT" in cleaned or "ICP" in cleaned or "INDUSTRY" in cleaned:
            return "FIT"
        if "NEED" in cleaned or "PAIN" in cleaned or "REQ" in cleaned:
            return "NEED"
        return "NEED"

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        valid = {"CONFIRMED", "PARTIAL", "UNKNOWN", "DISQUALIFIED"}
        if cleaned in valid:
            return cleaned
        if "DISQUALIF" in cleaned or "FAIL" in cleaned or "REJECT" in cleaned:
            return "DISQUALIFIED"
        if "CONFIRM" in cleaned or "MET" in cleaned or "YES" in cleaned or "QUALIF" in cleaned:
            return "CONFIRMED"
        if "PARTIAL" in cleaned or "INCOMPLETE" in cleaned or "MAYBE" in cleaned or "SOME" in cleaned:
            return "PARTIAL"
        return "UNKNOWN"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0


class QualificationOutput(BaseAIServiceOutput):
    """
    Structured qualification output produced by AI-08.
    Inherits timestamp, provider, model, latency_ms, raw_response from BaseAIServiceOutput.
    """

    overall_status: OverallQualificationStatus = Field(
        default="UNKNOWN",
        description="Overall qualification status: 'QUALIFIED', 'PARTIALLY_QUALIFIED', 'NOT_QUALIFIED', 'UNKNOWN'"
    )
    dimensions: List[QualificationCriterion] = Field(
        default_factory=list,
        description="Structured evaluation across the 6 qualification dimensions"
    )
    confirmed_criteria: List[str] = Field(
        default_factory=list,
        description="List of dimension names confirmed with evidence"
    )
    partial_criteria: List[str] = Field(
        default_factory=list,
        description="List of dimension names with partial evidence"
    )
    unknown_criteria: List[str] = Field(
        default_factory=list,
        description="List of dimension names with insufficient information"
    )
    disqualified_criteria: List[str] = Field(
        default_factory=list,
        description="List of dimension names where prospect is disqualified"
    )
    qualification_gaps: List[str] = Field(
        default_factory=list,
        description="Descriptive gaps requiring clarification (e.g. 'Budget has not been discussed')"
    )
    disqualifying_factors: List[str] = Field(
        default_factory=list,
        description="Explicit evidence-backed factors that disqualify the prospect"
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Traceable evidence items supporting the qualification assessment"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in qualification assessment (0.0 to 1.0)"
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Deterministic summary reasoning explaining status determination"
    )

    def get_criterion(self, dimension: str) -> Optional[QualificationCriterion]:
        """Convenience method to retrieve criterion by dimension name."""
        target = dimension.strip().upper()
        for c in self.dimensions:
            if c.dimension == target:
                return c
        return None

    @field_validator("overall_status", mode="before")
    @classmethod
    def normalize_overall_status(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        valid = {"QUALIFIED", "PARTIALLY_QUALIFIED", "NOT_QUALIFIED", "UNKNOWN"}
        if cleaned in valid:
            return cleaned
        if "NOT" in cleaned or "DISQUALIF" in cleaned:
            return "NOT_QUALIFIED"
        if "PARTIAL" in cleaned:
            return "PARTIALLY_QUALIFIED"
        if "QUALIF" in cleaned:
            return "QUALIFIED"
        return "UNKNOWN"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0


class QualificationInput(BaseModel):
    """Input contract aggregating context from all relevant AI intelligence layers."""

    business_context: Optional[BusinessIntelligenceOutput] = Field(
        default=None,
        description="Phase 3 Business Intelligence output defining offerings, ICP, and value props"
    )
    lead_intelligence: Optional[LeadIntelligenceOutput] = Field(
        default=None,
        description="Phase 4 Lead Intelligence output defining prospect role, company, and raw requirements"
    )
    lead_score: Optional[LeadScoreOutput] = Field(
        default=None,
        description="Phase 5 Lead Score output (FOR CONTEXT ONLY — does NOT determine qualification)"
    )
    intent_information: Optional[IntentDetectionOutput] = Field(
        default=None,
        description="Phase 5 Intent Detection output (FOR CONTEXT ONLY — high intent does NOT automatically qualify)"
    )
    conversation_intelligence: Optional[ConversationIntelligenceOutput] = Field(
        default=None,
        description="Phase 7 Conversation Intelligence output providing primary conversation facts"
    )
    company_research: Optional[CompanyResearchOutput] = Field(
        default=None,
        description="Phase 6 Company Research output providing verified company facts"
    )
    sales_pitch: Optional[PersonalizedSalesPitchOutput] = Field(
        default=None,
        description="Phase 7 Personalized Sales Pitch context (background only)"
    )
    qualification_overrides: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional administrative qualification overrides"
    )
    custom_criteria: Optional[List[str]] = Field(
        default=None,
        description="Optional enterprise-specific qualification criteria guidelines"
    )
