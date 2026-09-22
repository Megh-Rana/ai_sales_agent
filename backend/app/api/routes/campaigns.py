from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.campaign import (
    CampaignCreate,
    CampaignResponse,
    CampaignLeadResponse,
)
from app.services.campaign_service import CampaignService

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post(
    "",
    response_model=CampaignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new campaign with real lead references",
)
def create_campaign(
    campaign_in: CampaignCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new campaign and associates target leads using their real lead_id.
    Ensures leads belong to the database and preserves referential integrity.
    """
    try:
        return CampaignService.create_campaign(db, campaign_in, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=List[CampaignResponse],
    summary="List all campaigns for current user with live metrics",
)
def list_campaigns(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all campaigns owned by the user, aggregating real audience and contact metrics."""
    return CampaignService.list_campaigns(db, owner_id=current_user.id)


@router.get(
    "/{campaign_id}",
    response_model=CampaignResponse,
    summary="Get campaign details with joined target lead list",
)
def get_campaign(
    campaign_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves a single campaign along with its target leads joined from the live database."""
    campaign = CampaignService.get_campaign(db, campaign_id, owner_id=current_user.id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaign with ID '{campaign_id}' not found.",
        )
    return campaign


@router.post(
    "/{campaign_id}/leads",
    response_model=CampaignResponse,
    summary="Add real leads to an existing campaign",
)
def add_leads_to_campaign(
    campaign_id: UUID,
    lead_ids: List[UUID],
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Appends real leads to the campaign queue without duplication."""
    try:
        return CampaignService.add_leads_to_campaign(db, campaign_id, lead_ids, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch(
    "/{campaign_id}/leads/{lead_id}",
    response_model=CampaignLeadResponse,
    summary="Update outreach status for a lead within a campaign",
)
def update_campaign_lead_status(
    campaign_id: UUID,
    lead_id: UUID,
    status_update: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates campaign-level lead status (e.g. QUEUED -> CONTACTED -> QUALIFIED)."""
    updated = CampaignService.update_campaign_lead_status(
        db, campaign_id, lead_id, status_update, owner_id=current_user.id
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Campaign lead record not found.",
        )
    return updated
