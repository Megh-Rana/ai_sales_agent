"""
Fine-Tuning Pipeline Module — AI-11.

Provides local-only, versioned, validated, reproducible fine-tuning
capabilities for the AI Sales Agent platform using canonical Gemma 3 4B.
"""

from ai.fine_tuning.schemas import (
    AdapterError,
    AdapterMetadata,
    AdapterStatus,
    BaselineRecord,
    CheckpointError,
    CheckpointMetadata,
    DatasetMetadata,
    DatasetSplit,
    DatasetSplitError,
    DatasetValidationError,
    FineTuningError,
    LoRAConfig,
    ProvenanceMetadata,
    ReviewStatus,
    SourceType,
    TaskType,
    TrainingConfig,
    TrainingConfigurationError,
    TrainingDependencyError,
    TrainingExample,
)
from ai.fine_tuning.validation import DatasetValidator
from ai.fine_tuning.versioning import (
    compute_dataset_fingerprint,
    generate_dataset_metadata,
)
from ai.fine_tuning.splitting import DatasetSplitter
from ai.fine_tuning.formatting import DatasetFormatter
from ai.fine_tuning.config import (
    HardwareEnvironment,
    get_default_training_config,
    load_training_config,
    save_training_config,
)
from ai.fine_tuning.gate import (
    BaselineTracker,
    DecisionGateResult,
    FineTuningDecisionGate,
)
from ai.fine_tuning.checkpoints import CheckpointManager
from ai.fine_tuning.adapters import AdapterManager
from ai.fine_tuning.trainer import (
    EvaluationHook,
    FineTuningTrainer,
    SimpleEvaluationTracker,
)
from ai.fine_tuning.cli import FineTuningPipelineCLI

__all__ = [
    # Schemas & Types
    "TaskType",
    "ReviewStatus",
    "SourceType",
    "AdapterStatus",
    "FineTuningError",
    "DatasetValidationError",
    "DatasetSplitError",
    "TrainingConfigurationError",
    "TrainingDependencyError",
    "CheckpointError",
    "AdapterError",
    "ProvenanceMetadata",
    "TrainingExample",
    "DatasetSplit",
    "DatasetMetadata",
    "LoRAConfig",
    "TrainingConfig",
    "CheckpointMetadata",
    "BaselineRecord",
    "AdapterMetadata",
    # Core Components
    "DatasetValidator",
    "compute_dataset_fingerprint",
    "generate_dataset_metadata",
    "DatasetSplitter",
    "DatasetFormatter",
    "HardwareEnvironment",
    "get_default_training_config",
    "load_training_config",
    "save_training_config",
    "FineTuningDecisionGate",
    "DecisionGateResult",
    "BaselineTracker",
    "CheckpointManager",
    "AdapterManager",
    "FineTuningTrainer",
    "EvaluationHook",
    "SimpleEvaluationTracker",
    "FineTuningPipelineCLI",
]
