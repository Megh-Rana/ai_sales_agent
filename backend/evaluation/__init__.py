"""
End-to-End Evaluation & Benchmark Harness — AI-12.

Provides the complete evaluation infrastructure for the AI Sales Agent platform,
measuring task performance, safety adherence, evidence grounding, base-vs-adapter
comparisons, and production readiness reporting.
"""

from evaluation.schemas import (
    DimensionEvaluation,
    EvaluationCase,
    EvaluationDatasetMetadata,
    EvaluationResult,
    FailureCategory,
    ProductionReadinessReport,
    PromotionDecision,
    ReadinessDimension,
    ReadinessStatus,
    SafetyMetricSummary,
    TaskMetricSummary,
)
from evaluation.config import EvaluationConfig
from evaluation.datasets import (
    EvaluationDatasetLoader,
    compute_eval_dataset_fingerprint,
    get_golden_benchmark,
    verify_no_contamination,
)
from evaluation.runners import EvaluationRunner
from evaluation.metrics import (
    aggregate_failures,
    calculate_latency_stats,
    calculate_task_summaries,
    detect_hallucinations,
)
from evaluation.safety import SafetyEvaluator
from evaluation.comparison import ModelComparator
from evaluation.reporting import (
    evaluate_production_readiness,
    generate_markdown_report,
    save_reports,
)

__all__ = [
    # Schemas & Enums
    "FailureCategory",
    "ReadinessDimension",
    "ReadinessStatus",
    "PromotionDecision",
    "EvaluationCase",
    "EvaluationResult",
    "TaskMetricSummary",
    "SafetyMetricSummary",
    "DimensionEvaluation",
    "ProductionReadinessReport",
    "EvaluationDatasetMetadata",
    # Config
    "EvaluationConfig",
    # Datasets
    "EvaluationDatasetLoader",
    "get_golden_benchmark",
    "compute_eval_dataset_fingerprint",
    "verify_no_contamination",
    # Runner
    "EvaluationRunner",
    # Metrics
    "calculate_latency_stats",
    "detect_hallucinations",
    "calculate_task_summaries",
    "aggregate_failures",
    # Safety
    "SafetyEvaluator",
    # Comparison & Reporting
    "ModelComparator",
    "evaluate_production_readiness",
    "generate_markdown_report",
    "save_reports",
]
