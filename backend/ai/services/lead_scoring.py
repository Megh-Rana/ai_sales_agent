"""
Deterministic Lead Scoring Service.

Calculates a transparent, explainable 0–100 lead score using pure Python deterministic logic.
NO LLM calls are made by this service. Every point awarded is traceable to a component and evidence.
"""

import time
from typing import Optional, List
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.intent_scoring import (
    IntentDetectionOutput,
    LeadScoreOutput,
    ScoreComponent,
)

__all__ = [
    "LeadScoringService",
    "LeadScoreOutput",
    "ScoreComponent",
    "SCORING_VERSION",
    "SCORING_WEIGHTS",
]

SCORING_VERSION = "v1"

SCORING_WEIGHTS = {
    "requirement_fit": {"max": 25, "description": "Explicit requirement alignment"},
    "intent_strength": {"max": 30, "description": "Strength of detected buying intent"},
    "urgency_timeline": {"max": 20, "description": "Urgency and timeline indicators"},
    "business_fit": {"max": 15, "description": "ICP and buyer persona alignment"},
    "evidence_quality": {"max": 10, "description": "Quality and quantity of supporting evidence"},
}


class LeadScoringService:
    """
    Deterministic lead scoring engine.

    Consumes structured outputs from LeadIntelligenceService and IntentDetectionService
    and produces a transparent 0–100 score with component-level breakdown.

    This service makes ZERO LLM calls. All scoring is pure Python.
    """

    def __init__(self, scoring_version: str = SCORING_VERSION):
        self.scoring_version = scoring_version

    def score(
        self,
        lead_intelligence: LeadIntelligenceOutput,
        intent_detection: IntentDetectionOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> LeadScoreOutput:
        """
        Calculate deterministic lead score.

        Args:
            lead_intelligence: Output from LeadIntelligenceService
            intent_detection: Output from IntentDetectionService
            business_intelligence: Optional output from BusinessIntelligenceService

        Returns:
            LeadScoreOutput with component breakdown and explanation
        """
        start_time = time.perf_counter()

        components: List[ScoreComponent] = []

        # 1. Requirement Fit (max 25)
        components.append(self._score_requirement_fit(lead_intelligence))

        # 2. Intent Strength (max 30)
        components.append(self._score_intent_strength(lead_intelligence, intent_detection))

        # 3. Urgency & Timeline (max 20)
        components.append(self._score_urgency_timeline(lead_intelligence, intent_detection))

        # 4. Business / ICP Fit (max 15)
        components.append(self._score_business_fit(lead_intelligence, business_intelligence))

        # 5. Evidence Quality (max 10)
        components.append(self._score_evidence_quality(lead_intelligence, intent_detection))

        # Calculate final score
        raw_total = sum(c.score_awarded for c in components)
        final_score = max(0.0, min(100.0, round(raw_total, 1)))

        # Determine score band
        score_band = self._classify_band(final_score, lead_intelligence, intent_detection)

        # Calculate confidence based on evidence availability
        confidence = self._calculate_confidence(lead_intelligence, intent_detection)

        # Build explanation
        explanation = self._build_explanation(final_score, score_band, components)

        latency_ms = max(round((time.perf_counter() - start_time) * 1000, 2), 0.01)

        return LeadScoreOutput(
            final_score=final_score,
            score_band=score_band,
            components=components,
            score_explanation=explanation,
            scoring_version=self.scoring_version,
            confidence=confidence,
            reasoning=f"Deterministic score calculated using {self.scoring_version} across {len(components)} dimensions.",
            provider="deterministic",
            model="none",
            latency_ms=latency_ms,
        )

    # Alias to match service conventions
    def analyze_sync(
        self,
        lead_intelligence: LeadIntelligenceOutput,
        intent_detection: IntentDetectionOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> LeadScoreOutput:
        """Synchronous alias for score()."""
        return self.score(lead_intelligence, intent_detection, business_intelligence)

    async def analyze(
        self,
        lead_intelligence: LeadIntelligenceOutput,
        intent_detection: IntentDetectionOutput,
        business_intelligence: Optional[BusinessIntelligenceOutput] = None,
    ) -> LeadScoreOutput:
        """Async alias for score() — pure deterministic, no I/O needed."""
        return self.score(lead_intelligence, intent_detection, business_intelligence)

    # ------------------------------------------------------------------
    # Scoring dimensions
    # ------------------------------------------------------------------

    def _score_requirement_fit(self, lead: LeadIntelligenceOutput) -> ScoreComponent:
        """Score requirement fit (max 25 points)."""
        max_score = SCORING_WEIGHTS["requirement_fit"]["max"]
        points = 0.0
        reasons = []
        evidence = []

        req = lead.requirement

        # Explicit requirement summary present
        if req.summary and req.summary.strip():
            points += 8.0
            reasons.append("Explicit requirement statement present")
            evidence.append(f"Requirement: {req.summary[:100]}")

        # Explicit needs listed
        need_count = len(req.explicit_needs)
        if need_count > 0:
            need_pts = min(7.0, need_count * 2.0)
            points += need_pts
            reasons.append(f"{need_count} explicit need(s) identified")
            evidence.extend(req.explicit_needs[:3])

        # Requested capabilities
        cap_count = len(req.requested_capabilities)
        if cap_count > 0:
            cap_pts = min(5.0, cap_count * 1.5)
            points += cap_pts
            reasons.append(f"{cap_count} requested capability/ies identified")

        # Pain points alignment
        pain_count = len(req.pain_points)
        if pain_count > 0:
            pain_pts = min(5.0, pain_count * 1.5)
            points += pain_pts
            reasons.append(f"{pain_count} stated pain point(s)")
            evidence.extend(req.pain_points[:2])

        clamped = min(points, max_score)
        reason_text = "; ".join(reasons) if reasons else "No explicit requirement information available"

        return ScoreComponent(
            component_name="Requirement Fit",
            score_awarded=round(clamped, 1),
            max_score=max_score,
            reason=reason_text,
            evidence_references=evidence,
        )

    def _score_intent_strength(
        self, lead: LeadIntelligenceOutput, intent: IntentDetectionOutput
    ) -> ScoreComponent:
        """Score intent strength (max 30 points)."""
        max_score = SCORING_WEIGHTS["intent_strength"]["max"]
        points = 0.0
        reasons = []
        evidence = []

        # Intent level mapping
        level_scores = {"HIGH": 15.0, "MEDIUM": 8.0, "LOW": 3.0, "UNKNOWN": 0.0}
        level_pts = level_scores.get(intent.intent_level, 0.0)
        if level_pts > 0:
            points += level_pts
            reasons.append(f"Intent level: {intent.intent_level}")

        # Raw intent signals from lead intelligence
        for sig in lead.raw_intent_signals:
            sig_pts = sig.strength * 3.0  # Each signal contributes up to 3 points
            points += sig_pts
            if sig.evidence:
                evidence.append(sig.evidence[:80])

        # Intent signals from detection
        for sig in intent.intent_signals:
            sig_pts = sig.strength * 2.0
            points += sig_pts
            if sig.evidence:
                evidence.append(sig.evidence[:80])

        if lead.raw_intent_signals or intent.intent_signals:
            total_sigs = len(lead.raw_intent_signals) + len(intent.intent_signals)
            reasons.append(f"{total_sigs} intent signal(s) detected")

        # Positive signals count
        pos_count = len(intent.positive_signals)
        if pos_count > 0:
            points += min(3.0, pos_count * 1.0)
            reasons.append(f"{pos_count} positive indicator(s)")

        clamped = min(points, max_score)
        reason_text = "; ".join(reasons) if reasons else "No intent signals detected"

        return ScoreComponent(
            component_name="Intent Strength",
            score_awarded=round(clamped, 1),
            max_score=max_score,
            reason=reason_text,
            evidence_references=evidence[:5],
        )

    def _score_urgency_timeline(
        self, lead: LeadIntelligenceOutput, intent: IntentDetectionOutput
    ) -> ScoreComponent:
        """Score urgency and timeline (max 20 points)."""
        max_score = SCORING_WEIGHTS["urgency_timeline"]["max"]
        points = 0.0
        reasons = []
        evidence = []

        req = lead.requirement

        # Timeline signals
        tl_count = len(req.timeline_signals)
        if tl_count > 0:
            points += min(8.0, tl_count * 4.0)
            reasons.append(f"{tl_count} timeline signal(s)")
            evidence.extend(req.timeline_signals[:2])

        # Urgency signals
        urg_count = len(req.urgency_signals)
        if urg_count > 0:
            points += min(8.0, urg_count * 4.0)
            reasons.append(f"{urg_count} urgency signal(s)")
            evidence.extend(req.urgency_signals[:2])

        # Urgency indicators from intent detection
        ui_count = len(intent.urgency_indicators)
        if ui_count > 0:
            points += min(4.0, ui_count * 2.0)
            reasons.append(f"{ui_count} urgency indicator(s) from intent analysis")

        clamped = min(points, max_score)
        reason_text = "; ".join(reasons) if reasons else "No urgency or timeline signals detected"

        return ScoreComponent(
            component_name="Urgency & Timeline",
            score_awarded=round(clamped, 1),
            max_score=max_score,
            reason=reason_text,
            evidence_references=evidence,
        )

    def _score_business_fit(
        self,
        lead: LeadIntelligenceOutput,
        bi: Optional[BusinessIntelligenceOutput],
    ) -> ScoreComponent:
        """Score business / ICP fit (max 15 points)."""
        max_score = SCORING_WEIGHTS["business_fit"]["max"]
        points = 0.0
        reasons = []
        evidence = []

        # Buyer persona matches from lead intelligence
        if lead.buyer_persona_matches:
            best_match = max(lead.buyer_persona_matches, key=lambda m: m.match_score)
            match_pts = best_match.match_score * 8.0
            points += match_pts
            reasons.append(f"Best persona match: {best_match.persona_role} (score={best_match.match_score:.2f})")
            if best_match.evidence:
                evidence.append(best_match.evidence[:80])

        # Industry alignment with BI context
        if bi and bi.target_industries and lead.company_profile.industry:
            lead_industry = (lead.company_profile.industry or "").lower()
            matching = [i for i in bi.target_industries if i.lower() in lead_industry or lead_industry in i.lower()]
            if matching:
                points += 4.0
                reasons.append(f"Industry matches target: {', '.join(matching)}")
                evidence.append(f"Lead industry: {lead.company_profile.industry}")

        # Company characteristics
        if lead.company_profile.business_characteristics:
            points += min(3.0, len(lead.company_profile.business_characteristics) * 1.0)
            reasons.append(f"{len(lead.company_profile.business_characteristics)} business characteristic(s) identified")

        clamped = min(points, max_score)
        reason_text = "; ".join(reasons) if reasons else "Insufficient information for business fit assessment"

        return ScoreComponent(
            component_name="Business Fit",
            score_awarded=round(clamped, 1),
            max_score=max_score,
            reason=reason_text,
            evidence_references=evidence,
        )

    def _score_evidence_quality(
        self, lead: LeadIntelligenceOutput, intent: IntentDetectionOutput
    ) -> ScoreComponent:
        """Score evidence quality (max 10 points)."""
        max_score = SCORING_WEIGHTS["evidence_quality"]["max"]
        points = 0.0
        reasons = []
        evidence = []

        # Company profile evidence
        if lead.company_profile.evidence:
            points += 2.0
            reasons.append("Company profile evidence present")

        # Prospect profile evidence
        if lead.prospect_profile.evidence:
            points += 2.0
            reasons.append("Prospect profile evidence present")

        # Requirement evidence
        if lead.requirement.evidence:
            points += 2.0
            reasons.append("Requirement evidence present")

        # Source metadata quality
        sm = lead.source_metadata
        if sm.source_type != "UNKNOWN":
            points += 1.5
            reasons.append(f"Source type: {sm.source_type}")
        if sm.source_url:
            points += 0.5
            reasons.append("Source URL available")

        # Low missing information count is positive evidence — but ONLY if we
        # already have some substantive evidence (prevents awarding points for
        # completely empty leads that trivially have no missing_information list).
        missing_count = len(lead.missing_information)
        if points > 0:
            if missing_count == 0:
                points += 2.0
                reasons.append("No missing information flagged")
            elif missing_count <= 2:
                points += 1.0
                reasons.append(f"Only {missing_count} missing information item(s)")


        clamped = min(points, max_score)
        reason_text = "; ".join(reasons) if reasons else "Limited evidence available"

        return ScoreComponent(
            component_name="Evidence Quality",
            score_awarded=round(clamped, 1),
            max_score=max_score,
            reason=reason_text,
            evidence_references=evidence,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _classify_band(
        self,
        score: float,
        lead: LeadIntelligenceOutput,
        intent: IntentDetectionOutput,
    ) -> str:
        """Classify score into band. UNKNOWN if insufficient data."""
        # If we have almost no data, classify as UNKNOWN regardless of numeric score
        has_requirement = bool(lead.requirement.summary and lead.requirement.summary.strip())
        has_signals = bool(lead.raw_intent_signals or intent.intent_signals)
        has_company = bool(lead.company_profile.company_name)

        if not has_requirement and not has_signals and not has_company:
            return "UNKNOWN"

        if score >= 80:
            return "HOT"
        elif score >= 50:
            return "WARM"
        elif score >= 1:
            return "COLD"
        return "UNKNOWN"

    def _calculate_confidence(
        self, lead: LeadIntelligenceOutput, intent: IntentDetectionOutput
    ) -> float:
        """Calculate score confidence based on evidence completeness."""
        factors = 0.0
        max_factors = 5.0

        if lead.company_profile.company_name:
            factors += 1.0
        if lead.prospect_profile.name or lead.prospect_profile.role:
            factors += 1.0
        if lead.requirement.summary:
            factors += 1.0
        if lead.raw_intent_signals or intent.intent_signals:
            factors += 1.0
        if lead.source_metadata.source_type != "UNKNOWN":
            factors += 1.0

        return round(max(0.0, min(1.0, factors / max_factors)), 2)

    def _build_explanation(
        self, score: float, band: str, components: List[ScoreComponent]
    ) -> str:
        """Build human-readable explanation."""
        parts = [f"Lead Score: {score}/100 ({band})"]
        for c in components:
            if c.score_awarded > 0:
                parts.append(f"  {c.component_name}: {c.score_awarded}/{c.max_score} — {c.reason}")
        return "\n".join(parts)
