"""
Conversation Intelligence Schemas — AI-07.

Defines Pydantic models for Conversation Intelligence input and output contracts,
representing structured understanding of what occurred during a sales conversation.

Strict Scope Boundary:
This schema records and structures conversation facts (summary, stage, topics,
needs, requirements, questions, preferences, timeline, budget, decision context,
unresolved items, commitments, and key moments).
It does NOT perform qualification (AI-08), buying-signal / objection scoring (AI-09),
or Next Best Action recommendation (AI-10).
"""

import uuid
import re
from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, model_validator

from ai.core.schemas.base import BaseAIServiceOutput, Evidence
from ai.core.schemas.business_intelligence import BusinessIntelligenceOutput
from ai.core.schemas.lead_intelligence import LeadIntelligenceOutput
from ai.core.schemas.sales_pitch import PersonalizedSalesPitchOutput


# ─── Conversation Turn Model ───────────────────────────────────────────────

class ConversationTurn(BaseModel):
    """A single speaker turn in a sales conversation transcript."""

    turn_id: Optional[str] = Field(
        default=None,
        description="Unique identifier or index for this turn"
    )
    speaker: Literal["SELLER", "PROSPECT", "UNKNOWN"] = Field(
        default="UNKNOWN",
        description="Speaker role: 'SELLER', 'PROSPECT', or 'UNKNOWN'"
    )
    text: str = Field(
        default="",
        description="Verbatim spoken or transcribed text for this turn"
    )
    timestamp_start: Optional[float] = Field(
        default=None,
        description="Optional start time in seconds relative to call start"
    )
    timestamp_end: Optional[float] = Field(
        default=None,
        description="Optional end time in seconds relative to call start"
    )
    language: Optional[str] = Field(
        default=None,
        description="Optional detected language code for this turn (e.g. 'en', 'hi')"
    )

    @field_validator("speaker", mode="before")
    @classmethod
    def normalize_speaker(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        cleaned = re.sub(r"[\s_-]+", "_", v.strip().upper())
        if cleaned in {"SELLER", "PROSPECT", "UNKNOWN"}:
            return cleaned
        if cleaned in {"AGENT", "SALES", "SALES_AGENT", "SALES_REP", "REP", "BOT", "ASSISTANT"}:
            return "SELLER"
        if cleaned in {"CUSTOMER", "LEAD", "CLIENT", "USER", "BUYER"}:
            return "PROSPECT"
        return "UNKNOWN"


# ─── Sub-Models for Structured Understanding ────────────────────────────────

class CustomerNeed(BaseModel):
    """A customer need explicitly stated by the prospect in conversation."""

    need: str = Field(
        description="Description of the need explicitly expressed by the prospect"
    )
    supporting_evidence: Optional[str] = Field(
        default=None,
        description="Direct quote or snippet from the transcript supporting this need"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence level in this extraction (0.0 to 1.0)"
    )
    provenance: str = Field(
        default="TRANSCRIPT",
        description="Provenance of the fact (e.g. 'TRANSCRIPT')"
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


class ConversationRequirement(BaseModel):
    """A concrete technical, operational, or commercial requirement mentioned."""

    requirement: str = Field(
        description="Concrete requirement specified (e.g. 'WhatsApp integration', 'Multi-language support')"
    )
    supporting_evidence: Optional[str] = Field(
        default=None,
        description="Supporting transcript snippet"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0)"
    )
    provenance: str = Field(
        default="TRANSCRIPT",
        description="Origin source indicator"
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


class QuestionsAsked(BaseModel):
    """Questions explicitly asked by either party during the conversation."""

    prospect_questions: List[str] = Field(
        default_factory=list,
        description="Questions asked by the prospect"
    )
    seller_questions: List[str] = Field(
        default_factory=list,
        description="Questions asked by the seller"
    )


class KeyMoment(BaseModel):
    """A notable turning point, disclosure, or highlight from the dialogue."""

    moment_type: Literal[
        "REQUIREMENT_MENTION",
        "NEED_MENTION",
        "QUESTION",
        "COMMITMENT",
        "TIMELINE_MENTION",
        "BUDGET_MENTION",
        "DECISION_CONTEXT",
        "CONCERN",
        "IMPORTANT_STATEMENT",
    ] = Field(
        default="IMPORTANT_STATEMENT",
        description="Descriptive type of the key moment"
    )
    description: str = Field(
        description="Brief summary of what occurred in this key moment"
    )
    transcript_evidence: str = Field(
        description="Supporting verbatim snippet from the transcript"
    )
    speaker: Literal["SELLER", "PROSPECT", "UNKNOWN"] = Field(
        default="UNKNOWN",
        description="Speaker responsible for this key moment"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score (0.0 to 1.0)"
    )

    @field_validator("moment_type", mode="before")
    @classmethod
    def normalize_moment_type(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "IMPORTANT_STATEMENT"
        valid = {
            "REQUIREMENT_MENTION", "NEED_MENTION", "QUESTION", "COMMITMENT",
            "TIMELINE_MENTION", "BUDGET_MENTION", "DECISION_CONTEXT", "CONCERN",
            "IMPORTANT_STATEMENT"
        }
        cleaned = v.strip().upper()
        if cleaned in valid:
            return cleaned
        # Map common variants
        if "NEED" in cleaned:
            return "NEED_MENTION"
        if "REQ" in cleaned:
            return "REQUIREMENT_MENTION"
        if "TIME" in cleaned:
            return "TIMELINE_MENTION"
        if "BUDGET" in cleaned:
            return "BUDGET_MENTION"
        if "DECIS" in cleaned:
            return "DECISION_CONTEXT"
        if "COMMIT" in cleaned:
            return "COMMITMENT"
        if "QUESTION" in cleaned:
            return "QUESTION"
        if "CONCERN" in cleaned or "OBJECTION" in cleaned:
            return "CONCERN"
        return "IMPORTANT_STATEMENT"

    @field_validator("speaker", mode="before")
    @classmethod
    def normalize_speaker(cls, v: Any) -> str:
        return ConversationTurn.normalize_speaker(v)

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        if v is None:
            return 1.0
        try:
            return max(0.0, min(1.0, float(v)))
        except (ValueError, TypeError):
            return 1.0


# ─── Conversation Intelligence Output Contract ──────────────────────────────

class ConversationIntelligenceOutput(BaseAIServiceOutput):
    """
    Structured understanding of a sales conversation transcript.
    Inherits timestamp, provider, model, latency_ms, raw_response from BaseAIServiceOutput.
    """

    conversation_summary: str = Field(
        default="UNKNOWN",
        description="Objective narrative summary of what transpired in the conversation"
    )
    conversation_stage: Literal[
        "OPENING",
        "DISCOVERY",
        "REQUIREMENTS_DISCUSSION",
        "SOLUTION_DISCUSSION",
        "QUESTIONS",
        "NEGOTIATION",
        "CLOSING",
        "FOLLOW_UP",
        "UNKNOWN",
    ] = Field(
        default="UNKNOWN",
        description="Current or primary conversational stage based strictly on transcript evidence"
    )
    topics: List[str] = Field(
        default_factory=list,
        description="List of specific business/technical topics explicitly discussed"
    )
    customer_needs: List[CustomerNeed] = Field(
        default_factory=list,
        description="Explicit customer needs expressed by the prospect"
    )
    requirements: List[ConversationRequirement] = Field(
        default_factory=list,
        description="Concrete requirements stated during conversation"
    )
    questions_asked: QuestionsAsked = Field(
        default_factory=QuestionsAsked,
        description="Questions asked by prospect and seller"
    )
    stated_preferences: List[str] = Field(
        default_factory=list,
        description="Explicit preferences stated (e.g. billing cadence, communication channel)"
    )
    mentioned_timeline: Optional[str] = Field(
        default="UNKNOWN",
        description="Timeline information explicitly mentioned, or UNKNOWN"
    )
    mentioned_budget: Optional[str] = Field(
        default="UNKNOWN",
        description="Budget explicitly mentioned, or UNKNOWN. Strictly NO guessing."
    )
    decision_context: Optional[str] = Field(
        default="UNKNOWN",
        description="Explicit information regarding decision process or stakeholders, or UNKNOWN"
    )
    unresolved_items: List[str] = Field(
        default_factory=list,
        description="Items or questions left unanswered or pending resolution"
    )
    key_moments: List[KeyMoment] = Field(
        default_factory=list,
        description="Key highlights, milestones, or turns in the dialogue"
    )
    seller_commitments: List[str] = Field(
        default_factory=list,
        description="Explicit promises or follow-up actions committed by the seller"
    )
    prospect_commitments: List[str] = Field(
        default_factory=list,
        description="Explicit commitments made by the prospect"
    )
    conversation_language: str = Field(
        default="UNKNOWN",
        description="Primary language(s) of the conversation (e.g. 'English', 'Hindi', 'Mixed')"
    )
    evidence: List[Evidence] = Field(
        default_factory=list,
        description="Traceable transcript evidence items supporting conclusions"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Overall confidence in extraction fidelity (0.0 to 1.0)"
    )
    reasoning: Optional[str] = Field(
        default=None,
        description="Grounding reasoning explaining evidence coverage"
    )

    @field_validator("conversation_stage", mode="before")
    @classmethod
    def normalize_stage(cls, v: Any) -> str:
        if not v or not isinstance(v, str):
            return "UNKNOWN"
        valid = {
            "OPENING", "DISCOVERY", "REQUIREMENTS_DISCUSSION", "SOLUTION_DISCUSSION",
            "QUESTIONS", "NEGOTIATION", "CLOSING", "FOLLOW_UP", "UNKNOWN"
        }
        cleaned = v.strip().upper()
        if cleaned in valid:
            return cleaned
        # Map common synonyms
        if "DISCOV" in cleaned:
            return "DISCOVERY"
        if "REQ" in cleaned:
            return "REQUIREMENTS_DISCUSSION"
        if "SOLUT" in cleaned or "PITCH" in cleaned:
            return "SOLUTION_DISCUSSION"
        if "QUESTION" in cleaned or "Q&A" in cleaned:
            return "QUESTIONS"
        if "NEGOT" in cleaned or "PRIC" in cleaned:
            return "NEGOTIATION"
        if "CLOSE" in cleaned or "CLOSING" in cleaned:
            return "CLOSING"
        if "FOLLOW" in cleaned:
            return "FOLLOW_UP"
        if "OPEN" in cleaned:
            return "OPENING"
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


# ─── Conversation Intelligence Input Contract ───────────────────────────────

class ConversationIntelligenceInput(BaseModel):
    """Input contract aggregating transcript and optional background sales context."""

    conversation_id: str = Field(
        default_factory=lambda: f"conv_{uuid.uuid4().hex[:8]}",
        description="Unique identifier for this conversation"
    )
    lead_id: Optional[str] = Field(
        default=None,
        description="Optional lead identifier"
    )
    transcript: Union[str, List[ConversationTurn], List[Dict[str, Any]]] = Field(
        description="Conversation transcript as raw formatted string, list of ConversationTurn, or dicts"
    )
    language: Optional[str] = Field(
        default=None,
        description="Optional detected or declared conversation language"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Optional conversation metadata (call duration, agent name, channel, etc.)"
    )
    seller_context: Optional[Union[BusinessIntelligenceOutput, str]] = Field(
        default=None,
        description="Optional seller intelligence context (Phase 3)"
    )
    lead_context: Optional[Union[LeadIntelligenceOutput, str]] = Field(
        default=None,
        description="Optional lead intelligence context (Phase 4)"
    )
    personalized_pitch_context: Optional[Union[PersonalizedSalesPitchOutput, str]] = Field(
        default=None,
        description="Optional personalized pitch context (Phase 7)"
    )

    def get_turns(self) -> List[ConversationTurn]:
        """
        Normalize the input transcript into a standardized List[ConversationTurn].
        Parses raw text dialogues (e.g. 'SELLER: ...\nPROSPECT: ...') if needed.
        """
        if isinstance(self.transcript, list):
            turns: List[ConversationTurn] = []
            for item in self.transcript:
                if isinstance(item, ConversationTurn):
                    turns.append(item)
                elif isinstance(item, dict):
                    turns.append(ConversationTurn(**item))
            return turns

        if isinstance(self.transcript, str):
            raw_text = self.transcript.strip()
            if not raw_text:
                return []

            turns = []
            # Regex to match lines starting with Speaker prefixes
            # e.g., 'SELLER:', 'PROSPECT:', 'Agent:', 'Lead:', 'Sales Rep:'
            pattern = re.compile(
                r"^(SELLER|PROSPECT|AGENT|CUSTOMER|LEAD|CLIENT|USER|SALES\s+AGENT|SALES\s+REP|BOT|UNKNOWN)\s*:\s*(.*)$",
                re.IGNORECASE,
            )

            current_speaker = "UNKNOWN"
            current_lines: List[str] = []

            for line in raw_text.splitlines():
                line_str = line.strip()
                if not line_str:
                    continue
                match = pattern.match(line_str)
                if match:
                    if current_lines:
                        turns.append(
                            ConversationTurn(
                                turn_id=f"t_{len(turns)+1}",
                                speaker=current_speaker,
                                text=" ".join(current_lines),
                            )
                        )
                        current_lines = []
                    current_speaker = match.group(1)
                    current_lines.append(match.group(2))
                else:
                    current_lines.append(line_str)

            if current_lines:
                turns.append(
                    ConversationTurn(
                        turn_id=f"t_{len(turns)+1}",
                        speaker=current_speaker,
                        text=" ".join(current_lines),
                    )
                )

            return turns

        return []

    def get_formatted_transcript(self) -> str:
        """Return canonical formatted transcript string with speaker labels."""
        turns = self.get_turns()
        if not turns:
            if isinstance(self.transcript, str):
                return self.transcript.strip() or "UNKNOWN"
            return "UNKNOWN"

        lines = []
        for t in turns:
            lines.append(f"{t.speaker}: {t.text}")
        return "\n".join(lines)
