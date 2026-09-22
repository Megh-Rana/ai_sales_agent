from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class CRMConnectRequest(BaseModel):
    crm_type: str = Field(default="hubspot", description="Target CRM provider: 'hubspot' or 'salesforce'")
    auth_code: Optional[str] = Field(None, description="OAuth2 authorization code returned from OAuth redirect")
    portal_id: Optional[str] = Field(None, description="HubSpot Portal ID or Salesforce Org ID")
    client_id: Optional[str] = Field(None, description="Optional custom OAuth client ID")
    client_secret: Optional[str] = Field(None, description="Optional custom OAuth client secret")


class CRMConnectionStatus(BaseModel):
    status: str = Field(default="connected", description="Connection status string (e.g. 'connected', 'disconnected')")
    connected: bool = Field(..., description="Whether a CRM OAuth integration is active")
    crm_type: str = Field(default="hubspot", description="Active CRM provider ('hubspot' or 'salesforce')")
    portal_id: Optional[str] = Field(None, description="HubSpot Portal ID or Salesforce Org ID")
    account_name: Optional[str] = Field(None, description="CRM Portal or account identifier")
    connected_at: Optional[str] = Field(None, description="ISO timestamp when connection was established")
    last_sync: Optional[str] = Field(None, description="ISO timestamp of most recent sync")
    auto_sync_enabled: bool = Field(default=True, description="Whether bi-directional lead sync is enabled")


class CRMImportRequest(BaseModel):
    business_id: UUID = Field(..., description="ID of the business to import leads into")
    crm_type: str = Field(default="hubspot", description="CRM provider to pull from")
    limit: int = Field(default=50, ge=1, le=200, description="Max contacts to pull from CRM")
    resolutions: Optional[Dict[str, str]] = Field(
        default=None,
        description="Optional mapping of duplicate identifier (email/id) to 'merge' or 'skip'"
    )


class DuplicateResolutionRequest(BaseModel):
    business_id: UUID = Field(..., description="Business ID")
    resolutions: Dict[str, str] = Field(..., description="Map of existing lead ID or conflict email to 'merge' or 'skip'")
    duplicates_data: List[Dict[str, Any]] = Field(default_factory=list, description="Incoming duplicate lead rows to resolve")


class CRMSyncResponse(BaseModel):
    success: bool = Field(..., description="Whether the sync operation succeeded")
    crm_type: str = Field(..., description="CRM provider ('hubspot' or 'salesforce')")
    crm_record_id: Optional[str] = Field(None, description="Created or updated remote CRM contact/lead ID")
    synced_fields: List[str] = Field(default_factory=list, description="Fields successfully mapped and written")
    message: str = Field(..., description="Status summary or error details")


class CRMSyncLogEntry(BaseModel):
    id: str = Field(..., description="Unique log ID")
    timestamp: str = Field(..., description="ISO timestamp of sync attempt")
    event_type: str = Field(..., description="'lead_push', 'call_outcome_push', 'contact_import'")
    crm_type: str = Field(default="hubspot")
    status: str = Field(..., description="'SUCCESS', 'FAILURE', 'SKIPPED'")
    lead_id: Optional[str] = Field(None)
    details: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = Field(None)
