"""
Pydantic schemas for lead ingestion and CSV import results.
"""
from typing import List
from pydantic import BaseModel, Field


class LeadImportError(BaseModel):
    row: int = Field(..., description="1-indexed row number in the uploaded CSV file")
    reason: str = Field(..., description="Validation failure explanation")


# Backward compatibility alias
LeadImportRowError = LeadImportError


class LeadImportResponse(BaseModel):
    total_rows: int = Field(..., description="Total rows parsed from the CSV file")
    created: int = Field(..., description="Number of valid new leads persisted")
    skipped: int = Field(..., description="Number of valid duplicate leads skipped")
    failed: int = Field(..., description="Number of rows rejected due to validation errors")
    errors: List[LeadImportError] = Field(default_factory=list, description="Row-level error breakdown")
