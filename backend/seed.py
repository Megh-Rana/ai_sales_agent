"""
Deterministic development seed script for the AI Sales Agent Platform.
Populates sample businesses, leads, intelligence storage, and calls.

IMPORTANT:
All data created by this script is strictly synthetic DEMO data.
No real individuals, entities, or scrapers are utilized.
Target database is Supabase PostgreSQL via DATABASE_URL.
"""
import sys
import uuid
from sqlalchemy import select
from app.db.database import SessionLocal, check_db_connection
from app.db.models import Business, Lead, LeadIntelligence, Call, Profile


def seed_demo_data():
    print("Checking Supabase PostgreSQL database connectivity...")
    if not check_db_connection():
        print("Error: Could not establish connection to Supabase PostgreSQL database.", file=sys.stderr)
        print("Please verify DATABASE_URL in your environment or .env file.", file=sys.stderr)
        sys.exit(1)

    print("Seeding synthetic DEMO data into Supabase PostgreSQL (public schema)...")
    db = SessionLocal()

    try:
        # Check if DEMO business already exists
        existing_demo = db.scalars(
            select(Business).where(Business.name == "DEMO - CloudScale Systems")
        ).first()

        if existing_demo:
            print("DEMO data already present in database. Skipping.")
            return

        # 0. Create Demo Profile
        demo_owner_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        demo_owner_email = "demo-owner@cloudscale.example.internal"
        demo_profile = db.scalars(select(Profile).where(Profile.id == demo_owner_id)).first()
        if not demo_profile:
            demo_profile = Profile(
                id=demo_owner_id,
                email=demo_owner_email,
                full_name="Demo Platform Owner",
            )
            db.add(demo_profile)
            db.commit()
            db.refresh(demo_profile)
            print(f"Created DEMO Profile: {demo_profile.email} (ID: {demo_profile.id})")

        # 1. Create Demo Business
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
        print(f"Created DEMO Business: {demo_business.name} (ID: {demo_business.id})")

        # 2. Create Demo Leads
        lead1 = Lead(
            business_id=demo_business.id,
            company_name="DEMO PROSPECT - Apex Financial Tech",
            contact_name="DEMO CONTACT - Alex Morgan",
            contact_email="alex.morgan@demo-apexfin.example.internal",
            contact_phone="+1-555-0111",
            requirement="Seeking automated infrastructure migration pipeline for SOC2 compliance.",
            industry="Financial Technology",
            location="New York, NY (DEMO)",
            source="demo_inbound_form",
            source_url="https://demo.example.internal/request-quote",
            status="qualified",
            intent_score=88.5,  # Stored synthetic score
        )

        lead2 = Lead(
            business_id=demo_business.id,
            company_name="DEMO PROSPECT - BioHealth Logistics",
            contact_name="DEMO CONTACT - Jordan Taylor",
            contact_email="jordan.taylor@demo-biohealth.example.internal",
            contact_phone="+1-555-0122",
            requirement="Evaluating multi-region database latency reduction solutions.",
            industry="Healthcare Logistics",
            location="Boston, MA (DEMO)",
            source="demo_webinar",
            source_url="https://demo.example.internal/webinar-replay",
            status="new",
            intent_score=62.0,  # Stored synthetic score
        )

        lead3 = Lead(
            business_id=demo_business.id,
            company_name="DEMO PROSPECT - RetailPulse Analytics",
            contact_name="DEMO CONTACT - Casey Kim",
            contact_email="casey.kim@demo-retailpulse.example.internal",
            contact_phone="+1-555-0133",
            requirement="Comparing cost models for high-throughput stream processing.",
            industry="Retail Analytics",
            location="Seattle, WA (DEMO)",
            source="demo_partner_referral",
            source_url="https://demo.example.internal/partner-lead",
            status="contacted",
            intent_score=45.0,  # Stored synthetic score
        )

        db.add_all([lead1, lead2, lead3])
        db.commit()
        db.refresh(lead1)
        db.refresh(lead2)
        db.refresh(lead3)
        print(f"Created 3 DEMO Leads for business {demo_business.name}")

        # 3. Create Demo Lead Intelligence (Storage Only)
        intel1 = LeadIntelligence(
            lead_id=lead1.id,
            company_description="Mid-market financial analytics SaaS undergoing multi-cloud transition.",
            pain_points=[
                "High cloud infrastructure egress costs",
                "Manual multi-region disaster recovery testing"
            ],
            buying_signals=[
                "Hired new Chief Information Security Officer last month",
                "Recently announced international expansion in APAC"
            ],
            why_now="Current infrastructure support contract renewal due in 60 days.",
            technology=["PostgreSQL", "Kubernetes", "FastAPI", "Terraform"],
            hiring_signals=["5 open DevOps Engineer positions listed"],
            funding_signals=["Raised $22M Series B in Q2"],
            competitors=["Legacy Cloud Host A", "Self-managed DC B"],
            research_summary="High-intent prospect with imminent renewal deadline and budgeted expansion.",
        )
        db.add(intel1)

        # 4. Create Demo Call
        call1 = Call(
            lead_id=lead1.id,
            status="completed",
            language="en",
            duration=420,
            transcript=(
                "AGENT: Good morning, Alex. Thank you for connecting regarding Apex's multi-cloud journey.\n"
                "PROSPECT: Hi, yes. We are actively reviewing alternatives before our renewal in November.\n"
                "AGENT: Understood. Let's arrange an architectural walkthrough with our solutions specialist.\n"
                "PROSPECT: Perfect, please send a calendar invite for Thursday at 2 PM."
            ),
            outcome="meeting_booked",
        )
        db.add(call1)

        # 5. Create Second Demo Profile & Business (to demonstrate multi-tenant isolation)
        demo_owner_2_id = uuid.UUID("00000000-0000-0000-0000-000000000002")
        demo_owner_2_email = "demo-owner2@dataflow.example.internal"
        demo_profile_2 = db.scalars(select(Profile).where(Profile.id == demo_owner_2_id)).first()
        if not demo_profile_2:
            demo_profile_2 = Profile(
                id=demo_owner_2_id,
                email=demo_owner_2_email,
                full_name="Secondary Demo Owner",
            )
            db.add(demo_profile_2)
            db.commit()
            db.refresh(demo_profile_2)
            print(f"Created DEMO Profile 2: {demo_profile_2.email} (ID: {demo_profile_2.id})")

        demo_business_2 = Business(
            owner_id=demo_profile_2.id,
            name="DEMO - DataFlow Labs",
            industry="Data Streaming Infrastructure",
            description="Synthetic second demo organization providing real-time data streaming engines.",
            website="https://demo-dataflow.example.internal",
            location="Austin, TX (DEMO)",
            contact_email="demo-sales@dataflow.example.internal",
            contact_phone="+1-555-0200",
        )
        db.add(demo_business_2)
        db.commit()
        db.refresh(demo_business_2)
        print(f"Created DEMO Business 2: {demo_business_2.name} (ID: {demo_business_2.id})")

        lead4 = Lead(
            business_id=demo_business_2.id,
            company_name="DEMO PROSPECT - Meridian Health",
            contact_name="DEMO CONTACT - Sarah Connor",
            contact_email="sarah.connor@demo-meridian.example.internal",
            contact_phone="+1-555-0211",
            requirement="Evaluating zero-latency streaming pipelines for patient monitor telemetry.",
            industry="Healthcare Technology",
            location="Chicago, IL (DEMO)",
            source="demo_inbound_demo",
            source_url="https://demo.example.internal/request-eval",
            status="new",
            intent_score=75.0,
        )
        lead5 = Lead(
            business_id=demo_business_2.id,
            company_name="DEMO PROSPECT - Quantex Capital",
            contact_name="DEMO CONTACT - David Zhao",
            contact_email="david.zhao@demo-quantex.example.internal",
            contact_phone="+1-555-0222",
            requirement="Ultra-low latency market feed ingestion for quantitative strategies.",
            industry="Capital Markets",
            location="New York, NY (DEMO)",
            source="demo_conference",
            source_url="https://demo.example.internal/quant-summit",
            status="qualified",
            intent_score=91.0,
        )
        db.add_all([lead4, lead5])
        db.commit()
        print(f"Created 2 DEMO Leads for business {demo_business_2.name}")

        print("DEMO multi-tenant data seeded successfully into Supabase PostgreSQL!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding demo data: {e}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
