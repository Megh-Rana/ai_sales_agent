from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.crm import (
    CRMConnectRequest,
    CRMConnectionStatus,
    CRMImportRequest,
    CRMSyncLogEntry,
    CRMSyncResponse,
    DuplicateResolutionRequest,
)
from app.schemas.ingestion import LeadImportResponse
from app.services.crm_service import CRMService

router = APIRouter(prefix="/crm", tags=["CRM Integration"])


@router.get(
    "/status",
    response_model=CRMConnectionStatus,
    summary="Get current CRM integration status",
)
def get_crm_status(
    crm_type: str = Query("hubspot", description="CRM provider ('hubspot' or 'salesforce')"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns active OAuth2 connection status for the specified CRM."""
    return CRMService.get_connection_status(db, owner_id=current_user.id, crm_type=crm_type)


@router.get(
    "/oauth/authorize",
    summary="Get CRM OAuth2 authorization redirect URL",
)
def get_oauth_authorize_url(
    crm_type: str = Query("hubspot", description="CRM provider ('hubspot' or 'salesforce')"),
    redirect_uri: Optional[str] = Query(None, description="Custom callback redirect URI"),
):
    """Generates the OAuth2 Authorization Code grant redirect URL."""
    auth_url = CRMService.get_authorization_url(crm_type=crm_type, redirect_uri=redirect_uri)
    return {"authorization_url": auth_url, "crm_type": crm_type}


@router.post(
    "/oauth/callback",
    response_model=CRMConnectionStatus,
    summary="Exchange OAuth2 code for tokens",
)
@router.post(
    "/connect",
    response_model=CRMConnectionStatus,
    summary="Connect or authenticate CRM integration",
)
def handle_oauth_callback(
    payload: CRMConnectRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Exchanges OAuth code for access/refresh tokens and establishes active CRM connection."""
    integration = CRMService.exchange_code_for_tokens(
        db=db,
        owner_id=current_user.id,
        crm_type=payload.crm_type,
        code=payload.auth_code,
    )
    status_res = CRMService.get_connection_status(db, owner_id=current_user.id, crm_type=payload.crm_type)
    if payload.portal_id:
        status_res.portal_id = payload.portal_id
    return status_res


@router.post(
    "/disconnect",
    status_code=status.HTTP_200_OK,
    summary="Disconnect active CRM integration",
)
def disconnect_crm(
    crm_type: str = Query("hubspot"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Disconnects the current CRM integration."""
    success = CRMService.disconnect_crm(db, owner_id=current_user.id, crm_type=crm_type)
    return {"disconnected": success, "crm_type": crm_type}


@router.post(
    "/import",
    response_model=LeadImportResponse,
    summary="Import contacts from connected CRM into lead database",
)
def import_leads_from_crm(
    payload: CRMImportRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Pulls contacts from CRM sandbox and processes them through the identical
    validation and deduplication pipeline as CSV uploads. Returns created, skipped,
    and flagged duplicates for user review.
    """
    try:
        return CRMService.import_leads_from_crm(
            db=db,
            business_id=payload.business_id,
            owner_id=current_user.id,
            crm_type=payload.crm_type,
            limit=payload.limit,
            resolutions=payload.resolutions,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post(
    "/duplicates/resolve",
    response_model=LeadImportResponse,
    summary="Resolve flagged duplicate leads via interactive merge or skip",
)
@router.post(
    "/resolve-duplicates",
    response_model=LeadImportResponse,
    summary="Resolve flagged duplicate leads via interactive merge or skip (alias)",
)
def resolve_duplicates(
    payload: DuplicateResolutionRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Allows user to resolve duplicate candidates interactively per-record by choosing
    'merge' (updates existing record) or 'skip' (ignores incoming record).
    """
    try:
        return CRMService.resolve_duplicates(
            db=db,
            business_id=payload.business_id,
            owner_id=current_user.id,
            resolutions=payload.resolutions,
            duplicates_data=payload.duplicates_data,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/sync/lead",
    response_model=CRMSyncResponse,
    summary="Push newly discovered/enriched lead to connected CRM (query param)",
)
def sync_lead_to_crm(
    lead_id: UUID = Query(..., description="ID of the lead to push to CRM"),
    crm_type: str = Query("hubspot"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Pushes a lead with full field mapping to the CRM contacts/company database."""
    return CRMService.sync_lead_to_crm(
        db=db,
        lead_id=lead_id,
        owner_id=current_user.id,
        crm_type=crm_type,
    )


@router.post(
    "/sync/lead/{lead_id}",
    response_model=CRMSyncResponse,
    summary="Push newly discovered/enriched lead to connected CRM (path parameter)",
)
def sync_lead_to_crm_by_path(
    lead_id: UUID,
    crm_type: str = Query("hubspot"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CRMService.sync_lead_to_crm(
        db=db,
        lead_id=lead_id,
        owner_id=current_user.id,
        crm_type=crm_type,
    )


@router.post(
    "/sync/call",
    response_model=CRMSyncResponse,
    summary="Sync call outcome and transcript link back to CRM (query param)",
)
def sync_call_outcome_to_crm(
    call_id: UUID = Query(..., description="ID of the call outcome to sync"),
    crm_type: str = Query("hubspot"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Syncs call outcome (e.g. 'Interested') and call transcript URL to CRM."""
    return CRMService.sync_call_outcome_to_crm(
        db=db,
        call_id=call_id,
        owner_id=current_user.id,
        crm_type=crm_type,
    )


@router.post(
    "/sync/call/{call_id}",
    response_model=CRMSyncResponse,
    summary="Sync call outcome and transcript link back to CRM (path parameter)",
)
def sync_call_outcome_to_crm_by_path(
    call_id: UUID,
    crm_type: str = Query("hubspot"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return CRMService.sync_call_outcome_to_crm(
        db=db,
        call_id=call_id,
        owner_id=current_user.id,
        crm_type=crm_type,
    )


@router.get(
    "/sync/logs",
    response_model=List[CRMSyncLogEntry],
    summary="Get CRM sync audit and failure logs",
)
def get_sync_logs(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns persistent audit log of all sync events, including failed attempts."""
    return CRMService.get_sync_logs(db, owner_id=current_user.id)
