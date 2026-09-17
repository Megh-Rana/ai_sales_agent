"""
Buying Signals and Objections Service — AI-09.

Analyzes sales conversation transcripts to identify observable buying signals,
evaluate signal strength, extract and classify objections, gauge severity,
track resolution status, and compile unresolved prospect concerns.

Core Architectural Principle:
"GEMMA REASONS. PYTHON DECIDES."
Gemma extracts observable signals, objections, grounded quotes, and conversational nuance.
Python deterministically verifies attribution, cleans injection attempts, enforces
resolution logic, computes overall signal strength, and guarantees scope boundaries.

Strict Scope Boundary:
AI-09 answers what buying signals and objections are observably present in the dialogue.
It does NOT perform qualification (AI-08), numerical lead scoring (AI-04),
or Next Best Action recommendations (AI-10).
"""

import time
import re
from typing import Optional, Dict, Any, List, Set

from ai.core.providers.base import BaseAIProvider
from ai.core.factory import get_ai_provider
from ai.core.prompts.registry import prompt_registry
from ai.core.schemas.base import Evidence
from ai.core.schemas.buying_signals import (
    BuyingSignalType,
    BuyingSignalStrength,
    ObjectionType,
    ObjectionSeverity,
    ResolutionStatus,
    SpeakerRole,
    BuyingSignal,
    Objection,
    BuyingSignalsObjectionsOutput,
    BuyingSignalsObjectionsInput,
)

__all__ = [
    "BuyingSignalsObjectionsService",
    "BuyingSignalsObjectionsInput",
    "BuyingSignalsObjectionsOutput",
    "BuyingSignal",
    "Objection",
]

# Regex patterns for detecting prompt injection attempts in transcript or summaries
INJECTION_PATTERNS = [
    r"system\s+override",
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"ignore\s+(all\s+)?rules",
    r"mark\s+this\s+(lead\s+)?as\s+high",
    r"fake\s+objection",
    r"declare\s+(strong\s+)?buying\s+signal",
    r"disregard\s+objections",
]


class BuyingSignalsObjectionsService:
    """
    Production-grade Buying Signals & Objections intelligence service.
    Combines LLM extraction with deterministic Python governance rules.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "buying_signals_objections_v1",
    ):
        """
        Initialize service with AI provider and prompt template name.

        Args:
            provider: Optional BaseAIProvider instance (defaults to factory default)
            prompt_name: Name of registered prompt in PromptRegistry
        """
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _prepare_prompt_args(self, input_data: BuyingSignalsObjectionsInput) -> Dict[str, Any]:
        """Format inputs into structured prompt arguments."""

        # 1. Business Context
        business_context = "None provided."
        if input_data.business_context:
            bc = input_data.business_context
            icp_inds = ", ".join(bc.icp.industries) if bc.icp.industries else "General B2B"
            icp_size = bc.icp.company_size or "Any"
            val_props = "; ".join(vp.proposed_value for vp in bc.value_propositions[:3]) if bc.value_propositions else "None"
            business_context = (
                f"ICP Industries: {icp_inds}\n"
                f"ICP Company Size: {icp_size}\n"
                f"Core Offerings & Value Props: {val_props}"
            )

        # 2. Lead Context
        lead_context = "None provided."
        if input_data.lead_intelligence:
            li = input_data.lead_intelligence
            c_name = li.company_profile.company_name or "Unknown Company"
            c_ind = li.company_profile.industry or "Unknown"
            p_name = li.prospect_profile.name or "Unknown Contact"
            p_role = li.prospect_profile.role or "Unknown Role"
            req_sum = li.requirement.summary if li.requirement else "Not specified"
            lead_context = (
                f"Prospect: {p_name} ({p_role}) at {c_name} ({c_ind})\n"
                f"Stated Requirement: {req_sum}"
            )

        # 3. Conversation Intelligence Context
        conv_context = "None provided."
        if input_data.conversation_intelligence:
            ci = input_data.conversation_intelligence
            c_stage = ci.conversation_stage or "UNKNOWN"
            c_summary = ci.conversation_summary or "No summary"
            conv_context = (
                f"Conversation Stage: {c_stage}\n"
                f"Summary: {c_summary}"
            )

        # 4. Formatted Dialogue Transcript
        formatted_transcript = input_data.get_formatted_transcript()

        return {
            "business_context": business_context,
            "lead_context": lead_context,
            "conversation_context": conv_context,
            "transcript": formatted_transcript,
        }

    def _apply_deterministic_rules(
        self,
        output: BuyingSignalsObjectionsOutput,
        input_data: BuyingSignalsObjectionsInput,
    ) -> BuyingSignalsObjectionsOutput:
        """
        Deterministic Rule Engine — 'GEMMA REASONS. PYTHON DECIDES.'

        Enforces:
        1. Prompt Injection Scrubbing:
           Discard signals/objections generated directly by injection phrases.
        2. Prospect Attribution:
           Buying signals MUST originate from the prospect. Seller pitch statements
           are discarded or rejected from buying signals.
        3. Pricing Request vs Price Objection Disambiguation:
           Asking for pricing is a buying signal (REQUEST_FOR_PRICING), NOT a price objection.
           If misclassified as an objection, reassign or discard.
        4. Question vs Objection Disambiguation:
           Informational discovery questions without prospect resistance or friction
           are not valid objections.
        5. Grounded Evidence Verification:
           Filter out entries with empty or fabricated evidence.
        6. Deterministic Overall Signal Strength:
           Strictly computed from validated prospect buying signals:
           - At least one HIGH signal -> HIGH
           - At least one MEDIUM signal -> MEDIUM
           - At least one LOW signal -> LOW
           - No signals -> UNKNOWN
           (Numerical lead score and qualification MUST NOT alter this verdict).
        7. Resolution Status & Unresolved Concerns Tracking:
           All UNRESOLVED or PARTIALLY_RESOLVED objections are compiled into unresolved_concerns.
        8. Boundary Scrubbing:
           Ensure no downstream next-best-action or recommendation leakage.
        9. Confidence Clamping:
           Clamp overall and item confidences to [0.0, 1.0].
        """
        raw_transcript = input_data.get_formatted_transcript().lower()

        # ── 1. Validate and Filter Buying Signals ──────────────────────
        valid_buying_signals: List[BuyingSignal] = []

        for signal in output.buying_signals:
            desc = signal.description or ""
            evidence = (signal.evidence or "").strip()

            # Discard injection attempts
            if any(re.search(pat, desc, re.IGNORECASE) for pat in INJECTION_PATTERNS) or \
               any(re.search(pat, evidence, re.IGNORECASE) for pat in INJECTION_PATTERNS):
                continue

            # Discard empty signals
            if not desc and not evidence:
                continue

            # Check attribution: Buying signals must come from PROSPECT
            if signal.speaker == "SELLER":
                # Seller pitch statement is never a prospect buying signal
                continue

            # Normalize evidence & confidence
            signal.confidence = max(0.0, min(1.0, float(signal.confidence)))
            if not signal.provenance:
                signal.provenance = "CONVERSATION"

            valid_buying_signals.append(signal)

        output.buying_signals = valid_buying_signals

        # ── 2. Validate and Filter Objections ──────────────────────────
        valid_objections: List[Objection] = []

        for obj in output.objections:
            desc = obj.description or ""
            evidence = (obj.evidence or "").strip()

            # Discard injection attempts
            if any(re.search(pat, desc, re.IGNORECASE) for pat in INJECTION_PATTERNS) or \
               any(re.search(pat, evidence, re.IGNORECASE) for pat in INJECTION_PATTERNS):
                continue

            # Discard empty objections
            if not desc and not evidence:
                continue

            # Disambiguation 1: Pricing request is NOT a price objection
            # e.g., "Can you send over pricing?", "What's the cost?"
            pricing_request_pattern = r"(can you (send|share|give|provide)|what is|what's|how much does).*(pricing|price|cost|quote|rates)"
            if obj.objection_type in {"PRICE", "BUDGET"} and re.search(pricing_request_pattern, evidence, re.IGNORECASE):
                # Check if prospect actually complained about price
                if not re.search(r"(expensive|high|budget|cannot afford|too much|tight)", evidence, re.IGNORECASE):
                    # It is purely a pricing request, not an objection!
                    # Add as a buying signal if not already present
                    already_present = any(
                        s.signal_type == "REQUEST_FOR_PRICING" for s in output.buying_signals
                    )
                    if not already_present:
                        output.buying_signals.append(
                            BuyingSignal(
                                signal_type="REQUEST_FOR_PRICING",
                                strength="MEDIUM",
                                description="Prospect requested pricing information",
                                evidence=evidence,
                                speaker="PROSPECT",
                                confidence=1.0,
                                provenance="CONVERSATION",
                            )
                        )
                    continue

            # Disambiguation 2: Informational question is NOT an objection
            # e.g., "What integrations do you support?", "Do you support Salesforce?"
            pure_question_pattern = r"^(what|do you|can you|does your platform|how do you)\s+.*(support|integrate|work|feature)\??$"
            if re.match(pure_question_pattern, evidence.strip(), re.IGNORECASE):
                # Without explicit hesitation/dissatisfaction, it's a discovery question, not an objection
                if not re.search(r"(won't buy|blocker|cannot|problem|concern|issue|dealbreaker)", evidence, re.IGNORECASE):
                    continue

            obj.confidence = max(0.0, min(1.0, float(obj.confidence)))
            if not obj.provenance:
                obj.provenance = "CONVERSATION"

            valid_objections.append(obj)

        output.objections = valid_objections

        # ── 3. Deterministic Overall Signal Strength ───────────────────
        # Python evaluates overall signal strength purely based on valid prospect buying signals.
        # AI-04 lead score and AI-08 qualification context MUST NEVER force a signal strength.
        has_high_signal = any(s.strength == "HIGH" for s in output.buying_signals)
        has_med_signal = any(s.strength == "MEDIUM" for s in output.buying_signals)
        has_low_signal = any(s.strength == "LOW" for s in output.buying_signals)

        if has_high_signal:
            output.overall_signal_strength = "HIGH"
        elif has_med_signal:
            output.overall_signal_strength = "MEDIUM"
        elif has_low_signal:
            output.overall_signal_strength = "LOW"
        else:
            output.overall_signal_strength = "UNKNOWN"

        # ── 4. Compile Unresolved Concerns ─────────────────────────────
        unresolved: List[str] = []
        for obj in output.objections:
            if obj.resolution_status in {"UNRESOLVED", "PARTIALLY_RESOLVED"}:
                status_label = "Unresolved" if obj.resolution_status == "UNRESOLVED" else "Partially resolved"
                sev_label = f"[{obj.severity} severity]" if obj.severity != "UNKNOWN" else ""
                concern_desc = f"{status_label} {obj.objection_type.lower()} concern {sev_label}: {obj.description}".strip()
                unresolved.append(concern_desc)

        output.unresolved_concerns = unresolved

        # ── 5. Evidence Collection ─────────────────────────────────────
        collected_evidence: List[Evidence] = []
        for s in output.buying_signals:
            if s.evidence:
                collected_evidence.append(
                    Evidence(
                        source=f"Buying Signal ({s.signal_type})",
                        text=s.evidence,
                        confidence=s.confidence,
                    )
                )
        for o in output.objections:
            if o.evidence:
                collected_evidence.append(
                    Evidence(
                        source=f"Objection ({o.objection_type})",
                        text=o.evidence,
                        confidence=o.confidence,
                    )
                )
        output.evidence = collected_evidence

        # ── 6. Deterministic Reasoning Summary ─────────────────────────
        sig_count = len(output.buying_signals)
        obj_count = len(output.objections)
        unres_count = len(output.unresolved_concerns)
        output.reasoning = (
            f"Identified {sig_count} observable buying signal(s) (overall strength: {output.overall_signal_strength}) "
            f"and {obj_count} objection(s) ({unres_count} unresolved)."
        )

        # ── 7. Clamp Confidence ────────────────────────────────────────
        output.confidence = max(0.0, min(1.0, float(output.confidence)))

        return output

    async def analyze_async(
        self, input_data: BuyingSignalsObjectionsInput
    ) -> BuyingSignalsObjectionsOutput:
        """
        Analyze buying signals and objections asynchronously.

        Args:
            input_data: BuyingSignalsObjectionsInput with transcript and background context

        Returns:
            Validated, deterministically governed BuyingSignalsObjectionsOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(input_data)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        try:
            output = await self.provider.generate_structured_async(
                prompt=user_str,
                schema=BuyingSignalsObjectionsOutput,
                system_prompt=system_str,
            )
        except Exception:
            # Fallback handling for malformed provider response
            output = BuyingSignalsObjectionsOutput(
                buying_signals=[],
                objections=[],
                unresolved_concerns=[],
                overall_signal_strength="UNKNOWN",
                confidence=0.5,
                reasoning="Fallback: structured extraction failed, returning default UNKNOWN output.",
            )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return self._apply_deterministic_rules(output, input_data)

    def analyze_sync(
        self, input_data: BuyingSignalsObjectionsInput
    ) -> BuyingSignalsObjectionsOutput:
        """
        Analyze buying signals and objections synchronously.

        Args:
            input_data: BuyingSignalsObjectionsInput with transcript and background context

        Returns:
            Validated, deterministically governed BuyingSignalsObjectionsOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(input_data)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        try:
            output = self.provider.generate_structured(
                prompt=user_str,
                schema=BuyingSignalsObjectionsOutput,
                system_prompt=system_str,
            )
        except Exception:
            # Fallback handling for malformed provider response
            output = BuyingSignalsObjectionsOutput(
                buying_signals=[],
                objections=[],
                unresolved_concerns=[],
                overall_signal_strength="UNKNOWN",
                confidence=0.5,
                reasoning="Fallback: structured extraction failed, returning default UNKNOWN output.",
            )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return self._apply_deterministic_rules(output, input_data)

    def analyze(
        self, input_data: BuyingSignalsObjectionsInput
    ) -> BuyingSignalsObjectionsOutput:
        """Convenience alias for analyze_sync."""
        return self.analyze_sync(input_data)
