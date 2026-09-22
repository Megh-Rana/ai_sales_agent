from fastapi import APIRouter
from app.api.routes import health, businesses, leads, intelligence, calls
from app.api.routes import auth, admin, activity, notifications, campaigns, analytics, discovery, segments, crm

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(activity.router)
api_router.include_router(notifications.router)
api_router.include_router(businesses.router)
api_router.include_router(leads.router)
api_router.include_router(intelligence.router)
api_router.include_router(calls.router)
api_router.include_router(campaigns.router)
api_router.include_router(analytics.router)
api_router.include_router(discovery.router)
api_router.include_router(segments.router)
api_router.include_router(crm.router)
from app.api.routes import telephony
api_router.include_router(telephony.router)



