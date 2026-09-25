from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import DEFAULT_DATABASE_URL, get_settings
from app.core.logging import logger

settings = get_settings()

database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = "postgresql://" + database_url[len("postgres://"):]

is_sqlite = database_url.startswith("sqlite")


def _build_engine(url: str, sqlite: bool):
    if sqlite:
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=False,
        )
    else:
        return create_engine(
            url,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False,
        )


engine = _build_engine(database_url, is_sqlite)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db():
    """Create all tables if they do not exist."""
    global engine, database_url, is_sqlite
    import app.db.models  # load models

    if not is_sqlite:
        # Check if PostgreSQL server is reachable
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        except Exception as pg_err:
            from app.core.config import DEFAULT_SQLITE_PATH
            logger.warning(
                f"[Database] PostgreSQL connection failed ({pg_err}). "
                f"Falling back to local SQLite database at {DEFAULT_SQLITE_PATH}."
            )
            print(
                f"\n[Database Warning] PostgreSQL connection to localhost:5432 failed.\n"
                f"[Database Notice] Gracefully falling back to local SQLite: {DEFAULT_SQLITE_PATH}\n"
            )
            database_url = DEFAULT_DATABASE_URL
            is_sqlite = True
            engine = _build_engine(database_url, is_sqlite)
            SessionLocal.configure(bind=engine)

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

            # Safe migration for profiles.must_change_password and subscription_tier
            for col_name, col_def_sq, col_def_pg in [
                ("must_change_password", "BOOLEAN DEFAULT 0", "BOOLEAN DEFAULT FALSE"),
                ("subscription_tier", "VARCHAR(50) DEFAULT 'Starter' NOT NULL", "VARCHAR(50) DEFAULT 'Starter' NOT NULL"),
            ]:
                try:
                    if is_sqlite:
                        conn.execute(text(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_def_sq};"))
                    else:
                        conn.execute(text(f"ALTER TABLE profiles ADD COLUMN IF NOT EXISTS {col_name} {col_def_pg};"))
                    conn.commit()
                except Exception:
                    pass

            # Safe migration for campaigns scheduling fields
            for col_name, col_def in [
                ("timezone", "VARCHAR(50) DEFAULT 'UTC' NOT NULL"),
                ("business_hours_start", "VARCHAR(10) DEFAULT '09:00' NOT NULL"),
                ("business_hours_end", "VARCHAR(10) DEFAULT '18:00' NOT NULL"),
                ("repeat_enabled", "VARCHAR(10) DEFAULT 'false' NOT NULL"),
                ("repeat_schedule", "VARCHAR(50)"),
            ]:
                try:
                    if is_sqlite:
                        conn.execute(text(f"ALTER TABLE campaigns ADD COLUMN {col_name} {col_def};"))
                    else:
                        conn.execute(text(f"ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS {col_name} {col_def};"))
                    conn.commit()
                except Exception:
                    pass

            # Safe migration for leads.preferred_language
            try:
                if is_sqlite:
                    conn.execute(text("ALTER TABLE leads ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'en' NOT NULL;"))
                else:
                    conn.execute(text("ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en' NOT NULL;"))
                conn.commit()
            except Exception:
                pass

            # Safe migration for businesses.calendly_url
            try:
                if is_sqlite:
                    conn.execute(text("ALTER TABLE businesses ADD COLUMN calendly_url VARCHAR(500) DEFAULT 'https://calendly.com/vidur-sales/30min';"))
                else:
                    conn.execute(text("ALTER TABLE businesses ADD COLUMN IF NOT EXISTS calendly_url VARCHAR(500) DEFAULT 'https://calendly.com/vidur-sales/30min';"))
                conn.commit()
            except Exception:
                pass

            # Safe migration for calendly_trackings.email and email_delivery_id
            try:
                if is_sqlite:
                    conn.execute(text("ALTER TABLE calendly_trackings ADD COLUMN email VARCHAR(255);"))
                    conn.execute(text("ALTER TABLE calendly_trackings ADD COLUMN email_delivery_id VARCHAR(100);"))
                else:
                    conn.execute(text("ALTER TABLE calendly_trackings ADD COLUMN IF NOT EXISTS email VARCHAR(255);"))
                    conn.execute(text("ALTER TABLE calendly_trackings ADD COLUMN IF NOT EXISTS email_delivery_id VARCHAR(100);"))
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
