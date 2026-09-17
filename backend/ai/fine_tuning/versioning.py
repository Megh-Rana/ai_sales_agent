"""
Dataset Versioning & Fingerprinting — AI-11.

Generates deterministic SHA-256 fingerprints for datasets ensuring immutability,
traceability, and reproducible training runs.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List, Optional
from ai.fine_tuning.schemas import DatasetMetadata, DatasetSplit, TrainingExample


def canonicalize_example(example: TrainingExample) -> Dict[str, Any]:
    """
    Produce a deterministic dictionary representation of a training example
    excluding mutable local timestamps.
    """
    return {
        "id": example.id,
        "task": example.task.value,
        "instruction": example.instruction.strip(),
        "input": example.input,
        "output": example.output,
        "source": example.metadata.source,
        "source_type": example.metadata.source_type.value,
        "conversation_id": example.conversation_id or "",
    }


def compute_dataset_fingerprint(
    examples: List[TrainingExample],
    dataset_name: str = "",
    seed: int = 42
) -> str:
    """
    Compute a deterministic SHA-256 fingerprint for a collection of training examples.
    Sorting ensures order-invariance of inputs.
    """
    canonical_list = [canonicalize_example(ex) for ex in examples]
    # Sort deterministically by id
    canonical_list.sort(key=lambda x: x["id"])

    payload = {
        "dataset_name": dataset_name,
        "seed": seed,
        "examples": canonical_list,
    }

    serialized = json.dumps(payload, sort_keys=True, ensure_ascii=True)
    hasher = hashlib.sha256()
    hasher.update(serialized.encode("utf-8"))
    return hasher.hexdigest()


def generate_dataset_metadata(
    dataset_name: str,
    dataset_version: str,
    examples: List[TrainingExample],
    split: Optional[DatasetSplit] = None,
    seed: int = 42,
    base_model: str = "gemma3:4b",
    validation_status: str = "VALIDATED"
) -> DatasetMetadata:
    """
    Generate comprehensive audit metadata for a dataset version.
    """
    fingerprint = compute_dataset_fingerprint(examples, dataset_name=dataset_name, seed=seed)

    task_counts: Dict[str, int] = {}
    source_counts: Dict[str, int] = {}

    for ex in examples:
        t = ex.task.value
        task_counts[t] = task_counts.get(t, 0) + 1

        s = ex.metadata.source_type.value
        source_counts[s] = source_counts.get(s, 0) + 1

    train_c = len(split.train) if split else 0
    val_c = len(split.val) if split else 0
    test_c = len(split.test) if split else 0

    return DatasetMetadata(
        dataset_name=dataset_name,
        dataset_version=dataset_version,
        fingerprint=fingerprint,
        example_count=len(examples),
        task_counts=task_counts,
        source_counts=source_counts,
        train_count=train_c,
        val_count=val_c,
        test_count=test_c,
        random_seed=seed,
        base_model=base_model,
        validation_status=validation_status,
    )
