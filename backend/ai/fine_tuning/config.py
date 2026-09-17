"""
Training Configuration Management — AI-11.

Handles training hyperparameters, LoRA configuration, environment checks,
and validation of training constraints.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional
import torch

from ai.fine_tuning.schemas import LoRAConfig, TrainingConfig, TrainingConfigurationError


class HardwareEnvironment:
    """Detects available hardware capabilities for local training."""

    @staticmethod
    def get_info() -> Dict[str, Any]:
        has_cuda = torch.cuda.is_available()
        gpu_count = torch.cuda.device_count() if has_cuda else 0
        device_name = torch.cuda.get_device_name(0) if has_cuda and gpu_count > 0 else "CPU"
        total_vram_gb = 0.0

        if has_cuda and gpu_count > 0:
            total_vram_gb = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2)

        return {
            "cuda_available": has_cuda,
            "gpu_count": gpu_count,
            "device_name": device_name,
            "total_vram_gb": total_vram_gb,
            "torch_version": torch.__version__,
        }


def get_default_training_config(
    dataset_version: str = "v1.0.0",
    output_dir: str = "models/adapters",
    mock_mode: bool = False
) -> TrainingConfig:
    """
    Generate a safe, validated default training configuration tailored
    for local training of Gemma 3 4B via LoRA.
    """
    return TrainingConfig(
        base_model="gemma3:4b",
        output_dir=output_dir,
        dataset_version=dataset_version,
        seed=42,
        epochs=3,
        learning_rate=2e-4,
        batch_size=2,
        gradient_accumulation_steps=4,
        max_seq_length=2048,
        warmup_ratio=0.05,
        weight_decay=0.01,
        logging_steps=10,
        save_steps=50,
        eval_steps=50,
        lora=LoRAConfig(
            r=16,
            lora_alpha=32,
            lora_dropout=0.05,
            bias="none",
            target_modules=[
                "q_proj", "k_proj", "v_proj", "o_proj",
                "gate_proj", "up_proj", "down_proj"
            ],
        ),
        quantization="none",
        mock_mode=mock_mode,
    )


def load_training_config(config_path: str | Path) -> TrainingConfig:
    """Load and validate training configuration from a JSON file."""
    path = Path(config_path)
    if not path.exists():
        raise TrainingConfigurationError(f"Training config file does not exist: {config_path}")

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return TrainingConfig(**data)
    except Exception as e:
        raise TrainingConfigurationError(f"Failed to parse training config from {config_path}: {e}")


def save_training_config(config: TrainingConfig, output_path: str | Path) -> None:
    """Save training configuration to a JSON file."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config.model_dump(), f, indent=2)
