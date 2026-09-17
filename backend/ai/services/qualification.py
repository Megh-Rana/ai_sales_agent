"""
Qualification Service — AI-08.

Evaluates prospect qualification against defined multi-dimensional criteria:
1. NEED
2. FIT
3. AUTHORITY
4. TIMELINE
5. BUDGET
6. DECISION_PROCESS

Core Architectural Principle:
"GEMMA REASONS. PYTHON DECIDES."
Gemma extracts dimension evaluations, factual evidence, and explanations.
Python deterministically verifies and enforces the final qualification status.

Strict Scope Boundary:
AI-08 answers whether the prospect meets qualification criteria.
It does NOT perform buying-signal classification (AI-09), objection classification (AI-09),
or Next Best Action recommendations (AI-10).
"""

import time
import re
from typing import Optional, Dict, Any, List, Set

from ai.core.providers.base import BaseAIProvider
from ai.core.factory import get_ai_provider
from ai.core.prompts.registry import prompt_registry
from ai.core.schemas.base import Evidence
from ai.core.schemas.qualification import (
    QualificationDimensionName,
    DimensionStatus,
    OverallQualificationStatus,
    QualificationCriterion,
    QualificationOutput,
    QualificationInput,
)

__all__ = [
    "QualificationService",
    "QualificationInput",
    "QualificationOutput",
    "QualificationCriterion",
]

ALL_DIMENSIONS: List[QualificationDimensionName] = [
    "NEED",
    "FIT",
    "AUTHORITY",
    "TIMELINE",
    "BUDGET",
    "DECISION_PROCESS",
]


class QualificationService:
    """
    Production-quality qualification service combining LLM-powered multi-layer reasoning
    with deterministic Python safety rules and boundary enforcement.
    """

    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None,
        prompt_name: str = "qualification_v1",
    ):
        """
        Initialize service with AI provider and prompt template name.

        Args:
            provider: Optional BaseAIProvider instance (defaults to factory default)
            prompt_name: Name of registered prompt in PromptRegistry
        """
        self.provider = provider or get_ai_provider()
        self.prompt_name = prompt_name

    def _prepare_prompt_args(self, input_data: QualificationInput) -> Dict[str, Any]:
        """Format inputs from all intelligence layers into structured prompt arguments."""

        def format_field(val: Any) -> str:
            if val is None or val == "":
                return "UNKNOWN"
            return str(val)

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
                f"Core Value Propositions: {val_props}"
            )

        # 2. Lead Context
        lead_context = "None provided."
        if input_data.lead_intelligence:
            li = input_data.lead_intelligence
            p_name = li.prospect_profile.name or "UNKNOWN"
            p_role = li.prospect_profile.role or "UNKNOWN"
            c_name = li.company_profile.company_name or "UNKNOWN"
            c_ind = li.company_profile.industry or "UNKNOWN"
            req = li.requirement.summary or "UNKNOWN"
            needs = ", ".join(li.requirement.explicit_needs) if li.requirement.explicit_needs else "None"
            lead_context = (
                f"Prospect: {p_name} ({p_role}) at {c_name} ({c_ind})\n"
                f"Stated Requirement: {req}\n"
                f"Explicit Needs: {needs}"
            )

        # 3. Conversation Context
        conversation_context = "None provided."
        if input_data.conversation_intelligence:
            ci = input_data.conversation_intelligence
            c_needs = "; ".join(f"{n.need} (Quote: '{n.supporting_evidence}')" for n in ci.customer_needs[:3]) if ci.customer_needs else "None"
            c_reqs = "; ".join(f"{r.requirement}" for r in ci.requirements[:3]) if ci.requirements else "None"
            conversation_context = (
                f"Stage: {ci.conversation_stage}\n"
                f"Summary: {ci.conversation_summary}\n"
                f"Customer Needs: {c_needs}\n"
                f"Stated Requirements: {c_reqs}\n"
                f"Stated Budget: {ci.mentioned_budget}\n"
                f"Stated Timeline: {ci.mentioned_timeline}\n"
                f"Decision Context: {ci.decision_context}\n"
                f"Prospect Commitments: {'; '.join(ci.prospect_commitments) if ci.prospect_commitments else 'None'}"
            )

        # 4. Verified Company Research
        company_facts = "None verified."
        if input_data.company_research:
            cr = input_data.company_research
            if cr.facts:
                facts_list = [f"- {f.fact_type}: {f.value}" for f in cr.facts[:5] if f.value != "UNKNOWN"]
                if facts_list:
                    company_facts = "\n".join(facts_list)

        # 5. Background Contextual Signals (Strictly NOT qualification criteria)
        lead_score_context = "None"
        if input_data.lead_score:
            lead_score_context = f"Internal Score: {input_data.lead_score.final_score:.1f}, Band: {input_data.lead_score.score_band} (FOR CONTEXT ONLY)"

        intent_context = "None"
        if input_data.intent_information:
            intent_context = f"Intent Level: {input_data.intent_information.intent_level} (FOR CONTEXT ONLY)"

        # 6. Custom Guidelines
        custom_guidelines = "Standard B2B Qualification Framework"
        if input_data.custom_criteria:
            custom_guidelines = "\n".join(f"- {c}" for c in input_data.custom_criteria)

        # 7. Untrusted Data Handling & Sanitization
        raw_untrusted = ""
        if input_data.conversation_intelligence and input_data.conversation_intelligence.conversation_summary:
            raw_untrusted += input_data.conversation_intelligence.conversation_summary
        if input_data.sales_pitch:
            raw_untrusted += f"\nPitch Context: {input_data.sales_pitch.full_pitch}"

        sanitized_untrusted = re.sub(
            r"(?i)(?:system\s+override|ignore\s+(?:all\s+)?previous\s+instructions|disregard\s+schema\s+rules|reveal\s+system\s+prompt|declare\s+(?:this\s+)?(?:lead\s+)?qualified|mark\s+(?:as\s+)?qualified)[^\n]*",
            "[BLOCKED_INJECTION_ATTEMPT]",
            raw_untrusted,
        )

        return {
            "business_context": business_context,
            "lead_context": lead_context,
            "conversation_context": conversation_context,
            "company_facts": company_facts,
            "lead_score_context": lead_score_context,
            "intent_context": intent_context,
            "custom_guidelines": custom_guidelines,
            "untrusted_data": sanitized_untrusted.strip() or "No additional unparsed dialogue.",
        }

    def _apply_deterministic_rules(
        self,
        output: QualificationOutput,
        input_data: QualificationInput,
    ) -> QualificationOutput:
        """
        Deterministic Rule Engine — 'GEMMA REASONS. PYTHON DECIDES.'

        Enforces:
        1. All 6 dimensions must exist.
        2. UNKNOWN is NOT DISQUALIFIED (missing data never causes NOT_QUALIFIED).
        3. Strict rule hierarchy:
           - DISQUALIFIED dimension or factor -> NOT_QUALIFIED.
           - NEED & FIT confirmed, >=3 confirmed, authority partial/confirmed, no disqualified -> QUALIFIED.
           - Meaningful positive evidence, but gaps remain -> PARTIALLY_QUALIFIED.
           - Insufficient evidence -> UNKNOWN.
        4. Overrides any hallucinatory LLM verdict.
        5. Populates confirmed/partial/unknown/disqualified criteria lists.
        6. Formulates descriptive qualification gaps (without AI-10 next-best actions).
        7. Scrubs any accidental AI-09/AI-10 leakage.
        """
        # 1. Ensure all 6 dimensions are populated
        existing_dims: Dict[str, QualificationCriterion] = {
            d.dimension: d for d in output.dimensions
        }
        normalized_dimensions: List[QualificationCriterion] = []
        for dim_name in ALL_DIMENSIONS:
            if dim_name in existing_dims:
                normalized_dimensions.append(existing_dims[dim_name])
            else:
                # Add default UNKNOWN criterion
                normalized_dimensions.append(
                    QualificationCriterion(
                        dimension=dim_name,
                        status="UNKNOWN",
                        explanation=f"No explicit information available for {dim_name}.",
                        confidence=1.0,
                        provenance="UNKNOWN",
                    )
                )
        output.dimensions = normalized_dimensions

        # 2. Categorize criteria
        confirmed: List[str] = []
        partial: List[str] = []
        unknown: List[str] = []
        disqualified: List[str] = []

        for crit in output.dimensions:
            # Enforce UNKNOWN if evidence is completely missing but status was marked CONFIRMED without justification
            if crit.status == "CONFIRMED" and (not crit.evidence or crit.evidence.strip() in {"", "None", "UNKNOWN"}):
                crit.status = "UNKNOWN"
                crit.explanation = "Reclassified to UNKNOWN due to lack of supporting evidence quote."

            if crit.status == "CONFIRMED":
                confirmed.append(crit.dimension)
            elif crit.status == "PARTIAL":
                partial.append(crit.dimension)
            elif crit.status == "DISQUALIFIED":
                disqualified.append(crit.dimension)
            else:
                unknown.append(crit.dimension)

        output.confirmed_criteria = confirmed
        output.partial_criteria = partial
        output.unknown_criteria = unknown
        output.disqualified_criteria = disqualified

        # 3. Deterministic Overall Status Determination
        determined_status: OverallQualificationStatus

        # Rule 1: Disqualification
        if disqualified or output.disqualifying_factors:
            determined_status = "NOT_QUALIFIED"

        # Rule 2: Full Qualification
        # Must have:
        # - NEED confirmed
        # - FIT confirmed
        # - AUTHORITY at least PARTIAL or CONFIRMED
        # - At least 3 confirmed dimensions total
        # - Zero disqualified dimensions
        elif (
            "NEED" in confirmed
            and "FIT" in confirmed
            and ("AUTHORITY" in confirmed or "AUTHORITY" in partial)
            and len(confirmed) >= 3
            and not disqualified
        ):
            determined_status = "QUALIFIED"

        # Rule 3: Partial Qualification
        # Positive signal in NEED or FIT (or at least 1 confirmed dimension), but key criteria unresolved
        elif (
            ("NEED" in confirmed or "NEED" in partial or "FIT" in confirmed or "FIT" in partial or len(confirmed) >= 1)
            and not disqualified
        ):
            determined_status = "PARTIALLY_QUALIFIED"

        # Rule 4: Unknown
        # Insufficient evidence across all dimensions
        else:
            determined_status = "UNKNOWN"

        # 4. Enforce Python verdict over Gemma's raw output
        output.overall_status = determined_status

        # 5. Formulate descriptive qualification gaps (strictly descriptive, no next-best actions)
        gaps: List[str] = []
        if "BUDGET" in unknown:
            gaps.append("Budget has not been explicitly discussed or allocated.")
        elif "BUDGET" in partial:
            gaps.append("Budget range has been mentioned but not formally confirmed.")

        if "AUTHORITY" in unknown:
            gaps.append("Decision-maker role and approval authority have not been identified.")
        elif "AUTHORITY" in partial:
            gaps.append("Stakeholder is involved but final decision authority requires confirmation.")

        if "TIMELINE" in unknown:
            gaps.append("Deployment and purchasing timeline has not been defined.")
        elif "TIMELINE" in partial:
            gaps.append("Estimated timeline mentioned without firm go-live date.")

        if "DECISION_PROCESS" in unknown:
            gaps.append("Evaluation steps and decision approval process have not been clarified.")

        if "NEED" in unknown:
            gaps.append("Core business problem and pain points have not been articulated.")

        if "FIT" in unknown:
            gaps.append("Alignment with ideal customer profile and technical use cases requires validation.")

        output.qualification_gaps = gaps

        # 6. Scrub accidental AI-09/AI-10 keywords (anti-leakage)
        scrub_patterns = [
            r"(?i)\b(?:OBJECTION(?:\s+TYPE|\s+SEVERITY)?)\b",
            r"(?i)\b(?:NEXT\s+BEST\s+ACTION|ACTION\s+RECOMMENDATION)\b",
            r"(?i)\b(?:RECOMMENDED\s+ACTION\s*:?\s*.*)\b",
            r"(?i)\b(?:SCHEDULE\s+CALL|SEND\s+PROPOSAL|FOLLOW\s+UP\s+TOMORROW)\b",
        ]

        def scrub_text(text: str) -> str:
            if not text:
                return text
            cleaned = text
            for pat in scrub_patterns:
                cleaned = re.sub(pat, "", cleaned).strip()
            cleaned = re.sub(r"\s{2,}", " ", cleaned)
            return cleaned

        if output.reasoning:
            output.reasoning = scrub_text(output.reasoning)
        for crit in output.dimensions:
            crit.explanation = scrub_text(crit.explanation)

        # 7. Preserve Evidence references
        if not output.evidence:
            evidence_items: List[Evidence] = []
            for crit in output.dimensions:
                if crit.evidence and crit.evidence != "UNKNOWN":
                    evidence_items.append(
                        Evidence(
                            source=crit.provenance.lower(),
                            text=crit.evidence,
                            confidence=crit.confidence,
                        )
                    )
            output.evidence = evidence_items[:10]

        # 8. Clamp confidence
        output.confidence = max(0.0, min(1.0, float(output.confidence)))

        return output

    async def analyze_async(
        self, input_data: QualificationInput
    ) -> QualificationOutput:
        """
        Analyze prospect qualification asynchronously.

        Args:
            input_data: QualificationInput with multi-layer intelligence context

        Returns:
            Validated, deterministically governed QualificationOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(input_data)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = await self.provider.generate_structured_async(
            prompt=user_str,
            schema=QualificationOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return self._apply_deterministic_rules(output, input_data)

    def analyze_sync(
        self, input_data: QualificationInput
    ) -> QualificationOutput:
        """
        Analyze prospect qualification synchronously.

        Args:
            input_data: QualificationInput with multi-layer intelligence context

        Returns:
            Validated, deterministically governed QualificationOutput
        """
        template = prompt_registry.get(self.prompt_name)
        prompt_args = self._prepare_prompt_args(input_data)

        system_str = template.format_system(**prompt_args)
        user_str = template.format_user(**prompt_args)

        start_time = time.perf_counter()
        output = self.provider.generate_structured(
            prompt=user_str,
            schema=QualificationOutput,
            system_prompt=system_str,
        )
        latency_ms = (time.perf_counter() - start_time) * 1000

        output.provider = self.provider.provider_name
        output.model = self.provider.model or "unknown"
        if output.latency_ms == 0.0:
            output.latency_ms = max(round(latency_ms, 2), 0.01)

        return self._apply_deterministic_rules(output, input_data)

    def analyze(
        self, input_data: QualificationInput
    ) -> QualificationOutput:
        """Convenience alias for analyze_sync."""
        return self.analyze_sync(input_data)
