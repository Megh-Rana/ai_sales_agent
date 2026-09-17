"""
Fine-Tuning Schemas — AI-11.

Defines Pydantic models for training examples, provenance metadata,
dataset versioning, training configuration, checkpoints, adapters,
and evaluation baselines.
"""

from __future__ import annotations

import time
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


# ─── Enums ───────────────────────────────────────────────────────────

class TaskType(str, Enum):
    """Supported sales platform AI task types."""
    BUSINESS_INTELLIGENCE = "business_intelligence"
    LEAD_INTELLIGENCE = "lead_intelligence"
    INTENT_DETECTION = "intent_detection"
    WHY_NOW = "why_now"
    COMPANY_RESEARCH = "company_research"
    SALES_PITCH = "sales_pitch"
    CONVERSATION_INTELLIGENCE = "conversation_intelligence"
    QUALIFICATION = "qualification"
    BUYING_SIGNALS_OBJECTIONS = "buying_signals_objections"
    NEXT_BEST_ACTION = "next_best_action"


class ReviewStatus(str, Enum):
    """Quality review status of training data."""
    DRAFT = "DRAFT"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    APPROVED = "APPROVED"


class SourceType(str, Enum):
    """Provenance origin of training examples."""
    CURATED = "CURATED"
    SYNTHETIC = "SYNTHETIC"
    HUMAN_CORRECTED = "HUMAN_CORRECTED"
    BENCHMARK = "BENCHMARK"


class AdapterStatus(str, Enum):
    """Lifecycle status of a trained adapter."""
    EXPERIMENTAL = "EXPERIMENTAL"
    EVALUATED = "EVALUATED"
    PROMOTED = "PROMOTED"
    REJECTED = "REJECTED"
    ARCHIVED = "ARCHIVED"


# ─── Exceptions ──────────────────────────────────────────────────────

class FineTuningError(Exception):
    """Base exception for fine-tuning pipeline."""
    pass


class DatasetValidationError(FineTuningError):
    """Raised when a dataset example fails validation."""
    def __init__(self, example_id: str, field: str, error_code: str, message: str):
        super().__init__(f"[{error_code}] Example '{example_id}' field '{field}': {message}")
        self.example_id = example_id
        self.field = field
        self.error_code = error_code
        self.message = message


class DatasetSplitError(FineTuningError):
    """Raised when dataset splitting fails or encounters leakage."""
    pass


class TrainingConfigurationError(FineTuningError):
    """Raised when training configuration is invalid."""
    pass


class TrainingDependencyError(FineTuningError):
    """Raised when optional training dependencies (e.g. PEFT/accelerate) are missing."""
    pass


class CheckpointError(FineTuningError):
    """Raised when checkpoint operations fail."""
    pass


class AdapterError(FineTuningError):
    """Raised when adapter management or promotion operations fail."""
    pass


# ─── Provenance & Example Models ─────────────────────────────────────

class ProvenanceMetadata(BaseModel):
    """Provenance and lineage tracking for a training example."""
    source: str = Field(
        ...,
        description="Origin identifier (e.g., 'sales_calls_q3', 'curated_playbook_v1')"
    )
    source_type: SourceType = Field(
        default=SourceType.CURATED,
        description="Classification of origin (CURATED, SYNTHETIC, HUMAN_CORRECTED, BENCHMARK)"
    )
    created_at: float = Field(
        default_factory=time.time,
        description="UNIX timestamp when example was created"
    )
    reviewer: Optional[str] = Field(
        default=None,
        description="Identifier of human reviewer if reviewed"
    )
    reviewed_at: Optional[float] = Field(
        default=None,
        description="UNIX timestamp of review"
    )
    original_output: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Original uncorrected model output if HUMAN_CORRECTED"
    )
    correction_notes: Optional[str] = Field(
        default=None,
        description="Explanation of corrections applied"
    )
    quality_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=1.0,
        description="Quality score from 0.0 to 1.0"
    )


class TrainingExample(BaseModel):
    """A single structured instruction-tuning example."""
    id: str = Field(
        ...,
        description="Globally unique identifier for the example"
    )
    task: TaskType = Field(
        ...,
        description="Target sales intelligence task"
    )
    instruction: str = Field(
        ...,
        min_length=1,
        description="System/task instruction prompting the model"
    )
    input: Dict[str, Any] = Field(
        ...,
        description="Structured input context / variables"
    )
    output: Dict[str, Any] = Field(
        ...,
        description="Structured target output matching task Pydantic schema"
    )
    metadata: ProvenanceMetadata = Field(
        ...,
        description="Provenance and audit metadata"
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="Conversation grouping ID to prevent turn leakage across splits"
    )
    review_status: ReviewStatus = Field(
        default=ReviewStatus.DRAFT,
        description="Review status (DRAFT, VALIDATED, REJECTED, APPROVED)"
    )

    @field_validator("id")
    @classmethod
    def validate_id_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Example ID cannot be empty or whitespace.")
        return v.strip()

    @field_validator("instruction")
    @classmethod
    def validate_instruction_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Instruction cannot be empty or whitespace.")
        return v.strip()

    @field_validator("input", "output")
    @classmethod
    def validate_dict_non_empty(cls, v: Dict[str, Any], info) -> Dict[str, Any]:
        if not isinstance(v, dict) or len(v) == 0:
            raise ValueError(f"{info.field_name} must be a non-empty dictionary.")
        return v


# ─── Dataset Split & Metadata Models ─────────────────────────────────

class DatasetSplit(BaseModel):
    """Splits of training data."""
    train: List[TrainingExample] = Field(default_factory=list)
    val: List[TrainingExample] = Field(default_factory=list)
    test: List[TrainingExample] = Field(default_factory=list)

    @property
    def total_count(self) -> int:
        return len(self.train) + len(self.val) + len(self.test)


class DatasetMetadata(BaseModel):
    """Metadata describing a versioned, fingerprinted dataset."""
    dataset_name: str = Field(..., description="Dataset name identifier")
    dataset_version: str = Field(..., description="Semantic dataset version string")
    fingerprint: str = Field(..., description="Deterministic SHA-256 fingerprint")
    created_at: float = Field(default_factory=time.time)
    example_count: int = Field(default=0)
    task_counts: Dict[str, int] = Field(default_factory=dict)
    source_counts: Dict[str, int] = Field(default_factory=dict)
    train_count: int = Field(default=0)
    val_count: int = Field(default=0)
    test_count: int = Field(default=0)
    random_seed: int = Field(default=42)
    base_model: str = Field(default="gemma3:4b")
    validation_status: str = Field(default="VALIDATED")


# ─── Configuration Models ────────────────────────────────────────────

class LoRAConfig(BaseModel):
    """LoRA parameter-efficient fine-tuning configuration."""
    r: int = Field(default=16, ge=1, le=256, description="LoRA rank")
    lora_alpha: int = Field(default=32, ge=1, le=512, description="LoRA alpha scaling factor")
    lora_dropout: float = Field(default=0.05, ge=0.0, le=0.5, description="LoRA dropout rate")
    bias: str = Field(default="none", description="Bias type ('none', 'all', 'lora_only')")
    target_modules: List[str] = Field(
        default_factory=lambda: [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
        description="Model module names to adapt"
    )
    task_type: str = Field(default="CAUSAL_LM", description="PEFT task type")


class TrainingConfig(BaseModel):
    """Complete fine-tuning execution configuration."""
    base_model: str = Field(
        default="gemma3:4b",
        description="Canonical base model identifier. Must remain gemma3:4b."
    )
    output_dir: str = Field(
        default="models/adapters",
        description="Directory where adapter checkpoints are saved"
    )
    dataset_version: str = Field(
        default="v1.0.0",
        description="Dataset version identifier"
    )
    seed: int = Field(
        default=42,
        description="Random seed for reproducibility"
    )
    epochs: int = Field(
        default=3,
        ge=1,
        le=100,
        description="Number of training epochs"
    )
    learning_rate: float = Field(
        default=2e-4,
        gt=0.0,
        le=1e-2,
        description="Initial learning rate"
    )
    batch_size: int = Field(
        default=2,
        ge=1,
        le=64,
        description="Per-device batch size"
    )
    gradient_accumulation_steps: int = Field(
        default=4,
        ge=1,
        le=128,
        description="Number of updates steps to accumulate before backward pass"
    )
    max_seq_length: int = Field(
        default=2048,
        ge=128,
        le=8192,
        description="Maximum token sequence length"
    )
    warmup_ratio: float = Field(
        default=0.05,
        ge=0.0,
        le=0.5,
        description="Warmup ratio of total training steps"
    )
    weight_decay: float = Field(
        default=0.01,
        ge=0.0,
        le=0.2,
        description="Weight decay"
    )
    logging_steps: int = Field(
        default=10,
        ge=1,
        description="Log metrics every X steps"
    )
    save_steps: int = Field(
        default=50,
        ge=1,
        description="Save checkpoint every X steps"
    )
    eval_steps: int = Field(
        default=50,
        ge=1,
        description="Run evaluation every X steps"
    )
    lora: LoRAConfig = Field(
        default_factory=LoRAConfig,
        description="LoRA adapter hyperparameters"
    )
    quantization: str = Field(
        default="none",
        description="Quantization mode: 'none', '4bit', '8bit'"
    )
    mock_mode: bool = Field(
        default=False,
        description="Mock execution mode for fast testing without GPU/weights"
    )

    @field_validator("base_model")
    @classmethod
    def validate_base_model(cls, v: str) -> str:
        if v != "gemma3:4b":
            raise ValueError(f"Base model must be 'gemma3:4b', received: '{v}'")
        return v

    @field_validator("quantization")
    @classmethod
    def validate_quantization(cls, v: str) -> str:
        valid = {"none", "4bit", "8bit"}
        if v not in valid:
            raise ValueError(f"Quantization must be one of {valid}, received: '{v}'")
        return v


# ─── Checkpoint & Adapter Models ─────────────────────────────────────

class CheckpointMetadata(BaseModel):
    """Metadata recorded for an individual training checkpoint."""
    checkpoint_id: str = Field(..., description="Unique checkpoint identifier (e.g. 'ckpt-step-100')")
    run_id: str = Field(..., description="Training run identifier")
    step: int = Field(..., ge=0, description="Training step number")
    epoch: float = Field(..., ge=0.0, description="Training epoch number")
    base_model: str = Field(default="gemma3:4b", description="Base model name")
    dataset_fingerprint: str = Field(..., description="Fingerprint of dataset trained on")
    train_loss: Optional[float] = Field(default=None, description="Training loss at step")
    val_loss: Optional[float] = Field(default=None, description="Validation loss at step")
    metrics: Dict[str, float] = Field(default_factory=dict, description="Additional recorded metrics")
    created_at: float = Field(default_factory=time.time)
    checkpoint_path: str = Field(..., description="Relative or absolute filesystem path to checkpoint")
    status: str = Field(default="SAVED", description="Checkpoint status")


class BaselineRecord(BaseModel):
    """Baseline performance benchmark measurement on the canonical base model."""
    model_name: str = Field(default="gemma3:4b")
    dataset_version: str = Field(...)
    task: str = Field(...)
    metric_name: str = Field(...)
    metric_value: float = Field(...)
    created_at: float = Field(default_factory=time.time)
    configuration: Dict[str, Any] = Field(default_factory=dict)


class AdapterMetadata(BaseModel):
    """Metadata recorded for an adapter throughout its lifecycle."""
    adapter_id: str = Field(..., description="Unique adapter identifier")
    adapter_name: str = Field(..., description="Human-readable adapter name")
    adapter_version: str = Field(..., description="Semantic version string")
    base_model: str = Field(default="gemma3:4b", description="Canonical base model")
    dataset_version: str = Field(..., description="Dataset version used")
    dataset_fingerprint: str = Field(..., description="Dataset content fingerprint")
    run_id: str = Field(..., description="Training run identifier")
    checkpoint_id: Optional[str] = Field(default=None, description="Source checkpoint identifier")
    adapter_path: str = Field(..., description="Filesystem directory holding adapter weights")
    status: AdapterStatus = Field(default=AdapterStatus.EXPERIMENTAL)
    metrics: Dict[str, float] = Field(default_factory=dict)
    baseline_comparison: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Comparison metrics against canonical base model baseline"
    )
    created_at: float = Field(default_factory=time.time)
    promoted_at: Optional[float] = Field(default=None)
    promoted_by: Optional[str] = Field(default=None)
    rejection_reason: Optional[str] = Field(default=None)
    rollback_target: Optional[str] = Field(default=None)
