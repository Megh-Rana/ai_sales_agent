import math
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from app.schemas.common import PaginatedResponse
from app.services.business_service import BusinessService

router = APIRouter(prefix="/businesses", tags=["Businesses"])


@router.post(
    "",
    response_model=BusinessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new business",
)
def create_business(
    business_in: BusinessCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a business organization profile owned by the authenticated user."""
    return BusinessService.create_business(
        db, business_in, owner_id=current_user.id, owner_email=current_user.email
    )


@router.get(
    "",
    response_model=PaginatedResponse[BusinessResponse],
    summary="List businesses with pagination",
)
def list_businesses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns a paginated list of registered businesses owned by the authenticated user."""
    items, total = BusinessService.list_businesses(
        db, owner_id=current_user.id, page=page, page_size=page_size
    )
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    return PaginatedResponse[BusinessResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{business_id}",
    response_model=BusinessResponse,
    summary="Get business by ID",
)
def get_business(
    business_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves a single business record by its unique ID owned by the authenticated user."""
    business = BusinessService.get_business(db, business_id=business_id, owner_id=current_user.id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID '{business_id}' not found.",
        )
    return business


@router.put(
    "/{business_id}",
    response_model=BusinessResponse,
    summary="Update business by ID",
)
def update_business(
    business_id: UUID,
    business_in: BusinessUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates a business record owned by the authenticated user."""
    business = BusinessService.update_business(
        db, business_id=business_id, business_in=business_in, owner_id=current_user.id
    )
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID '{business_id}' not found.",
        )
    return business


@router.delete(
    "/{business_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete business by ID",
)
def delete_business(
    business_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes a business record and all related leads/calls owned by the authenticated user."""
    deleted = BusinessService.delete_business(
        db, business_id=business_id, owner_id=current_user.id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID '{business_id}' not found.",
        )
    return None
