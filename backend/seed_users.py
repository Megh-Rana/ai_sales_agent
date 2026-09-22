"""
seed_users.py — Seeds default admin and sales_rep users for development/testing.
Run from backend/ directory: python seed_users.py
"""
import sys
sys.path.insert(0, '.')

from app.db.database import SessionLocal
from app.services.auth_service import register_user

SEED_USERS = [
    {
        "email": "admin@vidur.in",
        "password": "admin@2026",
        "full_name": "Vidur Administrator",
        "role": "admin",
    },
    {
        "email": "neel@vidur.in",
        "password": "neelit002",
        "full_name": "Neel Agrawal",
        "role": "admin",
    },
    {
        "email": "megh@vidur.in",
        "password": "meghce099",
        "full_name": "Megh Rana",
        "role": "admin",
    },
    {
        "email": "admin@vidur.ai",
        "password": "Admin@Vidur2024!",
        "full_name": "Vidur Admin",
        "role": "admin",
    },
    {
        "email": "rep@vidur.ai",
        "password": "Rep@Vidur2024!",
        "full_name": "Test Rep",
        "role": "sales_rep",
    },
]

db = SessionLocal()
for user in SEED_USERS:
    try:
        profile = register_user(
            db=db,
            email=user["email"],
            password=user["password"],
            full_name=user["full_name"],
            role=user["role"],
        )
        print(f"Created: {profile.email} (role={profile.role})")
    except ValueError as e:
        print(f"Skipped (already exists): {user['email']} — {e}")
db.close()
print("Seed complete.")
