"""
activity.py — Activity log API routes.
GET  /api/activity/me    → Current user's own audit trail
GET  /api/activity/all   → All users' activity (admin only)
POST /api/activity       → Client-side action logging
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user, require_role
from app.db.database import get_db
from app.db.models.activity_log import ActivityLog
from app.services.activity_log_service import log_activity

router = APIRouter(prefix="/activity", tags=["Activity Log"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ActivityEntry(BaseModel):
    id: str
    user_id: str
    action_type: str
    resource: Optional[str]
    timestamp: str
    metadata: Optional[dict]


class LogActionRequest(BaseModel):
    action_type: str   # login, lead_view, campaign_launch, lead_export, settings_change
    resource: Optional[str] = None
    metadata: Optional[dict] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=List[ActivityEntry],
    summary="Get current user's activity log",
)
def get_my_activity(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the activity audit trail for the currently authenticated user."""
    query = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id)
    if action_type:
        query = query.filter(ActivityLog.action_type == action_type)
    query = query.order_by(ActivityLog.timestamp.desc())
    offset = (page - 1) * page_size
    logs = query.offset(offset).limit(page_size).all()
    return [
        ActivityEntry(
            id=str(log.id),
            user_id=str(log.user_id),
            action_type=log.action_type,
            resource=log.resource,
            timestamp=log.timestamp.isoformat() if log.timestamp else "",
            metadata=log.extra_metadata,
        )
        for log in logs
    ]


@router.get(
    "/all",
    response_model=List[ActivityEntry],
    summary="[Admin] Get all users' activity logs",
    dependencies=[Depends(require_role("admin"))],
)
def get_all_activity(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the full activity log for all users (admin only)."""
    logs = (
        db.query(ActivityLog)
        .order_by(ActivityLog.timestamp.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return [
        ActivityEntry(
            id=str(log.id),
            user_id=str(log.user_id),
            action_type=log.action_type,
            resource=log.resource,
            timestamp=log.timestamp.isoformat() if log.timestamp else "",
            metadata=log.extra_metadata,
        )
        for log in logs
    ]


@router.post(
    "",
    response_model=ActivityEntry,
    status_code=201,
    summary="Log a user action (client-driven)",
)
def log_user_action(
    body: LogActionRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Records an explicit user action from the frontend.
    Supported action_types: login, lead_view, campaign_launch, lead_export, settings_change.
    """
    entry = log_activity(
        db=db,
        user_id=current_user.id,
        action_type=body.action_type,
        resource=body.resource,
        metadata=body.metadata,
    )
    return ActivityEntry(
        id=str(entry.id),
        user_id=str(entry.user_id),
        action_type=entry.action_type,
        resource=entry.resource,
        timestamp=entry.timestamp.isoformat() if entry.timestamp else "",
        metadata=entry.extra_metadata,
    )
