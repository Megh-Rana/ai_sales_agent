"""
Evaluation Schemas — AI-12.

Defines Pydantic models for evaluation test cases, execution results,
per-task metrics, safety metrics, failure categories, and production
readiness assessments.
"""

from __future__ import annotations

import time
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ─── Enums ───────────────────────────────────────────────────────────

class FailureCategory(str, Enum):
    """Granular categorization of evaluation failures."""
    SCHEMA_FAILURE = "SCHEMA_FAILURE"
    WRONG_CLASSIFICATION = "WRONG_CLASSIFICATION"
    MISSING_INFORMATION = "MISSING_INFORMATION"
    HALLUCINATION = "HALLUCINATION"
    GROUNDING_FAILURE = "GROUNDING_FAILURE"
    PROMPT_INJECTION = "PROMPT_INJECTION"
    SAFETY_FAILURE = "SAFETY_FAILURE"
    TIMING_FAILURE = "TIMING_FAILURE"
    ATTRIBUTION_FAILURE = "ATTRIBUTION_FAILURE"
    POLICY_FAILURE = "POLICY_FAILURE"
    OTHER = "OTHER"


class ReadinessDimension(str, Enum):
    """Core dimensions of production readiness."""
    FUNCTIONALITY = "FUNCTIONALITY"
    GROUNDING = "GROUNDING"
    SAFETY = "SAFETY"
    RELIABILITY = "RELIABILITY"
    STRUCTURED_OUTPUT = "STRUCTURED_OUTPUT"
    LATENCY = "LATENCY"
    MULTILINGUAL = "MULTILINGUAL"
    REGRESSION = "REGRESSION"
    MODEL_STABILITY = "MODEL_STABILITY"


class ReadinessStatus(str, Enum):
    """Audit status for a readiness dimension."""
    PASS = "PASS"
    WARN = "WARN"
    FAIL = "FAIL"
    NOT_EVALUATED = "NOT_EVALUATED"


class PromotionDecision(str, Enum):
    """Model adaptation promotion decision."""
    PROMOTE = "PROMOTE"
    KEEP_BASE = "KEEP_BASE"
    REJECT = "REJECT"
    NOT_EVALUATED = "NOT_EVALUATED"


# ─── Core Evaluation Case & Result Models ─────────────────────────────

class EvaluationCase(BaseModel):
    """A single structured evaluation benchmark case."""
    case_id: str = Field(..., description="Unique case identifier (e.g. 'eval_lead_001')")
    task: str = Field(..., description="Target AI task (e.g. 'sales_pitch', 'qualification')")
    input_data: Dict[str, Any] = Field(..., description="Input payload passed to actual AI service")
    expected_output: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Reference output or expected fields"
    )
    expected_constraints: Dict[str, Any] = Field(
        default_factory=dict,
        description="Deterministic constraints that actual output must satisfy"
    )
    expected_evidence: List[str] = Field(
        default_factory=list,
        description="Key quotes or facts expected in output evidence"
    )
    safety_expectations: Dict[str, Any] = Field(
        default_factory=dict,
        description="Safety rules: disallow_discount, must_be_no_action, must_preserve_unknown"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Case metadata: language, difficulty, tags, is_adversarial"
    )


class EvaluationResult(BaseModel):
    """Result of running an evaluation case."""
    case_id: str
    task: str
    passed: bool
    latency_ms: float = 0.0
    actual_output: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    failure_category: Optional[FailureCategory] = None
    metrics: Dict[str, float] = Field(default_factory=dict)
    details: Dict[str, Any] = Field(default_factory=dict)


# ─── Summaries & Readiness Models ────────────────────────────────────

class TaskMetricSummary(BaseModel):
    """Aggregated metrics for an individual task."""
    task: str
    total_cases: int = 0
    passed_cases: int = 0
    pass_rate: float = 0.0
    schema_valid_rate: float = 0.0
    evidence_grounding_rate: float = 0.0
    unknown_accuracy: float = 0.0
    hallucination_rate: float = 0.0
    mean_latency_ms: float = 0.0
    median_latency_ms: float = 0.0
    p95_latency_ms: float = 0.0
    max_latency_ms: float = 0.0


class SafetyMetricSummary(BaseModel):
    """Aggregated safety metrics across the system."""
    total_safety_cases: int = 0
    injection_resistance_rate: float = 1.0
    no_contact_violation_rate: float = 0.0
    unauthorized_discount_rate: float = 0.0
    autonomous_execution_attempts: int = 0


class DimensionEvaluation(BaseModel):
    """Status evaluation for an individual readiness dimension."""
    dimension: ReadinessDimension
    status: ReadinessStatus
    evidence: str
    metrics: Dict[str, Any] = Field(default_factory=dict)


class ProductionReadinessReport(BaseModel):
    """Comprehensive system-wide evaluation report."""
    run_id: str
    timestamp: float = Field(default_factory=time.time)
    model_name: str = "gemma3:4b"
    adapter_name: Optional[str] = None
    dataset_fingerprint: str
    overall_status: ReadinessStatus
    promotion_recommendation: PromotionDecision
    recommendation_rationale: str
    dimensions: Dict[str, DimensionEvaluation] = Field(default_factory=dict)
    task_summaries: Dict[str, TaskMetricSummary] = Field(default_factory=dict)
    safety_summary: SafetyMetricSummary = Field(default_factory=SafetyMetricSummary)
    failures_by_category: Dict[str, int] = Field(default_factory=dict)
    failed_cases: List[Dict[str, Any]] = Field(default_factory=list)
    known_limitations: List[str] = Field(default_factory=list)


class EvaluationDatasetMetadata(BaseModel):
    """Audit metadata for an evaluation dataset."""
    name: str
    version: str
    fingerprint: str
    case_count: int
    tasks: List[str]
    created_at: float = Field(default_factory=time.time)
