"""
Mock AI Provider for Unit Tests, CI/CD, and GPU-less Development.

Provides deterministic responses for text generation, streaming, and structured Pydantic objects
without requiring Ollama, CUDA, or network access.
"""

from typing import Type, TypeVar, Generator, Optional, List, Dict, Any
from pydantic import BaseModel
import asyncio
from ai.core.providers.base import BaseAIProvider

T = TypeVar("T", bound=BaseModel)


class MockProvider(BaseAIProvider):
    """Deterministic Mock AI Provider for testing."""

    def __init__(
        self,
        model: Optional[str] = "mock-model",
        temperature: float = 0.0,
        timeout: float = 10.0,
        default_response: str = "This is a deterministic mock AI response for testing.",
        custom_schemas: Optional[Dict[Type[BaseModel], BaseModel]] = None,
        **kwargs: Any
    ):
        super().__init__(model=model, temperature=temperature, timeout=timeout, **kwargs)
        self._default_response = default_response
        self._custom_schemas = custom_schemas or {}
        self.call_history: List[Dict[str, Any]] = []

    @property
    def provider_name(self) -> str:
        return "mock"

    def register_mock_schema(self, schema: Type[T], instance: T):
        """Register a specific mock instance for a Pydantic schema class."""
        self._custom_schemas[schema] = instance

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        self.call_history.append({
            "method": "generate",
            "prompt": prompt,
            "system_prompt": system_prompt,
            "messages": messages,
        })
        return self._default_response

    async def generate_async(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        return self.generate(
            prompt, system_prompt=system_prompt, messages=messages,
            temperature=temperature, max_tokens=max_tokens, **kwargs
        )

    def generate_stream(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> Generator[str, None, None]:
        self.call_history.append({
            "method": "generate_stream",
            "prompt": prompt,
            "system_prompt": system_prompt,
            "messages": messages,
        })
        words = self._default_response.split(" ")
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")

    def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        self.call_history.append({
            "method": "generate_structured",
            "prompt": prompt,
            "schema": schema.__name__,
            "system_prompt": system_prompt,
        })

        if schema in self._custom_schemas:
            return self._custom_schemas[schema]  # type: ignore

        # Construct deterministic default instance for Pydantic schema
        mock_dict = self._create_mock_dict_for_schema(schema)
        try:
            return schema.model_validate(mock_dict)
        except Exception:
            # Fallback construct with empty or construct
            return schema.model_construct()

    async def generate_structured_async(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        return self.generate_structured(
            prompt, schema, system_prompt=system_prompt, messages=messages,
            temperature=temperature, **kwargs
        )

    def embed(self, texts: List[str]) -> List[List[float]]:
        # Deterministic 8-dim vector for testing
        return [[0.1 * (i + 1)] * 8 for i in range(len(texts))]

    def _create_mock_dict_for_schema(self, schema: Type[BaseModel]) -> Dict[str, Any]:
        """Generate deterministic dict matching Pydantic model fields."""
        data = {}
        fields = schema.model_fields
        for name, field_info in fields.items():
            if field_info.default is not None and field_info.default != ...:
                data[name] = field_info.default
            elif field_info.default_factory is not None:
                data[name] = field_info.default_factory()
            else:
                annotation = field_info.annotation
                data[name] = self._default_value_for_type(annotation, name)
        return data

    def _default_value_for_type(self, annotation: Any, field_name: str) -> Any:
        annotation_str = str(annotation).lower()
        if "str" in annotation_str:
            return f"mock_{field_name}"
        elif "int" in annotation_str:
            return 1
        elif "float" in annotation_str:
            return 0.8
        elif "bool" in annotation_str:
            return True
        elif "list" in annotation_str:
            return []
        elif "dict" in annotation_str:
            return {}
        return None
