"""
Foundational Pydantic Schemas for AI Services.

Provides reusable schemas for Evidence, Confidence, Extracted Fields, and Base AI Outputs.
Enforces explicit representation of UNKNOWN data, confidence metrics, and evidence tracing.
"""

from typing import Generic, TypeVar, Optional, List, Any, Literal
import time
from pydantic import BaseModel, Field, field_validator

T = TypeVar("T")


class Evidence(BaseModel):
    """Evidence supporting an AI-extracted conclusion or field value."""

    source: Optional[str] = Field(
        default=None,
        description="Source of the evidence (e.g. 'transcript', 'company_doc', 'user_input')"
    )
    text: str = Field(
        description="Exact quote or snippet serving as evidence"
    )
    timestamp: Optional[float] = Field(
        default=None,
        description="Timestamp in seconds if derived from audio/transcript"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence level of this specific evidence piece (0.0 to 1.0)"
    )


class ExtractedField(BaseModel, Generic[T]):
    """
    Standard container for any AI-extracted sales intelligence value.
    Ensures every field carries value, status, confidence, and evidence.
    """

    value: Optional[T] = Field(
        default=None,
        description="Extracted value, or None if unknown"
    )
    status: Literal["CONFIRMED", "INFERRED", "UNKNOWN", "REJECTED"] = Field(
        default="UNKNOWN",
        description="Status of the extraction: CONFIRMED, INFERRED, UNKNOWN, or REJECTED"
    )
    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Model confidence score between 0.0 and 1.0"
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="List of supporting evidence items"
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Brief explanation of how this value was determined"
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def validate_confidence(cls, v: Any) -> float:
        if v is None:
            return 0.0
        try:
            val = float(v)
            return max(0.0, min(1.0, val))
        except (ValueError, TypeError):
            return 0.0


class BaseAIServiceOutput(BaseModel):
    """Base response class for all AI service outputs."""

    timestamp: float = Field(
        default_factory=time.time,
        description="UNIX timestamp when analysis was generated"
    )
    provider: str = Field(
        default="unknown",
        description="AI Provider used for generation (e.g. 'ollama', 'mock')"
    )
    model: str = Field(
        default="unknown",
        description="Model name used for generation"
    )
    latency_ms: float = Field(
        default=0.0,
        description="Execution latency in milliseconds"
    )
    raw_response: Optional[str] = Field(
        default=None,
        description="Raw output string from LLM before parsing (optional)"
    )
