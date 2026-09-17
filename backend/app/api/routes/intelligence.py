from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.intelligence import (
    LeadIntelligenceCreate,
    LeadIntelligenceResponse,
    LeadIntelligenceUpdate,
)
from app.services.intelligence_service import IntelligenceService

router = APIRouter(prefix="/leads", tags=["Lead Intelligence"])


@router.get(
    "/{lead_id}/intelligence",
    response_model=LeadIntelligenceResponse,
    summary="Get intelligence for a lead",
)
def get_lead_intelligence(
    lead_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves stored intelligence for a specific lead owned by the user.
    Returns 404 if no intelligence record exists or lead is not accessible.
    """
    intel = IntelligenceService.get_lead_intelligence(db, lead_id, owner_id=current_user.id)
    if not intel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No intelligence record found for lead ID '{lead_id}'.",
        )
    return intel


@router.post(
    "/{lead_id}/intelligence",
    response_model=LeadIntelligenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Store new intelligence for a lead",
)
def create_lead_intelligence(
    lead_id: UUID,
    intel_in: LeadIntelligenceCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stores a new intelligence entry for a given lead owned by the user.
    Validates lead existence and ownership (returns 400 if lead ID not found or unowned).
    """
    try:
        return IntelligenceService.create_lead_intelligence(
            db, lead_id, intel_in, owner_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/{lead_id}/intelligence",
    response_model=LeadIntelligenceResponse,
    summary="Update or upsert intelligence for a lead",
)
def upsert_lead_intelligence(
    lead_id: UUID,
    intel_in: LeadIntelligenceUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates existing intelligence or creates one if none exists, validating ownership.
    """
    try:
        return IntelligenceService.upsert_lead_intelligence(
            db, lead_id, intel_in, owner_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
