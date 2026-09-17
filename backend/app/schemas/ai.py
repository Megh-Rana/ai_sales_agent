"""
Pydantic contracts for future AI/LLM integration.
Defines data structures and serialization boundaries ONLY — zero AI execution,
prompts, or live model calls are implemented.
"""
from enum import Enum
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class QualificationStatus(str, Enum):
    QUALIFIED = "qualified"
    UNQUALIFIED = "unqualified"
    NOT_DISCUSSED = "not_discussed"


class LeadAnalysisContract(BaseModel):
    """Contract for future AI lead research and synthesis."""
    summary: str = Field(..., description="High-level prospect executive overview")
    pain_points: List[str] = Field(default_factory=list, description="Extracted customer friction points")
    buying_signals: List[str] = Field(default_factory=list, description="Observed purchasing indicators")
    why_now: Optional[str] = Field(None, description="Timeliness and urgency rationale")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score (0.0 to 1.0)")
    sources: List[str] = Field(default_factory=list, description="Provenance and reference URLs")

    model_config = ConfigDict(extra="forbid")


class LeadScoringFactor(BaseModel):
    """Component scoring factor used in lead evaluation."""
    name: str = Field(..., description="Factor label (e.g., Tech Stack Alignment, Hiring Velocity)")
    weight: float = Field(..., ge=0.0, le=1.0, description="Factor weight")
    impact: str = Field(..., description="Impact category (positive, neutral, negative)")
    description: str = Field(..., description="Evidence explaining factor score")


class LeadScoringContract(BaseModel):
    """Contract for future AI predictive lead scoring."""
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Calculated score between 0.0 and 100.0")
    factors: List[LeadScoringFactor] = Field(default_factory=list, description="Score component breakdown")
    explanation: str = Field(..., description="Human-readable score explanation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in scoring evaluation")

    model_config = ConfigDict(extra="forbid")


class SalesPitchContract(BaseModel):
    """Contract for future AI personalized pitch generation."""
    opening: str = Field(..., description="Attention-grabbing opening hook")
    personalized_pitch: str = Field(..., description="Tailored core value proposition")
    value_proposition: str = Field(..., description="Concise ROI statement")
    talking_points: List[str] = Field(default_factory=list, description="Key agenda and discussion bullets")
    objection_handling: Dict[str, str] = Field(
        default_factory=dict,
        description="Anticipated objections mapped to response angles"
    )

    model_config = ConfigDict(extra="forbid")


class QualificationCriterion(BaseModel):
    """Single qualification dimension (e.g. Budget, Authority, Need, Timeline)."""
    criterion: str = Field(
        ...,
        description="Dimension: Need, Budget, Authority, Timeline, Current Solution, Urgency, Use Case, Decision Process"
    )
    value: Optional[str] = Field(None, description="Extracted detail if discussed")
    status: QualificationStatus = Field(
        default=QualificationStatus.NOT_DISCUSSED,
        description="State: qualified, unqualified, or not_discussed (never fabricated)"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Extraction confidence")
    evidence: Optional[str] = Field(None, description="Direct quote or source evidence")


class QualificationContract(BaseModel):
    """Structured prospect qualification framework (BANT/MEDDIC facts)."""
    criteria: List[QualificationCriterion] = Field(
        default_factory=list,
        description="Individual qualification criteria"
    )
    summary: Optional[str] = Field(None, description="Overall qualification summary")
    overall_status: str = Field(..., description="High-level status (qualified, pipeline, unqualified)")

    model_config = ConfigDict(extra="forbid")


class CallAnalysisContract(BaseModel):
    """Contract for future post-call AI analysis."""
    outcome: str = Field(..., description="Call result (meeting_booked, follow_up, not_interested, etc.)")
    summary: str = Field(..., description="Concise transcript summary")
    qualification: Optional[QualificationContract] = Field(None, description="Extracted qualification facts")
    buying_signals: List[str] = Field(default_factory=list, description="Buying signals captured on call")
    objections: List[str] = Field(default_factory=list, description="Objections raised by prospect")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall analysis confidence score")

    model_config = ConfigDict(extra="forbid")


class NextBestActionContract(BaseModel):
    """Contract for future AI next-step recommendations."""
    action: str = Field(..., description="Recommended sales action (e.g., send_proposal, schedule_demo)")
    timing: str = Field(..., description="Recommended execution window (e.g., immediate, within_24h)")
    reason: str = Field(..., description="Rationale supporting the recommendation")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model recommendation confidence")

    model_config = ConfigDict(extra="forbid")
