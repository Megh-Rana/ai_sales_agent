"""
Buying Signals and Objections Schemas — AI-09.

Defines Pydantic models for Buying Signals and Objections input and output contracts:
- Identifies observable buying signals, extracts verbatim evidence, and gauges signal strength (HIGH, MEDIUM, LOW, UNKNOWN).
- Extracts objections and concerns, categorizes objection types, gauges severity, and tracks resolution status (RESOLVED, PARTIALLY_RESOLVED, UNRESOLVED, UNKNOWN).
- Synthesizes an overall buying signal strength and extracts unresolved concerns.

Strict Scope Boundary:
AI-09 answers what buying signals and objections are observably present in the dialogue.
It does NOT perform qualification (AI-08), numerical lead scoring (AI-04),
or Next Best Action recommendations (AI-10).
"""

import re
from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

from ai.core.schemas.base import BaseAIServiceOutput, Evidence
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.intent_scoring import IntentDetectionOutput, LeadScoreOutput
from ai.core.schemas.company_research import CompanyResearchOutput
from ai.core.schemas.conversation_intelligence import (
    ConversationIntelligenceOutput,
    ConversationTurn,
)
from ai.core.schemas.qualification import QualificationOutput


# ─── Types & Enums ─────────────────────────────────────────────────────────

BuyingSignalType = Literal[
    "EXPLICIT_INTEREST",
    "PRODUCT_FIT_CONFIRMATION",
    "PURCHASE_INTENT",
    "REQUEST_FOR_PRICING",
    "REQUEST_FOR_PROPOSAL",
    "REQUEST_FOR_DEMO",
    "IMPLEMENTATION_DISCUSSION",
    "PROCUREMENT_DISCUSSION",
    "DECISION_PROCESS_DISCUSSION",
    "TIMELINE_COMMITMENT",
    "COMPETITIVE_EVALUATION",
    "STAKEHOLDER_INVOLVEMENT",
    "OTHER",
    "UNKNOWN",
]

BuyingSignalStrength = Literal[
    "HIGH",
    "MEDIUM",
    "LOW",
    "UNKNOWN",
]

ObjectionType = Literal[
    "PRICE",
    "BUDGET",
    "TIMELINE",
    "PRODUCT_FIT",
    "FEATURE_GAP",
    "INTEGRATION",
    "SECURITY",
    "COMPLIANCE",
    "IMPLEMENTATION",
    "RESOURCES",
    "TRUST",
    "COMPETITION",
    "INTERNAL_APPROVAL",
    "AUTHORITY",
    "PROCESS",
    "OTHER",
    "UNKNOWN",
]

ObjectionSeverity = Literal[
    "HIGH",
    "MEDIUM",
    "LOW",
    "UNKNOWN",
]

ResolutionStatus = Literal[
    "RESOLVED",
    "PARTIALLY_RESOLVED",
    "UNRESOLVED",
    "UNKNOWN",
]

SpeakerRole = Literal[
    "PROSPECT",
    "SELLER",
    "UNKNOWN",
]


# ─── Core Models ───────────────────────────────────────────────────────────

class BuyingSignal(BaseModel):
    """An observable buying signal expressed by a prospect during conversation."""

    signal_type: BuyingSignalType = Field(
        default="UNKNOWN",
        description="Categorized type of buying signal",
    )
    strength: BuyingSignalStrength = Field(
        default="UNKNOWN",
        description="Observable strength of signal: 'HIGH', 'MEDIUM', 'LOW', or 'UNKNOWN'",
    )
    description: str = Field(
        default="",
        description="Brief descriptive summary of the observed buying signal",
    )
    evidence: Optional[str] = Field(
        default=None,
        description="Verbatim prospect quote or grounded factual snippet supporting this signal",
    )
    speaker: SpeakerRole = Field(
        default="PROSPECT",
        description="Speaker role: must be 'PROSPECT' (seller pitches are NOT prospect buying signals)",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for this extraction (0.0 to 1.0)",
    )
    provenance: str = Field(
        default="CONVERSATION",
        description="Source of this signal indicator",
    )

    @field_validator("signal_type", mode="before")
    @classmethod
    def normalize_signal_type(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        valid = {
            "EXPLICIT_INTEREST",
            "PRODUCT_FIT_CONFIRMATION",
            "PURCHASE_INTENT",
            "REQUEST_FOR_PRICING",
            "REQUEST_FOR_PROPOSAL",
            "REQUEST_FOR_DEMO",
            "IMPLEMENTATION_DISCUSSION",
            "PROCUREMENT_DISCUSSION",
            "DECISION_PROCESS_DISCUSSION",
            "TIMELINE_COMMITMENT",
            "COMPETITIVE_EVALUATION",
            "STAKEHOLDER_INVOLVEMENT",
            "OTHER",
            "UNKNOWN",
        }
        if cleaned in valid:
            return cleaned
        if "PRIC" in cleaned or "COST" in cleaned or "QUOTE" in cleaned:
            return "REQUEST_FOR_PRICING"
        if "PROPOSAL" in cleaned or "RFP" in cleaned:
            return "REQUEST_FOR_PROPOSAL"
        if "DEMO" in cleaned:
            return "REQUEST_FOR_DEMO"
        if "FIT" in cleaned:
            return "PRODUCT_FIT_CONFIRMATION"
        if "PURCHASE" in cleaned or "BUY" in cleaned or "CONTRACT" in cleaned or "SIGN" in cleaned:
            return "PURCHASE_INTENT"
        if "PROCURE" in cleaned or "VENDOR" in cleaned:
            return "PROCUREMENT_DISCUSSION"
        if "IMPLEMENT" in cleaned or "DEPLOY" in cleaned or "ONBOARD" in cleaned:
            return "IMPLEMENTATION_DISCUSSION"
        if "DECIS" in cleaned:
            return "DECISION_PROCESS_DISCUSSION"
        if "TIME" in cleaned or "START" in cleaned or "LAUNCH" in cleaned:
            return "TIMELINE_COMMITMENT"
        if "COMPET" in cleaned:
            return "COMPETITIVE_EVALUATION"
        if "STAKEHOLDER" in cleaned or "TEAM" in cleaned or "BOSS" in cleaned:
            return "STAKEHOLDER_INVOLVEMENT"
        if "INTEREST" in cleaned:
            return "EXPLICIT_INTEREST"
        return "OTHER"

    @field_validator("strength", mode="before")
    @classmethod
    def normalize_strength(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        if cleaned in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}:
            return cleaned
        if "HIGH" in cleaned or "STRONG" in cleaned:
            return "HIGH"
        if "MED" in cleaned or "MODERATE" in cleaned:
            return "MEDIUM"
        if "LOW" in cleaned or "WEAK" in cleaned:
            return "LOW"
        return "UNKNOWN"

    @field_validator("speaker", mode="before")
    @classmethod
    def normalize_speaker(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "PROSPECT"
        cleaned = v.strip().upper()
        if cleaned in {"PROSPECT", "SELLER", "UNKNOWN"}:
            return cleaned
        if "SELL" in cleaned or "REP" in cleaned or "AGENT" in cleaned:
            return "SELLER"
        if "PROSPECT" in cleaned or "BUYER" in cleaned or "CLIENT" in cleaned or "CUSTOMER" in cleaned:
            return "PROSPECT"
        return "UNKNOWN"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0


class Objection(BaseModel):
    """An objection, hesitation, or blocker raised by the prospect."""

    objection_type: ObjectionType = Field(
        default="UNKNOWN",
        description="Categorized type of objection",
    )
    severity: ObjectionSeverity = Field(
        default="UNKNOWN",
        description="Severity of the objection: 'HIGH' (blocker), 'MEDIUM' (serious concern), 'LOW' (minor hesitation), 'UNKNOWN'",
    )
    description: str = Field(
        default="",
        description="Brief descriptive summary of the objection",
    )
    evidence: Optional[str] = Field(
        default=None,
        description="Verbatim quote or grounded factual snippet expressing this objection",
    )
    speaker: SpeakerRole = Field(
        default="PROSPECT",
        description="Speaker role who raised the objection: 'PROSPECT', 'SELLER', 'UNKNOWN'",
    )
    resolution_status: ResolutionStatus = Field(
        default="UNRESOLVED",
        description="Current status: 'RESOLVED', 'PARTIALLY_RESOLVED', 'UNRESOLVED', 'UNKNOWN'",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for this extraction (0.0 to 1.0)",
    )
    provenance: str = Field(
        default="CONVERSATION",
        description="Source of this objection indicator",
    )

    @field_validator("objection_type", mode="before")
    @classmethod
    def normalize_objection_type(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        valid = {
            "PRICE",
            "BUDGET",
            "TIMELINE",
            "PRODUCT_FIT",
            "FEATURE_GAP",
            "INTEGRATION",
            "SECURITY",
            "COMPLIANCE",
            "IMPLEMENTATION",
            "RESOURCES",
            "TRUST",
            "COMPETITION",
            "INTERNAL_APPROVAL",
            "AUTHORITY",
            "PROCESS",
            "OTHER",
            "UNKNOWN",
        }
        if cleaned in valid:
            return cleaned
        if "PRICE" in cleaned or "EXPENS" in cleaned or "COST" in cleaned:
            return "PRICE"
        if "BUDGET" in cleaned or "AFFORD" in cleaned:
            return "BUDGET"
        if "INTEG" in cleaned or "API" in cleaned or "CRM" in cleaned:
            return "INTEGRATION"
        if "SEC" in cleaned or "SOC2" in cleaned or "ISO" in cleaned or "ENCRYPT" in cleaned:
            return "SECURITY"
        if "COMPLI" in cleaned or "GDPR" in cleaned or "HIPAA" in cleaned or "REGULAT" in cleaned:
            return "COMPLIANCE"
        if "FEATURE" in cleaned or "CAPABILITY" in cleaned or "GAP" in cleaned or "LACK" in cleaned:
            return "FEATURE_GAP"
        if "FIT" in cleaned or "B2B" in cleaned or "B2C" in cleaned or "USE_CASE" in cleaned:
            return "PRODUCT_FIT"
        if "TIME" in cleaned or "DELAY" in cleaned or "QUARTER" in cleaned or "BUSY" in cleaned:
            return "TIMELINE"
        if "RESOURCE" in cleaned or "BANDWIDTH" in cleaned or "STAFF" in cleaned or "TEAM" in cleaned:
            return "RESOURCES"
        if "AUTH" in cleaned or "DECISION_MAKER" in cleaned or "NOT_MY_CALL" in cleaned:
            return "AUTHORITY"
        if "APPROV" in cleaned or "BOARD" in cleaned or "COMMITTEE" in cleaned:
            return "INTERNAL_APPROVAL"
        if "COMPET" in cleaned or "RIVAL" in cleaned or "ALTERNATIVE" in cleaned:
            return "COMPETITION"
        if "TRUST" in cleaned or "REPUTATION" in cleaned or "TRACK_RECORD" in cleaned:
            return "TRUST"
        if "IMPLEMENT" in cleaned or "ONBOARD" in cleaned or "MIGRAT" in cleaned:
            return "IMPLEMENTATION"
        if "PROCESS" in cleaned or "PROCURE" in cleaned or "LEGAL" in cleaned:
            return "PROCESS"
        return "OTHER"

    @field_validator("severity", mode="before")
    @classmethod
    def normalize_severity(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        if cleaned in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}:
            return cleaned
        if "HIGH" in cleaned or "BLOCK" in cleaned or "CRITICAL" in cleaned or "SHOWSTOPPER" in cleaned:
            return "HIGH"
        if "MED" in cleaned or "SERIOUS" in cleaned or "MODERATE" in cleaned:
            return "MEDIUM"
        if "LOW" in cleaned or "MINOR" in cleaned or "LIGHT" in cleaned:
            return "LOW"
        return "UNKNOWN"

    @field_validator("resolution_status", mode="before")
    @classmethod
    def normalize_resolution_status(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNRESOLVED"
        cleaned = v.strip().upper()
        if cleaned in {"RESOLVED", "PARTIALLY_RESOLVED", "UNRESOLVED", "UNKNOWN"}:
            return cleaned
        if "PARTIAL" in cleaned:
            return "PARTIALLY_RESOLVED"
        if "RESOLV" in cleaned or "ADDRESSED" in cleaned or "SOLVED" in cleaned or "ANSWERED" in cleaned:
            return "RESOLVED"
        if "UNRESOLV" in cleaned or "OPEN" in cleaned or "PENDING" in cleaned or "ACTIVE" in cleaned:
            return "UNRESOLVED"
        return "UNKNOWN"

    @field_validator("speaker", mode="before")
    @classmethod
    def normalize_speaker(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "PROSPECT"
        cleaned = v.strip().upper()
        if cleaned in {"PROSPECT", "SELLER", "UNKNOWN"}:
            return cleaned
        if "SELL" in cleaned or "REP" in cleaned or "AGENT" in cleaned:
            return "SELLER"
        if "PROSPECT" in cleaned or "BUYER" in cleaned or "CLIENT" in cleaned or "CUSTOMER" in cleaned:
            return "PROSPECT"
        return "UNKNOWN"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0


class BuyingSignalsObjectionsOutput(BaseAIServiceOutput):
    """
    Structured buying signals and objections output produced by AI-09.
    Inherits timestamp, provider, model, latency_ms, raw_response from BaseAIServiceOutput.
    """

    buying_signals: List[BuyingSignal] = Field(
        default_factory=list,
        description="Structured list of observable buying signals expressed by prospect",
    )
    objections: List[Objection] = Field(
        default_factory=list,
        description="Structured list of objections, concerns, and hesitations raised by prospect",
    )
    unresolved_concerns: List[str] = Field(
        default_factory=list,
        description="Clear descriptive summaries of unresolved or partially resolved prospect concerns",
    )
    overall_signal_strength: BuyingSignalStrength = Field(
        default="UNKNOWN",
        description="Aggregate descriptive buying signal strength: 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'",
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Traceable evidence items supporting buying signal and objection detections",
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in buying signals & objections analysis (0.0 to 1.0)",
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Deterministic narrative summary explaining signal strength and objection findings",
    )

    def get_signals_by_type(self, signal_type: str) -> List[BuyingSignal]:
        """Retrieve all buying signals matching a specific type."""
        target = signal_type.strip().upper()
        return [s for s in self.buying_signals if s.signal_type == target]

    def get_objections_by_type(self, objection_type: str) -> List[Objection]:
        """Retrieve all objections matching a specific type."""
        target = objection_type.strip().upper()
        return [o for o in self.objections if o.objection_type == target]

    def get_unresolved_objections(self) -> List[Objection]:
        """Retrieve all objections that are UNRESOLVED or PARTIALLY_RESOLVED."""
        return [
            o for o in self.objections
            if o.resolution_status in {"UNRESOLVED", "PARTIALLY_RESOLVED"}
        ]

    @field_validator("overall_signal_strength", mode="before")
    @classmethod
    def normalize_overall_signal_strength(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = v.strip().upper()
        if cleaned in {"HIGH", "MEDIUM", "LOW", "UNKNOWN"}:
            return cleaned
        if "HIGH" in cleaned or "STRONG" in cleaned:
            return "HIGH"
        if "MED" in cleaned or "MODERATE" in cleaned:
            return "MEDIUM"
        if "LOW" in cleaned or "WEAK" in cleaned:
            return "LOW"
        return "UNKNOWN"

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0


class BuyingSignalsObjectionsInput(BaseModel):
    """Input contract aggregating conversation transcript and upstream context."""

    transcript: Union[str, List[ConversationTurn], List[Dict[str, Any]]] = Field(
        description="Raw conversation transcript string or list of structured ConversationTurn objects/dicts",
    )
    conversation_intelligence: Optional[ConversationIntelligenceOutput] = Field(
        default=None,
        description="Phase 7 Conversation Intelligence output providing context on stage, summary, and moments",
    )
    business_context: Optional[BusinessIntelligenceOutput] = Field(
        default=None,
        description="Phase 3 Business Intelligence output defining offerings, ICP, and value props",
    )
    lead_intelligence: Optional[LeadIntelligenceOutput] = Field(
        default=None,
        description="Phase 4 Lead Intelligence output defining prospect role, company, and raw requirements",
    )
    qualification: Optional[QualificationOutput] = Field(
        default=None,
        description="Phase 8 Qualification output (FOR BACKGROUND CONTEXT ONLY — does NOT dictate buying signals)",
    )
    intent_information: Optional[IntentDetectionOutput] = Field(
        default=None,
        description="Phase 5 Intent Detection output (FOR BACKGROUND CONTEXT ONLY)",
    )
    lead_score: Optional[LeadScoreOutput] = Field(
        default=None,
        description="Phase 5 Lead Score output (FOR BACKGROUND CONTEXT ONLY — does NOT determine buying signal strength)",
    )
    company_research: Optional[CompanyResearchOutput] = Field(
        default=None,
        description="Phase 6 Company Research output providing verified company facts",
    )

    def get_turns(self) -> List[ConversationTurn]:
        """Convert input transcript into a standardized list of ConversationTurn instances."""
        if isinstance(self.transcript, list):
            turns: List[ConversationTurn] = []
            for item in self.transcript:
                if isinstance(item, ConversationTurn):
                    turns.append(item)
                elif isinstance(item, dict):
                    turns.append(ConversationTurn(**item))
            return turns
        elif isinstance(self.transcript, str):
            # Parse simple speaker-delimited lines like 'Seller: ...' or '[PROSPECT]: ...'
            lines = [ln.strip() for ln in self.transcript.split("\n") if ln.strip()]
            turns = []
            for i, line in enumerate(lines):
                speaker: SpeakerRole = "UNKNOWN"
                text = line
                # Look for speaker prefix
                match = re.match(r"^\[?(SELLER|REP|AGENT|PROSPECT|BUYER|CUSTOMER|CLIENT)\]?:\s*(.*)$", line, re.IGNORECASE)
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
        """Format transcript into a standardized, readable dialogue block."""
        turns = self.get_turns()
        if not turns:
            if isinstance(self.transcript, str) and self.transcript.strip():
                return self.transcript.strip()
            return "None provided."
        
        formatted_lines = []
        for turn in turns:
            spk = turn.speaker if turn.speaker in {"SELLER", "PROSPECT"} else "UNKNOWN"
            prefix = f"[{spk}]"
            if turn.timestamp_start is not None:
                prefix += f" ({turn.timestamp_start:.1f}s)"
            formatted_lines.append(f"{prefix}: {turn.text}")
        return "\n".join(formatted_lines)
