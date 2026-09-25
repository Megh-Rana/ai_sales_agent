"""
test_email_layer.py — Comprehensive tests for EmailService, SMTP dispatch,
error handling, and database activity audit logging.
"""

import os
import sys
import unittest
from uuid import UUID

# Ensure backend is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.services.email_service import EmailService, email_service
from app.db.database import SessionLocal
from app.db.models.activity_log import ActivityLog


class TestEmailService(unittest.TestCase):
    def test_email_validation(self):
        """Test recipient email address format validation."""
        valid_cases = [
            "priya.sharma@razorpay.com",
            "alex@vidur.ai",
            "test.user+tag@domain.co.uk",
            "contact@sub.company.org",
        ]
        invalid_cases = [
            "",
            "plainaddress",
            "@missingusername.com",
            "username@.com",
            "username@com",
            "user@domain..com",
            None,
        ]
        for email in valid_cases:
            self.assertTrue(EmailService.is_valid_email(email), f"Expected '{email}' to be valid")

        for email in invalid_cases:
            self.assertFalse(EmailService.is_valid_email(email), f"Expected '{email}' to be invalid")

    def test_generate_html_body(self):
        """Test executive responsive HTML email formatting."""
        html = EmailService.generate_html_body(
            recipient_name="Priya Sharma",
            company_name="Razorpay Software",
            subject="AI Voice Demo",
            body_text="Hi Priya,\n\nThank you for speaking today.\n\nWe look forward to partnering.",
            pitch_snippet="Autonomous sales voice agent cadences for high-throughput SDR teams",
            language="en",
        )
        self.assertIn("<!DOCTYPE html>", html)
        self.assertIn("Priya Sharma", html)
        self.assertIn("Razorpay Software", html)
        self.assertIn("Autonomous sales voice agent cadences", html)
        self.assertIn("Vidur AI Sales Team", html)

    def test_send_email_sandbox_mode(self):
        """Test sandbox simulated delivery and database audit trail writing."""
        old_host = os.environ.get("SMTP_HOST")
        os.environ["SMTP_HOST"] = ""
        try:
            res = email_service.send_pitch_email(
                recipient_email="priya.sharma@razorpay.com",
                company_name="Razorpay Software",
                subject="Quick Follow-Up: AI Voice Architecture",
                body="Hi Priya, thank you for your time today.",
                recipient_name="Priya Sharma",
                lead_id="lead-razorpay-01",
            )
            self.assertTrue(res.success)
            self.assertEqual(res.mode, "simulated_logged")
            self.assertEqual(res.recipient_email, "priya.sharma@razorpay.com")
            self.assertTrue(res.delivery_id.startswith("email_"))
            self.assertIsNone(res.error)

            # Verify written to database
            db = SessionLocal()
            try:
                log = (
                    db.query(ActivityLog)
                    .filter(ActivityLog.action_type == "email_dispatched")
                    .order_by(ActivityLog.timestamp.desc())
                    .first()
                )
                self.assertIsNotNone(log)
                self.assertEqual(log.extra_metadata.get("delivery_id"), res.delivery_id)
                self.assertEqual(log.extra_metadata.get("recipient"), "priya.sharma@razorpay.com")
                self.assertEqual(log.extra_metadata.get("company_name"), "Razorpay Software")
            finally:
                db.close()
        finally:
            if old_host:
                os.environ["SMTP_HOST"] = old_host

    def test_send_email_invalid_recipient(self):
        """Test that invalid recipient email returns failure and doesn't crash."""
        res = email_service.send_pitch_email(
            recipient_email="not-an-email",
            company_name="Acme",
            subject="Test",
            body="Test body",
        )
        self.assertFalse(res.success)
        self.assertEqual(res.mode, "failed")
        self.assertIn("Invalid email syntax", res.error)

    def test_smtp_connection_unconfigured(self):
        """Test that test_smtp_connection reports unconfigured state when host is empty."""
        old_host = os.environ.get("SMTP_HOST")
        os.environ["SMTP_HOST"] = ""
        try:
            diag = email_service.test_smtp_connection()
            self.assertFalse(diag["configured"])
            self.assertEqual(diag["status"], "unconfigured")
        finally:
            if old_host:
                os.environ["SMTP_HOST"] = old_host

    def test_smtp_failure_and_strict_mode(self):
        """Test error handling when live SMTP host is unreachable."""
        os.environ["SMTP_HOST"] = "127.0.0.1"
        os.environ["SMTP_PORT"] = "65534"  # Non-existent port
        os.environ["SMTP_TIMEOUT"] = "0.5"
        try:
            # Mode A: Soft fallback with error reported
            os.environ["REQUIRE_LIVE_EMAIL"] = "false"
            res = email_service.send_pitch_email(
                recipient_email="contact@example.com",
                company_name="Acme",
                subject="Test Failover",
                body="Testing fallback",
            )
            self.assertTrue(res.success)
            self.assertEqual(res.mode, "fallback_logged")
            self.assertIsNotNone(res.error)

            # Mode B: Strict requirement raises error
            os.environ["REQUIRE_LIVE_EMAIL"] = "true"
            res_strict = email_service.send_pitch_email(
                recipient_email="contact@example.com",
                company_name="Acme",
                subject="Test Strict",
                body="Testing strict",
            )
            self.assertFalse(res_strict.success)
            self.assertEqual(res_strict.mode, "failed")
            self.assertIsNotNone(res_strict.error)
        finally:
            os.environ.pop("SMTP_HOST", None)
            os.environ.pop("SMTP_PORT", None)
            os.environ.pop("SMTP_TIMEOUT", None)
            os.environ.pop("REQUIRE_LIVE_EMAIL", None)


if __name__ == "__main__":
    unittest.main()
