from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.db.database import get_db

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get("/health", summary="Liveness probe")
def liveness():
    """
    Liveness probe confirming that the FastAPI application is alive and responding.
    Does not require database access.
    """
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }


@router.get("/health/ready", summary="Readiness probe")
def readiness(response: Response, db: Session = Depends(get_db)):
    """
    Readiness probe verifying that Supabase PostgreSQL is reachable and accepting queries.
    Returns HTTP 200 if connected, or HTTP 503 Service Unavailable if degraded.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "environment": settings.ENVIRONMENT,
        }
    except Exception as e:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "not_ready",
            "database": "disconnected",
            "environment": settings.ENVIRONMENT,
            "detail": f"Database connectivity check failed: {str(e)}",
        }
