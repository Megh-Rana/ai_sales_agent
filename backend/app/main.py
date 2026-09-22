from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.api import api_router
from app.core.config import get_settings
from app.core.logging import logger
from app.core.middleware import CorrelationIdMiddleware
from app.db.database import check_db_connection

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown hooks."""
    logger.info(f"Starting Sales Agent Platform Backend in '{settings.ENVIRONMENT}' environment...")
    db_ok = check_db_connection()
    if db_ok:
        logger.info("Database connectivity check succeeded.")
    else:
        logger.warning("Database connectivity check failed during startup.")
    yield
    logger.info("Shutting down Sales Agent Platform Backend.")


def create_app() -> FastAPI:
    """FastAPI application factory."""
    app = FastAPI(
        title="AI Sales Agent Platform API",
        description=(
            "Clean, production-ready backend API for the AI Sales Agent Platform. "
            "Manages Businesses, Leads, Lead Intelligence storage, and Call logs."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Safe CORS Configuration
    origins = settings.CORS_ORIGINS
    if isinstance(origins, str):
        origins = [origins]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=r"^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$|^https:\/\/.*\.vercel\.app$",
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        allow_private_network=True,
    )

    # Request correlation ID and operational tracing middleware
    app.add_middleware(CorrelationIdMiddleware)

    # Global Exception Handlers
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Request validation error",
                "errors": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled server exception on {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error occurred."},
        )

    # Mount API routers
    app.include_router(api_router)

    @app.get("/", tags=["Root"])
    def root():
        return {
            "name": "AI Sales Agent Platform API",
            "version": "0.1.0",
            "docs": "/docs",
            "health": "/api/health",
            "ready": "/api/health/ready",
        }

    return app


app = create_app()
