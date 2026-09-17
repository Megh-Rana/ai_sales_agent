"""
Intent Detection Service.

Analyzes lead intelligence context to identify observable buying/intent signals
using the configured BaseAIProvider. Does NOT calculate final lead scores.
"""

import time
from typing import Optional, Dict, Any
from ai.core.providers.base import BaseAIProvider
from ai.core.factory import get_ai_provider
from ai.core.prompts.registry import prompt_registry
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.intent_scoring import (
    IntentDetectionOutput,
    IntentSignal,
)

__all__ = [
    "IntentDetectionService",
    "IntentDetectionOutput",
    "IntentSignal",
]


class IntentDetectionService:
    """
    Service that detects buying/intent signals from lead intelligence context.

    Uses LLM for extraction and classification only.
    Does NOT calculate the final numerical lead score.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "intent_detection_v1",
    ):
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _summarize_lead_intelligence(self, lead: LeadIntelligenceOutput) -> str:
        """Flatten LeadIntelligenceOutput into a concise text summary for the prompt."""
        parts = []

        cp = lead.company_profile
        if cp.company_name:
            parts.append(f"Company: {cp.company_name}")
        if cp.industry:
            parts.append(f"Industry: {cp.industry}")
        if cp.company_size:
            parts.append(f"Size: {cp.company_size}")
        if cp.geography:
            parts.append(f"Geography: {cp.geography}")
        if cp.likely_needs:
            parts.append(f"Likely Needs: {', '.join(cp.likely_needs)}")

        pp = lead.prospect_profile
        if pp.name:
            parts.append(f"Prospect: {pp.name}")
        if pp.role:
            parts.append(f"Role: {pp.role}")
        if pp.decision_authority and pp.decision_authority != "UNKNOWN":
            parts.append(f"Authority: {pp.decision_authority}")
        if pp.likely_pain_points:
            parts.append(f"Prospect Pain Points: {', '.join(pp.likely_pain_points)}")

        req = lead.requirement
        if req.summary:
            parts.append(f"Requirement: {req.summary}")
        if req.explicit_needs:
            parts.append(f"Explicit Needs: {', '.join(req.explicit_needs)}")
        if req.urgency_signals:
            parts.append(f"Urgency Signals: {', '.join(req.urgency_signals)}")
        if req.timeline_signals:
            parts.append(f"Timeline Signals: {', '.join(req.timeline_signals)}")
        if req.budget_signals:
            parts.append(f"Budget Signals: {', '.join(req.budget_signals)}")
        if req.pain_points:
            parts.append(f"Pain Points: {', '.join(req.pain_points)}")

        if lead.raw_intent_signals:
            sigs = [f"{s.signal} ({s.category}, strength={s.strength})" for s in lead.raw_intent_signals]
            parts.append(f"Raw Intent Signals: {'; '.join(sigs)}")

        if lead.missing_information:
            parts.append(f"Missing Information: {', '.join(lead.missing_information)}")

        return "\n".join(parts) if parts else "No lead intelligence available."

    def _summarize_bi_context(self, bi: Optional[BusinessIntelligenceOutput]) -> str:
        """Flatten optional BI context into a concise text summary."""
        if bi is None:
            return "UNKNOWN"
        parts = []
        if bi.target_industries:
            parts.append(f"Target Industries: {', '.join(bi.target_industries)}")
        if bi.buyer_personas:
            roles = [p.role for p in bi.buyer_personas]
            parts.append(f"Buyer Personas: {', '.join(roles)}")
        if bi.positive_buying_signals:
            sigs = [s.signal for s in bi.positive_buying_signals]
            parts.append(f"Known Buying Signals: {', '.join(sigs)}")
        return "\n".join(parts) if parts else "UNKNOWN"

    async def analyze(
        self,
        lead_intelligence: LeadIntelligenceOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> IntentDetectionOutput:
        """Analyze lead intelligence asynchronously and detect intent signals."""
        template = prompt_registry.get(self.prompt_name)
        prompt_args = {
            "lead_intelligence_summary": self._summarize_lead_intelligence(lead_intelligence),
            "business_intelligence_context": self._summarize_bi_context(business_intelligence),
        }
        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = await self.provider.generate_structured_async(
            prompt=user_str,
            schema=IntentDetectionOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)
        return output

    def analyze_sync(
        self,
        lead_intelligence: LeadIntelligenceOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> IntentDetectionOutput:
        """Analyze lead intelligence synchronously and detect intent signals."""
        template = prompt_registry.get(self.prompt_name)
        prompt_args = {
            "lead_intelligence_summary": self._summarize_lead_intelligence(lead_intelligence),
            "business_intelligence_context": self._summarize_bi_context(business_intelligence),
        }
        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = self.provider.generate_structured(
            prompt=user_str,
            schema=IntentDetectionOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)
        return output
