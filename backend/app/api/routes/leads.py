import math
import csv
import io
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.common import PaginatedResponse
from app.schemas.ingestion import LeadImportResponse
from app.schemas.lead import LeadCreate, LeadResponse, LeadUpdate
from app.services.lead_service import LeadService

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lead",
)
def create_lead(
    lead_in: LeadCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new sales lead associated with a business owned by the user.
    Validates business existence and ownership, returning 400 on invalid or unowned business.
    """
    try:
        return LeadService.create_lead(db, lead_in, owner_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/import",
    response_model=LeadImportResponse,
    status_code=status.HTTP_200_OK,
    summary="Import leads from CSV file",
)
async def import_leads_csv(
    business_id: UUID = Query(..., description="ID of the business to import leads into"),
    file: UploadFile = File(..., description="CSV file containing lead records"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Imports leads from a CSV file into the specified business owned by the user.
    Enforces file size limits, UTF-8 parsing, header validation, field normalization,
    and deterministic deduplication, returning a detailed created/skipped/failed breakdown.
    """
    try:
        file_bytes = await file.read()
        filename = file.filename or "import.csv"
        return LeadService.import_leads_csv(
            db=db,
            business_id=business_id,
            owner_id=current_user.id,
            file_bytes=file_bytes,
            filename=filename,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get(
    "",
    response_model=PaginatedResponse[LeadResponse],
    summary="List leads with filtering and pagination",
)
def list_leads(
    business_id: Optional[UUID] = Query(None, description="Filter by business ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (new, contacted, qualified, etc.)"),
    industry: Optional[str] = Query(None, description="Partial match filter by industry"),
    location: Optional[str] = Query(None, description="Partial match filter by location"),
    source: Optional[str] = Query(None, description="Filter by acquisition source"),
    min_intent_score: Optional[float] = Query(
        None,
        ge=0.0,
        le=100.0,
        description="Filter leads with intent_score >= min_intent_score (0-100)"
    ),
    sort_by: str = Query(
        "created_at",
        pattern="^(created_at|intent_score|company_name|status)$",
        description="Field to sort results by"
    ),
    sort_order: str = Query(
        "desc",
        pattern="^(asc|desc)$",
        description="Sort direction (asc or desc)"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves leads owned by the authenticated user with database-level filtering, sorting, and pagination.
    """
    items, total = LeadService.list_leads(
        db=db,
        owner_id=current_user.id,
        business_id=business_id,
        status=status_filter,
        industry=industry,
        location=location,
        source=source,
        min_intent_score=min_intent_score,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    return PaginatedResponse[LeadResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Get lead by ID",
)
def get_lead(
    lead_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves a single lead by its unique ID, verifying ownership."""
    lead = LeadService.get_lead(db, lead_id, owner_id=current_user.id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID '{lead_id}' not found.",
        )
    return lead


@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update lead by ID",
)
def update_lead(
    lead_id: UUID,
    lead_in: LeadUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates fields of an existing lead owned by the user."""
    lead = LeadService.update_lead(db, lead_id, lead_in, owner_id=current_user.id)
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID '{lead_id}' not found.",
        )
    return lead


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete lead by ID",
)
def delete_lead(
    lead_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Permanently deletes a lead and cascaded intelligence/calls owned by the user."""
    deleted = LeadService.delete_lead(db, lead_id, owner_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID '{lead_id}' not found.",
        )
    return None


@router.get(
    "/export/csv",
    summary="Export leads to CSV with same filters as list endpoint",
)
def export_leads_csv(
    business_id: Optional[UUID] = Query(None, description="Filter by business ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    industry: Optional[str] = Query(None, description="Partial match filter by industry"),
    location: Optional[str] = Query(None, description="Partial match filter by location"),
    source: Optional[str] = Query(None, description="Filter by acquisition source"),
    min_intent_score: Optional[float] = Query(None, ge=0.0, le=100.0, description="Filter by minimum intent score"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Exports leads to CSV format with all enrichment fields.
    Uses same filtering logic as list endpoint but returns all results (no pagination).
    """
    # Fetch all matching leads without pagination
    items, total = LeadService.list_leads(
        db=db,
        owner_id=current_user.id,
        business_id=business_id,
        status=status_filter,
        industry=industry,
        location=location,
        source=source,
        min_intent_score=min_intent_score,
        sort_by="created_at",
        sort_order="desc",
        page=1,
        page_size=10000,  # Large limit to get all results
    )

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "ID",
        "Company Name",
        "Contact Name",
        "Contact Email",
        "Contact Phone",
        "Job Title",
        "Industry",
        "Location",
        "Company Size",
        "Website",
        "LinkedIn Profile",
        "Status",
        "Intent Score",
        "Source",
        "Requirement",
        "Created At",
        "Updated At",
    ])
    
    # Write data rows
    for lead in items:
        writer.writerow([
            str(lead.id),
            lead.company_name or "",
            lead.contact_name or "",
            lead.contact_email or "",
            lead.contact_phone or "",
            lead.job_title or "",
            lead.industry or "",
            lead.location or "",
            lead.company_size or "",
            lead.website or "",
            lead.linkedin_profile or "",
            lead.status or "",
            lead.intent_score if lead.intent_score is not None else "",
            lead.source or "",
            lead.requirement or "",
            lead.created_at.isoformat() if lead.created_at else "",
            lead.updated_at.isoformat() if lead.updated_at else "",
        ])
    
    # Prepare response
    output.seek(0)
    filename = f"leads_export_{current_user.id}_{items[0].created_at.strftime('%Y%m%d') if items else 'empty'}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8",
        }
    )
