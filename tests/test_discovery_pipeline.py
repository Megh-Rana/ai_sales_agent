import os
import sys
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

BACKEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.database import Base
from app.services.discovery_service import DiscoveryService
from app.db.models.lead import Lead

class TestDiscoveryPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(cls.engine)
        cls.Session = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.Session()

    def tearDown(self):
        self.db.close()

    def test_tc01_sharepoint_discovery_query(self):
        """
        Verify that searching Industry='IT Services', Location='Global', Keyword='SharePoint Implementation'
        returns the SharePoint Implementation Partner lead with complete 11 enrichment fields.
        """
        response = DiscoveryService.scan_public_sources(
            db=self.db,
            keywords="SharePoint Implementation",
            industry="IT Services",
            location="Global"
        )

        self.assertGreaterEqual(response.total_discovered, 1, "Expected at least 1 lead matching SharePoint query")
        
        # Check that the lead is persisted in DB
        db_leads = self.db.query(Lead).filter(Lead.requirement.like("%SharePoint%")).all()
        self.assertGreaterEqual(len(db_leads), 1, "Discovered lead must be persisted in database")

        lead = response.leads[0]
        
        # Validate 11 mandatory enrichment attributes
        self.assertTrue(lead.name and lead.name != "unavailable", "Contact Name should be present")
        self.assertTrue(lead.company_name and lead.company_name != "unavailable", "Company Name should be present")
        self.assertEqual(lead.industry, "IT Services", "Industry should match")
        self.assertEqual(lead.location, "Global", "Location should match")
        self.assertTrue(lead.job_title and lead.job_title != "unavailable", "Job Title should be present")
        self.assertTrue(lead.company_size and lead.company_size != "unavailable", "Company Size should be present")
        self.assertTrue(lead.source_platform and lead.source_platform != "unavailable", "Source Platform must be valid")
        self.assertTrue(lead.original_post_url.startswith("http"), "Original Requirement Post URL must be valid and clickable")
        self.assertTrue(lead.linkedin_profile.startswith("http"), "LinkedIn Profile must be valid and clickable")
        self.assertTrue(lead.website.startswith("http"), "Website must be valid and clickable")
        self.assertTrue(bool(lead.discovery_date), "Discovery Date must be populated")

        # Verify fallback for non-public contact information
        # GlobalNet IT Solutions fixture has email and phone set to 'unavailable'
        self.assertEqual(lead.business_email, "unavailable", "Missing email should be 'unavailable' rather than blank/null")
        self.assertEqual(lead.phone, "unavailable", "Missing phone should be 'unavailable' rather than blank/null")

    def test_multi_source_query(self):
        """Verify multi-source public query across LinkedIn, RFP Portals, and Freelance Boards."""
        response = DiscoveryService.scan_public_sources(
            db=self.db,
            keywords="Voice AI Calling",
            sources=["LinkedIn", "Public B2B RFP Directories", "Freelance Job Boards"]
        )
        self.assertGreaterEqual(response.total_discovered, 1)
        self.assertTrue(all(l.original_post_url.startswith("http") for l in response.leads))

    def test_non_linkedin_source_returns_and_enriches_lead_end_to_end(self):
        """
        Verify that a non-LinkedIn source (e.g. Company Website RFP crawler or X/Twitter)
        successfully returns, enriches, and persists a lead end-to-end.
        """
        response = DiscoveryService.scan_public_sources(
            db=self.db,
            keywords="Enterprise ERP Integration",
            sources=["Company Website RFP"]
        )

        self.assertGreaterEqual(response.total_discovered, 1, "Expected at least 1 lead from Company Website RFP source")
        lead = response.leads[0]

        # Verify accurate Source Platform attribution
        self.assertEqual(lead.source_platform, "Company Website RFP")
        self.assertTrue(lead.original_post_url.startswith("https://nexus-retail.example.internal"))
        self.assertEqual(lead.company_name, "Nexus Retail Technologies")
        self.assertTrue(lead.business_email and lead.business_email != "unavailable")
        self.assertTrue(lead.phone and lead.phone != "unavailable")
        self.assertEqual(lead.signal_type, "direct_requirement")
        self.assertFalse(lead.is_inferred_from_hiring)

        # Verify database persistence
        db_lead = self.db.query(Lead).filter(Lead.company_name == "Nexus Retail Technologies").first()
        self.assertIsNotNone(db_lead, "Discovered company website lead must be persisted in database")
        self.assertEqual(db_lead.source, "Company Website RFP")

    def test_job_posting_inferred_lead_tagged_correctly(self):
        """
        Verify that job-posting-inferred leads are correctly deduced and tagged
        with is_inferred_from_hiring=True, signal_type='inferred_hiring_signal',
        and an explanatory inferred_need_basis.
        """
        response = DiscoveryService.scan_public_sources(
            db=self.db,
            keywords="SharePoint Implementation",
            sources=["Job Board (Hiring Signal)"]
        )

        self.assertGreaterEqual(response.total_discovered, 1, "Expected at least 1 job inference lead")
        lead = response.leads[0]

        # Assert visual distinction tags
        self.assertEqual(lead.source_platform, "Job Board (Hiring Signal)")
        self.assertTrue(lead.is_inferred_from_hiring, "Must be tagged as is_inferred_from_hiring=True")
        self.assertEqual(lead.signal_type, "inferred_hiring_signal", "signal_type must be 'inferred_hiring_signal'")
        self.assertIsNotNone(lead.inferred_need_basis, "inferred_need_basis must explain hiring deduction")
        self.assertIn("Hiring signal", lead.inferred_need_basis)

        # Verify database persistence & intelligence linkage
        db_lead = self.db.query(Lead).filter(Lead.company_name == lead.company_name).first()
        self.assertIsNotNone(db_lead, "Inferred lead must be stored in database")
        self.assertEqual(db_lead.source, "Job Board (Hiring Signal)")

    def test_adapter_resilience_on_failure(self):
        """
        Verify that if one adapter fails or throws an exception,
        the multi-source orchestrator gracefully continues and other adapters return results.
        """
        from app.services.discovery_adapters.orchestrator import MultiSourceDiscoveryOrchestrator
        from app.services.discovery_adapters.base import SourceAdapter, RawDiscoveredPost

        class BrokenFailingAdapter(SourceAdapter):
            @property
            def name(self) -> str:
                return "Broken Adapter"
            @property
            def category(self) -> str:
                return "social"
            @property
            def is_live(self) -> bool:
                return False
            def search(self, keyword, industry=None, location=None, max_results=20):
                raise ConnectionError("Simulated upstream carrier rate limit or network partition")

        orchestrator = MultiSourceDiscoveryOrchestrator()
        orchestrator.adapters["broken"] = BrokenFailingAdapter()

        # Run fan-out search: must NOT raise an exception
        results = orchestrator.fan_out_search(keyword="SharePoint Implementation")
        self.assertGreaterEqual(len(results), 1, "Surviving adapters must still return results despite broken adapter")
        self.assertTrue(any(r.source_platform == "LinkedIn" for r in results))


if __name__ == "__main__":
    unittest.main()

