"""
Sarvam AI Cloud Provider Implementation.

Encapsulates all interaction with Sarvam AI Cloud API (sarvam-105b).
Provides sync, async, streaming, and structured JSON generation.
"""

import os
import json
import asyncio
from typing import Type, TypeVar, Generator, Optional, List, Any, Dict
from pydantic import BaseModel

from ai.core.providers.base import BaseAIProvider
from ai.core.structured_output import StructuredOutputValidator, StructuredOutputValidationError
import config

T = TypeVar("T", bound=BaseModel)


class SarvamProviderError(RuntimeError):
    """Exception raised when a Sarvam API call fails."""
    pass


class SarvamProvider(BaseAIProvider):
    """AI Provider for Sarvam AI Cloud API (sarvam-105b)."""

    def __init__(
        self,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        timeout: Optional[float] = None,
        api_key: Optional[str] = None,
        **kwargs: Any
    ):
        model_name = (
            model
            or getattr(config, "SARVAM_LLM_MODEL", None)
            or os.getenv("SARVAM_LLM_MODEL", "sarvam-105b")
        )
        temp = temperature if temperature is not None else 0.5
        t_out = timeout if timeout is not None else 60.0

        super().__init__(
            model=model_name,
            temperature=temp,
            timeout=t_out,
            **kwargs
        )

        self.api_key = api_key or getattr(config, "SARVAM_API_KEY", "") or os.getenv("SARVAM_API_KEY", "")
        self._client = None

    @property
    def provider_name(self) -> str:
        return "sarvam"

    def _get_client(self):
        """Lazy-instantiate SarvamAI Client."""
        if self._client is None:
            if not self.api_key:
                raise SarvamProviderError(
                    "SARVAM_API_KEY is not set. Provide a valid Sarvam API key in .env."
                )
            try:
                from sarvamai import SarvamAI
                self._client = SarvamAI(api_subscription_key=self.api_key)
            except ImportError:
                raise SarvamProviderError(
                    "The 'sarvamai' package is not installed. Run 'pip install sarvamai'."
                )
            except Exception as e:
                raise SarvamProviderError(f"Failed to initialize SarvamAI client: {e}") from e
        return self._client

    def _build_messages(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
    ) -> List[Dict[str, str]]:
        msgs: List[Dict[str, str]] = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        if messages:
            msgs.extend(messages)
        if prompt:
            msgs.append({"role": "user", "content": prompt})
        return msgs

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        """Generate text response synchronously using Sarvam API."""
        client = self._get_client()
        msgs = self._build_messages(prompt, system_prompt, messages)
        temp = temperature if temperature is not None else self.temperature

        call_kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": msgs,
            "temperature": temp,
            "reasoning_effort": None,
        }
        if max_tokens:
            call_kwargs["max_tokens"] = max_tokens

        try:
            res = client.chat.completions(**call_kwargs)
            if hasattr(res, "choices") and res.choices and len(res.choices) > 0:
                msg = res.choices[0].message
                if hasattr(msg, "content") and msg.content:
                    return msg.content.strip()
                if hasattr(msg, "reasoning_content") and msg.reasoning_content:
                    return msg.reasoning_content.strip()
            return ""
        except Exception as e:
            raise SarvamProviderError(f"Sarvam generate failed with model '{self.model}': {e}") from e

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
        return await asyncio.to_thread(
            self.generate,
            prompt,
            system_prompt=system_prompt,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs
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
        """Stream text response tokens synchronously using Sarvam API."""
        client = self._get_client()
        msgs = self._build_messages(prompt, system_prompt, messages)
        temp = temperature if temperature is not None else self.temperature

        call_kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": msgs,
            "temperature": temp,
            "reasoning_effort": None,
            "stream": True,
        }
        if max_tokens:
            call_kwargs["max_tokens"] = max_tokens

        try:
            stream = client.chat.completions(**call_kwargs)
            for chunk in stream:
                if hasattr(chunk, "choices") and chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if hasattr(delta, "content") and delta.content:
                        yield delta.content
        except Exception as e:
            raise SarvamProviderError(f"Sarvam stream failed with model '{self.model}': {e}") from e

    def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        """Generate structured response matching a Pydantic schema using Sarvam API."""
        try:
            skeleton_dict = StructuredOutputValidator.generate_schema_skeleton(schema)
            skeleton_json = json.dumps(skeleton_dict, indent=2)
        except Exception:
            skeleton_json = "{}"

        augmented_system = system_prompt or ""
        augmented_system += (
            "\n\nCRITICAL INSTRUCTION: You MUST return a valid JSON object matching this schema structure:\n"
            f"{skeleton_json}\n"
            "Do NOT return an empty object {}. Populate all relevant fields based on the supplied context. "
            "Output raw JSON only without markdown codeblocks or conversational text."
        )

        raw_content = self.generate(
            prompt=prompt,
            system_prompt=augmented_system,
            messages=messages,
            temperature=temperature,
            **kwargs
        )

        return StructuredOutputValidator.validate_and_parse(raw_content, schema)

    async def generate_structured_async(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        return await asyncio.to_thread(
            self.generate_structured,
            prompt,
            schema,
            system_prompt=system_prompt,
            messages=messages,
            temperature=temperature,
            **kwargs
        )
