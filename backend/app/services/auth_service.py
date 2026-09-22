"""
auth_service.py — Authentication service for Vidur Sales OS.

Provides:
- Password hashing and verification (native bcrypt)
- In-memory failed login attempt tracking with lockout (exponential backoff)
- User authentication against the database
- User registration
"""

import threading
import time
import uuid
from typing import Optional, Tuple

import bcrypt as _bcrypt
from sqlalchemy.orm import Session

from app.db.models.profile import Profile

# ---------------------------------------------------------------------------
# Password hashing (native bcrypt)
# ---------------------------------------------------------------------------

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = _bcrypt.gensalt()
    hashed = _bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return _bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


# ---------------------------------------------------------------------------
# In-memory lockout tracker (thread-safe)
# ---------------------------------------------------------------------------

_lockout_lock = threading.Lock()

# Structure: { email_lower: {"count": int, "locked_until": float_epoch, "first_attempt": float_epoch} }
_login_attempts: dict = {}

# Config
MAX_ATTEMPTS = 5          # lock after this many consecutive failures
LOCKOUT_BASE_SECONDS = 30 # base lockout time in seconds
ATTEMPT_WINDOW_SECONDS = 300  # sliding window; reset count if no failure in this many seconds


def _get_lockout_seconds(count: int) -> float:
    """Exponential backoff: 30s, 60s, 120s, 240s … capped at 15min."""
    multiplier = max(0, count - MAX_ATTEMPTS)
    duration = LOCKOUT_BASE_SECONDS * (2 ** multiplier)
    return min(duration, 900)  # cap at 15 minutes


def check_lockout(email: str) -> Optional[float]:
    """
    Check if an email is currently locked out.
    Returns the remaining lockout seconds if locked, or None if not locked.
    """
    key = email.lower().strip()
    with _lockout_lock:
        info = _login_attempts.get(key)
        if not info:
            return None
        locked_until = info.get("locked_until", 0)
        if locked_until and time.time() < locked_until:
            remaining = locked_until - time.time()
            return remaining
        return None


def record_failed_attempt(email: str) -> Tuple[int, Optional[float]]:
    """
    Record a failed login attempt. Returns (attempt_count, lockout_remaining_seconds).
    Triggers lockout when count reaches MAX_ATTEMPTS.
    """
    key = email.lower().strip()
    now = time.time()
    with _lockout_lock:
        info = _login_attempts.get(key, {"count": 0, "locked_until": 0, "first_attempt": now})

        # Reset if window expired and not currently locked
        if now - info.get("first_attempt", now) > ATTEMPT_WINDOW_SECONDS and not (info.get("locked_until", 0) > now):
            info = {"count": 0, "locked_until": 0, "first_attempt": now}

        info["count"] = info.get("count", 0) + 1

        lockout_remaining = None
        if info["count"] >= MAX_ATTEMPTS:
            duration = _get_lockout_seconds(info["count"])
            info["locked_until"] = now + duration
            lockout_remaining = duration

        _login_attempts[key] = info
        return info["count"], lockout_remaining


def reset_attempts(email: str) -> None:
    """Reset the failed attempt counter after a successful login."""
    key = email.lower().strip()
    with _lockout_lock:
        _login_attempts.pop(key, None)


# ---------------------------------------------------------------------------
# User authentication
# ---------------------------------------------------------------------------

def authenticate_user(db: Session, email: str, password: str) -> Optional[Profile]:
    """
    Authenticate a user by email and password.
    Returns the Profile object on success, None on failure.
    """
    profile = db.query(Profile).filter(
        Profile.email == email.lower().strip()
    ).first()

    if not profile:
        return None

    if not profile.hashed_password:
        # User exists (e.g. Supabase user) but has no local password
        return None

    if not verify_password(password, profile.hashed_password):
        return None

    return profile


def register_user(
    db: Session,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    role: str = "sales_rep",
    must_change_password: bool = False,
) -> Profile:
    """
    Register a new user with hashed password and role.
    Raises ValueError if the email already exists.
    """
    email = email.lower().strip()
    existing = db.query(Profile).filter(Profile.email == email).first()
    if existing:
        raise ValueError(f"A user with email '{email}' already exists.")

    profile = Profile(
        id=uuid.uuid4(),
        email=email,
        full_name=full_name or email.split("@")[0],
        hashed_password=hash_password(password),
        role=role,
        must_change_password=must_change_password,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def change_user_password(
    db: Session,
    user_id: uuid.UUID,
    new_password: str,
    old_password: Optional[str] = None,
    require_old_password_check: bool = False,
) -> Profile:
    """
    Change a user's password. If require_old_password_check is True, old_password must match.
    Clears must_change_password flag to False upon successful change.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise ValueError("User not found.")

    if require_old_password_check:
        if not old_password or not verify_password(old_password, profile.hashed_password or ""):
            raise ValueError("Current password verification failed.")

    profile.hashed_password = hash_password(new_password)
    profile.must_change_password = False
    db.commit()
    db.refresh(profile)
    return profile

