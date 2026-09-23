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

from sqlalchemy import text
from app.db.database import engine


def run_migration():
    """Run the improvements migration SQL script"""
    
    migration_file = Path(__file__).parent / "migrations" / "add_improvements_fields.sql"
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        return False
    
    print("=" * 70)
    print("Database Migration: Add Improvements Fields")
    print("=" * 70)
    print()
    
    # Read migration SQL
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    try:
        print("📊 Connecting to database...")
        with engine.connect() as conn:
            # Check current database
            result = conn.execute(text("SELECT current_database()"))
            db_name = result.scalar()
            print(f"✓ Connected to database: {db_name}")
            print()
            
            print("🔄 Applying migrations...")
            print("-" * 70)
            
            # Execute migration (it's wrapped in BEGIN/COMMIT)
            conn.execute(text(migration_sql))
            conn.commit()
            
            print("-" * 70)
            print()
            
            # Verify columns exist
            print("✓ Verifying new columns...")
            
            tables_to_check = [
                ("profiles", "subscription_tier"),
                ("campaigns", "timezone"),
                ("campaigns", "business_hours_start"),
                ("campaigns", "business_hours_end"),
                ("campaigns", "repeat_enabled"),
                ("campaigns", "repeat_schedule"),
                ("leads", "preferred_language"),
            ]
            
            all_exist = True
            for table, column in tables_to_check:
                check_sql = text("""
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = :table AND column_name = :column
                    )
                """)
                result = conn.execute(check_sql, {"table": table, "column": column})
                exists = result.scalar()
                
                status = "✓" if exists else "✗"
                print(f"  {status} {table}.{column}")
                
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
