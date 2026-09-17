"""
Evaluation Metrics Engine — AI-12.

Computes task-specific metrics, schema validity rates, evidence grounding,
hallucination rates, UNKNOWN preservation accuracy, and latency statistics.
"""

from __future__ import annotations

import statistics
from typing import Any, Dict, List, Optional, Tuple
from evaluation.schemas import (
    EvaluationResult,
    FailureCategory,
    TaskMetricSummary,
)


def calculate_latency_stats(latencies: List[float]) -> Dict[str, float]:
    """Compute mean, median, p95, and max latency in milliseconds."""
    if not latencies:
        return {"mean": 0.0, "median": 0.0, "p95": 0.0, "max": 0.0}

    sorted_lat = sorted(latencies)
    mean_val = round(statistics.mean(latencies), 2)
    median_val = round(statistics.median(latencies), 2)
    max_val = round(max(latencies), 2)

    # 95th percentile index
    p95_idx = int(round(len(sorted_lat) * 0.95)) - 1
    p95_val = round(sorted_lat[max(0, p95_idx)], 2)

    return {
        "mean": mean_val,
        "median": median_val,
        "p95": p95_val,
        "max": max_val,
    }


def detect_hallucinations(output: Dict[str, Any], input_data: Dict[str, Any]) -> Tuple[float, List[str]]:
    """
    Detect unsupported factual claims or fabricated URLs in output.
    Returns (hallucination_score: 0.0 to 1.0, list_of_reasons).
    """
    reasons = []
    output_str = str(output).lower()
    input_str = str(input_data).lower()

    # 1. Fabricated URLs check
    import re
    urls = re.findall(r"https?://[^\s'\"]+", output_str)
    for url in urls:
        if url not in input_str:
            reasons.append(f"Fabricated URL detected: {url}")

    # 2. Fabricated revenue / metric claims if input lacked metrics
    suspicious_keywords = ["$100m", "$50m", "10,000 employees", "fortune 500"]
    for kw in suspicious_keywords:
        if kw in output_str and kw not in input_str:
            reasons.append(f"Unsupported fabricated claim: '{kw}'")

    score = 1.0 if reasons else 0.0
    return score, reasons


def calculate_task_summaries(results: List[EvaluationResult]) -> Dict[str, TaskMetricSummary]:
    """
    Aggregate evaluation results per task with comprehensive metrics.
    """
    grouped: Dict[str, List[EvaluationResult]] = {}
    for r in results:
        if r.task not in grouped:
            grouped[r.task] = []
        grouped[r.task].append(r)

    summaries: Dict[str, TaskMetricSummary] = {}
    for task_name, task_results in grouped.items():
        total = len(task_results)
        passed = sum(1 for r in task_results if r.passed)
        pass_rate = round(passed / total, 4) if total > 0 else 0.0

        schema_valid_count = sum(1 for r in task_results if r.failure_category != FailureCategory.SCHEMA_FAILURE)
        schema_valid_rate = round(schema_valid_count / total, 4) if total > 0 else 0.0

        hallucination_count = sum(1 for r in task_results if r.failure_category == FailureCategory.HALLUCINATION)
        hallucination_rate = round(hallucination_count / total, 4) if total > 0 else 0.0

        unknown_valid_count = sum(
            1 for r in task_results
            if r.metrics.get("unknown_accuracy", 1.0) >= 0.99
        )
        unknown_accuracy = round(unknown_valid_count / total, 4) if total > 0 else 1.0

        latencies = [r.latency_ms for r in task_results if r.latency_ms > 0]
        lat_stats = calculate_latency_stats(latencies)

        summaries[task_name] = TaskMetricSummary(
            task=task_name,
            total_cases=total,
            passed_cases=passed,
            pass_rate=pass_rate,
            schema_valid_rate=schema_valid_rate,
            evidence_grounding_rate=round(1.0 - hallucination_rate, 4),
            unknown_accuracy=unknown_accuracy,
            hallucination_rate=hallucination_rate,
            mean_latency_ms=lat_stats["mean"],
            median_latency_ms=lat_stats["median"],
            p95_latency_ms=lat_stats["p95"],
            max_latency_ms=lat_stats["max"],
        )

    return summaries


def aggregate_failures(results: List[EvaluationResult]) -> Dict[str, int]:
    """Compile count of failures grouped by failure category."""
    counts: Dict[str, int] = {}
    for r in results:
        if not r.passed and r.failure_category:
            cat = r.failure_category.value
            counts[cat] = counts.get(cat, 0) + 1
    return counts
