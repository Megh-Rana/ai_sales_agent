from fastapi import APIRouter
from app.api.routes import health, businesses, leads, intelligence, calls, auth

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(businesses.router)
api_router.include_router(leads.router)
api_router.include_router(intelligence.router)
api_router.include_router(calls.router)

