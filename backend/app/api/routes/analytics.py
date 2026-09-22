from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.security import AuthenticatedUser, get_current_user
from app.db.database import get_db
from app.schemas.analytics import AnalyticsMetricsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get(
    "/metrics",
    response_model=AnalyticsMetricsResponse,
    summary="Get dynamic analytics and sales funnel metrics",
)
def get_analytics_metrics(
    date_range: str = Query("30d", description="Preset date range: today, 7d, 30d, 90d"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns real aggregate metrics (discovered, contacted, interested, converted)
    computed dynamically from live database state (leads, calls, campaigns).
    Never hardcoded.
    """
    return AnalyticsService.get_metrics(db, owner_id=current_user.id, date_range=date_range)


@router.get(
    "/funnel",
    summary="Get funnel stages summary only",
)
def get_funnel_summary(
    date_range: str = Query("30d"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Convenience endpoint returning specifically the funnel stages and counts."""
    metrics = AnalyticsService.get_metrics(db, owner_id=current_user.id, date_range=date_range)
    return {
        "discovered": metrics.discoveredCount,
        "contacted": metrics.contactedCount,
        "interested": metrics.interestedCount,
        "converted": metrics.convertedCount,
        "conversion_rate": metrics.conversionRate,
        "stages": metrics.funnelStages,
    }
