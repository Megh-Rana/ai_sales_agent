"""
Lead Intelligence Service.

Extracts structured company profiles, prospect profiles, requirements breakdowns,
buyer persona matches, and raw intent signals from lead data, research context, and business intelligence.
"""

import time
from typing import Optional, Dict, Any
from ai.core.providers.base import BaseAIProvider
from ai.core.factory import get_ai_provider
from ai.core.prompts.registry import prompt_registry
from ai.core.schemas.lead_intelligence import (
    LeadProfileInput,
    LeadIntelligenceOutput,
    LeadCompanyProfile,
    ProspectProfile,
    LeadRequirement,
    BuyerPersonaMatch,
    RawIntentSignal,
    SourceMetadata,
)

__all__ = [
    "LeadIntelligenceService",
    "LeadProfileInput",
    "LeadIntelligenceOutput",
    "LeadCompanyProfile",
    "ProspectProfile",
    "LeadRequirement",
    "BuyerPersonaMatch",
    "RawIntentSignal",
    "SourceMetadata",
]


class LeadIntelligenceService:
    """
    Service responsible for analyzing raw lead context and producing structured lead intelligence.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "lead_intelligence_v1",
    ):
        """
        Initialize service with AI provider and prompt template name.

        Args:
            provider: Optional BaseAIProvider subclass instance (defaults to factory default provider)
            prompt_name: Name of registered prompt in PromptRegistry
        """
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _prepare_prompt_args(self, profile: LeadProfileInput) -> Dict[str, Any]:
        """Convert lead profile model into formatted string arguments for prompt template."""
        def format_field(val: Any) -> str:
            if val is None or val == "":
                return "UNKNOWN"
            if isinstance(val, list):
                return ", ".join(val) if val else "UNKNOWN"
            return str(val)

        bi_str = "UNKNOWN"
        if profile.business_intelligence_context is not None:
            bi = profile.business_intelligence_context
            personas = ", ".join([p.role for p in bi.buyer_personas]) if bi.buyer_personas else "None"
            target_ind = ", ".join(bi.target_industries) if bi.target_industries else "None"
            bi_str = f"Target Industries: {target_ind} | Key Buyer Personas: {personas}"

        return {
            "company_name": format_field(profile.company_name),
            "company_domain": format_field(profile.company_domain),
            "company_description": format_field(profile.company_description),
            "industry": format_field(profile.industry),
            "company_size": format_field(profile.company_size),
            "prospect_name": format_field(profile.prospect_name),
            "prospect_role": format_field(profile.prospect_role),
            "prospect_company": format_field(profile.prospect_company),
            "prospect_location": format_field(profile.prospect_location),
            "prospect_linkedin_or_source": format_field(profile.prospect_linkedin_or_source),
            "raw_requirement": format_field(profile.raw_requirement),
            "source": format_field(profile.source),
            "source_url": format_field(profile.source_url),
            "source_date": format_field(profile.source_date),
            "research_context": format_field(profile.research_context),
            "business_intelligence_context": bi_str,
        }

    def _apply_provenance(self, output: LeadIntelligenceOutput, profile: LeadProfileInput) -> None:
        """Populate source metadata and provenance information."""
        if output.source_metadata is None or output.source_metadata.source_type == "UNKNOWN":
            source_type = "USER_PROVIDED" if profile.raw_requirement or profile.company_name else "UNKNOWN"
            output.source_metadata = SourceMetadata(
                source_type=source_type,
                source_url=profile.source_url,
                source_date=profile.source_date,
                notes=f"Source: {profile.source or 'Direct input'}",
            )
        else:
            if profile.source_url:
                output.source_metadata.source_url = profile.source_url
            if profile.source_date:
                output.source_metadata.source_date = profile.source_date

        if profile.company_name and (not output.company_profile.company_name or output.company_profile.company_name == "UNKNOWN"):
            output.company_profile.company_name = profile.company_name

    async def analyze(self, profile: LeadProfileInput) -> LeadIntelligenceOutput:
        """
        Analyze lead profile asynchronously and return structured lead intelligence.

        Args:
            profile: LeadProfileInput containing raw lead, prospect, and context details

        Returns:
            Validated LeadIntelligenceOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(profile)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = await self.provider.generate_structured_async(
            prompt=user_str,
            schema=LeadIntelligenceOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        self._apply_provenance(output, profile)
        return output

    def analyze_sync(self, profile: LeadProfileInput) -> LeadIntelligenceOutput:
        """
        Analyze lead profile synchronously and return structured lead intelligence.

        Args:
            profile: LeadProfileInput containing raw lead, prospect, and context details

        Returns:
            Validated LeadIntelligenceOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(profile)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = self.provider.generate_structured(
            prompt=user_str,
            schema=LeadIntelligenceOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        self._apply_provenance(output, profile)
        return output
