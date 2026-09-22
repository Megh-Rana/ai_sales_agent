from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.segment import SegmentCreate, SegmentResponse, SegmentUpdate
from app.services.segment_service import SegmentService

router = APIRouter(prefix="/segments", tags=["Segments"])


@router.post(
    "",
    response_model=SegmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and persist a new named lead segment",
)
def create_segment(
    segment_in: SegmentCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Persists a named filter combination (e.g. 'Q4 Healthcare Prospects') to the database.
    Retrievable later from the Segments view.
    """
    try:
        return SegmentService.create_segment(db, segment_in, owner_id=current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=List[SegmentResponse],
    summary="List all saved lead segments",
)
def list_segments(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves all saved segments for the user, ordered by creation date.
    """
    return SegmentService.list_segments(db, owner_id=current_user.id)


@router.get(
    "/{segment_id}",
    response_model=SegmentResponse,
    summary="Get saved segment by ID",
)
def get_segment(
    segment_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves a single segment by its ID.
    """
    segment = SegmentService.get_segment(db, segment_id, owner_id=current_user.id)
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment with ID '{segment_id}' not found.",
        )
    return segment


@router.put(
    "/{segment_id}",
    response_model=SegmentResponse,
    summary="Update saved segment by ID",
)
def update_segment(
    segment_id: UUID,
    segment_in: SegmentUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates a saved segment.
    """
    segment = SegmentService.update_segment(db, segment_id, segment_in, owner_id=current_user.id)
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment with ID '{segment_id}' not found.",
        )
    return segment


@router.delete(
    "/{segment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete saved segment by ID",
)
def delete_segment(
    segment_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a saved segment.
    """
    deleted = SegmentService.delete_segment(db, segment_id, owner_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Segment with ID '{segment_id}' not found.",
        )
    return None
