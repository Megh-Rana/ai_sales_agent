"""
Centralized call lifecycle state machine.
Enforces deterministic status transitions and prevents invalid lifecycle jumps.
"""
from typing import Dict, Set

# Valid lifecycle state graph
ALLOWED_TRANSITIONS: Dict[str, Set[str]] = {
    "scheduled": {"in_progress", "no_answer", "cancelled", "failed", "completed"},
    "in_progress": {"completed", "failed", "no_answer", "cancelled"},
    "completed": set(),    # Terminal state
    "no_answer": set(),    # Terminal state
    "cancelled": set(),    # Terminal state
    "failed": set(),       # Terminal state
}

TERMINAL_STATES: Set[str] = {"completed", "no_answer", "cancelled", "failed"}


def validate_call_transition(current_status: str, new_status: str) -> None:
    """
    Validates whether a transition from current_status to new_status is permitted.
    Raises ValueError with a clear explanation if the transition is illegal.
    Identical transitions (current == new) are permitted as idempotent no-ops.
    """
    curr = current_status.lower() if current_status else ""
    target = new_status.lower() if new_status else ""

    if curr == target:
        return

    if curr in TERMINAL_STATES:
        raise ValueError(
            f"Cannot transition call from terminal status '{curr}' to '{target}'."
        )

    allowed = ALLOWED_TRANSITIONS.get(curr, set())
    if target not in allowed:
        valid_options = ", ".join(f"'{s}'" for s in sorted(allowed)) if allowed else "none (terminal)"
        raise ValueError(
            f"Invalid call status transition from '{curr}' to '{target}'. "
            f"Allowed next states from '{curr}': {valid_options}."
        )
