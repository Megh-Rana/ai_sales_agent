import json
import os
import re
import sys
import uuid

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_ROOT = os.path.dirname(BACKEND_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import select
from app.db.database import SessionLocal, init_db
from app.db.models import Business, Lead, LeadIntelligence, Profile, Campaign, CampaignLead


def deterministic_uuid(lead_id_str: str) -> uuid.UUID:
    """Map string like 'lead-101' to deterministic UUID '00000000-0000-0000-0001-000000000101'."""
    match = re.search(r"(\d+)$", lead_id_str)
    if match:
        num = int(match.group(1))
        return uuid.UUID(f"00000000-0000-0000-0001-{num:012d}")
    return uuid.uuid5(uuid.NAMESPACE_DNS, lead_id_str)


def parse_and_seed_discovery_leads():
    init_db()
    db = SessionLocal()

    try:
        # Ensure demo owner and business exist
        demo_owner_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        demo_profile = db.scalars(select(Profile).where(Profile.id == demo_owner_id)).first()
        if not demo_profile:
            demo_profile = Profile(
                id=demo_owner_id,
                email="demo-owner@cloudscale.example.internal",
                full_name="Demo Platform Owner",
            )
            db.add(demo_profile)
            db.commit()
            db.refresh(demo_profile)

        demo_business = db.scalars(
            select(Business).where(Business.name == "DEMO - CloudScale Systems")
        ).first()
        if not demo_business:
            demo_business = Business(
                owner_id=demo_profile.id,
                name="DEMO - CloudScale Systems",
                industry="Cloud Infrastructure",
                description="Synthetic demo business organization providing cloud deployment automation.",
                website="https://demo-cloudscale.example.internal",
                location="San Francisco, CA (DEMO)",
                contact_email="demo-sales@cloudscale.example.internal",
                contact_phone="+1-555-0100",
            )
            db.add(demo_business)
            db.commit()
            db.refresh(demo_business)

        leads_file = os.path.join(WORKSPACE_ROOT, "src", "data", "leads.ts")
        if not os.path.exists(leads_file):
            print(f"Error: {leads_file} not found.")
            return

        with open(leads_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract blocks for each lead
        lead_blocks = re.findall(r"\{\s*id:\s*['\"](lead-\d+)['\"].*?\n\s*\},", content, re.DOTALL)
        # Or parse lead entries using regex matches
        matches = re.finditer(
            r"id:\s*['\"](lead-\d+)['\"],"
            r".*?companyName:\s*['\"](.*?)['\"],"
            r".*?companyDomain:\s*['\"](.*?)['\"],"
            r".*?industry:\s*['\"](.*?)['\"],"
            r".*?location:\s*['\"](.*?)['\"],"
            r".*?employeeCount:\s*['\"](.*?)['\"],"
            r".*?requirement:\s*['\"](.*?)['\"],"
            r".*?intentScore:\s*(\d+),",
            content,
            re.DOTALL,
        )

        seeded_count = 0
        for m in matches:
            lead_key = m.group(1)
            company_name = m.group(2)
            domain = m.group(3)
            industry = m.group(4)
            location = m.group(5)
            requirement = m.group(7)
            intent_score = float(m.group(8))
            lead_uuid = deterministic_uuid(lead_key)

            # Check if lead already exists
            existing = db.scalars(select(Lead).where(Lead.id == lead_uuid)).first()
            lead_chunk = content[m.start():content.find("},", m.end()) + 2]
            contact_match = re.search(r"name:\s*['\"](.*?)['\"]", lead_chunk)
            contact_name = contact_match.group(1) if contact_match else f"{company_name} Lead"

            role_match = re.search(r"role:\s*['\"](.*?)['\"]", lead_chunk)
            job_title = role_match.group(1) if role_match else "Commercial Executive"

            source_match = re.search(r"platform:\s*['\"](.*?)['\"]", lead_chunk)
            source_platform = source_match.group(1) if source_match else "Discovery"

            source_url_match = re.search(r"sourceUrl:\s*['\"](.*?)['\"]", lead_chunk)
            source_url = source_url_match.group(1) if source_url_match else f"https://{domain}"

            linkedin_url = f"https://www.linkedin.com/company/{re.sub(r'[^a-zA-Z0-9]+', '-', company_name).strip('-').lower()}"
            website_url = f"https://{domain}"

            if not existing:
                lead = Lead(
                    id=lead_uuid,
                    business_id=demo_business.id,
                    company_name=company_name,
                    contact_name=contact_name,
                    contact_email="meghrana2007@gmail.com",
                    contact_phone="+918320441189",
                    requirement=requirement,
                    industry=industry,
                    location=location,
                    source=source_platform,
                    source_url=source_url,
                    status="new",
                    intent_score=intent_score,
                    job_title=job_title,
                    company_size=m.group(6),
                    linkedin_url=linkedin_url,
                    website=website_url,
                )
                db.add(lead)
                seeded_count += 1
            else:
                existing.contact_phone = os.getenv("DEFAULT_DESTINATION_PHONE", "+918320441189")
                existing.contact_email = os.getenv("DEFAULT_DESTINATION_EMAIL", "meghrana2007@gmail.com")
                # Update enrichment columns if missing
                if not existing.job_title:
                    existing.job_title = job_title
                if not existing.company_size:
                    existing.company_size = m.group(6)
                if not existing.linkedin_url:
                    existing.linkedin_url = linkedin_url
                if not existing.website:
                    existing.website = website_url

        db.commit()
        all_leads = db.scalars(select(Lead)).all()
        print(f"[SUCCESS] Discovery leads seeded/updated. Newly inserted: {seeded_count}. Total in DB: {len(all_leads)}.")

    finally:
        db.close()


if __name__ == "__main__":
    parse_and_seed_discovery_leads()
