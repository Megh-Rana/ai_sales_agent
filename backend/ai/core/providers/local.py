"""
Local Hugging Face Model Provider Extension Point.

Provides an extension interface for executing GGUF/Hugging Face models directly via Transformers
or llama-cpp-python when required without Ollama.

Note: Keep this lightweight to prevent unnecessary downloading of multi-gigabyte models.
"""

from typing import Type, TypeVar, Generator, Optional, List, Dict, Any
from pydantic import BaseModel
from ai.core.providers.base import BaseAIProvider

T = TypeVar("T", bound=BaseModel)


class LocalModelProvider(BaseAIProvider):
    """
    Extension point for local Hugging Face / Transformers models.
    Can be configured in future phases when on-device PEFT/LoRA models are loaded directly.
    """

    def __init__(
        self,
        model: Optional[str] = None,
        device: str = "cpu",
        temperature: float = 0.7,
        timeout: float = 60.0,
        **kwargs: Any
    ):
        super().__init__(model=model or "local-hf-model", temperature=temperature, timeout=timeout, **kwargs)
        self.device = device

    @property
    def provider_name(self) -> str:
        return "local"

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        raise NotImplementedError(
            "LocalModelProvider direct inference is an extension point. "
            "Use OllamaProvider or MockProvider for current operational tasks."
        )

    async def generate_async(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        return self.generate(prompt, system_prompt=system_prompt, messages=messages, **kwargs)

    def generate_stream(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> Generator[str, None, None]:
        raise NotImplementedError("LocalModelProvider streaming is not configured.")

    def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        raise NotImplementedError("LocalModelProvider structured output is not configured.")

    async def generate_structured_async(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        return self.generate_structured(prompt, schema, system_prompt=system_prompt, messages=messages, **kwargs)
