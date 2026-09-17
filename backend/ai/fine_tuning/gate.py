"""
Fine-Tuning Decision Gate & Baseline Tracking — AI-11.

Enforces the critical architectural rule:
"Should we fine-tune?"
Fine-tuning is recommended ONLY when prompting + in-context learning + deterministic
post-processing are proven insufficient by concrete evidence.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from ai.fine_tuning.schemas import BaselineRecord


VALID_FINE_TUNING_EVIDENCE_CATEGORIES = {
    "repeated_domain_extraction_failures",
    "persistent_formatting_failures",
    "consistent_sales_terminology_errors",
    "multilingual_domain_errors",
    "systematic_pitch_style_failures",
    "measurable_benchmark_improvement_potential",
}


class DecisionGateResult(BaseModel):
    """Result of fine-tuning need assessment."""
    approved: bool = Field(description="True if fine-tuning is justified by evidence")
    reasons: List[str] = Field(default_factory=list, description="Rationale for gate decision")
    recommended_action: str = Field(description="Next recommended step")
    evidence_provided: List[str] = Field(default_factory=list)


class FineTuningDecisionGate:
    """
    Evaluates whether fine-tuning is warranted based on empirical failure evidence.
    Prevents premature or unnecessary local fine-tuning.
    """

    @classmethod
    def evaluate(cls, evidence_items: List[str]) -> DecisionGateResult:
        """
        Evaluate provided evidence against accepted fine-tuning rationales.
        """
        if not evidence_items:
            return DecisionGateResult(
                approved=False,
                reasons=[
                    "No failure evidence provided. Fine-tuning should not be executed "
                    "without demonstrated limitations in prompting or in-context learning."
                ],
                recommended_action="Continue with standard Gemma 3 4B prompting and prompt engineering.",
                evidence_provided=[],
            )

        recognized: List[str] = []
        for item in evidence_items:
            normalized = item.strip().lower()
            for cat in VALID_FINE_TUNING_EVIDENCE_CATEGORIES:
                if cat in normalized or normalized in cat:
                    recognized.append(cat)

        if not recognized:
            return DecisionGateResult(
                approved=False,
                reasons=[
                    "Supplied evidence items do not match recognized fine-tuning justification categories: "
                    f"{list(VALID_FINE_TUNING_EVIDENCE_CATEGORIES)}"
                ],
                recommended_action="Refine prompt instructions, examples, or schema validation in Python first.",
                evidence_provided=evidence_items,
            )

        return DecisionGateResult(
            approved=True,
            reasons=[
                f"Sufficient domain adaptation evidence identified: {sorted(list(set(recognized)))}."
            ],
            recommended_action="Proceed to capture base model baseline before training LoRA adapter.",
            evidence_provided=evidence_items,
        )


class BaselineTracker:
    """
    Records and verifies performance baselines on the canonical base model (gemma3:4b)
    prior to adapter training.
    """

    def __init__(self, storage_path: str | Path = "models/baselines.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)

    def record_baseline(
        self,
        task: str,
        metric_name: str,
        metric_value: float,
        dataset_version: str,
        configuration: Optional[Dict[str, Any]] = None,
        model_name: str = "gemma3:4b",
    ) -> BaselineRecord:
        """Record a baseline benchmark metric on the base model."""
        record = BaselineRecord(
            model_name=model_name,
            dataset_version=dataset_version,
            task=task,
            metric_name=metric_name,
            metric_value=metric_value,
            configuration=configuration or {},
        )

        existing = self.load_baselines()
        key = f"{model_name}|{task}|{metric_name}|{dataset_version}"
        existing[key] = record.model_dump()

        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2)

        return record

    def get_baseline(
        self,
        task: str,
        metric_name: str,
        dataset_version: str,
        model_name: str = "gemma3:4b"
    ) -> Optional[BaselineRecord]:
        """Retrieve recorded baseline metric if available."""
        existing = self.load_baselines()
        key = f"{model_name}|{task}|{metric_name}|{dataset_version}"
        if key in existing:
            return BaselineRecord(**existing[key])
        return None

    def load_baselines(self) -> Dict[str, Any]:
        """Load all recorded baselines."""
        if not self.storage_path.exists():
            return {}
        try:
            with open(self.storage_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
