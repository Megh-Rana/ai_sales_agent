"""
Intent Detection, Lead Scoring, and Why Now Schemas.

Defines Pydantic models for Intent Signals, Intent Detection Output,
Deterministic Score Components, Lead Score Output, and Why Now Output.
"""

from typing import List, Optional, Literal, Any
from pydantic import BaseModel, Field, field_validator, AliasChoices
from ai.core.schemas.base import BaseAIServiceOutput


# ---------------------------------------------------------------------------
# Intent Detection
# ---------------------------------------------------------------------------

class IntentSignal(BaseModel):
    """One detected buying/intent signal with provenance."""

    signal_type: str = Field(
        default="UNKNOWN",
        description="Category of intent signal (e.g. 'EXPLICIT_REQUIREMENT', 'BUDGET', 'TIMELINE', 'URGENCY', 'DEMO_REQUEST', 'PRICING_REQUEST', 'SWITCHING', 'PAIN', 'VENDOR_SEARCH')"
    )
    interpretation: str = Field(
        default="", description="What this signal means in context"
    )
    strength: float = Field(
        default=0.5, ge=0.0, le=1.0, description="Signal strength between 0.0 and 1.0"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting quote, snippet, or fact"
    )
    source: Optional[str] = Field(
        default=None, description="Origin of signal (e.g. 'raw_requirement', 'research_context')"
    )
    provenance: str = Field(
        default="UNKNOWN",
        description="Provenance classification: 'USER_PROVIDED', 'INFERRED', 'UNKNOWN'"
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


class IntentDetectionOutput(BaseAIServiceOutput):
    """Structured output from intent detection analysis."""

    intent_level: Literal["HIGH", "MEDIUM", "LOW", "UNKNOWN"] = Field(
        default="UNKNOWN",
        validation_alias=AliasChoices("intent_level", "overall_intent_level"),
        description="Overall assessed intent level"
    )
    intent_signals: List[IntentSignal] = Field(
        default_factory=list,
        validation_alias=AliasChoices("intent_signals", "buying_intent_signals"),
        description="All detected intent signals"
    )
    positive_signals: List[str] = Field(
        default_factory=list, description="Summary of positive buying indicators"
    )
    negative_signals: List[str] = Field(
        default_factory=list, description="Summary of negative or disqualifying indicators"
    )
    urgency_indicators: List[str] = Field(
        default_factory=list, description="Urgency-specific indicators"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Overall detection confidence"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Summary reasoning"
    )

    @field_validator("intent_level", mode="before")
    @classmethod
    def normalize_intent_level(cls, v: Any) -> str:
        if isinstance(v, str):
            v_upper = v.strip().upper()
            if "DISQUALIF" in v_upper or "NOT INTEREST" in v_upper or "REFUS" in v_upper:
                return "LOW"
            if v_upper in ["HIGH", "MEDIUM", "LOW", "UNKNOWN"]:
                return v_upper
        return v

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


# ---------------------------------------------------------------------------
# Deterministic Lead Scoring
# ---------------------------------------------------------------------------

class ScoreComponent(BaseModel):
    """One scoring dimension with awarded and maximum score."""

    component_name: str = Field(
        default="", description="Scoring dimension name"
    )
    score_awarded: float = Field(
        default=0.0, description="Points awarded for this component"
    )
    max_score: float = Field(
        default=0.0, description="Maximum possible points for this component"
    )
    reason: str = Field(
        default="", description="Explanation of why this score was awarded"
    )
    evidence_references: List[str] = Field(
        default_factory=list, description="Evidence items supporting the score"
    )


class LeadScoreOutput(BaseAIServiceOutput):
    """Deterministic lead score output with component breakdown."""

    final_score: float = Field(
        default=0.0, ge=0.0, le=100.0, description="Final deterministic lead score (0–100)"
    )
    score_band: Literal["HOT", "WARM", "COLD", "UNKNOWN"] = Field(
        default="UNKNOWN", description="Score classification band"
    )
    components: List[ScoreComponent] = Field(
        default_factory=list, description="Component-level score breakdown"
    )
    score_explanation: str = Field(
        default="", description="Human-readable score explanation"
    )
    scoring_version: str = Field(
        default="v1", description="Version of scoring algorithm used"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Overall score confidence"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Summary reasoning"
    )

    @field_validator("final_score", mode="before")
    @classmethod
    def clamp_final_score(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(100.0, float(v)))
        except (ValueError, TypeError):
            return 0.0

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 0.0


# ---------------------------------------------------------------------------
# Why Now / Buying Urgency
# ---------------------------------------------------------------------------

class TriggerSignal(BaseModel):
    """One urgency/timing trigger with supporting evidence."""

    trigger: str = Field(
        default="", description="Trigger event or fact"
    )
    evidence: Optional[str] = Field(
        default=None, description="Supporting evidence for trigger"
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


class WhyNowOutput(BaseAIServiceOutput):
    """Why Now / buying urgency analysis output."""

    why_now: str = Field(
        default="", description="Summary explanation of why this lead is actionable now"
    )
    urgency_level: Literal["HIGH", "MEDIUM", "LOW", "UNKNOWN"] = Field(
        default="UNKNOWN", description="Assessed urgency level"
    )
    trigger_signals: List[TriggerSignal] = Field(
        default_factory=list, description="Urgency trigger signals"
    )
    supporting_evidence: List[str] = Field(
        default_factory=list, description="Evidence supporting the Why Now assessment"
    )
    recommended_contact_window: str = Field(
        default="UNKNOWN",
        description="Recommended contact timing (e.g. 'Within 24-48 hours'). This is a recommendation, not a discovered fact."
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Overall confidence"
    )
    reasoning: Optional[str] = Field(
        default=None, description="Summary reasoning"
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
