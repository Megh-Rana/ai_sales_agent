#!/usr/bin/env python3
"""
Database Migration Runner
Applies non-breaking schema changes for test case improvements
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text, inspect
from app.db.database import engine, is_sqlite


MIGRATION_COLUMNS = [
    # (table, column, type_and_default_sqlite, type_and_default_postgres)
    ("profiles", "subscription_tier", "VARCHAR(50) DEFAULT 'Starter' NOT NULL", "VARCHAR(50) DEFAULT 'Starter' NOT NULL"),
    ("campaigns", "timezone", "VARCHAR(50) DEFAULT 'UTC' NOT NULL", "VARCHAR(50) DEFAULT 'UTC' NOT NULL"),
    ("campaigns", "business_hours_start", "VARCHAR(10) DEFAULT '09:00' NOT NULL", "VARCHAR(10) DEFAULT '09:00' NOT NULL"),
    ("campaigns", "business_hours_end", "VARCHAR(10) DEFAULT '18:00' NOT NULL", "VARCHAR(10) DEFAULT '18:00' NOT NULL"),
    ("campaigns", "repeat_enabled", "VARCHAR(10) DEFAULT 'false' NOT NULL", "VARCHAR(10) DEFAULT 'false' NOT NULL"),
    ("campaigns", "repeat_schedule", "VARCHAR(50)", "VARCHAR(50)"),
    ("leads", "preferred_language", "VARCHAR(10) DEFAULT 'en' NOT NULL", "VARCHAR(10) DEFAULT 'en' NOT NULL"),
]

MIGRATION_INDEXES = [
    ("idx_profiles_subscription_tier", "profiles", "subscription_tier"),
    ("idx_campaigns_timezone", "campaigns", "timezone"),
    ("idx_campaigns_repeat_enabled", "campaigns", "repeat_enabled"),
    ("idx_leads_preferred_language", "leads", "preferred_language"),
]


def run_migration():
    """Run the improvements migration across supported database engines (SQLite and PostgreSQL)"""
    print("=" * 70)
    print("Database Migration: Add Improvements Fields")
    print("=" * 70)
    print()

    try:
        print("📊 Connecting to database...")
        with engine.connect() as conn:
            if is_sqlite:
                db_name = engine.url.database or "SQLite (local)"
            else:
                db_name = conn.execute(text("SELECT current_database()")).scalar()
            print(f"✓ Connected to database: {db_name} (engine: {'SQLite' if is_sqlite else 'PostgreSQL'})")
            print()

            print("🔄 Applying migrations...")
            # Ensure base tables exist before running schema migrations
            from app.db.database import init_db
            init_db()

            inspector = inspect(conn)
            existing_tables = set(inspector.get_table_names())

            for table, col, sqlite_def, pg_def in MIGRATION_COLUMNS:
                if table not in existing_tables:
                    print(f"  ⚠ Table '{table}' does not exist yet, skipping column '{col}'")
                    continue

                existing_cols = {c["name"] for c in inspector.get_columns(table)}
                if col not in existing_cols:
                    col_def = sqlite_def if is_sqlite else pg_def
                    if is_sqlite:
                        sql = f"ALTER TABLE {table} ADD COLUMN {col} {col_def};"
                    else:
                        sql = f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_def};"
                    conn.execute(text(sql))
                    conn.commit()
                    # Re-inspect so subsequent checks see the newly added column
                    inspector = inspect(conn)
                    print(f"  ✓ Added {table}.{col}")
                else:
                    print(f"  ℹ Column {table}.{col} already exists")

            # Create indexes
            for idx_name, table, col in MIGRATION_INDEXES:
                if table in existing_tables:
                    try:
                        conn.execute(text(f"CREATE INDEX IF NOT EXISTS {idx_name} ON {table}({col});"))
                        conn.commit()
                    except Exception:
                        pass

            print("-" * 70)
            print()

            # Verify columns exist
            print("✓ Verifying new columns...")
            inspector = inspect(conn)
            all_exist = True
            for table, col, _, _ in MIGRATION_COLUMNS:
                if table not in existing_tables:
                    continue
                current_cols = {c["name"] for c in inspector.get_columns(table)}
                exists = col in current_cols
                status = "✓" if exists else "✗"
                print(f"  {status} {table}.{col}")
                if not exists:
                    all_exist = False

            print()

            if all_exist:
                print("=" * 70)
                print("✅ Migration completed successfully!")
                print("=" * 70)
                print()
                print("Summary:")
                print("  • Added subscription_tier to profiles (TC-46)")
                print("  • Added timezone & scheduling to campaigns (TC-35, TC-37)")
                print("  • Added preferred_language to leads (TC-33)")
                print("  • Created indexes for new columns")
                print()
                return True
            else:
                print("❌ Migration verification failed - some columns are missing")
                return False

    except Exception as e:
        print()
        print("=" * 70)
        print("❌ Migration failed!")
        print("=" * 70)
        print(f"Error: {e}")
        print()
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
