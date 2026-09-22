"""
notifications.py — In-app notification API routes.
GET   /api/notifications           → Get user's notifications
POST  /api/notifications           → Create a notification (internal / admin)
PATCH /api/notifications/{id}/read → Mark notification as read
DELETE /api/notifications/{id}     → Delete a notification
"""

import uuid as uuid_lib
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user, require_role
from app.db.database import get_db
from app.db.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    target_path: Optional[str]
    created_at: str


class CreateNotificationRequest(BaseModel):
    user_id: str            # Target user UUID
    title: str
    message: str
    type: str = "signal"   # signal | call | followup | campaign
    target_path: Optional[str] = "/dashboard"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="Get in-app notifications for current user",
)
def get_notifications(
    unread_only: bool = False,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns in-app notifications for the authenticated user, newest first."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.read == False)
    notifications = query.order_by(Notification.created_at.desc()).limit(50).all()
    return [_to_response(n) for n in notifications]


@router.post(
    "",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a notification for a user",
)
def create_notification(
    body: CreateNotificationRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates an in-app notification for the specified user.
    Triggered internally (e.g. when a lead is marked 'interested').
    Any authenticated user may create notifications on behalf of themselves;
    admins may create for any user.
    """
    try:
        target_user_id = uuid_lib.UUID(body.user_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid user_id format.")

    # Non-admins may only create notifications for themselves
    if current_user.role != "admin" and target_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You may only create notifications for yourself.",
        )

    notification = Notification(
        id=uuid_lib.uuid4(),
        user_id=target_user_id,
        title=body.title,
        message=body.message,
        type=body.type,
        read=False,
        target_path=body.target_path or "/dashboard",
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return _to_response(notification)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark a notification as read",
)
def mark_notification_read(
    notification_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marks a specific notification as read. Users may only update their own notifications."""
    try:
        nid = uuid_lib.UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid notification ID.")

    notification = db.query(Notification).filter(
        Notification.id == nid,
        Notification.user_id == current_user.id,
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notification.read = True
    db.commit()
    db.refresh(notification)
    return _to_response(notification)


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a notification",
)
def delete_notification(
    notification_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a notification. Users may only delete their own notifications."""
    try:
        nid = uuid_lib.UUID(notification_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid notification ID.")

    notification = db.query(Notification).filter(
        Notification.id == nid,
        Notification.user_id == current_user.id,
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(notification)
    db.commit()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _to_response(n: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=str(n.id),
        user_id=str(n.user_id),
        title=n.title,
        message=n.message,
        type=n.type,
        read=n.read,
        target_path=n.target_path,
        created_at=n.created_at.isoformat() if n.created_at else "",
    )
