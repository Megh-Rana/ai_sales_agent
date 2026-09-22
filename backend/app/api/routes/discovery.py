from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.discovery import DiscoveryScanRequest, DiscoveryScanResponse, DiscoveredLeadEnrichment
from app.services.discovery_service import DiscoveryService

router = APIRouter(prefix="/discovery", tags=["Discovery"])

@router.post("/scan", response_model=DiscoveryScanResponse, status_code=status.HTTP_200_OK)
def scan_public_sources(
    payload: DiscoveryScanRequest,
    db: Session = Depends(get_db)
):
    """
    Scans public ToS-compliant sources (LinkedIn posts, B2B RFP portals, freelance job boards)
    for posted requirements matching keywords, industry, and location.
    Enriches each discovered lead with 11 mandatory fields (or 'unavailable') and persists to the database.
    """
    return DiscoveryService.scan_public_sources(
        db=db,
        request=payload
    )

@router.get("/leads", response_model=List[DiscoveredLeadEnrichment], status_code=status.HTTP_200_OK)
def get_discovered_leads(
    industry: Optional[str] = Query(None, description="Filter by industry"),
    location: Optional[str] = Query(None, description="Filter by location"),
    keyword: Optional[str] = Query(None, description="Filter by keyword"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns discovered leads stored in the database with their enriched attributes.
    """
    return DiscoveryService.get_discovered_leads(
        db=db,
        industry=industry,
        location=location,
        keyword=keyword,
        limit=limit
    )
