"""
Business Intelligence Service.

Extracts structured Ideal Customer Profiles (ICP), Buyer Personas, Value Propositions,
Key Differentiators, Buying Signals, Disqualifying Signals, Customer Pain Points,
Use Cases, Target Industry details, and Discovery Questions using the configured BaseAIProvider.
"""

import time
from typing import Optional, Dict, Any
from ai.core.providers.base import BaseAIProvider
from ai.core.factory import get_ai_provider
from ai.core.prompts.registry import prompt_registry
from ai.core.schemas.business_intelligence import (
    BusinessProfileInput,
    BusinessIntelligenceOutput,
    ICPProfile,
    BuyerPersona,
    ValueProposition,
    KeyDifferentiator,
    BuyingSignal,
    DisqualifyingSignal,
    CustomerPainPoint,
    LikelyUseCase,
    DiscoveryQuestion,
)

__all__ = [
    "BusinessIntelligenceService",
    "BusinessProfileInput",
    "BusinessIntelligenceOutput",
    "ICPProfile",
    "BuyerPersona",
    "ValueProposition",
    "KeyDifferentiator",
    "BuyingSignal",
    "DisqualifyingSignal",
    "CustomerPainPoint",
    "LikelyUseCase",
    "DiscoveryQuestion",
]


class BusinessIntelligenceService:
    """
    Service responsible for analyzing business profiles and generating structured B2B sales intelligence.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "business_analysis_v1",
    ):
        """
        Initialize service with AI provider and prompt template name.

        Args:
            provider: Optional BaseAIProvider subclass instance (defaults to factory default provider)
            prompt_name: Name of registered prompt in PromptRegistry
        """
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _prepare_prompt_args(self, profile: BusinessProfileInput) -> Dict[str, Any]:
        """Convert profile model into formatted string arguments for prompt template."""
        def format_field(val: Any) -> str:
            if val is None or val == "":
                return "UNKNOWN"
            if isinstance(val, list):
                return ", ".join(val) if val else "UNKNOWN"
            return str(val)

        return {
            "business_name": format_field(profile.business_name),
            "business_description": format_field(profile.business_description),
            "products_or_services": format_field(profile.products_or_services),
            "target_market": format_field(profile.target_market),
            "target_geography": format_field(profile.target_geography),
            "industry": format_field(profile.industry),
            "company_size": format_field(profile.company_size),
            "pricing_information": format_field(profile.pricing_information),
            "differentiators": format_field(profile.differentiators),
            "existing_sales_context": format_field(profile.existing_sales_context),
            "additional_context": format_field(profile.additional_context),
        }

    async def analyze(self, profile: BusinessProfileInput) -> BusinessIntelligenceOutput:
        """
        Analyze a business profile asynchronously and return structured intelligence.

        Args:
            profile: BusinessProfileInput containing business & product details

        Returns:
            Validated BusinessIntelligenceOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(profile)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = await self.provider.generate_structured_async(
            prompt=user_str,
            schema=BusinessIntelligenceOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return output

    def analyze_sync(self, profile: BusinessProfileInput) -> BusinessIntelligenceOutput:
        """
        Analyze a business profile synchronously and return structured intelligence.

        Args:
            profile: BusinessProfileInput containing business & product details

        Returns:
            Validated BusinessIntelligenceOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(profile)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = self.provider.generate_structured(
            prompt=user_str,
            schema=BusinessIntelligenceOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return output
