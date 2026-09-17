"""
AI Provider Factory & Dependency Injection.

Provides a unified factory function `get_ai_provider()` to instantiate and retrieve
the configured BaseAIProvider instance (OllamaProvider, MockProvider, etc.).
"""

import os
from typing import Optional, Dict, Type, Any
from ai.core.providers.base import BaseAIProvider
from ai.core.providers.ollama import OllamaProvider
from ai.core.providers.mock import MockProvider
from ai.core.providers.local import LocalModelProvider
import config

_PROVIDER_MAP: Dict[str, Type[BaseAIProvider]] = {
    "ollama": OllamaProvider,
    "mock": MockProvider,
    "local": LocalModelProvider,
}

_DEFAULT_PROVIDER_INSTANCE: Optional[BaseAIProvider] = None


def get_ai_provider(
    provider_name: Optional[str] = None,
    model: Optional[str] = None,
    force_new: bool = False,
    **kwargs: Any
) -> BaseAIProvider:
    """
    Factory function to retrieve an AI provider instance.

    Args:
        provider_name: 'ollama', 'mock', 'local' (defaults to config.AI_PROVIDER or env AI_PROVIDER)
        model: Optional model name override
        force_new: If True, creates a fresh instance instead of returning cached singleton
        **kwargs: Additional parameters passed to provider constructor

    Returns:
        Instance of BaseAIProvider subclass
    """
    global _DEFAULT_PROVIDER_INSTANCE

    # Return cached default instance if explicitly set or requesting standard provider without custom overrides
    if not force_new and provider_name is None and model is None and not kwargs and _DEFAULT_PROVIDER_INSTANCE is not None:
        return _DEFAULT_PROVIDER_INSTANCE

    target_provider = (
        provider_name or getattr(config, "AI_PROVIDER", os.getenv("AI_PROVIDER", "ollama"))
    ).lower()

    if target_provider not in _PROVIDER_MAP:
        raise ValueError(
            f"Invalid AI provider '{target_provider}'. Supported providers are: {list(_PROVIDER_MAP.keys())}"
        )

    provider_cls = _PROVIDER_MAP[target_provider]
    instance = provider_cls(model=model, **kwargs)

    # Cache singleton default if created via default parameters
    if provider_name is None and model is None and not kwargs:
        _DEFAULT_PROVIDER_INSTANCE = instance

    return instance


def set_default_ai_provider(provider: BaseAIProvider):
    """Set custom default provider instance (useful for unit testing setups)."""
    global _DEFAULT_PROVIDER_INSTANCE
    _DEFAULT_PROVIDER_INSTANCE = provider


def reset_default_ai_provider():
    """Reset cached default provider instance."""
    global _DEFAULT_PROVIDER_INSTANCE
    _DEFAULT_PROVIDER_INSTANCE = None
