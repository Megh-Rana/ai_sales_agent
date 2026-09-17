import json
from functools import lru_cache
from typing import List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SUPPORTED_PG_PREFIXES = (
    "postgresql://",
    "postgresql+psycopg2://",
    "postgresql+psycopg://",
    "postgres://",
)


from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_SQLITE_PATH = (BACKEND_DIR / "sales_platform.db").resolve()
DEFAULT_DATABASE_URL = f"sqlite:///{DEFAULT_SQLITE_PATH}"


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    TEST_DATABASE_URL: Optional[str] = None

    # Supabase (Optional / Backend Only)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars-long"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173", "*"]

    # Logging
    LOG_LEVEL: str = "INFO"

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            return "sqlite:///./sales_platform.db"
        
        v_lower = v.lower()
        if v_lower.startswith("sqlite"):
            return v
        
        # Normalize legacy postgres:// prefix
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://"):]
        return v

    @field_validator("TEST_DATABASE_URL")
    @classmethod
    def validate_test_database_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        
        v_lower = v.lower()
        if "sqlite" in v_lower:
            raise ValueError(
                "SQLite is strictly prohibited for tests. TEST_DATABASE_URL must be an isolated PostgreSQL connection string."
            )
        
        if not any(v_lower.startswith(prefix) for prefix in SUPPORTED_PG_PREFIXES):
            raise ValueError(
                f"Unsupported database scheme in TEST_DATABASE_URL. Only PostgreSQL is supported. "
                f"Received: {v.split('://')[0]}://..."
            )
        
        if v.startswith("postgres://"):
            v = "postgresql://" + v[len("postgres://"):]
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
