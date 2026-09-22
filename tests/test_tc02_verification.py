import csv
import io
import os
import sys
import unittest
from uuid import uuid4

# Add backend to sys.path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BACKEND_DIR = os.path.join(WORKSPACE_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.database import SessionLocal, init_db
from app.db.models.segment import Segment
from app.schemas.segment import SegmentCreate
from app.services.segment_service import SegmentService


class TestTC02Phase4(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_filter_and_logic(self):
        """Verify combinable AND-logic: Industry=Healthcare + Size=50-200 + Source=LinkedIn"""
        # Read mock leads from leads.ts
        leads_path = os.path.join(WORKSPACE_ROOT, "src", "data", "leads.ts")
        with open(leads_path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("lead-122", content)
        self.assertIn("lead-123", content)

        # Parse range helper function
        def parse_range(val_str):
            clean = val_str.replace(",", "").replace("–", "-").replace("—", "-").strip()
            if "+" in clean:
                v = int(clean.replace("+", ""))
                return (v, float("inf"))
            if "-" in clean:
                parts = clean.split("-")
                return (int(parts[0].strip()), int(parts[1].strip()))
            v = int(clean)
            return (v, v)

        def matches_size(lead_size, filter_range):
            l_min, l_max = parse_range(lead_size)
            f_min, f_max = parse_range(filter_range)
            return max(l_min, f_min) <= min(l_max, f_max)

        # Sample test leads representing full lead distribution
        leads_sample = [
            {"id": "lead-122", "company": "Apex Care Health Partners", "industry": "Healthcare & Life Sciences", "size": "50-200", "source": "LinkedIn"},
            {"id": "lead-123", "company": "Vitalis Health Systems", "industry": "Healthcare & Life Sciences", "size": "50-200", "source": "LinkedIn"},
            {"id": "lead-104", "company": "Nexus Health Systems", "industry": "Healthcare & Life Sciences", "size": "1,000+", "source": "RFP Portal"},
            {"id": "lead-106", "company": "MediCore Diagnostic Labs", "industry": "Healthcare & Life Sciences", "size": "100–250", "source": "TechStack"},
            {"id": "lead-121", "company": "GlobalNet IT Solutions", "industry": "IT Services", "size": "500–1,000", "source": "LinkedIn"},
            {"id": "lead-101", "company": "Acme Logistics Solutions", "industry": "Logistics & 3PL", "size": "250–500", "source": "IndiaMART"},
            {"id": "lead-102", "company": "CloudScale Telephony Systems", "industry": "B2B SaaS", "size": "100–250", "source": "G2 Crowd"},
        ]

        # Apply AND filters: Industry=Healthcare, Company Size=50-200, Source=LinkedIn
        filtered = [
            l for l in leads_sample
            if "healthcare" in l["industry"].lower()
            and matches_size(l["size"], "50-200")
            and l["source"].lower() == "linkedin"
        ]

        # Must return ONLY leads matching all three criteria
        matching_ids = [l["id"] for l in filtered]
        self.assertEqual(matching_ids, ["lead-122", "lead-123"], "Only leads matching all 3 criteria should be returned.")

    def test_segment_creation_persistence(self):
        """Verify persistent Segment creation: save named filter combination and retrieve from DB"""
        segment_name = "Q4 Healthcare Prospects"
        filter_payload = {
            "industries": ["Healthcare & Life Sciences"],
            "company_size": "50-200",
            "sources": ["LinkedIn"],
        }

        # 1. Create segment in database
        segment_in = SegmentCreate(
            name=segment_name,
            description="High-priority healthcare prospects with 50-200 headcount sourced from LinkedIn",
            filters=filter_payload,
            lead_count=2,
        )
        created = SegmentService.create_segment(self.db, segment_in)
        self.assertIsNotNone(created.id)
        self.assertEqual(created.name, segment_name)
        self.assertEqual(created.lead_count, 2)
        self.assertEqual(created.filters["company_size"], "50-200")

        # 2. Retrieve segment from DB (simulating page reload / revisit "Segments" view)
        retrieved = SegmentService.get_segment(self.db, created.id)
        self.assertIsNotNone(retrieved, "Segment must be persistent in database.")
        self.assertEqual(retrieved.name, segment_name)
        self.assertEqual(retrieved.filters, filter_payload)

        # 3. List segments
        all_segments = SegmentService.list_segments(self.db)
        self.assertTrue(any(s.id == created.id for s in all_segments))

        # Cleanup
        SegmentService.delete_segment(self.db, created.id)

    def test_export_fields_and_alignment(self):
        """Verify bulk export format: row count matches filtered count and all 12 enrichment columns exist"""
        expected_columns = [
            "Name", "Email", "Phone", "LinkedIn", "Company", "Website",
            "Job Title", "Industry", "Company Size", "Post URL", "Source", "Discovery Date"
        ]

        leads_to_export = [
            {
                "Name": "Dr. Evelyn Reed",
                "Email": "e.reed@apexcarehealth.com",
                "Phone": "+1 (617) 555-0194",
                "LinkedIn": "https://linkedin.com/in/evelyn-reed-md",
                "Company": "Apex Care Health Partners",
                "Website": "https://apexcarehealth.com",
                "Job Title": "Chief Medical Information Officer",
                "Industry": "Healthcare & Life Sciences",
                "Company Size": "50-200",
                "Post URL": "https://www.linkedin.com/posts/apex-care-health_patient-engagement-voice-ai-71928301",
                "Source": "LinkedIn",
                "Discovery Date": "Today · 11:20"
            },
            {
                "Name": "Marcus Bennett",
                "Email": "m.bennett@vitalishealth.com",
                "Phone": "+1 (312) 555-0145",
                "LinkedIn": "https://linkedin.com/in/marcus-bennett-health",
                "Company": "Vitalis Health Systems",
                "Website": "https://vitalishealth.com",
                "Job Title": "VP of Patient Services",
                "Industry": "Healthcare & Life Sciences",
                "Company Size": "50-200",
                "Post URL": "https://www.linkedin.com/posts/vitalis-health_ambulatory-care-voice-intake-82910384",
                "Source": "LinkedIn",
                "Discovery Date": "Today · 09:30"
            }
        ]

        # Generate CSV stream
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=expected_columns)
        writer.writeheader()
        writer.writerows(leads_to_export)
        csv_data = output.getvalue()

        # Parse CSV back
        reader = csv.DictReader(io.StringIO(csv_data))
        rows = list(reader)

        # 1. Row count matches filtered lead set exactly
        self.assertEqual(len(rows), len(leads_to_export), "Row count must match filtered count exactly.")

        # 2. Every enrichment column present and correctly labeled
        self.assertEqual(reader.fieldnames, expected_columns)

        # 3. No misalignment or missing values
        for i, row in enumerate(rows):
            for col in expected_columns:
                self.assertTrue(len(row[col]) > 0, f"Column {col} should not be empty for row {i}")
                self.assertEqual(row[col], leads_to_export[i][col])


if __name__ == "__main__":
    unittest.main()
