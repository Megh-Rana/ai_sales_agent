from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from typing import Callable, Optional
from uuid import UUID
import jwt
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel, ConfigDict
from app.core.config import get_settings

settings = get_settings()


class AuthenticatedUser(BaseModel):
    id: UUID
    email: Optional[str] = None
    role: str = "sales_rep"  # "sales_rep" or "admin"

    model_config = ConfigDict(from_attributes=True)


def require_role(*allowed_roles: str) -> Callable:
    """
    FastAPI dependency factory for Role-Based Access Control (RBAC).
    Returns a dependency that enforces the current user holds one of the allowed roles.
    Raises HTTP 403 Forbidden for insufficient role permissions.

    Usage:
        @router.get("/admin/users", dependencies=[Depends(require_role("admin"))])
    """
    async def _check_role(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: requires one of roles {list(allowed_roles)}, "
                       f"but user has role '{current_user.role}'.",
            )
        return current_user
    return _check_role


def get_jwt_secret() -> str:
    """Returns the configured Supabase JWT secret or falls back to SECRET_KEY."""
    return settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY


def create_access_token(
    user_id: UUID,
    email: Optional[str] = None,
    role: str = "authenticated",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Creates a signed JWT access token compatible with Supabase Auth conventions.
    Used for local development, API clients, and automated testing.
    """
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(hours=24))

    payload = {
        "sub": str(user_id),
        "aud": "authenticated",
        "role": role,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload, get_jwt_secret(), algorithm="HS256")


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def hash_token(token: str) -> str:
    """Hash a token using SHA-256 with SECRET_KEY as salt."""
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        token.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def verify_token(token: str, expected_hash: str) -> bool:
    """Safely verify a token hash against an expected hash using constant-time comparison."""
    computed_hash = hash_token(token)
    return hmac.compare_digest(computed_hash, expected_hash)


async def get_current_user(
    authorization: Optional[str] = Header(None, description="Bearer <token>")
) -> AuthenticatedUser:
    """
    FastAPI security dependency.
    Extracts and cryptographically validates the Supabase JWT Bearer token,
    identifying the authenticated user and their UUID.
    """
    if not authorization:
        settings = get_settings()
        if settings.ENVIRONMENT == "development" or not settings.SUPABASE_JWT_SECRET:
            return AuthenticatedUser(
                id=UUID("00000000-0000-0000-0000-000000000001"),
                email="demo-owner@cloudscale.example.internal",
                role="authenticated",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header. Expected Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1].strip()
    secret = get_jwt_secret()

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256", "RS256", "ES256"],
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject ('sub') is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = UUID(str(sub))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
    )
