"""
Structured Output Parsing & Validation Engine.

Converts raw LLM text output to validated Pydantic model instances.
Includes robust extraction strategies (markdown stripping, JSON extraction)
and explicit error handling without silent data corruption or hallucination.
"""

import json
import re
from typing import Type, TypeVar, Any, Dict
from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


class StructuredOutputValidationError(ValueError):
    """Exception raised when raw LLM response cannot be validated against the target Pydantic schema."""

    def __init__(self, message: str, raw_text: str, schema_class: Type[BaseModel], original_error: Exception = None):
        super().__init__(message)
        self.raw_text = raw_text
        self.schema_class = schema_class
        self.original_error = original_error


class StructuredOutputValidator:
    """Validator for converting raw LLM text into Pydantic models."""

    @classmethod
    def validate_and_parse(cls, raw_text: str, schema: Type[T]) -> T:
        """
        Parse raw text into JSON and validate against target Pydantic schema.

        Args:
            raw_text: Raw output string from LLM
            schema: Target Pydantic BaseModel subclass

        Returns:
            Validated instance of `schema`

        Raises:
            StructuredOutputValidationError if parsing or validation fails completely.
        """
        if not raw_text or not raw_text.strip():
            raise StructuredOutputValidationError(
                "Received empty response from AI model", raw_text, schema
            )

        cleaned_text = cls._clean_json_text(raw_text)

        # Strategy 1: Direct JSON parse
        try:
            dict_data = json.loads(cleaned_text)
            return schema.model_validate(dict_data)
        except (json.JSONDecodeError, ValidationError) as err1:
            # Strategy 2: Balanced JSON block extraction ({...})
            json_block = cls._extract_json_block(cleaned_text)
            if json_block and json_block != cleaned_text:
                try:
                    dict_data = json.loads(json_block)
                    return schema.model_validate(dict_data)
                except ValidationError as val_err:
                    # Schema validation failed on the extracted JSON - preserve the genuine schema error!
                    raise StructuredOutputValidationError(
                        f"Validation error against schema '{schema.__name__}': {str(val_err)}",
                        raw_text=raw_text,
                        schema_class=schema,
                        original_error=val_err,
                    )
                except json.JSONDecodeError:
                    pass

            raise StructuredOutputValidationError(
                f"Failed to parse or validate LLM output against schema '{schema.__name__}': {str(err1)}",
                raw_text=raw_text,
                schema_class=schema,
                original_error=err1,
            )

    @classmethod
    def _clean_json_text(cls, text: str) -> str:
        """Strip reasoning tags, markdown blocks, and extra whitespace."""
        # Strip <think>...</think> tags if present
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

        # Strip ```json ... ``` or ``` ... ``` wrappers
        markdown_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, flags=re.IGNORECASE)
        if markdown_match:
            text = markdown_match.group(1).strip()

        return text.strip()

    @classmethod
    def _extract_json_block(cls, text: str) -> str | None:
        """Extract the first valid outer {...} JSON object from text using balanced braces."""
        start_idx = text.find("{")
        while start_idx != -1:
            brace_count = 0
            in_string = False
            escape = False
            for i in range(start_idx, len(text)):
                char = text[i]
                if in_string:
                    if escape:
                        escape = False
                    elif char == "\\":
                        escape = True
                    elif char == '"':
                        in_string = False
                else:
                    if char == '"':
                        in_string = True
                    elif char == "{":
                        brace_count += 1
                    elif char == "}":
                        brace_count -= 1
                        if brace_count == 0:
                            candidate = text[start_idx : i + 1]
                            try:
                                json.loads(candidate)
                                return candidate
                            except json.JSONDecodeError:
                                break
            start_idx = text.find("{", start_idx + 1)
        return None

    @classmethod
    def generate_schema_skeleton(cls, schema: Type[BaseModel]) -> Dict[str, Any]:
        """Recursively generate a clean JSON template skeleton from a Pydantic model class."""
        from typing import get_args, get_origin, Union

        ignored_fields = {"timestamp", "provider", "model", "latency_ms", "raw_response"}
        skeleton = {}

        for name, field in schema.model_fields.items():
            if name in ignored_fields:
                continue
            skeleton[name] = cls._type_to_sample(field.annotation)

        return skeleton

    @classmethod
    def _type_to_sample(cls, tp: Any) -> Any:
        from typing import get_args, get_origin, Union

        origin = get_origin(tp)
        if origin is Union:
            args = [a for a in get_args(tp) if a is not type(None)]
            if args:
                return cls._type_to_sample(args[0])
            return "..."

        if origin is list:
            args = get_args(tp)
            if args:
                item_type = args[0]
                if isinstance(item_type, type) and issubclass(item_type, BaseModel):
                    return [cls.generate_schema_skeleton(item_type)]
            return ["..."]

        if isinstance(tp, type) and issubclass(tp, BaseModel):
            return cls.generate_schema_skeleton(tp)

        if tp is int:
            return 1
        if tp is float:
            return 1.0
        if tp is bool:
            return True
        return "..."
