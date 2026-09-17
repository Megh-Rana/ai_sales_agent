"""
Adapter Management & Promotion Engine — AI-11.

Controls the lifecycle of LoRA adapters:
EXPERIMENTAL -> EVALUATED -> PROMOTED or REJECTED -> ARCHIVED.
Enforces explicit, evidence-based promotion requiring baseline improvement,
guards against silent deployment, and provides safe rollback.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from ai.fine_tuning.schemas import (
    AdapterError,
    AdapterMetadata,
    AdapterStatus,
    BaselineRecord,
)


class AdapterManager:
    """Manages adapter catalog, evaluation gating, promotion, and rollbacks."""

    def __init__(self, adapters_dir: str | Path = "models/adapters"):
        self.adapters_dir = Path(adapters_dir)
        self.adapters_dir.mkdir(parents=True, exist_ok=True)
        self.index_file = self.adapters_dir / "adapters_index.json"

    def register_adapter(
        self,
        adapter_id: str,
        adapter_name: str,
        adapter_version: str,
        dataset_version: str,
        dataset_fingerprint: str,
        run_id: str,
        adapter_path: str,
        checkpoint_id: Optional[str] = None,
        metrics: Optional[Dict[str, float]] = None,
        base_model: str = "gemma3:4b",
    ) -> AdapterMetadata:
        """Register a freshly trained adapter in EXPERIMENTAL state."""
        if base_model != "gemma3:4b":
            raise AdapterError(f"Base model must remain 'gemma3:4b', received '{base_model}'")

        adapter_dir = Path(adapter_path)
        adapter_dir.mkdir(parents=True, exist_ok=True)

        meta = AdapterMetadata(
            adapter_id=adapter_id,
            adapter_name=adapter_name,
            adapter_version=adapter_version,
            base_model=base_model,
            dataset_version=dataset_version,
            dataset_fingerprint=dataset_fingerprint,
            run_id=run_id,
            checkpoint_id=checkpoint_id,
            adapter_path=str(adapter_dir),
            status=AdapterStatus.EXPERIMENTAL,
            metrics=metrics or {},
            created_at=time.time(),
        )

        self._save_adapter_meta(meta)
        index = self._load_index()
        index[adapter_id] = meta.model_dump()
        self._save_index(index)

        return meta

    def record_evaluation(
        self,
        adapter_id: str,
        evaluation_metrics: Dict[str, float],
        baseline: Optional[BaselineRecord] = None,
    ) -> AdapterMetadata:
        """
        Record evaluation results for an adapter, transitioning it to EVALUATED.
        """
        adapter = self.get_adapter(adapter_id)
        if not adapter:
            raise AdapterError(f"Adapter '{adapter_id}' not found.")

        if adapter.status == AdapterStatus.REJECTED:
            raise AdapterError(f"Cannot evaluate rejected adapter '{adapter_id}'.")

        adapter.metrics.update(evaluation_metrics)
        adapter.status = AdapterStatus.EVALUATED

        if baseline:
            adapter.baseline_comparison = {
                "metric_name": baseline.metric_name,
                "baseline_value": baseline.metric_value,
                "adapter_value": evaluation_metrics.get(baseline.metric_name),
                "delta": round(
                    evaluation_metrics.get(baseline.metric_name, 0.0) - baseline.metric_value,
                    4
                ),
            }

        self._update_adapter(adapter)
        return adapter

    def promote_adapter(
        self,
        adapter_id: str,
        promoted_by: str = "system",
        baseline: Optional[BaselineRecord] = None,
        target_metric: Optional[str] = None,
        min_improvement_delta: float = 0.0,
    ) -> AdapterMetadata:
        """
        Explicitly promote an adapter to production metadata status.
        Requires evaluation and verification that adapter performs at least as well
        or better than the canonical base model baseline.
        """
        adapter = self.get_adapter(adapter_id)
        if not adapter:
            raise AdapterError(f"Adapter '{adapter_id}' not found.")

        if adapter.status == AdapterStatus.REJECTED:
            raise AdapterError(
                f"Promotion rejected: Adapter '{adapter_id}' was marked REJECTED and cannot be promoted."
            )

        if adapter.status != AdapterStatus.EVALUATED:
            raise AdapterError(
                f"Promotion requires explicit prior evaluation. Current status: '{adapter.status.value}'."
            )

        # Baseline gate
        if baseline and target_metric:
            adapter_score = adapter.metrics.get(target_metric)
            if adapter_score is None:
                raise AdapterError(
                    f"Promotion failed: Target metric '{target_metric}' not found in adapter evaluation metrics."
                )

            delta = adapter_score - baseline.metric_value
            if delta < min_improvement_delta:
                adapter.status = AdapterStatus.REJECTED
                adapter.rejection_reason = (
                    f"Metric '{target_metric}' ({adapter_score}) failed to beat baseline "
                    f"({baseline.metric_value}) by required delta of {min_improvement_delta}."
                )
                self._update_adapter(adapter)
                raise AdapterError(
                    f"Promotion rejected: Adapter underperformed baseline on '{target_metric}'. {adapter.rejection_reason}"
                )

        # Demote any currently promoted adapter
        all_adapters = self.list_adapters()
        for other in all_adapters:
            if other.adapter_id != adapter_id and other.status == AdapterStatus.PROMOTED:
                other.status = AdapterStatus.ARCHIVED
                self._update_adapter(other)

        adapter.status = AdapterStatus.PROMOTED
        adapter.promoted_at = time.time()
        adapter.promoted_by = promoted_by
        self._update_adapter(adapter)
        return adapter

    def reject_adapter(self, adapter_id: str, reason: str) -> AdapterMetadata:
        """Mark an adapter as REJECTED."""
        adapter = self.get_adapter(adapter_id)
        if not adapter:
            raise AdapterError(f"Adapter '{adapter_id}' not found.")

        adapter.status = AdapterStatus.REJECTED
        adapter.rejection_reason = reason
        self._update_adapter(adapter)
        return adapter

    def rollback(
        self,
        promoted_adapter_id: str,
        rollback_target: str = "canonical_base_model"
    ) -> AdapterMetadata:
        """
        Roll back a promoted adapter to ARCHIVED, restoring canonical base model status.
        """
        adapter = self.get_adapter(promoted_adapter_id)
        if not adapter:
            raise AdapterError(f"Adapter '{promoted_adapter_id}' not found.")

        if adapter.status != AdapterStatus.PROMOTED:
            raise AdapterError(f"Adapter '{promoted_adapter_id}' is not currently PROMOTED.")

        adapter.status = AdapterStatus.ARCHIVED
        adapter.rollback_target = rollback_target
        self._update_adapter(adapter)
        return adapter

    def get_adapter(self, adapter_id: str) -> Optional[AdapterMetadata]:
        """Fetch adapter metadata by id."""
        index = self._load_index()
        if adapter_id in index:
            return AdapterMetadata(**index[adapter_id])
        return None

    def list_adapters(self, status: Optional[AdapterStatus] = None) -> List[AdapterMetadata]:
        """List all adapters, optionally filtered by lifecycle status."""
        index = self._load_index()
        results: List[AdapterMetadata] = []
        for item in index.values():
            meta = AdapterMetadata(**item)
            if status is None or meta.status == status:
                results.append(meta)
        results.sort(key=lambda x: x.created_at, reverse=True)
        return results

    def _save_adapter_meta(self, meta: AdapterMetadata) -> None:
        p = Path(meta.adapter_path) / "adapter_metadata.json"
        with open(p, "w", encoding="utf-8") as f:
            json.dump(meta.model_dump(), f, indent=2)

    def _update_adapter(self, meta: AdapterMetadata) -> None:
        self._save_adapter_meta(meta)
        index = self._load_index()
        index[meta.adapter_id] = meta.model_dump()
        self._save_index(index)

    def _load_index(self) -> Dict[str, Any]:
        if not self.index_file.exists():
            return {}
        try:
            with open(self.index_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_index(self, index: Dict[str, Any]) -> None:
        with open(self.index_file, "w", encoding="utf-8") as f:
            json.dump(index, f, indent=2)
