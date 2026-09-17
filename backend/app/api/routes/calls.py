import math
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.call import CallCreate, CallResponse, CallUpdate
from app.schemas.common import PaginatedResponse
from app.schemas.webhook import CallWebhookPayload, CallWebhookResponse
from app.services.call_service import CallService

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.post(
    "",
    response_model=CallResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new call record",
)
def create_call(
    call_in: CallCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new call record linked to a lead owned by the user.
    Validates lead existence and returns 400 on invalid or unowned lead.
    """
    try:
        return CallService.create_call(db, call_in, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=PaginatedResponse[CallResponse],
    summary="List calls with filtering and pagination",
)
def list_calls(
    lead_id: Optional[UUID] = Query(None, description="Filter calls by lead ID"),
    call_status: Optional[str] = Query(None, alias="status", description="Filter calls by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves calls owned by the user, filtered by lead and status with pagination."""
    items, total = CallService.list_calls(
        db, owner_id=current_user.id, lead_id=lead_id, status=call_status, page=page, page_size=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    return PaginatedResponse[CallResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{call_id}",
    response_model=CallResponse,
    summary="Get call by ID",
)
def get_call(
    call_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves details of a specific call record owned by the user."""
    call = CallService.get_call(db, call_id, owner_id=current_user.id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID '{call_id}' not found.",
        )
    return call


@router.put(
    "/{call_id}",
    response_model=CallResponse,
    summary="Update call record",
)
def update_call(
    call_id: UUID,
    call_in: CallUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates call details such as status, duration, outcome, or transcript.
    Storage only — enforces call state machine transition rules.
    """
    try:
        call = CallService.update_call(db, call_id, call_in, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call with ID '{call_id}' not found.",
        )
    return call


@router.post(
    "/{call_id}/webhook",
    response_model=CallWebhookResponse,
    status_code=status.HTTP_200_OK,
    summary="Voice provider telephony webhook endpoint",
)
def call_webhook(
    call_id: UUID,
    payload: CallWebhookPayload,
    db: Session = Depends(get_db),
):
    """
    Receives voice provider telemetry events (e.g. call.started, call.completed).
    Enforces webhook idempotency and state transition validation.
    """
    try:
        return CallService.process_call_webhook(db, call_id, payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
