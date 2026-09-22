"""
admin.py — Admin-only API routes.
All endpoints in this router require role == "admin" via require_role dependency.
Sales reps calling these endpoints will receive HTTP 403 Forbidden.

GET /api/admin/users     → List all platform users
GET /api/admin/activity  → View all users' activity audit trail
GET /api/admin/stats     → High-level activity stats
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, require_role
from app.db.database import get_db
from app.db.models.profile import Profile
from app.db.models.activity_log import ActivityLog

router = APIRouter(prefix="/admin", tags=["Administration"])

# Convenience: admin-only dependency
admin_required = Depends(require_role("admin"))


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class UserSummary(BaseModel):
    user_id: str
    email: Optional[str]
    full_name: Optional[str]
    role: str
    must_change_password: bool = False
    created_at: Optional[str] = None


class AdminCreateUserRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "sales_rep"
    must_change_password: bool = True


class AdminUpdateUserCredentialsRequest(BaseModel):
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    must_change_password: Optional[bool] = None


class ActivitySummary(BaseModel):
    id: str
    user_id: str
    action_type: str
    resource: Optional[str]
    timestamp: str
    metadata: Optional[dict]


class AdminStats(BaseModel):
    total_users: int
    total_actions: int
    logins_today: int


# ---------------------------------------------------------------------------
# Endpoints (all admin-only)
# ---------------------------------------------------------------------------

@router.get(
    "/users",
    response_model=List[UserSummary],
    summary="[Admin] List all platform users",
)
def list_users(
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    """Returns a list of all registered users (admin only). Returns 403 for sales_rep tokens."""
    profiles = db.query(Profile).order_by(Profile.created_at.desc()).all()
    return [
        UserSummary(
            user_id=str(p.id),
            email=p.email,
            full_name=p.full_name,
            role=p.role,
            must_change_password=bool(getattr(p, "must_change_password", False)),
            created_at=p.created_at.isoformat() if getattr(p, "created_at", None) else None,
        )
        for p in profiles
    ]


@router.post(
    "/users",
    response_model=UserSummary,
    summary="[Admin] Create new platform user",
)
def create_user_by_admin(
    body: AdminCreateUserRequest,
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    """Admin creates a new user with name, email/id, password, and must_change_password flag."""
    from app.services.auth_service import register_user
    from fastapi import HTTPException, status

    try:
        profile = register_user(
            db=db,
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            role=body.role,
            must_change_password=body.must_change_password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    return UserSummary(
        user_id=str(profile.id),
        email=profile.email,
        full_name=profile.full_name,
        role=profile.role,
        must_change_password=bool(getattr(profile, "must_change_password", False)),
        created_at=profile.created_at.isoformat() if getattr(profile, "created_at", None) else None,
    )


@router.put(
    "/users/{user_id}",
    response_model=UserSummary,
    summary="[Admin] Update user profile, password, or reset must_change_password",
)
def update_user_by_admin(
    user_id: UUID,
    body: AdminUpdateUserCredentialsRequest,
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    """Admin updates any user's credentials, password, or resets their password-change requirement."""
    from app.services.auth_service import hash_password
    from fastapi import HTTPException, status

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if body.full_name is not None:
        profile.full_name = body.full_name
    if body.role is not None:
        profile.role = body.role
    if body.password is not None and body.password.strip():
        profile.hashed_password = hash_password(body.password.strip())
    if body.must_change_password is not None:
        profile.must_change_password = body.must_change_password

    db.commit()
    db.refresh(profile)

    return UserSummary(
        user_id=str(profile.id),
        email=profile.email,
        full_name=profile.full_name,
        role=profile.role,
        must_change_password=bool(getattr(profile, "must_change_password", False)),
        created_at=profile.created_at.isoformat() if getattr(profile, "created_at", None) else None,
    )


@router.delete(
    "/users/{user_id}",
    summary="[Admin] Delete user account",
)
def delete_user_by_admin(
    user_id: UUID,
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    """Admin deletes a user profile."""
    from fastapi import HTTPException, status

    if str(current_admin.id) == str(user_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete their own active account.")

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(profile)
    db.commit()
    return {"status": "success", "message": f"User {profile.email} deleted successfully."}


@router.get(
    "/activity",
    response_model=List[ActivitySummary],
    summary="[Admin] View all users' activity audit trail",
)
def list_all_activity(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action_type: Optional[str] = Query(None, description="Filter by action type"),
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    """Returns the full audit log for all users, paginated (admin only)."""
    query = db.query(ActivityLog)
    if action_type:
        query = query.filter(ActivityLog.action_type == action_type)
    query = query.order_by(ActivityLog.timestamp.desc())
    offset = (page - 1) * page_size
    logs = query.offset(offset).limit(page_size).all()
    return [
        ActivitySummary(
            id=str(log.id),
            user_id=str(log.user_id),
            action_type=log.action_type,
            resource=log.resource,
            timestamp=log.timestamp.isoformat() if log.timestamp else "",
            metadata=log.extra_metadata,
        )
        for log in logs
    ]


@router.get(
    "/stats",
    response_model=AdminStats,
    summary="[Admin] High-level activity statistics",
)
def admin_stats(
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    """Returns total user count, total activity actions, and today's login count."""
    from datetime import datetime, timezone, timedelta
    total_users = db.query(Profile).count()
    total_actions = db.query(ActivityLog).count()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    logins_today = db.query(ActivityLog).filter(
        ActivityLog.action_type == "login",
        ActivityLog.timestamp >= today_start,
    ).count()
    return AdminStats(
        total_users=total_users,
        total_actions=total_actions,
        logins_today=logins_today,
    )


# ---------------------------------------------------------------------------
# Phase 7 Endpoints: Telemetry, Billing, Fraud, Compliance Queue, Audit Logs
# ---------------------------------------------------------------------------

from app.services.admin_service import AdminService
from app.services.compliance_service import ComplianceService


@router.get("/users-usage", summary="[Admin] List client accounts with subscription tier and usage")
def get_users_usage(
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    return AdminService.get_users_overview(db)


@router.get("/voice-usage", summary="[Admin] Aggregate telephony voice minutes matching call logs (zero drift)")
def get_voice_usage(
    business_id: Optional[UUID] = Query(None),
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    return AdminService.get_voice_usage_telemetry(db, business_id=business_id)


@router.get("/billing/calculate", summary="[Admin] Usage-based billing calculator")
def calculate_billing(
    tier: str = Query("Growth", description="Subscription tier: Starter, Growth, Enterprise"),
    voice_minutes: float = Query(1250.0, ge=0),
    contacts: int = Query(3200, ge=0),
    crm_integrations: int = Query(2, ge=0),
    current_admin: AuthenticatedUser = admin_required,
):
    return AdminService.calculate_client_billing(
        tier=tier,
        voice_minutes=voice_minutes,
        contacts=contacts,
        crm_integrations=crm_integrations,
    )


@router.get("/fraud/anomalies", summary="[Admin] Anomaly & fraud detection for abnormal call volume spikes")
def get_fraud_anomalies(
    threshold: int = Query(15, ge=1),
    window_minutes: int = Query(10, ge=1),
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    return AdminService.detect_fraud_anomalies(
        db=db,
        call_spike_threshold=threshold,
        window_minutes=window_minutes,
    )


class SimulateSpikeRequest(BaseModel):
    business_id: UUID
    call_count: int = 25


@router.post("/fraud/simulate-spike", summary="[Admin] Simulate rapid call volume surge to test anomaly detector")
def simulate_fraud_spike(
    request: SimulateSpikeRequest,
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    from app.db.models.call import Call
    from app.db.models.lead import Lead
    import uuid

    lead = db.query(Lead).filter(Lead.business_id == request.business_id).first()
    if not lead:
        lead = Lead(
            business_id=request.business_id,
            company_name="Simulated Spike Target",
            contact_phone="+1-555-0999",
            status="new",
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

    now = datetime.now(timezone.utc)
    for i in range(request.call_count):
        db.add(
            Call(
                lead_id=lead.id,
                status="completed",
                duration=45,
                provider="twilio",
                provider_call_id=f"CA-spike-{uuid.uuid4().hex[:12]}",
                created_at=now,
            )
        )
    db.commit()

    anomalies = AdminService.detect_fraud_anomalies(db, call_spike_threshold=10, window_minutes=15)
    return {
        "success": True,
        "simulated_calls": request.call_count,
        "anomalies_detected": anomalies,
    }


# Compliance Review Queue Endpoints

class ProductSubmitRequest(BaseModel):
    product_name: str
    description: str
    business_id: Optional[UUID] = None


@router.post("/compliance/submit", summary="Submit product description for compliance classification")
def submit_product(
    request: ProductSubmitRequest,
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    return ComplianceService.submit_product_for_compliance(
        db=db,
        product_name=request.product_name,
        description=request.description,
        business_id=request.business_id,
    )


@router.get("/compliance/queue", summary="[Admin] View pending & reviewed products in compliance queue")
def get_compliance_queue(
    status: Optional[str] = Query(None),
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    return ComplianceService.get_compliance_queue(db, status_filter=status)


class ComplianceReviewDecision(BaseModel):
    decision: str = "approved"  # 'approved' or 'rejected'
    admin_notes: Optional[str] = None


@router.post("/compliance/{review_id}/review", summary="[Admin] Approve or reject flagged product")
def review_product(
    review_id: str,
    body: ComplianceReviewDecision,
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    try:
        return ComplianceService.review_product(
            db=db,
            review_id=review_id,
            decision=body.decision,
            admin_id=current_admin.id,
            admin_notes=body.admin_notes,
        )
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/audit-logs", summary="[Admin] Surface immutable system activity audit logs")
def get_system_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    current_admin: AuthenticatedUser = admin_required,
    db: Session = Depends(get_db),
):
    return AdminService.get_audit_logs(db, page=page, page_size=page_size)

