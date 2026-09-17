"""
Next Best Action Schemas — AI-10.

Defines Pydantic models for Next Best Action input and output contracts:
- Controlled vocabulary of sales actions grounded in upstream intelligence.
- Structured action representation with rationale, priority, urgency, timing, evidence,
  triggering factors, dependencies, confidence, and provenance.
- Ranked output identifying a primary action and up to two secondary actions.
- Explicit NO_ACTION handling and customer stop conditions.

Strict Scope Boundary:
AI-10 converts upstream intelligence into ranked, evidence-grounded action recommendations.
It does NOT calculate lead scores (AI-04), re-perform qualification (AI-08),
re-classify buying signals or objections (AI-09), or execute actions autonomously.
"""

import re
from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

from ai.core.schemas.base import BaseAIServiceOutput, Evidence
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.intent_scoring import IntentDetectionOutput, LeadScoreOutput
from ai.core.schemas.company_research import CompanyResearchOutput
from ai.core.schemas.sales_pitch import PersonalizedSalesPitchOutput
from ai.core.schemas.conversation_intelligence import (
    ConversationIntelligenceOutput,
    ConversationTurn,
)
from ai.core.schemas.qualification import QualificationOutput
from ai.core.schemas.buying_signals import BuyingSignalsObjectionsOutput


# ─── Types & Controlled Vocabulary ──────────────────────────────────────────

ActionType = Literal[
    "ASK_CLARIFYING_QUESTION",
    "FOLLOW_UP",
    "SEND_PRICING",
    "SEND_PROPOSAL",
    "SEND_INFORMATION",
    "SEND_TECHNICAL_DOCUMENTATION",
    "SCHEDULE_DEMO",
    "SCHEDULE_TECHNICAL_CALL",
    "INVOLVE_DECISION_MAKER",
    "ADDRESS_OBJECTION",
    "CONFIRM_TIMELINE",
    "CONFIRM_BUDGET",
    "CONFIRM_DECISION_PROCESS",
    "REQUEST_REQUIREMENTS",
    "NURTURE",
    "CLOSE",
    "NO_ACTION",
]

ActionPriority = Literal[
    "HIGH",
    "MEDIUM",
    "LOW",
    "UNKNOWN",
]

ActionUrgency = Literal[
    "IMMEDIATE",
    "SOON",
    "NORMAL",
    "LOW",
    "UNKNOWN",
]

ActionProvenance = Literal[
    "CONVERSATION",
    "QUALIFICATION",
    "BUYING_SIGNAL",
    "OBJECTION",
    "BUSINESS_CONTEXT",
    "LEAD_INTELLIGENCE",
    "COMPANY_RESEARCH",
    "INFERRED",
    "UNKNOWN",
]


# ─── Core Models ───────────────────────────────────────────────────────────

class NextBestAction(BaseModel):
    """A single structured recommendation for the sales agent."""

    action_type: ActionType = Field(
        default="NO_ACTION",
        description="Controlled action category indicating what the sales agent should do next",
    )
    title: str = Field(
        default="",
        description="Concise, actionable headline summarizing the recommendation",
    )
    description: str = Field(
        default="",
        description="Detailed description of what the action entails and how to execute it",
    )
    rationale: str = Field(
        default="",
        description="Business justification explaining why this specific action is recommended based on context",
    )
    priority: ActionPriority = Field(
        default="MEDIUM",
        description="Action priority level: 'HIGH', 'MEDIUM', 'LOW', or 'UNKNOWN'",
    )
    urgency: ActionUrgency = Field(
        default="NORMAL",
        description="Urgency tier: 'IMMEDIATE', 'SOON', 'NORMAL', 'LOW', or 'UNKNOWN'",
    )
    recommended_timing: str = Field(
        default="Within normal sales cycle",
        description="Grounded relative timing guidance (e.g. 'Within current evaluation window', 'After Tuesday'). Never hallucinate calendar dates.",
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Verbatim quotes or grounded snippets justifying why this action was selected",
    )
    triggering_factors: List[str] = Field(
        default_factory=list,
        description="Categorical factors triggering this action (e.g. 'REQUEST_FOR_PRICING', 'UNRESOLVED_SECURITY_CONCERN')",
    )
    dependencies: List[str] = Field(
        default_factory=list,
        description="Prerequisites that should be addressed before or alongside this action",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score reflecting evidence strength (0.0 to 1.0)",
    )
    provenance: str = Field(
        default="CONVERSATION",
        description="Origin source of the triggering context (e.g. 'CONVERSATION', 'QUALIFICATION', 'OBJECTION', 'BUYING_SIGNAL')",
    )

    @field_validator("action_type", mode="before")
    @classmethod
    def normalize_action_type(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "NO_ACTION"
        cleaned = v.strip().upper().replace(" ", "_").replace("-", "_")
        valid = {
            "ASK_CLARIFYING_QUESTION",
            "FOLLOW_UP",
            "SEND_PRICING",
            "SEND_PROPOSAL",
            "SEND_INFORMATION",
            "SEND_TECHNICAL_DOCUMENTATION",
            "SCHEDULE_DEMO",
            "SCHEDULE_TECHNICAL_CALL",
            "INVOLVE_DECISION_MAKER",
            "ADDRESS_OBJECTION",
            "CONFIRM_TIMELINE",
            "CONFIRM_BUDGET",
            "CONFIRM_DECISION_PROCESS",
            "REQUEST_REQUIREMENTS",
            "NURTURE",
            "CLOSE",
            "NO_ACTION",
        }
        if cleaned in valid:
            return cleaned
        
        # Synonyms and substring matching
        if "NO_ACTION" in cleaned or "NONE" in cleaned or "STOP" in cleaned or "DISQUALIF" in cleaned:
            return "NO_ACTION"
        if "PRIC" in cleaned or "QUOTE" in cleaned or "COST" in cleaned:
            return "SEND_PRICING"
        if "PROPOSAL" in cleaned or "RFP" in cleaned:
            return "SEND_PROPOSAL"
        if "DEMO" in cleaned:
            return "SCHEDULE_DEMO"
        if "TECH_CALL" in cleaned or "TECHNICAL_CALL" in cleaned or "ARCHITECT" in cleaned:
            return "SCHEDULE_TECHNICAL_CALL"
        if "TECH_DOC" in cleaned or "DOCUMENTATION" in cleaned or "WHITEPAPER" in cleaned or "SECURITY_DOC" in cleaned:
            return "SEND_TECHNICAL_DOCUMENTATION"
        if "DECISION_MAKER" in cleaned or "STAKEHOLDER" in cleaned or "AUTHORITY" in cleaned or "LEADERSHIP" in cleaned:
            return "INVOLVE_DECISION_MAKER"
        if "OBJECTION" in cleaned or "CONCERN" in cleaned or "RESOLVE" in cleaned or "BLOCKER" in cleaned:
            return "ADDRESS_OBJECTION"
        if "BUDGET" in cleaned:
            return "CONFIRM_BUDGET"
        if "TIMELINE" in cleaned or "TIMING" in cleaned:
            return "CONFIRM_TIMELINE"
        if "DECISION_PROCESS" in cleaned or "PROCESS" in cleaned:
            return "CONFIRM_DECISION_PROCESS"
        if "REQUIREMENT" in cleaned or "SCOPE" in cleaned:
            return "REQUEST_REQUIREMENTS"
        if "CLARIF" in cleaned or "QUESTION" in cleaned:
            return "ASK_CLARIFYING_QUESTION"
        if "INFO" in cleaned or "BROCHURE" in cleaned:
            return "SEND_INFORMATION"
        if "NURTURE" in cleaned or "CHECK_IN" in cleaned:
            return "NURTURE"
        if "CLOSE" in cleaned or "CONTRACT" in cleaned or "SIGN" in cleaned:
            return "CLOSE"
        if "FOLLOW" in cleaned:
            return "FOLLOW_UP"

        return "FOLLOW_UP"

    @field_validator("priority", mode="before")
    @classmethod
    def normalize_priority(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "MEDIUM"
        cleaned = v.strip().upper()
        if cleaned in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}:
            return cleaned
        if "HIGH" in cleaned or "CRITICAL" in cleaned or "URGENT" in cleaned:
            return "HIGH"
        if "LOW" in cleaned or "MINOR" in cleaned:
            return "LOW"
        if "MED" in cleaned:
            return "MEDIUM"
        return "MEDIUM"

    @field_validator("urgency", mode="before")
    @classmethod
    def normalize_urgency(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "NORMAL"
        cleaned = v.strip().upper()
        if cleaned in {"IMMEDIATE", "SOON", "NORMAL", "LOW", "UNKNOWN"}:
            return cleaned
        if "IMMEDIATE" in cleaned or "CRITICAL" in cleaned or "NOW" in cleaned or "TODAY" in cleaned:
            return "IMMEDIATE"
        if "SOON" in cleaned or "FAST" in cleaned or "WEEK" in cleaned:
            return "SOON"
        if "LOW" in cleaned or "LATER" in cleaned:
            return "LOW"
        return "NORMAL"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0

    @field_validator("evidence", mode="before")
    @classmethod
    def normalize_evidence(cls, v: Any) -> List[Evidence]:
        if not v:
            return []
        if isinstance(v, list):
            items = []
            for item in v:
                if isinstance(item, Evidence):
                    items.append(item)
                elif isinstance(item, dict):
                    items.append(Evidence(**item))
                elif isinstance(item, str) and item.strip():
                    items.append(Evidence(text=item.strip(), source="CONVERSATION", confidence=1.0))
            return items
        elif isinstance(v, str) and v.strip():
            return [Evidence(text=v.strip(), source="CONVERSATION", confidence=1.0)]
        return []


class NextBestActionOutput(BaseAIServiceOutput):
    """
    Structured Next Best Action output produced by AI-10.
    Inherits timestamp, provider, model, latency_ms, raw_response from BaseAIServiceOutput.
    """

    primary_next_best_action: Optional[NextBestAction] = Field(
        default=None,
        description="The single highest-priority grounded action the sales agent should execute next",
    )
    secondary_actions: List[NextBestAction] = Field(
        default_factory=list,
        description="At most 2 supplementary or contingent recommended actions",
    )
    no_action_reason: Optional[str] = Field(
        default=None,
        description="Explicit explanation if NO_ACTION was selected (e.g. prospect requested stop, insufficient evidence)",
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Aggregate evidence items supporting the primary and secondary action recommendations",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in the action recommendations (0.0 to 1.0)",
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Concise business explanation of why this action ranking was selected (no raw chain-of-thought)",
    )

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0

    @field_validator("evidence", mode="before")
    @classmethod
    def normalize_evidence(cls, v: Any) -> List[Evidence]:
        if not v:
            return []
        if isinstance(v, list):
            items = []
            for item in v:
                if isinstance(item, Evidence):
                    items.append(item)
                elif isinstance(item, dict):
                    items.append(Evidence(**item))
                elif isinstance(item, str) and item.strip():
                    items.append(Evidence(text=item.strip(), source="CONVERSATION", confidence=1.0))
            return items
        elif isinstance(v, str) and v.strip():
            return [Evidence(text=v.strip(), source="CONVERSATION", confidence=1.0)]
        return []


class NextBestActionInput(BaseModel):
    """Input contract aggregating context from all relevant AI intelligence layers."""

    business_context: Optional[BusinessIntelligenceOutput] = Field(
        default=None,
        description="Phase 3 Business Intelligence output defining offerings, ICP, and value props",
    )
    lead_intelligence: Optional[LeadIntelligenceOutput] = Field(
        default=None,
        description="Phase 4 Lead Intelligence output defining prospect role, company, and raw requirements",
    )
    lead_score: Optional[LeadScoreOutput] = Field(
        default=None,
        description="Phase 5 Deterministic Lead Score (FOR CONTEXT ONLY — does NOT dictate action priority)",
    )
    intent_information: Optional[IntentDetectionOutput] = Field(
        default=None,
        description="Phase 5 Intent Detection output (FOR CONTEXT ONLY)",
    )
    conversation_intelligence: Optional[ConversationIntelligenceOutput] = Field(
        default=None,
        description="Phase 7 Conversation Intelligence output providing stage, summary, needs, and requirements",
    )
    qualification: Optional[QualificationOutput] = Field(
        default=None,
        description="Phase 8 Qualification output providing dimension statuses and qualification gaps",
    )
    buying_signals_objections: Optional[BuyingSignalsObjectionsOutput] = Field(
        default=None,
        description="Phase 9 Buying Signals and Objections output providing signals, blockers, and unresolved concerns",
    )
    company_research: Optional[CompanyResearchOutput] = Field(
        default=None,
        description="Phase 6 Company Research output providing verified company facts",
    )
    sales_pitch: Optional[PersonalizedSalesPitchOutput] = Field(
        default=None,
        description="Phase 7 Personalized Sales Pitch context (background reference)",
    )
    transcript: Optional[Union[str, List[ConversationTurn], List[Dict[str, Any]]]] = Field(
        default=None,
        description="Optional raw conversation transcript string or list of turns",
    )

    def get_turns(self) -> List[ConversationTurn]:
        """Convert transcript into standardized list of ConversationTurn instances."""
        if not self.transcript:
            return []
        if isinstance(self.transcript, list):
            turns: List[ConversationTurn] = []
            for item in self.transcript:
                if isinstance(item, ConversationTurn):
                    turns.append(item)
                elif isinstance(item, dict):
                    turns.append(ConversationTurn(**item))
            return turns
        elif isinstance(self.transcript, str):
            lines = [ln.strip() for ln in self.transcript.split("\n") if ln.strip()]
            turns = []
            for i, line in enumerate(lines):
                speaker = "UNKNOWN"
                text = line
                match = re.match(
                    r"^\[?(SELLER|REP|AGENT|PROSPECT|BUYER|CUSTOMER|CLIENT)\]?:\s*(.*)$",
                    line,
                    re.IGNORECASE,
                )
                if match:
                    spk_raw = match.group(1).upper()
                    if spk_raw in {"SELLER", "REP", "AGENT"}:
                        speaker = "SELLER"
                    else:
                        speaker = "PROSPECT"
                    text = match.group(2)
                turns.append(
                    ConversationTurn(
                        turn_id=str(i + 1),
                        speaker=speaker,
                        text=text,
                    )
                )
            return turns
        return []

    def get_formatted_transcript(self) -> str:
        """Format dialogue into clean readable dialogue block."""
        turns = self.get_turns()
        if not turns:
            if isinstance(self.transcript, str) and self.transcript.strip():
                return self.transcript.strip()
            return "None provided."
        formatted = []
        for turn in turns:
            spk = turn.speaker if turn.speaker in {"SELLER", "PROSPECT"} else "UNKNOWN"
            prefix = f"[{spk}]"
            if turn.timestamp_start is not None:
                prefix += f" ({turn.timestamp_start:.1f}s)"
            formatted.append(f"{prefix}: {turn.text}")
        return "\n".join(formatted)
