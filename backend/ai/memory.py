"""
Conversation Memory — tracks conversation state, extracts entities,
scores interest, and generates call summaries.
"""

import time
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ConversationTurn:
    """A single turn in the conversation."""
    role: str  # "agent" or "prospect"
    text: str
    language: str
    timestamp: float = field(default_factory=time.time)


@dataclass
class LeadInfo:
    """Extracted information about the prospect."""
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    interest_level: str = "unknown"  # unknown, not_interested, maybe, interested, very_interested
    budget_discussed: bool = False
    authority_confirmed: bool = False
    need_identified: bool = False
    timeline_discussed: bool = False
    objections: list = field(default_factory=list)
    callback_requested: bool = False
    callback_time: Optional[str] = None
    meeting_scheduled: bool = False


class ConversationMemory:
    """Manages conversation state and context."""

    def __init__(self):
        self.turns: list[ConversationTurn] = []
        self.lead_info = LeadInfo()
        self.start_time = time.time()
        self.language = "en"  # Detected language of the conversation
        self._call_ended = False

    def add_turn(self, role: str, text: str, language: str = "en"):
        """Add a conversation turn."""
        self.turns.append(ConversationTurn(
            role=role,
            text=text,
            language=language,
        ))
        # Update detected language based on prospect's speech
        if role == "prospect":
            self.language = language

    def get_context_for_llm(self, max_turns: int = 10) -> list[dict]:
        """
        Get conversation history formatted for LLM input.
        Returns recent turns in OpenAI-style message format.
        """
        recent = self.turns[-max_turns:] if len(self.turns) > max_turns else self.turns
        messages = []
        for turn in recent:
            if turn.role == "agent":
                messages.append({"role": "assistant", "content": turn.text})
            else:
                messages.append({"role": "user", "content": turn.text})
        return messages

    def get_context_string(self, max_turns: int = 10) -> str:
        """Get conversation history as a formatted string."""
        recent = self.turns[-max_turns:] if len(self.turns) > max_turns else self.turns
        lines = []
        for turn in recent:
            speaker = "Sales Agent" if turn.role == "agent" else "Prospect"
            lines.append(f"{speaker}: {turn.text}")
        return "\n".join(lines)

    def update_lead_info(self, **kwargs):
        """Update extracted lead information."""
        for key, value in kwargs.items():
            if hasattr(self.lead_info, key):
                setattr(self.lead_info, key, value)

    def get_bant_score(self) -> dict:
        """Get BANT qualification score."""
        return {
            "budget": self.lead_info.budget_discussed,
            "authority": self.lead_info.authority_confirmed,
            "need": self.lead_info.need_identified,
            "timeline": self.lead_info.timeline_discussed,
            "score": sum([
                self.lead_info.budget_discussed,
                self.lead_info.authority_confirmed,
                self.lead_info.need_identified,
                self.lead_info.timeline_discussed,
            ]),
            "max_score": 4,
        }

    def end_call(self):
        """Mark the call as ended."""
        self._call_ended = True

    def get_summary(self) -> dict:
        """Generate a call summary."""
        duration = time.time() - self.start_time
        bant = self.get_bant_score()

        return {
            "duration_seconds": round(duration, 1),
            "total_turns": len(self.turns),
            "language": self.language,
            "lead_info": {
                "name": self.lead_info.name,
                "company": self.lead_info.company,
                "interest_level": self.lead_info.interest_level,
                "objections": self.lead_info.objections,
                "callback_requested": self.lead_info.callback_requested,
                "meeting_scheduled": self.lead_info.meeting_scheduled,
            },
            "bant_score": bant,
            "transcript": self.get_context_string(max_turns=100),
        }

    @property
    def turn_count(self) -> int:
        return len(self.turns)

    @property
    def is_ended(self) -> bool:
        return self._call_ended
