import os
import sys
import unittest
from datetime import datetime
from uuid import UUID

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))

from app.db.database import SessionLocal
from app.services.analytics_service import AnalyticsService, parse_date_window


class TestFourIssueFixes(unittest.TestCase):
    def test_issue_1_quiet_hours_notice_contrast(self):
        """Verify Quiet Hours explanatory text and override checkbox use dark/high-contrast neutral colors."""
        path = os.path.join(ROOT_DIR, "src", "components", "calls", "CallConfirmationModal.tsx")
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Quiet Hours Notice: Calling Outside Standard Hours", content)
        # Verify text-slate-300 was replaced with dark high-contrast neutral
        self.assertNotIn('<p className="text-slate-300 text-[11px] leading-relaxed">', content)
        self.assertIn('text-slate-800 dark:text-slate-200', content)
        self.assertIn('text-slate-900 dark:text-slate-100', content)

    def test_issue_2_opportunity_radar_tabs_and_badges(self):
        """Verify tab selected state is visually consistent and badge text colors are dark/high-contrast."""
        header_path = os.path.join(ROOT_DIR, "src", "components", "opportunities", "OpportunityHeader.tsx")
        with open(header_path, "r", encoding="utf-8") as f:
            header_content = f.read()

        # Tab selected state for urgent no longer dominates with yellow block
        self.assertNotIn("bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs", header_content)
        self.assertIn("activeTab === 'urgent'", header_content)

        card_path = os.path.join(ROOT_DIR, "src", "components", "opportunities", "OpportunityCard.tsx")
        with open(card_path, "r", encoding="utf-8") as f:
            card_content = f.read()

        # Badges retain colored backgrounds while ensuring dark high-contrast text
        self.assertIn("text-emerald-950 dark:text-emerald-300", card_content)
        self.assertIn("text-amber-950 dark:text-amber-300", card_content)
        self.assertIn("text-blue-950 dark:text-blue-300", card_content)
        self.assertIn("text-indigo-950 dark:text-indigo-300", card_content)
        self.assertIn("text-purple-950 dark:text-purple-300", card_content)
        self.assertIn("HIGH PRIORITY", card_content)
        self.assertIn("text-amber-950 dark:text-amber-200", card_content)

    def test_issue_3_state_selector_removed(self):
        """Verify dev STATE selector toggle is removed from Action Center, Follow-ups, and Analytics headers."""
        action_header = os.path.join(ROOT_DIR, "src", "components", "actions", "ActionCenterHeader.tsx")
        with open(action_header, "r", encoding="utf-8") as f:
            action_content = f.read()
        self.assertNotIn("Demo State Switcher Toggle", action_content)
        self.assertNotIn("['normal', 'loading', 'empty', 'error']", action_content)

        followup_header = os.path.join(ROOT_DIR, "src", "components", "followUps", "FollowUpHeader.tsx")
        with open(followup_header, "r", encoding="utf-8") as f:
            followup_content = f.read()
        self.assertNotIn("Demo State Switcher Toggle", followup_content)
        self.assertNotIn("['normal', 'loading', 'empty', 'error']", followup_content)

        analytics_header = os.path.join(ROOT_DIR, "src", "components", "analytics", "AnalyticsHeader.tsx")
        with open(analytics_header, "r", encoding="utf-8") as f:
            analytics_content = f.read()
        self.assertNotIn("Demo State Switcher Toggle", analytics_content)
        self.assertNotIn("['normal', 'loading', 'empty', 'error']", analytics_content)

        # Internal state handling must remain intact in pages
        analytics_page = os.path.join(ROOT_DIR, "src", "pages", "Analytics.tsx")
        with open(analytics_page, "r", encoding="utf-8") as f:
            analytics_page_content = f.read()
        self.assertIn("viewState === 'loading'", analytics_page_content)
        self.assertIn("viewState === 'empty'", analytics_page_content)
        self.assertIn("viewState === 'error'", analytics_page_content)

    def test_issue_4_analytics_date_filtering_and_real_data(self):
        """Verify AnalyticsService filters live database records by date range and returns real metrics."""
        db = SessionLocal()
        owner_id = UUID("00000000-0000-0000-0000-000000000001")

        # 1. Today filter
        today_metrics = AnalyticsService.get_metrics(db, owner_id=owner_id, date_range="today")
        self.assertEqual(today_metrics.dateRange, "today")
        self.assertGreaterEqual(today_metrics.discoveredCount, 0)
        self.assertGreaterEqual(today_metrics.callPerformance.totalCalls, 0)

        # 2. 7 days filter
        m_7d = AnalyticsService.get_metrics(db, owner_id=owner_id, date_range="7d")
        self.assertEqual(m_7d.dateRange, "7d")
        self.assertGreater(m_7d.discoveredCount, 0)
        self.assertGreater(m_7d.callPerformance.totalCalls, 0)

        # 3. 30 days filter vs 7 days filter
        m_30d = AnalyticsService.get_metrics(db, owner_id=owner_id, date_range="30d")
        self.assertGreaterEqual(m_30d.discoveredCount, m_7d.discoveredCount)

        # 4. Custom filter
        today_str = datetime.now().strftime("%Y-%m-%d")
        custom_metrics = AnalyticsService.get_metrics(
            db, owner_id=owner_id, date_range="custom", start_date=today_str, end_date=today_str
        )
        self.assertGreaterEqual(custom_metrics.discoveredCount, 0)
        self.assertGreaterEqual(custom_metrics.callPerformance.totalCalls, 0)

        # 5. Verify sourcePerformance and industryPerformance are computed dynamically
        self.assertIsInstance(m_30d.sourcePerformance, list)
        self.assertGreater(len(m_30d.sourcePerformance), 0)
        self.assertIsInstance(m_30d.industryPerformance, list)
        self.assertGreater(len(m_30d.industryPerformance), 0)

        db.close()


if __name__ == "__main__":
    unittest.main()
