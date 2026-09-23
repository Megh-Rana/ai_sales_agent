"""
auth.py — Authentication API routes.
POST /api/auth/register  → Create new user (hashed password, role)
POST /api/auth/login     → Validate credentials, enforce lockout, return JWT
GET  /api/auth/me        → Return current user info
"""

from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import AuthenticatedUser, create_access_token, get_current_user
from app.db.database import get_db
from app.db.models.profile import Profile
from app.services.auth_service import (
    authenticate_user,
    check_lockout,
    record_failed_attempt,
    register_user,
    reset_attempts,
)
from app.services.activity_log_service import log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "sales_rep"  # "sales_rep" | "admin"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    role: str
    full_name: Optional[str] = None
    must_change_password: bool = False


class UserResponse(BaseModel):
    user_id: str
    email: str
    role: str
    full_name: Optional[str] = None
    subscription_tier: str = "Starter"
    must_change_password: bool = False


class ChangePasswordRequest(BaseModel):
    old_password: Optional[str] = None
    new_password: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Creates a new Profile with a bcrypt-hashed password and the given role.
    Returns a signed JWT access token on success.
    """
    try:
        profile = register_user(
            db=db,
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            role=body.role,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    token = create_access_token(
        user_id=profile.id,
        email=profile.email,
        role=profile.role,
    )

    # Log registration action
    try:
        log_activity(db, profile.id, "register", metadata={"role": profile.role})
    except Exception:
        pass  # Non-fatal

    return TokenResponse(
        access_token=token,
        user_id=str(profile.id),
        email=profile.email or "",
        role=profile.role,
        full_name=profile.full_name,
        must_change_password=bool(getattr(profile, "must_change_password", False)),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Validates credentials against the database (bcrypt).
    Enforces login lockout after 5 consecutive failures with exponential backoff.
    Returns a signed JWT on success.
    """
    email = body.email.lower().strip()

    # --- Check lockout first ---
    lockout_remaining = check_lockout(email)
    if lockout_remaining is not None:
        wait_secs = int(lockout_remaining) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked due to too many failed login attempts. "
                   f"Please try again in {wait_secs} seconds.",
            headers={"Retry-After": str(wait_secs)},
        )

    # --- Authenticate ---
    profile = authenticate_user(db, email, body.password)

    if not profile:
        count, new_lockout = record_failed_attempt(email)
        if new_lockout is not None:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Account locked for {int(new_lockout)} seconds.",
                headers={"Retry-After": str(int(new_lockout))},
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # --- Success ---
    reset_attempts(email)

    token = create_access_token(
        user_id=profile.id,
        email=profile.email,
        role=profile.role,
    )

    # Log successful login
    try:
        log_activity(db, profile.id, "login", metadata={"email": profile.email})
    except Exception:
        pass  # Non-fatal

    return TokenResponse(
        access_token=token,
        user_id=str(profile.id),
        email=profile.email or "",
        role=profile.role,
        full_name=profile.full_name,
        must_change_password=bool(getattr(profile, "must_change_password", False)),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user",
)
def me(current_user: AuthenticatedUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns profile information for the currently authenticated user."""
    profile = db.query(Profile).filter(Profile.id == current_user.id).first()
    return UserResponse(
        user_id=str(current_user.id),
        email=current_user.email or (profile.email if profile else ""),
        role=current_user.role,
        full_name=profile.full_name if profile else None,
        subscription_tier=getattr(profile, "subscription_tier", "Starter") if profile else "Starter",
        must_change_password=bool(getattr(profile, "must_change_password", False)) if profile else False,
    )


@router.post(
    "/change-password",
    summary="Change password for authenticated user",
)
def change_password(
    body: ChangePasswordRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Changes the authenticated user's password.
    Clears must_change_password flag upon success.
    """
    profile = db.query(Profile).filter(Profile.id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

    from app.services.auth_service import hash_password, verify_password

    if not getattr(profile, "must_change_password", False) and body.old_password:
        if not verify_password(body.old_password, profile.hashed_password or ""):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect.")

    if len(body.new_password.strip()) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters.")

    profile.hashed_password = hash_password(body.new_password.strip())
    profile.must_change_password = False
    db.commit()
    db.refresh(profile)

    try:
        log_activity(db, profile.id, "change_password", metadata={"email": profile.email})
    except Exception:
        pass

    return {
        "status": "success",
        "message": "Password changed successfully. You can now use your new password for all future logins.",
        "must_change_password": False,
    }


class UpdateSubscriptionRequest(BaseModel):
    subscription_tier: str  # "Starter", "Growth", or "Enterprise"


@router.put(
    "/subscription",
    summary="Update subscription tier for authenticated user",
)
def update_subscription(
    body: UpdateSubscriptionRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates the user's subscription tier.
    Allowed tiers: Starter, Growth, Enterprise.
    """
    allowed_tiers = ["Starter", "Growth", "Enterprise"]
    if body.subscription_tier not in allowed_tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid subscription tier. Allowed: {', '.join(allowed_tiers)}",
        )

    profile = db.query(Profile).filter(Profile.id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

    old_tier = getattr(profile, "subscription_tier", "Starter")
    profile.subscription_tier = body.subscription_tier
    db.commit()
    db.refresh(profile)

    try:
        log_activity(
            db,
            profile.id,
            "subscription_change",
            metadata={"old_tier": old_tier, "new_tier": body.subscription_tier}
        )
    except Exception:
        pass

    return {
        "status": "success",
        "message": f"Subscription tier updated to {body.subscription_tier}",
        "subscription_tier": body.subscription_tier,
        "old_tier": old_tier,
    }
