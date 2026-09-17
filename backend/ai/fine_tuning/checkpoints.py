"""
Checkpoint Management — AI-11.

Persists, catalogs, and retrieves training checkpoint metadata.
Guarantees checkpoints are isolated from the canonical base model.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from ai.fine_tuning.schemas import CheckpointError, CheckpointMetadata


class CheckpointManager:
    """Manages adapter checkpoints and metadata indexes."""

    def __init__(self, checkpoints_dir: str | Path = "models/checkpoints"):
        self.checkpoints_dir = Path(checkpoints_dir)
        self.checkpoints_dir.mkdir(parents=True, exist_ok=True)
        self.index_file = self.checkpoints_dir / "checkpoints_index.json"

    def register_checkpoint(
        self,
        checkpoint_id: str,
        run_id: str,
        step: int,
        epoch: float,
        dataset_fingerprint: str,
        train_loss: Optional[float] = None,
        val_loss: Optional[float] = None,
        metrics: Optional[Dict[str, float]] = None,
        checkpoint_path: Optional[str] = None,
        base_model: str = "gemma3:4b",
    ) -> CheckpointMetadata:
        """
        Record a new checkpoint with its training metrics.
        """
        if base_model != "gemma3:4b":
            raise CheckpointError(f"Base model must remain 'gemma3:4b', received: '{base_model}'")

        ckpt_dir = Path(checkpoint_path) if checkpoint_path else (self.checkpoints_dir / checkpoint_id)
        ckpt_dir.mkdir(parents=True, exist_ok=True)

        meta = CheckpointMetadata(
            checkpoint_id=checkpoint_id,
            run_id=run_id,
            step=step,
            epoch=epoch,
            base_model=base_model,
            dataset_fingerprint=dataset_fingerprint,
            train_loss=train_loss,
            val_loss=val_loss,
            metrics=metrics or {},
            checkpoint_path=str(ckpt_dir),
            status="SAVED",
        )

        # Write metadata in checkpoint folder
        meta_file = ckpt_dir / "checkpoint_metadata.json"
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(meta.model_dump(), f, indent=2)

        # Update central index
        index = self._load_index()
        index[checkpoint_id] = meta.model_dump()
        self._save_index(index)

        return meta

    def get_checkpoint(self, checkpoint_id: str) -> Optional[CheckpointMetadata]:
        """Fetch metadata for a specific checkpoint."""
        index = self._load_index()
        if checkpoint_id in index:
            return CheckpointMetadata(**index[checkpoint_id])
        return None

    def list_checkpoints(self, run_id: Optional[str] = None) -> List[CheckpointMetadata]:
        """List all registered checkpoints, optionally filtered by run_id."""
        index = self._load_index()
        results: List[CheckpointMetadata] = []
        for item in index.values():
            ckpt = CheckpointMetadata(**item)
            if run_id is None or ckpt.run_id == run_id:
                results.append(ckpt)
        results.sort(key=lambda x: (x.run_id, x.step))
        return results

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
