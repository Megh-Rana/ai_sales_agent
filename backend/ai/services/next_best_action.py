"""
Next Best Action Service — AI-10.

Converts multi-layer sales intelligence into ranked, evidence-grounded recommended next actions.

Core Architectural Principle:
"GEMMA REASONS + PYTHON VALIDATES / ENFORCES POLICY = NEXT BEST ACTION"
Gemma analyzes available intelligence and proposes candidate actions, rationales, and timing.
Python deterministically validates action types, verifies evidence grounding, enforces no-contact policies,
prioritizes unresolved blockers, handles conflict resolution, rejects hallucinations/prompt injections,
and limits output to a compact, actionable set.

Strict Scope Boundary:
AI-10 recommends actions; it does NOT execute them.
It does NOT calculate lead scores (AI-04), re-perform qualification (AI-08),
or re-classify buying signals or objections (AI-09).
"""

import time
import re
from typing import Optional, Dict, Any, List, Set

from ai.core.providers.base import BaseAIProvider
from ai.core.factory import get_ai_provider
from ai.core.prompts.registry import prompt_registry
from ai.core.schemas.base import Evidence
from ai.core.schemas.next_best_action import (
    ActionType,
    ActionPriority,
    ActionUrgency,
    NextBestAction,
    NextBestActionOutput,
    NextBestActionInput,
)

__all__ = [
    "NextBestActionService",
    "NextBestActionInput",
    "NextBestActionOutput",
    "NextBestAction",
]

# Patterns detecting prompt injection attempts in transcript, summaries, or candidate actions
INJECTION_PATTERNS = [
    r"system\s+override",
    r"ignore\s+(all\s+)?(previous\s+)?instructions",
    r"ignore\s+(all\s+)?rules",
    r"discount",
    r"special\s+pricing",
    r"90%\s+off",
    r"free\s+trial\s+unlimited",
    r"force\s+(follow\s*up|action|call)",
    r"immediately\s+call",
]

# Patterns indicating prospect explicit refusal or no-contact directives
NO_CONTACT_PATTERNS = [
    r"don'?t\s+contact\s+me",
    r"stop\s+(calling|contacting|emailing)",
    r"remove\s+me(\s+from)?",
    r"not\s+interested\s+in\s+further\s+(communication|contact|calls)",
    r"not\s+interested",
    r"take\s+me\s+off(\s+your)?(\s+list)?",
    r"do\s+not\s+call",
    r"unsubscribe",
    r"never\s+contact",
]


class NextBestActionService:
    """
    Production-grade Next Best Action intelligence engine.
    Combines Gemma reasoning with deterministic Python policy enforcement.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "next_best_action_v1",
    ):
        """
        Initialize NextBestActionService.

        Args:
            provider: Optional BaseAIProvider instance (defaults to factory default)
            prompt_name: Name of registered prompt in PromptRegistry
        """
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _prepare_prompt_args(self, input_data: NextBestActionInput) -> Dict[str, Any]:
        """Format upstream multi-layer intelligence into structured prompt variables."""

        # 1. Business Context
        business_context = "None provided."
        if input_data.business_context:
            bc = input_data.business_context
            inds = ", ".join(bc.icp.industries) if bc.icp.industries else "General B2B"
            size = bc.icp.company_size or "Any"
            val_props = "; ".join(vp.proposed_value for vp in bc.value_propositions[:3]) if bc.value_propositions else "None"
            business_context = (
                f"Target ICP: {inds} (Size: {size})\n"
                f"Core Value Propositions: {val_props}"
            )

        # 2. Lead Intelligence Context
        lead_context = "None provided."
        if input_data.lead_intelligence:
            li = input_data.lead_intelligence
            c_name = li.company_profile.company_name or "Unknown Company"
            c_ind = li.company_profile.industry or "Unknown Industry"
            p_name = li.prospect_profile.name or "Unknown Contact"
            p_role = li.prospect_profile.role or "Unknown Role"
            req = li.requirement.summary if li.requirement else "Not specified"
            lead_context = (
                f"Prospect: {p_name} ({p_role}) at {c_name} ({c_ind})\n"
                f"Stated Requirement: {req}"
            )

        # 3. Conversation Intelligence Context
        conversation_context = "None provided."
        if input_data.conversation_intelligence:
            ci = input_data.conversation_intelligence
            stage = ci.conversation_stage or "UNKNOWN"
            summary = ci.conversation_summary or "No summary available"
            needs = "; ".join(n.need for n in ci.customer_needs[:3]) if ci.customer_needs else "None captured"
            conversation_context = (
                f"Stage: {stage}\n"
                f"Summary: {summary}\n"
                f"Identified Needs: {needs}"
            )

        # 4. Qualification Context (AI-08)
        qualification_context = "None provided."
        if input_data.qualification:
            q = input_data.qualification
            gaps = "; ".join(q.qualification_gaps) if q.qualification_gaps else "No critical gaps identified"
            confirmed = ", ".join(q.confirmed_criteria) if q.confirmed_criteria else "None"
            unknowns = ", ".join(q.unknown_criteria) if q.unknown_criteria else "None"
            disqualified = ", ".join(q.disqualified_criteria) if q.disqualified_criteria else "None"
            qualification_context = (
                f"Overall Qualification Status: {q.overall_status}\n"
                f"Confirmed Dimensions: {confirmed}\n"
                f"Unknown / Missing Dimensions: {unknowns}\n"
                f"Disqualified Dimensions: {disqualified}\n"
                f"Qualification Gaps: {gaps}"
            )

        # 5. Buying Signals & Objections Context (AI-09)
        signals_objections_context = "None provided."
        if input_data.buying_signals_objections:
            bso = input_data.buying_signals_objections
            signals_summary = (
                "; ".join(f"{s.signal_type} ({s.strength})" for s in bso.buying_signals)
                if bso.buying_signals else "None detected"
            )
            unresolved = (
                "; ".join(bso.unresolved_concerns)
                if bso.unresolved_concerns else "None"
            )
            signals_objections_context = (
                f"Overall Buying Signal Strength: {bso.overall_signal_strength}\n"
                f"Observed Buying Signals: {signals_summary}\n"
                f"Unresolved Objections / Concerns: {unresolved}"
            )

        # 6. Contextual Background Signals (Strictly reference only)
        lead_score_context = "Not evaluated."
        if input_data.lead_score:
            score_val = getattr(input_data.lead_score, "final_score", getattr(input_data.lead_score, "total_score", "N/A"))
            band_val = getattr(input_data.lead_score, "score_band", getattr(input_data.lead_score, "qualification_band", "N/A"))
            lead_score_context = (
                f"Score: {score_val}/100 "
                f"({band_val}) [BACKGROUND CONTEXT ONLY]"
            )

        intent_context = "Not evaluated."
        if input_data.intent_information:
            intent_context = (
                f"Intent Level: {input_data.intent_information.intent_level} [BACKGROUND CONTEXT ONLY]"
            )

        company_facts = "None available."
        if input_data.company_research and input_data.company_research.verified_facts:
            facts = [f.fact for f in input_data.company_research.verified_facts[:3]]
            company_facts = "; ".join(facts)

        # 7. Untrusted Data Boundary (Transcript or raw input)
        raw_transcript = input_data.get_formatted_transcript()
        untrusted_data = raw_transcript if raw_transcript else "None provided."

        return {
            "business_context": business_context,
            "lead_context": lead_context,
            "conversation_context": conversation_context,
            "qualification_context": qualification_context,
            "signals_objections_context": signals_objections_context,
            "lead_score_context": lead_score_context,
            "intent_context": intent_context,
            "company_facts": company_facts,
            "untrusted_data": untrusted_data,
        }

    def _check_explicit_no_contact(self, input_data: NextBestActionInput) -> Optional[str]:
        """Check if prospect explicitly expressed no-contact, stop, or rejection."""
        # 1. Check formatted dialogue transcript
        transcript_text = input_data.get_formatted_transcript().lower()
        for pat in NO_CONTACT_PATTERNS:
            match = re.search(pat, transcript_text, re.IGNORECASE)
            if match:
                return match.group(0)

        # 2. Check conversation intelligence summary / stage
        if input_data.conversation_intelligence:
            summary = (input_data.conversation_intelligence.conversation_summary or "").lower()
            for pat in NO_CONTACT_PATTERNS:
                match = re.search(pat, summary, re.IGNORECASE)
                if match:
                    return match.group(0)

        # 3. Check objections in buying signals
        if input_data.buying_signals_objections:
            for obj in input_data.buying_signals_objections.objections:
                obj_text = f"{obj.description} {obj.evidence or ''}".lower()
                for pat in NO_CONTACT_PATTERNS:
                    match = re.search(pat, obj_text, re.IGNORECASE)
                    if match:
                        return match.group(0)

        return None

    def _apply_deterministic_rules(
        self,
        output: NextBestActionOutput,
        input_data: NextBestActionInput,
    ) -> NextBestActionOutput:
        """
        Deterministic Policy Enforcement — 'GEMMA REASONS. PYTHON DECIDES.'

        Enforces:
        1. Explicit No-Contact / Refusal Policy:
           Immediately sets NO_ACTION, clears secondary actions, and provides clear reason.
        2. Prompt Injection Neutralization:
           Scrubs discount authorizations, system overrides, and forced follow-ups.
        3. Blocker Conflict Resolution:
           Severe unresolved objections (security, compliance, architecture, budget) outrank
           positive selling actions (SEND_PROPOSAL, SCHEDULE_DEMO). The blocker must be addressed first.
        4. Evidence Grounding & Action Verification:
           Rejects candidate actions that lack grounded evidence or upstream support.
        5. Deterministic Triggers Alignment:
           Aligns explicit pricing requests, demo requests, and qualification gaps to appropriate actions.
        6. Timing Sanitization:
           Prevents calendar date hallucinations and grounds timing in relative conversational windows.
        7. Compact Output Limits:
           Ensures exactly 1 primary action and at most 2 secondary actions (max 3 total).
        8. NO_ACTION Fallback:
           Guarantees safe NO_ACTION when evidence is insufficient.
        """
        # ── 1. Enforce Explicit No-Contact / Stop Policy ────────────────────
        no_contact_match = self._check_explicit_no_contact(input_data)
        if no_contact_match:
            no_action = NextBestAction(
                action_type="NO_ACTION",
                title="Do Not Contact",
                description="Prospect explicitly requested no further contact, outreach, or follow-up.",
                rationale=f"Prospect indicated explicit opt-out/refusal matching: '{no_contact_match}'. Respecting customer directive.",
                priority="LOW",
                urgency="LOW",
                recommended_timing="Do not contact",
                evidence=[Evidence(text=no_contact_match, source="CONVERSATION", confidence=1.0)],
                triggering_factors=["EXPLICIT_NO_CONTACT"],
                dependencies=[],
                confidence=1.0,
                provenance="CONVERSATION",
            )
            output.primary_next_best_action = no_action
            output.secondary_actions = []
            output.no_action_reason = "Prospect explicitly requested no further contact or communication."
            output.confidence = 1.0
            output.reasoning = "Deterministic policy: Explicit no-contact request overrides all other potential actions."
            return output

        # ── 2. Collect & Sanitize Candidate Actions ────────────────────────
        candidates: List[NextBestAction] = []
        if output.primary_next_best_action:
            candidates.append(output.primary_next_best_action)
        if output.secondary_actions:
            candidates.extend(output.secondary_actions)

        valid_candidates: List[NextBestAction] = []
        raw_transcript_lower = input_data.get_formatted_transcript().lower()

        for action in candidates:
            # Check for prompt injection in title, desc, rationale, or timing
            full_text = f"{action.title} {action.description} {action.rationale} {action.recommended_timing}".lower()
            if any(re.search(pat, full_text, re.IGNORECASE) for pat in INJECTION_PATTERNS):
                # Discard malicious/injected actions (e.g. discount authorization, forced call)
                continue

            # Grounding check: Actions claiming proposal/pricing/demo must have grounded context
            if action.action_type in {"SEND_PROPOSAL", "SCHEDULE_DEMO"}:
                # Check if there is actual upstream support
                has_signal = False
                if input_data.buying_signals_objections:
                    for s in input_data.buying_signals_objections.buying_signals:
                        if s.signal_type in {"REQUEST_FOR_PROPOSAL", "REQUEST_FOR_DEMO", "PURCHASE_INTENT", "PRODUCT_FIT_CONFIRMATION"}:
                            has_signal = True
                            break
                if not has_signal and not any(k in raw_transcript_lower for k in ["demo", "proposal", "rfp", "contract"]):
                    # Unsupported progression action -> demote or reject
                    continue

            # Timing sanitization: Do not allow hallucinated calendar dates like "2026-09-18"
            date_match = re.search(r"\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b", action.recommended_timing)
            if date_match:
                action.recommended_timing = "Within agreed conversational timeframe"

            # Clamp confidence
            action.confidence = max(0.0, min(1.0, float(action.confidence)))
            valid_candidates.append(action)

        # ── 3. Deterministic Upstream Trigger Injections ────────────────────
        # Ensure obvious upstream triggers have representation if LLM missed them
        unresolved_blockers = []
        if input_data.buying_signals_objections:
            unresolved_blockers = input_data.buying_signals_objections.get_unresolved_objections()

        # Check for unresolved high-severity objection
        high_severity_blockers = [
            o for o in unresolved_blockers if o.severity in {"HIGH", "MEDIUM"}
        ]
        if high_severity_blockers:
            blocker = high_severity_blockers[0]
            # Determine appropriate action type for blocker
            b_action_type: ActionType = "ADDRESS_OBJECTION"
            b_title = f"Address Unresolved {blocker.objection_type.capitalize()} Objection"
            if blocker.objection_type in {"SECURITY", "COMPLIANCE", "INTEGRATION"}:
                b_action_type = "ADDRESS_OBJECTION"
                b_title = f"Address {blocker.objection_type.capitalize()} Concern & Provide Technical Specifications"

            # Check if this blocker is already covered in valid candidates
            already_covered = any(
                c.action_type in {"ADDRESS_OBJECTION", "SEND_TECHNICAL_DOCUMENTATION", "SCHEDULE_TECHNICAL_CALL"}
                for c in valid_candidates
            )
            if not already_covered:
                evidence_items = []
                if blocker.evidence:
                    evidence_items.append(Evidence(text=blocker.evidence, source="OBJECTION", confidence=1.0))
                valid_candidates.insert(
                    0,
                    NextBestAction(
                        action_type=b_action_type,
                        title=b_title,
                        description=f"Resolve the prospect's unresolved {blocker.objection_type.lower()} concern ({blocker.description}) which is blocking progression.",
                        rationale=f"The prospect raised an unresolved {blocker.severity.lower()} concern regarding {blocker.objection_type.lower()} that must be satisfied before deal can advance.",
                        priority="HIGH",
                        urgency="IMMEDIATE" if blocker.severity == "HIGH" else "SOON",
                        recommended_timing="Prior to advancing proposal or contract",
                        evidence=evidence_items,
                        triggering_factors=[f"UNRESOLVED_{blocker.objection_type}_CONCERN"],
                        dependencies=[],
                        confidence=0.95,
                        provenance="OBJECTION",
                    ),
                )

        # Check for explicit pricing request
        if input_data.buying_signals_objections:
            pricing_signals = input_data.buying_signals_objections.get_signals_by_type("REQUEST_FOR_PRICING")
            if pricing_signals:
                pricing_act = next((c for c in valid_candidates if c.action_type == "SEND_PRICING"), None)
                if not pricing_act:
                    sig = pricing_signals[0]
                    ev = [Evidence(text=sig.evidence, source="BUYING_SIGNAL", confidence=1.0)] if sig.evidence else []
                    pricing_act = NextBestAction(
                        action_type="SEND_PRICING",
                        title="Send Requested Pricing",
                        description="Deliver the requested pricing schedule, quotes, or licensing options.",
                        rationale="Prospect explicitly requested pricing information during conversation.",
                        priority="HIGH",
                        urgency="SOON",
                        recommended_timing="Within 24 hours of request",
                        evidence=ev,
                        triggering_factors=["REQUEST_FOR_PRICING"],
                        dependencies=[],
                        confidence=0.95,
                        provenance="BUYING_SIGNAL",
                    )
                if not high_severity_blockers:
                    valid_candidates = [pricing_act] + [c for c in valid_candidates if c.action_type != "SEND_PRICING"]
                elif pricing_act not in valid_candidates:
                    valid_candidates.append(pricing_act)

        # Check for explicit demo request
        if input_data.buying_signals_objections:
            demo_signals = input_data.buying_signals_objections.get_signals_by_type("REQUEST_FOR_DEMO")
            if demo_signals:
                demo_act = next((c for c in valid_candidates if c.action_type == "SCHEDULE_DEMO"), None)
                if not demo_act:
                    sig = demo_signals[0]
                    ev = [Evidence(text=sig.evidence, source="BUYING_SIGNAL", confidence=1.0)] if sig.evidence else []
                    demo_act = NextBestAction(
                        action_type="SCHEDULE_DEMO",
                        title="Schedule Product Demo",
                        description="Coordinate and schedule a tailored product demonstration for the prospect.",
                        rationale="Prospect explicitly requested a product demonstration.",
                        priority="HIGH",
                        urgency="SOON",
                        recommended_timing="Within the current evaluation window",
                        evidence=ev,
                        triggering_factors=["REQUEST_FOR_DEMO"],
                        dependencies=[],
                        confidence=0.95,
                        provenance="BUYING_SIGNAL",
                    )
                if not high_severity_blockers:
                    valid_candidates = [demo_act] + [c for c in valid_candidates if c.action_type != "SCHEDULE_DEMO"]
                elif demo_act not in valid_candidates:
                    valid_candidates.append(demo_act)

        # Check for missing budget in qualification
        if input_data.qualification and input_data.qualification.overall_status in {"PARTIALLY_QUALIFIED", "UNKNOWN"}:
            budget_crit = input_data.qualification.get_criterion("BUDGET")
            if budget_crit and budget_crit.status == "UNKNOWN":
                if not any(c.action_type in {"CONFIRM_BUDGET", "ASK_CLARIFYING_QUESTION"} for c in valid_candidates):
                    valid_candidates.append(
                        NextBestAction(
                            action_type="CONFIRM_BUDGET",
                            title="Confirm Budget Parameters",
                            description="Clarify the prospect's allocated budget and financial expectations.",
                            rationale="Budget dimension remains unknown in qualification, creating an evaluation gap.",
                            priority="MEDIUM",
                            urgency="NORMAL",
                            recommended_timing="During next discovery interaction",
                            evidence=[],
                            triggering_factors=["MISSING_BUDGET"],
                            dependencies=[],
                            confidence=0.85,
                            provenance="QUALIFICATION",
                        )
                    )

        # Check for missing authority / decision maker involvement
        if input_data.qualification and input_data.qualification.overall_status in {"PARTIALLY_QUALIFIED", "UNKNOWN"}:
            auth_crit = input_data.qualification.get_criterion("AUTHORITY")
            if auth_crit and auth_crit.status in {"PARTIAL", "UNKNOWN"}:
                if not any(c.action_type in {"INVOLVE_DECISION_MAKER", "CONFIRM_DECISION_PROCESS"} for c in valid_candidates):
                    valid_candidates.append(
                        NextBestAction(
                            action_type="INVOLVE_DECISION_MAKER",
                            title="Involve Decision Maker",
                            description="Engage the primary economic buyer or key decision maker.",
                            rationale="Decision-making authority is not fully confirmed or involves additional stakeholders.",
                            priority="MEDIUM",
                            urgency="NORMAL",
                            recommended_timing="Prior to final proposal delivery",
                            evidence=[],
                            triggering_factors=["DECISION_MAKER_NOT_INVOLVED"],
                            dependencies=[],
                            confidence=0.8,
                            provenance="QUALIFICATION",
                        )
                    )

        # ── 4. Conflict Resolution & Blocker Prioritization ────────────────
        # If there is an active high-severity blocker, any action of type ADDRESS_OBJECTION
        # (or technical clarification) MUST outrank SEND_PROPOSAL or SCHEDULE_DEMO.
        if high_severity_blockers:
            blocker_actions = [
                c for c in valid_candidates
                if c.action_type in {"ADDRESS_OBJECTION", "SEND_TECHNICAL_DOCUMENTATION", "SCHEDULE_TECHNICAL_CALL"}
            ]
            other_actions = [
                c for c in valid_candidates
                if c.action_type not in {"ADDRESS_OBJECTION", "SEND_TECHNICAL_DOCUMENTATION", "SCHEDULE_TECHNICAL_CALL"}
            ]
            if blocker_actions:
                # Prioritize blocker first
                # If other actions include SEND_PROPOSAL or SCHEDULE_DEMO, add dependency
                for oa in other_actions:
                    if oa.action_type in {"SEND_PROPOSAL", "SCHEDULE_DEMO"}:
                        if "Resolve outstanding blocker first" not in oa.dependencies:
                            oa.dependencies.append("Resolve outstanding blocker first")
                valid_candidates = blocker_actions + other_actions

        # ── 5. Handle NO_ACTION Case ───────────────────────────────────────
        # Filter out NO_ACTION from candidate list if there are real active actions
        real_actions = [c for c in valid_candidates if c.action_type != "NO_ACTION"]
        
        # Deduplicate actions by action_type preserving order
        deduped_actions: List[NextBestAction] = []
        seen_types: Set[str] = set()
        for a in real_actions:
            if a.action_type not in seen_types:
                seen_types.add(a.action_type)
                deduped_actions.append(a)

        if not deduped_actions:
            # No valid grounded actions exist
            output.primary_next_best_action = NextBestAction(
                action_type="NO_ACTION",
                title="No Immediate Action Required",
                description="Context indicates conversation ended or insufficient evidence exists to justify an immediate outreach.",
                rationale="No explicit prospect requests, unresolved blockers, or critical qualification gaps identified.",
                priority="LOW",
                urgency="LOW",
                recommended_timing="Review during routine account follow-up",
                evidence=[],
                triggering_factors=["INSUFFICIENT_EVIDENCE"],
                dependencies=[],
                confidence=min(output.confidence, 0.85),
                provenance="INFERRED",
            )
            output.secondary_actions = []
            if not output.no_action_reason:
                output.no_action_reason = "Insufficient grounded evidence or requests to justify active outreach."
            if not output.reasoning:
                output.reasoning = "Deterministic policy: Evaluated conversation without actionable signals or blockers -> NO_ACTION."
            return output

        # ── 6. Select Primary and Secondary Actions (Max 3 Total) ──────────
        output.primary_next_best_action = deduped_actions[0]
        output.secondary_actions = deduped_actions[1:3]  # At most 2 secondary
        output.no_action_reason = None

        # Aggregate evidence items from selected actions
        agg_evidence: List[Evidence] = []
        for ev in output.primary_next_best_action.evidence:
            agg_evidence.append(ev)
        for sec in output.secondary_actions:
            for ev in sec.evidence:
                agg_evidence.append(ev)
        output.evidence = agg_evidence

        # Confidence clamping
        output.confidence = max(0.0, min(1.0, float(output.confidence)))
        if not output.reasoning:
            output.reasoning = (
                f"Selected {output.primary_next_best_action.action_type} as primary action "
                f"based on grounded context and prioritized blockers."
            )

        return output

    async def analyze_async(
        self, input_data: NextBestActionInput
    ) -> NextBestActionOutput:
        """
        Analyze intelligence layers and recommend Next Best Action asynchronously.

        Args:
            input_data: NextBestActionInput containing upstream intelligence

        Returns:
            Validated, deterministically governed NextBestActionOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(input_data)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        try:
            output = await self.provider.generate_structured_async(
                prompt=user_str,
                schema=NextBestActionOutput,
                system_prompt=system_str,
            )
        except Exception:
            # Fallback handling for malformed provider response
            output = NextBestActionOutput(
                primary_next_best_action=NextBestAction(
                    action_type="NO_ACTION",
                    title="No Action (Fallback)",
                    description="Structured generation failed or produced invalid format.",
                    rationale="Enforcing safe holding state due to unparseable upstream response.",
                    priority="LOW",
                    urgency="LOW",
                    recommended_timing="None",
                    confidence=0.5,
                    provenance="INFERRED",
                ),
                secondary_actions=[],
                no_action_reason="Structured model extraction failed; default safe fallback applied.",
                confidence=0.5,
                reasoning="Fallback: structured extraction failed, returning safe NO_ACTION.",
            )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return self._apply_deterministic_rules(output, input_data)

    def analyze_sync(
        self, input_data: NextBestActionInput
    ) -> NextBestActionOutput:
        """
        Analyze intelligence layers and recommend Next Best Action synchronously.

        Args:
            input_data: NextBestActionInput containing upstream intelligence

        Returns:
            Validated, deterministically governed NextBestActionOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(input_data)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        try:
            output = self.provider.generate_structured(
                prompt=user_str,
                schema=NextBestActionOutput,
                system_prompt=system_str,
            )
        except Exception:
            # Fallback handling for malformed provider response
            output = NextBestActionOutput(
                primary_next_best_action=NextBestAction(
                    action_type="NO_ACTION",
                    title="No Action (Fallback)",
                    description="Structured generation failed or produced invalid format.",
                    rationale="Enforcing safe holding state due to unparseable upstream response.",
                    priority="LOW",
                    urgency="LOW",
                    recommended_timing="None",
                    confidence=0.5,
                    provenance="INFERRED",
                ),
                secondary_actions=[],
                no_action_reason="Structured model extraction failed; default safe fallback applied.",
                confidence=0.5,
                reasoning="Fallback: structured extraction failed, returning safe NO_ACTION.",
            )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return self._apply_deterministic_rules(output, input_data)

    def analyze(
        self, input_data: NextBestActionInput
    ) -> NextBestActionOutput:
        """Convenience alias for analyze_sync."""
        return self.analyze_sync(input_data)
