"""
Ollama Local AI Provider Implementation.

Encapsulates all interaction with locally running Ollama model infrastructure.
Provides synchronous, asynchronous, and streaming generation, as well as
structured JSON output validation using Ollama's format='json'.
"""

import time
from typing import Type, TypeVar, Generator, Optional, List, Dict, Any
from pydantic import BaseModel
from ai.core.providers.base import BaseAIProvider
from ai.core.structured_output import StructuredOutputValidator, StructuredOutputValidationError
import config

T = TypeVar("T", bound=BaseModel)


class OllamaProviderError(RuntimeError):
    """Exception raised when an Ollama API call fails or times out."""
    pass


class OllamaProvider(BaseAIProvider):
    """AI Provider for local Ollama inference."""

    def __init__(
        self,
        model: Optional[str] = None,
        host: Optional[str] = None,
        temperature: Optional[float] = None,
        timeout: Optional[float] = None,
        num_ctx: Optional[int] = None,
        num_gpu: Optional[int] = None,
        **kwargs: Any
    ):
        if model is not None:
            if not str(model).strip():
                raise ValueError("OllamaProvider requires a non-empty model name.")
            model_name = model.strip()
        else:
            model_name = getattr(config, "AI_MODEL", getattr(config, "OLLAMA_MODEL", "gemma3:4b"))
            if not model_name or not str(model_name).strip():
                raise ValueError(
                    "OllamaProvider requires a non-empty model name. Set AI_MODEL or OLLAMA_MODEL (e.g. 'gemma3:4b')."
                )

        if host is not None:
            if not str(host).strip():
                raise ValueError("OllamaProvider requires a non-empty host URL.")
            target_host = host.strip()
        else:
            target_host = getattr(config, "OLLAMA_HOST", "http://localhost:11434")
            if not target_host or not str(target_host).strip():
                raise ValueError(
                    "OllamaProvider requires a non-empty host URL. Set OLLAMA_HOST (e.g. 'http://localhost:11434')."
                )
        temp = temperature if temperature is not None else getattr(config, "AI_TEMPERATURE", getattr(config, "OLLAMA_TEMPERATURE", 0.7))
        tout = timeout if timeout is not None else getattr(config, "AI_TIMEOUT", 60.0)

        super().__init__(model=model_name, temperature=temp, timeout=tout, **kwargs)
        self.host = target_host
        self.num_ctx = num_ctx if num_ctx is not None else getattr(config, "OLLAMA_NUM_CTX", 8192)
        self.num_gpu = num_gpu if num_gpu is not None else getattr(config, "OLLAMA_NUM_GPU", 99)
        self._client = None

    @property
    def provider_name(self) -> str:
        return "ollama"

    def _handle_ollama_exception(self, e: Exception, action: str = "generation") -> OllamaProviderError:
        """Inspect and translate Ollama/HTTP exceptions into developer-friendly actionable errors."""
        err_str = str(e).lower()
        status_code = getattr(e, "status_code", None)

        if status_code == 404 or "not found" in err_str:
            msg = (
                f"Ollama model '{self.model}' not found on server '{self.host}'. "
                f"Run 'ollama pull {self.model}' or verify AI_MODEL/OLLAMA_MODEL configuration. Original error: {e}"
            )
        elif "connection refused" in err_str or "connecterror" in err_str or "failed to connect" in err_str or "connection error" in err_str:
            msg = (
                f"Cannot connect to Ollama server at '{self.host}'. "
                f"Ensure Ollama is running (e.g., run 'ollama serve') and accessible. Original error: {e}"
            )
        elif "timed out" in err_str or "timeout" in err_str:
            msg = (
                f"Ollama {action} timed out after {self.timeout}s on server '{self.host}'. Original error: {e}"
            )
        else:
            msg = f"Ollama {action} failed on '{self.host}' with model '{self.model}': {e}"

        return OllamaProviderError(msg)

    def _get_client(self):
        """Lazy-instantiate Ollama Client."""
        if self._client is None:
            try:
                import ollama
                self._client = ollama.Client(host=self.host)
            except ImportError:
                raise OllamaProviderError(
                    "The 'ollama' Python package is not installed. Install it via 'pip install ollama'."
                )
            except Exception as e:
                raise self._handle_ollama_exception(e, action="client initialization")
        return self._client

    def _extract_content(self, res: Any) -> str:
        """Extract message content from Ollama ChatResponse object or dict safely."""
        if hasattr(res, "message") and hasattr(res.message, "content"):
            return res.message.content or ""
        if isinstance(res, dict) and "message" in res:
            msg = res["message"]
            if isinstance(msg, dict) and "content" in msg:
                return msg["content"] or ""
            if hasattr(msg, "content"):
                return msg.content or ""
        try:
            return res["message"]["content"] or ""
        except Exception:
            raise OllamaProviderError(f"Malformed response received from Ollama: {res}")

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        client = self._get_client()
        temp = temperature if temperature is not None else self.temperature

        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        if messages:
            msgs.extend(messages)
        if prompt:
            msgs.append({"role": "user", "content": prompt})

        opts = {
            "temperature": temp,
            "num_ctx": self.num_ctx,
            "num_gpu": self.num_gpu,
        }
        if max_tokens:
            opts["num_predict"] = max_tokens

        try:
            res = client.chat(
                model=self.model,
                messages=msgs,
                keep_alive=-1,
                options=opts,
            )
            return self._extract_content(res)
        except Exception as e:
            if isinstance(e, OllamaProviderError):
                raise
            raise self._handle_ollama_exception(e, action="generation") from e

    async def generate_async(
        self,
        prompt: str,
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any
    ) -> str:
        # Run sync generate in thread pool for async compatibility
        import asyncio
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
        client = self._get_client()
        temp = temperature if temperature is not None else self.temperature

        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        if messages:
            msgs.extend(messages)
        if prompt:
            msgs.append({"role": "user", "content": prompt})

        opts = {
            "temperature": temp,
            "num_ctx": self.num_ctx,
            "num_gpu": self.num_gpu,
        }
        if max_tokens:
            opts["num_predict"] = max_tokens

        try:
            stream = client.chat(
                model=self.model,
                messages=msgs,
                stream=True,
                keep_alive=-1,
                options=opts,
            )
            for chunk in stream:
                token = ""
                if hasattr(chunk, "message") and hasattr(chunk.message, "content"):
                    token = chunk.message.content or ""
                elif isinstance(chunk, dict) and "message" in chunk:
                    msg = chunk["message"]
                    token = msg.get("content") if isinstance(msg, dict) else getattr(msg, "content", "")
                else:
                    try:
                        token = chunk["message"]["content"] or ""
                    except Exception:
                        pass
                if token:
                    yield token
        except Exception as e:
            if isinstance(e, OllamaProviderError):
                raise
            raise self._handle_ollama_exception(e, action="streaming") from e

    def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system_prompt: str = "",
        messages: Optional[List[Dict[str, str]]] = None,
        temperature: Optional[float] = None,
        **kwargs: Any
    ) -> T:
        client = self._get_client()
        temp = temperature if temperature is not None else self.temperature

        import json
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

        msgs = [{"role": "system", "content": augmented_system}]
        if messages:
            msgs.extend(messages)
        if prompt:
            msgs.append({"role": "user", "content": prompt})

        opts = {
            "temperature": temp,
            "num_ctx": self.num_ctx,
            "num_gpu": self.num_gpu,
        }

        try:
            res = client.chat(
                model=self.model,
                messages=msgs,
                format="json",
                keep_alive=-1,
                options=opts,
            )
            raw_content = self._extract_content(res)
            # If constrained format="json" prematurely returned an empty object, retry without the constraint
            if not raw_content or raw_content.strip() == "{}":
                res = client.chat(
                    model=self.model,
                    messages=msgs,
                    keep_alive=-1,
                    options=opts,
                )
                raw_content = self._extract_content(res)
        except Exception as e:
            if isinstance(e, OllamaProviderError):
                raise
            raise self._handle_ollama_exception(e, action="structured chat request") from e

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
        import asyncio
        return await asyncio.to_thread(
            self.generate_structured,
            prompt,
            schema,
            system_prompt=system_prompt,
            messages=messages,
            temperature=temperature,
            **kwargs
        )
