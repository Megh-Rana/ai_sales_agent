"""
Command-Line & Programmatic CLI Workflow — AI-11.

Provides high-level operational commands for:
- validating datasets
- inspecting fingerprints and metadata
- deterministic splitting
- decision gate evaluation
- adapter training
- adapter promotion and rollback
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from ai.fine_tuning.adapters import AdapterManager
from ai.fine_tuning.checkpoints import CheckpointManager
from ai.fine_tuning.config import get_default_training_config
from ai.fine_tuning.formatting import DatasetFormatter
from ai.fine_tuning.gate import BaselineTracker, FineTuningDecisionGate
from ai.fine_tuning.schemas import (
    AdapterStatus,
    DatasetSplit,
    ReviewStatus,
    SourceType,
    TaskType,
    TrainingExample,
)
from ai.fine_tuning.splitting import DatasetSplitter
from ai.fine_tuning.trainer import FineTuningTrainer
from ai.fine_tuning.validation import DatasetValidator
from ai.fine_tuning.versioning import compute_dataset_fingerprint, generate_dataset_metadata


class FineTuningPipelineCLI:
    """Entry point for executing fine-tuning pipeline steps."""

    def __init__(
        self,
        adapters_dir: str = "models/adapters",
        checkpoints_dir: str = "models/checkpoints",
        baselines_file: str = "models/baselines.json"
    ):
        self.adapter_manager = AdapterManager(adapters_dir=adapters_dir)
        self.checkpoint_manager = CheckpointManager(checkpoints_dir=checkpoints_dir)
        self.baseline_tracker = BaselineTracker(storage_path=baselines_file)
        self.validator = DatasetValidator(strict_schema=True)

    def load_examples_from_file(self, file_path: str | Path) -> List[TrainingExample]:
        """Load examples from JSON or JSONL."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        records: List[Dict[str, Any]] = []
        if path.suffix == ".jsonl":
            records = DatasetFormatter.read_jsonl(path)
        else:
            with open(path, "r", encoding="utf-8") as f:
                content = json.load(f)
                if isinstance(content, list):
                    records = content
                elif isinstance(content, dict) and "examples" in content:
                    records = content["examples"]
                else:
                    records = [content]

        examples: List[TrainingExample] = []
        for r in records:
            examples.append(TrainingExample(**r))
        return examples

    def validate_dataset(self, file_path: str | Path) -> Dict[str, Any]:
        """Validate dataset file and return audit summary."""
        raw_records = DatasetFormatter.read_jsonl(file_path) if str(file_path).endswith(".jsonl") else None
        if raw_records is None:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                raw_records = data if isinstance(data, list) else data.get("examples", [])

        valid_examples = []
        errors = []
        for r in raw_records:
            item_errors = self.validator.validate_example(r)
            if item_errors:
                errors.extend(item_errors)
            else:
                valid_examples.append(TrainingExample(**r))

        return {
            "total_records": len(raw_records),
            "valid_records": len(valid_examples),
            "error_count": len(errors),
            "errors": [
                {"id": e.example_id, "field": e.field, "code": e.error_code, "msg": e.message}
                for e in errors
            ],
            "is_valid": len(errors) == 0,
        }

    def inspect_dataset(self, examples: List[TrainingExample], name: str = "dataset") -> Dict[str, Any]:
        """Inspect and return fingerprint, counts, and task distribution."""
        fingerprint = compute_dataset_fingerprint(examples, dataset_name=name)
        meta = generate_dataset_metadata(name, "1.0.0", examples)
        return meta.model_dump()

    def split_and_save(
        self,
        examples: List[TrainingExample],
        output_dir: str | Path,
        seed: int = 42,
        train_ratio: float = 0.8,
        val_ratio: float = 0.1,
        test_ratio: float = 0.1,
    ) -> DatasetSplit:
        """Deterministically split and save JSONL files."""
        splitter = DatasetSplitter(
            train_ratio=train_ratio,
            val_ratio=val_ratio,
            test_ratio=test_ratio,
            seed=seed,
        )
        split = splitter.split(examples)

        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)

        DatasetFormatter.write_jsonl(split.train, out_path / "train.jsonl")
        DatasetFormatter.write_jsonl(split.val, out_path / "val.jsonl")
        DatasetFormatter.write_jsonl(split.test, out_path / "test.jsonl")

        meta = generate_dataset_metadata(
            dataset_name="sales_dataset",
            dataset_version="v1.0.0",
            examples=examples,
            split=split,
            seed=seed,
        )
        with open(out_path / "dataset_metadata.json", "w", encoding="utf-8") as f:
            json.dump(meta.model_dump(), f, indent=2)

        return split

    def evaluate_gate(self, evidence: List[str]) -> Dict[str, Any]:
        """Evaluate whether fine-tuning is justified."""
        result = FineTuningDecisionGate.evaluate(evidence)
        return result.model_dump()

    def run_training(
        self,
        split: DatasetSplit,
        dataset_fingerprint: str,
        mock_mode: bool = True,
        epochs: int = 3,
    ) -> Dict[str, Any]:
        """Execute adapter training."""
        config = get_default_training_config(mock_mode=mock_mode)
        config.epochs = epochs
        trainer = FineTuningTrainer(
            config=config,
            checkpoint_manager=self.checkpoint_manager,
            adapter_manager=self.adapter_manager,
        )
        adapter_meta = trainer.train(split, dataset_fingerprint)
        return adapter_meta.model_dump()
