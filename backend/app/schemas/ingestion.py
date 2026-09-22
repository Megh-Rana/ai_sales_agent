"""
Pydantic schemas for lead ingestion, CSV import, and CRM sync results.
"""
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class LeadImportError(BaseModel):
    row: int = Field(..., description="1-indexed row number in the uploaded CSV or CRM batch")
    reason: str = Field(..., description="Validation failure explanation")


# Backward compatibility alias
LeadImportRowError = LeadImportError


class DuplicateLeadDetail(BaseModel):
    row: int = Field(..., description="1-indexed row number")
    conflict_field: str = Field(..., description="'email' or 'company_name'")
    conflict_value: str = Field(..., description="The duplicate value triggering conflict")
    incoming_data: Dict[str, Any] = Field(default_factory=dict, description="Fields from the incoming lead")
    existing_lead_id: UUID = Field(..., description="UUID of the existing duplicate lead")
    existing_data: Dict[str, Any] = Field(default_factory=dict, description="Fields of the currently stored lead")


class LeadImportResponse(BaseModel):
    total_rows: int = Field(..., description="Total rows parsed from the source")
    created: int = Field(..., description="Number of valid new leads persisted")
    skipped: int = Field(..., description="Number of valid duplicate leads skipped")
    merged: int = Field(default=0, description="Number of duplicate leads merged into existing records")
    failed: int = Field(..., description="Number of rows rejected due to validation errors")
    errors: List[LeadImportError] = Field(default_factory=list, description="Row-level error breakdown")
    duplicates: List[DuplicateLeadDetail] = Field(default_factory=list, description="Detected duplicates for interactive resolution")
