"""Pydantic schemas for request and response validation."""
from app.schemas.common import PaginatedResponse, ErrorResponse
from app.schemas.business import BusinessCreate, BusinessUpdate, BusinessResponse
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse
from app.schemas.intelligence import (
    LeadIntelligenceCreate,
    LeadIntelligenceUpdate,
    LeadIntelligenceResponse,
)
from app.schemas.call import CallCreate, CallUpdate, CallResponse

__all__ = [
    "PaginatedResponse",
    "ErrorResponse",
    "BusinessCreate",
    "BusinessUpdate",
    "BusinessResponse",
    "LeadCreate",
    "LeadUpdate",
    "LeadResponse",
    "LeadIntelligenceCreate",
    "LeadIntelligenceUpdate",
    "LeadIntelligenceResponse",
    "CallCreate",
    "CallUpdate",
    "CallResponse",
]
