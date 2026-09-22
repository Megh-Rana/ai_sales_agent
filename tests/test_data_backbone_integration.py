import os
import sys
import uuid
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(WORKSPACE_ROOT, "backend")
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.models import Base, Profile, Business, Lead, Call, Campaign, CampaignLead
from app.services.lead_service import LeadService
from app.services.campaign_service import CampaignService
from app.services.call_service import CallService
from app.services.analytics_service import AnalyticsService
from app.schemas.lead import LeadCreate
from app.schemas.campaign import CampaignCreate, CampaignLeadCreate
from app.schemas.call import CallCreate


class TestDataBackboneIntegration(unittest.TestCase):
    def setUp(self):
        # Use in-memory SQLite for deterministic, isolated integration testing
        self.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(bind=self.engine)
        self.Session = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = self.Session()

        # Seed test profile & business
        self.owner_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
        self.profile = Profile(id=self.owner_id, email="tester@vidur.internal", full_name="Integration Tester")
        self.db.add(self.profile)

        self.business_id = uuid.UUID("22222222-2222-2222-2222-222222222222")
        self.business = Business(
            id=self.business_id,
            owner_id=self.owner_id,
            name="Vidur Technologies Inc.",
            industry="Artificial Intelligence",
            location="San Francisco, CA",
        )
        self.db.add(self.business)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_full_backbone_journey(self):
        """
        End-to-End Integration Journey:
        1. Create a lead via Discovery
        2. Push it into a Campaign (asserting identical lead_id)
        3. Query baseline Analytics
        4. Simulate a call outcome (asserting DB update)
        5. Assert Analytics funnel numbers dynamically change
        """
        # -------------------------------------------------------------
        # Step 1: Create lead via Discovery
        # -------------------------------------------------------------
        lead_input = LeadCreate(
            business_id=self.business_id,
            company_name="Helios Renewable Energy",
            contact_name="Elena Vance",
            contact_email="elena.vance@heliosenergy.example.com",
            contact_phone="+1-555-432-1000",
            requirement="Seeking autonomous AI dialer to qualify solar installation inbound inquiries.",
            industry="CleanTech & Solar",
            location="Denver, CO",
            source="IndiaMART Tenders",
            source_url="https://example.com/tenders/helios-99",
            status="new",
            intent_score=92.5,
        )
        created_lead = LeadService.create_lead(self.db, lead_input, owner_id=self.owner_id)
        self.assertIsNotNone(created_lead.id, "Discovery lead must be assigned a persistent database ID.")
        lead_db_id = created_lead.id

        # -------------------------------------------------------------
        # Step 2: Push lead into a Campaign with identical ID
        # -------------------------------------------------------------
        camp_input = CampaignCreate(
            name="Q3 CleanTech Enterprise Surge",
            objective="REQUIREMENT_RESPONSE",
            primary_channel="AI_VOICE_CALL",
            status="RUNNING",
            estimated_pipeline_value="₹55.0L",
            business_id=self.business_id,
            lead_ids=[lead_db_id],
            leads=[
                CampaignLeadCreate(
                    lead_id=lead_db_id,
                    custom_opening_hook="Hi Elena, noticed Helios is expanding solar sales across the Rockies...",
                    custom_value_prop="Vidur AI eliminates lead qualification lag and books site audits automatically.",
                    status="QUEUED",
                )
            ],
        )
        created_camp = CampaignService.create_campaign(self.db, camp_input, owner_id=self.owner_id)
        self.assertEqual(len(created_camp.leads), 1, "Campaign must contain exactly 1 attached lead.")

        # Acceptance criteria: Lead created via Discovery appears with the SAME ID inside Campaign lead list
        camp_lead_ref = created_camp.leads[0]
        self.assertEqual(
            camp_lead_ref.lead_id,
            lead_db_id,
            f"Campaign lead must reference the real lead_id from DB: expected {lead_db_id}, got {camp_lead_ref.lead_id}",
        )
        self.assertEqual(camp_lead_ref.company_name, "Helios Renewable Energy")
        self.assertEqual(camp_lead_ref.status, "QUEUED")

        # -------------------------------------------------------------
        # Step 3: Query baseline Analytics funnel metrics
        # -------------------------------------------------------------
        baseline_metrics = AnalyticsService.get_metrics(self.db, owner_id=self.owner_id)
        self.assertEqual(baseline_metrics.discoveredCount, 1, "Discovered count must be 1 from DB.")
        self.assertEqual(baseline_metrics.contactedCount, 0, "Initial contacted count must be 0.")
        self.assertEqual(baseline_metrics.interestedCount, 0, "Initial interested count must be 0.")
        self.assertEqual(baseline_metrics.convertedCount, 0, "Initial converted count must be 0.")

        # -------------------------------------------------------------
        # Step 4: Simulate a call outcome (Dialer execution)
        # -------------------------------------------------------------
        call_input = CallCreate(
            lead_id=lead_db_id,
            status="completed",
            language="en",
            duration=310,
            transcript="AGENT: Hello Elena, calling regarding Helios solar inquiry...\nPROSPECT: Yes, let us book a demo.",
            outcome="meeting_booked",
            provider="browser_voice",
        )
        call_rec = CallService.create_call(self.db, call_input, owner_id=self.owner_id)
        self.assertIsNotNone(call_rec.id, "Call record must be saved in database.")

        # Verify DB status synchronization
        refreshed_lead = LeadService.get_lead(self.db, lead_db_id, owner_id=self.owner_id)
        self.assertEqual(
            refreshed_lead.status,
            "converted",
            "Lead status in DB must automatically update to 'converted' following a meeting_booked call outcome.",
        )

        refreshed_camp = CampaignService.get_campaign(self.db, created_camp.id, owner_id=self.owner_id)
        self.assertEqual(
            refreshed_camp.leads[0].status,
            "CONVERTED",
            "Campaign lead outreach status in DB must automatically synchronize to 'CONVERTED'.",
        )

        # -------------------------------------------------------------
        # Step 5: Assert Analytics endpoint reflects updated funnel counts
        # -------------------------------------------------------------
        updated_metrics = AnalyticsService.get_metrics(self.db, owner_id=self.owner_id)

        # Acceptance criteria: After call outcome is recorded, funnel numbers change accordingly (not static)
        self.assertEqual(
            updated_metrics.contactedCount,
            1,
            "Analytics contacted count must dynamically increment to 1.",
        )
        self.assertEqual(
            updated_metrics.interestedCount,
            1,
            "Analytics interested count must dynamically increment to 1.",
        )
        self.assertEqual(
            updated_metrics.convertedCount,
            1,
            "Analytics converted/meeting booked count must dynamically increment to 1.",
        )
        self.assertEqual(
            updated_metrics.conversionRate,
            100.0,
            "Conversion rate must dynamically compute (1 / 1 = 100%).",
        )

        # Verify funnel stages list
        stages_by_id = {s.stageId: s for s in updated_metrics.funnelStages}
        self.assertEqual(stages_by_id["discovered"].count, 1)
        self.assertEqual(stages_by_id["contacted"].count, 1)
        self.assertEqual(stages_by_id["qualified"].count, 1)
        self.assertEqual(stages_by_id["meeting"].count, 1)

        # Verify call performance
        self.assertEqual(updated_metrics.callPerformance.totalCalls, 1)
        self.assertEqual(updated_metrics.callPerformance.avgDurationSeconds, 310)
        self.assertEqual(updated_metrics.callPerformance.qualifiedCalls, 1)

        print("\n[SUCCESS] All data backbone integration checks passed successfully!")


if __name__ == "__main__":
    unittest.main()
