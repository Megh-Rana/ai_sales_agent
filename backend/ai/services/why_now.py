"""
Why Now / Buying Urgency Analysis Service.

Identifies why a lead may be actionable NOW, based on structured signals
from LeadIntelligenceOutput and IntentDetectionOutput.
Uses the configured BaseAIProvider for interpretation.
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
    WhyNowOutput,
    TriggerSignal,
)

__all__ = [
    "WhyNowService",
    "WhyNowOutput",
    "TriggerSignal",
]


class WhyNowService:
    """
    Service that generates evidence-backed Why Now / buying urgency analysis.

    Uses LLM for interpretation only. Every claim must map to evidence.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "why_now_v1",
    ):
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _summarize_lead_intelligence(self, lead: LeadIntelligenceOutput) -> str:
        """Flatten lead intelligence into concise text."""
        parts = []

        cp = lead.company_profile
        if cp.company_name:
            parts.append(f"Company: {cp.company_name}")
        if cp.industry:
            parts.append(f"Industry: {cp.industry}")

        pp = lead.prospect_profile
        if pp.name:
            parts.append(f"Prospect: {pp.name}")
        if pp.role:
            parts.append(f"Role: {pp.role}")

        req = lead.requirement
        if req.summary:
            parts.append(f"Requirement: {req.summary}")
        if req.urgency_signals:
            parts.append(f"Urgency Signals: {', '.join(req.urgency_signals)}")
        if req.timeline_signals:
            parts.append(f"Timeline Signals: {', '.join(req.timeline_signals)}")
        if req.budget_signals:
            parts.append(f"Budget Signals: {', '.join(req.budget_signals)}")
        if req.pain_points:
            parts.append(f"Pain Points: {', '.join(req.pain_points)}")

        if lead.raw_intent_signals:
            sigs = [f"{s.signal} ({s.category})" for s in lead.raw_intent_signals]
            parts.append(f"Raw Intent Signals: {'; '.join(sigs)}")

        return "\n".join(parts) if parts else "No lead intelligence available."

    def _summarize_intent_detection(self, intent: IntentDetectionOutput) -> str:
        """Flatten intent detection into concise text."""
        parts = [f"Intent Level: {intent.intent_level}"]

        if intent.positive_signals:
            parts.append(f"Positive Signals: {', '.join(intent.positive_signals)}")
        if intent.negative_signals:
            parts.append(f"Negative Signals: {', '.join(intent.negative_signals)}")
        if intent.urgency_indicators:
            parts.append(f"Urgency Indicators: {', '.join(intent.urgency_indicators)}")
        if intent.intent_signals:
            sigs = [f"{s.signal_type}: {s.interpretation}" for s in intent.intent_signals if s.interpretation]
            if sigs:
                parts.append(f"Intent Signals: {'; '.join(sigs[:5])}")

        return "\n".join(parts)

    def _summarize_bi_context(self, bi: Optional[BusinessIntelligenceOutput]) -> str:
        """Flatten optional BI context."""
        if bi is None:
            return "UNKNOWN"
        parts = []
        if bi.target_industries:
            parts.append(f"Target Industries: {', '.join(bi.target_industries)}")
        if bi.buyer_personas:
            parts.append(f"Buyer Personas: {', '.join(p.role for p in bi.buyer_personas)}")
        return "\n".join(parts) if parts else "UNKNOWN"

    async def analyze(
        self,
        lead_intelligence: LeadIntelligenceOutput,
        intent_detection: IntentDetectionOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> WhyNowOutput:
        """Analyze urgency asynchronously and generate Why Now assessment."""
        template = prompt_registry.get(self.prompt_name)
        prompt_args = {
            "lead_intelligence_summary": self._summarize_lead_intelligence(lead_intelligence),
            "intent_detection_summary": self._summarize_intent_detection(intent_detection),
            "business_intelligence_context": self._summarize_bi_context(business_intelligence),
        }
        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = await self.provider.generate_structured_async(
            prompt=user_str,
            schema=WhyNowOutput,
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
        intent_detection: IntentDetectionOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> WhyNowOutput:
        """Analyze urgency synchronously and generate Why Now assessment."""
        template = prompt_registry.get(self.prompt_name)
        prompt_args = {
            "lead_intelligence_summary": self._summarize_lead_intelligence(lead_intelligence),
            "intent_detection_summary": self._summarize_intent_detection(intent_detection),
            "business_intelligence_context": self._summarize_bi_context(business_intelligence),
        }
        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = self.provider.generate_structured(
            prompt=user_str,
            schema=WhyNowOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)
        return output
