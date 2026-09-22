"""
activity_log_service.py — Helper for writing activity audit records.
"""

import uuid
from typing import Optional, Any
from sqlalchemy.orm import Session

from app.db.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    user_id: uuid.UUID,
    action_type: str,
    resource: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> ActivityLog:
    """
    Insert a record into the activity_logs table.

    Args:
        db:          Active SQLAlchemy session.
        user_id:     UUID of the acting user.
        action_type: Short string describing the action, e.g. "login", "lead_view",
                     "campaign_launch", "lead_export", "settings_change".
        resource:    Optional resource identifier (lead ID, campaign ID, etc.).
        metadata:    Optional dict of arbitrary extra context.

    Returns:
        The persisted ActivityLog instance.
    """
    entry = ActivityLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action_type=action_type,
        resource=resource,
        extra_metadata=metadata,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
