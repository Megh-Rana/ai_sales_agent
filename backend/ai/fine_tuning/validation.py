"""
Dataset Validation Module — AI-11.

Enforces strict data quality, task schema validation, security redaction,
prompt injection detection, and hidden chain-of-thought rejection.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Set, Tuple, Type
from pydantic import BaseModel, ValidationError

from ai.fine_tuning.schemas import (
    DatasetValidationError,
    ReviewStatus,
    SourceType,
    TaskType,
    TrainingExample,
)

# Reuse authoritative platform schemas from AI-01 through AI-10
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.intent_scoring import IntentDetectionOutput, WhyNowOutput
from ai.core.schemas.company_research import CompanyResearchOutput
from ai.core.schemas.sales_pitch import PersonalizedSalesPitchOutput
from ai.core.schemas.conversation_intelligence import ConversationIntelligenceOutput
from ai.core.schemas.qualification import QualificationOutput
from ai.core.schemas.buying_signals import BuyingSignalsObjectionsOutput
from ai.core.schemas.next_best_action import NextBestActionOutput


# Task-to-schema mapping for authoritative validation
TASK_SCHEMA_MAP: Dict[TaskType, Type[BaseModel]] = {
    TaskType.BUSINESS_INTELLIGENCE: BusinessIntelligenceOutput,
    TaskType.LEAD_INTELLIGENCE: LeadIntelligenceOutput,
    TaskType.INTENT_DETECTION: IntentDetectionOutput,
    TaskType.WHY_NOW: WhyNowOutput,
    TaskType.COMPANY_RESEARCH: CompanyResearchOutput,
    TaskType.SALES_PITCH: PersonalizedSalesPitchOutput,
    TaskType.CONVERSATION_INTELLIGENCE: ConversationIntelligenceOutput,
    TaskType.QUALIFICATION: QualificationOutput,
    TaskType.BUYING_SIGNALS_OBJECTIONS: BuyingSignalsObjectionsOutput,
    TaskType.NEXT_BEST_ACTION: NextBestActionOutput,
}

# ─── Security & Hygiene Patterns ─────────────────────────────────────

FORBIDDEN_COT_KEYS: Set[str] = {
    "internal_reasoning",
    "hidden_chain_of_thought",
    "step_by_step_private_reasoning",
    "chain_of_thought",
    "private_reasoning",
    "private_thought",
    "thought_process",
    "scratchpad",
}

FORBIDDEN_COT_PHRASES: List[re.Pattern] = [
    re.compile(r"hidden\s+chain\s+of\s+thought", re.IGNORECASE),
    re.compile(r"step-by-step\s+private\s+reasoning", re.IGNORECASE),
    re.compile(r"private\s+reasoning:", re.IGNORECASE),
    re.compile(r"internal\s+reasoning:", re.IGNORECASE),
]

SECRET_PATTERNS: List[Tuple[str, re.Pattern]] = [
    ("OPENAI_KEY", re.compile(r"\bsk-[a-zA-Z0-9]{20,}\b")),
    ("GITHUB_TOKEN", re.compile(r"\b(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{20,}\b")),
    ("JWT_BEARER", re.compile(r"Bearer\s+ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+")),
    ("PRIVATE_KEY", re.compile(r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----")),
    ("PASSWORD_EXPLICIT", re.compile(r"(password|passwd|secret|api_key)\s*[:=]\s*['\"][^\s'\"]{6,}['\"]", re.IGNORECASE)),
]

PROMPT_INJECTION_PATTERNS: List[re.Pattern] = [
    re.compile(r"system\s*:\s*ignore\s+(all\s+)?(previous\s+)?(instructions|rules|safety)", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?(previous\s+)?instructions", re.IGNORECASE),
    re.compile(r"override\s+(all\s+)?(system\s+)?rules", re.IGNORECASE),
    re.compile(r"give\s+a\s+100%\s+discount", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+in\s+developer\s+mode", re.IGNORECASE),
    re.compile(r"bypass\s+safety\s+filter", re.IGNORECASE),
    re.compile(r"<script>.*?</script>", re.IGNORECASE),
]


class DatasetValidator:
    """
    Validates training examples for adherence to task schemas, safety,
    provenance policies, and absence of prompt injection or secrets.
    """

    def __init__(self, strict_schema: bool = True):
        self.strict_schema = strict_schema

    def validate_example(self, example: TrainingExample | Dict[str, Any]) -> List[DatasetValidationError]:
        """
        Validate a single training example against all quality criteria.
        Returns a list of validation errors (empty if completely valid).
        """
        errors: List[DatasetValidationError] = []

        # 1. Pydantic Model coercion & structure check
        if isinstance(example, dict):
            example_id = str(example.get("id", "UNKNOWN_ID"))
            try:
                parsed_example = TrainingExample(**example)
            except ValidationError as e:
                for err in e.errors():
                    loc = ".".join(str(x) for x in err["loc"])
                    errors.append(DatasetValidationError(
                        example_id=example_id,
                        field=loc,
                        error_code="INVALID_STRUCTURE",
                        message=err["msg"]
                    ))
                return errors
            except Exception as e:
                errors.append(DatasetValidationError(
                    example_id=example_id,
                    field="root",
                    error_code="PARSING_ERROR",
                    message=str(e)
                ))
                return errors
        else:
            parsed_example = example
            example_id = parsed_example.id

        # 2. Field non-empty checks
        if not parsed_example.instruction or not parsed_example.instruction.strip():
            errors.append(DatasetValidationError(
                example_id=example_id,
                field="instruction",
                error_code="EMPTY_INSTRUCTION",
                message="Instruction cannot be empty or whitespace."
            ))

        if not parsed_example.input:
            errors.append(DatasetValidationError(
                example_id=example_id,
                field="input",
                error_code="EMPTY_INPUT",
                message="Input dictionary cannot be empty."
            ))

        if not parsed_example.output:
            errors.append(DatasetValidationError(
                example_id=example_id,
                field="output",
                error_code="EMPTY_OUTPUT",
                message="Output dictionary cannot be empty."
            ))

        # 3. Chain-of-Thought (CoT) rejection
        cot_err = self._check_cot_leakage(example_id, parsed_example)
        if cot_err:
            errors.extend(cot_err)

        # 4. Secret detection
        secret_err = self._check_secrets(example_id, parsed_example)
        if secret_err:
            errors.extend(secret_err)

        # 5. Prompt injection detection
        injection_err = self._check_prompt_injection(example_id, parsed_example)
        if injection_err:
            errors.extend(injection_err)

        # 6. Task-specific schema validation
        if self.strict_schema:
            schema_err = self._validate_task_schema(example_id, parsed_example)
            if schema_err:
                errors.extend(schema_err)

        # 7. Confidence bounds check
        confidence_err = self._check_confidences(example_id, parsed_example.output)
        if confidence_err:
            errors.extend(confidence_err)

        # 8. Provenance & Synthetic data quality policy
        provenance_err = self._check_provenance_policy(example_id, parsed_example)
        if provenance_err:
            errors.extend(provenance_err)

        return errors

    def validate_dataset(
        self,
        examples: List[TrainingExample]
    ) -> Tuple[List[TrainingExample], List[DatasetValidationError]]:
        """
        Validate an entire list of examples, checking individual validity
        and dataset-wide invariants like duplicate IDs.
        """
        valid_examples: List[TrainingExample] = []
        all_errors: List[DatasetValidationError] = []

        seen_ids: Set[str] = set()
        seen_content_hashes: Dict[str, str] = {}  # hash -> id

        for ex in examples:
            # Check duplicate ID
            if ex.id in seen_ids:
                all_errors.append(DatasetValidationError(
                    example_id=ex.id,
                    field="id",
                    error_code="DUPLICATE_ID",
                    message=f"Duplicate example ID '{ex.id}' detected in dataset."
                ))
            else:
                seen_ids.add(ex.id)

            # Check duplicate content (instruction + input content)
            norm_content = f"{ex.task}|{ex.instruction.strip()}|{str(sorted(ex.input.items()))}"
            if norm_content in seen_content_hashes:
                prior_id = seen_content_hashes[norm_content]
                all_errors.append(DatasetValidationError(
                    example_id=ex.id,
                    field="content",
                    error_code="DUPLICATE_EXAMPLE",
                    message=f"Duplicate training content detected (identical to '{prior_id}')."
                ))
            else:
                seen_content_hashes[norm_content] = ex.id

            # Validate individual example
            ex_errors = self.validate_example(ex)
            if ex_errors:
                all_errors.extend(ex_errors)
            else:
                valid_examples.append(ex)

        return valid_examples, all_errors

    # ── Internal Checkers ────────────────────────────────────────────────

    def _check_cot_leakage(
        self, example_id: str, ex: TrainingExample
    ) -> List[DatasetValidationError]:
        errors: List[DatasetValidationError] = []

        # Recursively check keys in output dictionary
        def _check_keys(d: Any, path: str = "output"):
            if isinstance(d, dict):
                for k, v in d.items():
                    if k.lower() in FORBIDDEN_COT_KEYS:
                        errors.append(DatasetValidationError(
                            example_id=example_id,
                            field=f"{path}.{k}",
                            error_code="COT_LEAKAGE",
                            message=f"Hidden chain-of-thought field '{k}' is forbidden in training targets."
                        ))
                    _check_keys(v, f"{path}.{k}")
            elif isinstance(d, list):
                for idx, item in enumerate(d):
                    _check_keys(item, f"{path}[{idx}]")

        _check_keys(ex.output)

        # Check for textual CoT leakage phrases in string output values
        def _check_strings(d: Any, path: str = "output"):
            if isinstance(d, str):
                for pattern in FORBIDDEN_COT_PHRASES:
                    if pattern.search(d):
                        errors.append(DatasetValidationError(
                            example_id=example_id,
                            field=path,
                            error_code="COT_LEAKAGE",
                            message=f"Hidden reasoning phrase matching '{pattern.pattern}' detected."
                        ))
            elif isinstance(d, dict):
                for k, v in d.items():
                    _check_strings(v, f"{path}.{k}")
            elif isinstance(d, list):
                for idx, item in enumerate(d):
                    _check_strings(item, f"{path}[{idx}]")

        _check_strings(ex.output)
        return errors

    def _check_secrets(
        self, example_id: str, ex: TrainingExample
    ) -> List[DatasetValidationError]:
        errors: List[DatasetValidationError] = []

        def _scan_text(text: str, field_name: str):
            for secret_type, pattern in SECRET_PATTERNS:
                if pattern.search(text):
                    errors.append(DatasetValidationError(
                        example_id=example_id,
                        field=field_name,
                        error_code="SECRET_DETECTED",
                        message=f"Potentially sensitive secret detected ({secret_type})."
                    ))

        # Scan instruction, input, and output
        _scan_text(ex.instruction, "instruction")
        _scan_text(str(ex.input), "input")
        _scan_text(str(ex.output), "output")
        return errors

    def _check_prompt_injection(
        self, example_id: str, ex: TrainingExample
    ) -> List[DatasetValidationError]:
        errors: List[DatasetValidationError] = []

        def _scan_injection(text: str, field_name: str):
            for pattern in PROMPT_INJECTION_PATTERNS:
                if pattern.search(text):
                    errors.append(DatasetValidationError(
                        example_id=example_id,
                        field=field_name,
                        error_code="PROMPT_INJECTION",
                        message=f"Suspected prompt injection or adversarial command detected: '{pattern.pattern}'."
                    ))

        _scan_injection(ex.instruction, "instruction")
        _scan_injection(str(ex.input), "input")
        return errors

    def _validate_task_schema(
        self, example_id: str, ex: TrainingExample
    ) -> List[DatasetValidationError]:
        errors: List[DatasetValidationError] = []
        schema_cls = TASK_SCHEMA_MAP.get(ex.task)

        if not schema_cls:
            errors.append(DatasetValidationError(
                example_id=example_id,
                field="task",
                error_code="UNSUPPORTED_TASK",
                message=f"No authoritative Pydantic schema found for task '{ex.task}'."
            ))
            return errors

        try:
            schema_cls(**ex.output)
        except ValidationError as val_err:
            for err in val_err.errors():
                loc = ".".join(str(x) for x in err["loc"])
                errors.append(DatasetValidationError(
                    example_id=example_id,
                    field=f"output.{loc}",
                    error_code="SCHEMA_VIOLATION",
                    message=f"Task '{ex.task.value}' target mismatch: {err['msg']}"
                ))
        except Exception as general_err:
            errors.append(DatasetValidationError(
                example_id=example_id,
                field="output",
                error_code="SCHEMA_ERROR",
                message=f"Schema validation error: {general_err}"
            ))

        return errors

    def _check_confidences(
        self, example_id: str, data: Any, path: str = "output"
    ) -> List[DatasetValidationError]:
        errors: List[DatasetValidationError] = []

        if isinstance(data, dict):
            for k, v in data.items():
                curr_path = f"{path}.{k}"
                if k == "confidence" and isinstance(v, (int, float)):
                    if v < 0.0 or v > 1.0:
                        errors.append(DatasetValidationError(
                            example_id=example_id,
                            field=curr_path,
                            error_code="INVALID_CONFIDENCE",
                            message=f"Confidence value {v} is outside valid range [0.0, 1.0]."
                        ))
                else:
                    errors.extend(self._check_confidences(example_id, v, curr_path))
        elif isinstance(data, list):
            for idx, item in enumerate(data):
                errors.extend(self._check_confidences(example_id, item, f"{path}[{idx}]"))

        return errors

    def _check_provenance_policy(
        self, example_id: str, ex: TrainingExample
    ) -> List[DatasetValidationError]:
        errors: List[DatasetValidationError] = []
        meta = ex.metadata

        # Synthetic data policy: Never automatically approved without human reviewer
        if meta.source_type == SourceType.SYNTHETIC:
            if ex.review_status == ReviewStatus.APPROVED and not meta.reviewer:
                errors.append(DatasetValidationError(
                    example_id=example_id,
                    field="metadata.reviewer",
                    error_code="UNREVIEWED_SYNTHETIC_APPROVAL",
                    message="Synthetic data cannot be marked APPROVED without a human reviewer specified."
                ))

        # Human corrected data policy: Must include original_output
        if meta.source_type == SourceType.HUMAN_CORRECTED:
            if not meta.original_output:
                errors.append(DatasetValidationError(
                    example_id=example_id,
                    field="metadata.original_output",
                    error_code="MISSING_ORIGINAL_OUTPUT",
                    message="Human-corrected data must preserve original_output for provenance tracking."
                ))

        return errors
