import math
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
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


@router.post(
    "/{business_id}/upload-document",
    status_code=status.HTTP_200_OK,
    summary="Upload business document (PDF, DOCX) for AI analysis",
)
async def upload_business_document(
    business_id: UUID,
    file: UploadFile = File(..., description="Business document (PDF, DOCX, TXT)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Uploads a business document (PDF, DOCX, TXT) and extracts business information.
    Updates the business profile with extracted details.
    TC-02: Manual business info onboarding with document upload.
    """
    # Validate business exists and user owns it
    business = BusinessService.get_business(db, business_id=business_id, owner_id=current_user.id)
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business with ID '{business_id}' not found.",
        )
    
    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    content_type = file.content_type or ""
    filename = file.filename or ""
    
    if content_type not in allowed_types and not any(filename.endswith(ext) for ext in [".pdf", ".docx", ".txt"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOCX, and TXT files are supported.",
        )
    
    # Size limit: 10MB
    file_bytes = await file.read()
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size must be less than 10MB.",
        )
    
    # Extract text from document
    try:
        if filename.endswith(".txt") or content_type == "text/plain":
            text_content = file_bytes.decode("utf-8", errors="ignore")
        elif filename.endswith(".pdf") or content_type == "application/pdf":
            # Basic PDF text extraction (fallback)
            text_content = file_bytes.decode("utf-8", errors="ignore")
            # Note: For production, use PyPDF2 or pdfplumber for proper PDF parsing
        elif filename.endswith(".docx") or "wordprocessingml" in content_type:
            # Basic DOCX extraction (fallback)
            text_content = file_bytes.decode("utf-8", errors="ignore")
            # Note: For production, use python-docx for proper DOCX parsing
        else:
            text_content = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from document: {str(e)}",
        )
    
    # Extract business information from text (simple keyword extraction)
    extracted_info = {}
    text_lower = text_content.lower()
    
    # Extract industry keywords
    industry_keywords = {
        "technology": ["software", "saas", "cloud", "ai", "tech", "digital"],
        "healthcare": ["health", "medical", "clinic", "hospital", "pharma"],
        "finance": ["finance", "banking", "fintech", "lending", "credit"],
        "retail": ["retail", "ecommerce", "commerce", "store", "shopping"],
        "logistics": ["logistics", "supply chain", "freight", "warehouse"],
    }
    
    for industry, keywords in industry_keywords.items():
        if any(kw in text_lower for kw in keywords):
            extracted_info["industry"] = industry.title()
            break
    
    # Use first 500 chars as description if not already set
    if not business.description and len(text_content) > 20:
        extracted_info["description"] = text_content[:500].strip() + ("..." if len(text_content) > 500 else "")
    
    # Update business record with extracted info
    if extracted_info:
        update_data = BusinessUpdate(**extracted_info)
        BusinessService.update_business(
            db,
            business_id=business_id,
            business_in=update_data,
            owner_id=current_user.id,
        )
    
    return {
        "status": "success",
        "message": "Document uploaded and processed successfully.",
        "filename": filename,
        "size_bytes": len(file_bytes),
        "extracted_fields": list(extracted_info.keys()),
        "text_preview": text_content[:200].strip() if text_content else "",
    }
