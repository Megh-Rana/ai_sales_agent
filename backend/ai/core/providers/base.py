"""
Abstract Base AI Provider Interface.

Defines the contract for all AI model providers (Ollama, Mock, Local, Cloud).
All downstream sales intelligence services MUST depend on this interface,
never directly on vendor-specific client libraries (e.g. ollama.Client).
"""

from abc import ABC, abstractmethod
from typing import Type, TypeVar, Generator, Optional, List, Any, Dict
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseAIProvider(ABC):
    """Abstract Base Class for AI Model Providers."""

    def __init__(
        self,
        model: Optional[str] = None,
        temperature: float = 0.7,
        timeout: float = 60.0,
        **kwargs: Any
    ):
        self.model = model
        self.temperature = temperature
        self.timeout = timeout
        self.extra_config = kwargs

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return provider identifier (e.g. 'ollama', 'mock', 'local')."""
        pass

    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        """
        Generate text response synchronously.

        Args:
            prompt: User prompt
            system_prompt: Optional system instructions
            messages: Optional chat messages list (if conversation context provided)
            temperature: Sampling temperature override
            max_tokens: Max output tokens override
        """
        pass

    @abstractmethod
    async def generate_async(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        """Generate text response asynchronously."""
        pass

    @abstractmethod
    def generate_stream(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> Generator[str, None, None]:
        """
        Stream text response tokens synchronously.

        Yields text chunks as they become available.
        """
        pass

    @abstractmethod
    def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        """
        Generate structured response matching a Pydantic schema.

        Args:
            prompt: User prompt
            schema: Pydantic model class to validate output against
            system_prompt: Optional system instructions
            messages: Optional chat messages list
            temperature: Sampling temperature override
        """
        pass

    @abstractmethod
    async def generate_structured_async(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        """Generate structured response matching a Pydantic schema asynchronously."""
        pass

    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        Default implementation returns empty vectors if embeddings not supported.
        """
        return [[] for _ in texts]
