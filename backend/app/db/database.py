from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()

database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = "postgresql://" + database_url[len("postgres://"):]

is_sqlite = database_url.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(
        database_url,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Create all tables if they do not exist."""
    import app.db.models  # load models
    Base.metadata.create_all(bind=engine)

    # Safe migration for newly added lead enrichment columns on both Postgres and SQLite
    try:
        with engine.connect() as conn:
            for col_name, col_type in [
                ("job_title", "VARCHAR(255)"),
                ("company_size", "VARCHAR(100)"),
                ("linkedin_url", "VARCHAR(500)"),
                ("website", "VARCHAR(500)"),
            ]:
                try:
                    if is_sqlite:
                        conn.execute(text(f"ALTER TABLE leads ADD COLUMN {col_name} {col_type};"))
                    else:
                        conn.execute(text(f"ALTER TABLE leads ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
                    conn.commit()
                except Exception:
                    pass

            # Safe migration for profiles.must_change_password
            try:
                if is_sqlite:
                    conn.execute(text("ALTER TABLE profiles ADD COLUMN must_change_password BOOLEAN DEFAULT 0;"))
                else:
                    conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;"))
                conn.commit()
            except Exception:
                pass
    except Exception as e:
        logger.warning(f"Database column enrichment migration check: {e}")


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding database session with clean cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Check if the PostgreSQL database connection is healthy."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"PostgreSQL connection check failed: {e}")
        return False
