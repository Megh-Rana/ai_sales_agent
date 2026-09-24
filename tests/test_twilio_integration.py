"""
Unit & Integration Tests for Twilio Telephony Carrier Layer
Verifies Twilio carrier trunking powered exclusively by YOUR internal AI infrastructure:
- TTS: Sarvam Bulbul v3 / Edge-TTS (backend/tts/engine.py)
- LLM: Local Ollama Gemma 3 4B / Sarvam (backend/ai/brain.py)
- STT: Sarvam Saaras v3 / Faster-Whisper (backend/stt/engine.py)
- PSTN: Twilio carrier trunking, TwiML <Play> audio delivery, AMD, and SMS
"""

import os
import sys
import uuid
import unittest
from fastapi.testclient import TestClient

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(WORKSPACE_ROOT, "backend")
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Base, Business, Lead, Call, Profile
from app.services.twilio_service import TwilioService
from app.services.telephony_service import TelephonyService
from app.services.telephony_audio import synthesize_speech_to_wav, get_audio_bytes
from ai.brain import AIBrain
from tts.engine import TTSEngine


class TestTwilioIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # In-memory SQLite for isolated test execution
        cls.engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(bind=cls.engine)
        cls.Session = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        cls.db = cls.Session()

        cls.owner_id = uuid.uuid4()
        cls.profile = Profile(id=cls.owner_id, email="twilio-test@vidur.internal", full_name="Twilio Tester")
        cls.db.add(cls.profile)
        cls.db.commit()

        cls.business = Business(
            id=uuid.uuid4(),
            owner_id=cls.owner_id,
            name="Vidur Autonomous Systems",
            industry="Artificial Intelligence",
            description="AI Sales Agents and Autonomous Telephony",
            location="Bangalore, India",
            contact_email="sales@vidur.internal",
            contact_phone="+91-80-12345678",
        )
        cls.db.add(cls.business)
        cls.db.commit()

        cls.lead = Lead(
            id=uuid.uuid4(),
            business_id=cls.business.id,
            company_name="Apex Logistics India",
            contact_name="Sanjay Sharma",
            contact_email="sanjay@apexlogistics.example",
            contact_phone="+91-98765-43210",
            status="new",
            requirement="Automated driver verification and spot load booking dialer.",
        )
        cls.db.add(cls.lead)
        cls.db.commit()

    def test_01_twilio_carrier_status_and_capabilities(self):
        """Verify Twilio carrier configuration and capability reporting."""
        status = TwilioService.get_status()
        self.assertEqual(status["provider"], "twilio")
        self.assertTrue(status["capabilities"]["pstn_dialing"])
        self.assertTrue(status["capabilities"]["answering_machine_detection"])
        self.assertTrue(status["capabilities"]["voicemail_drop"])
        self.assertTrue(status["capabilities"]["twiml_dialogue"])
        self.assertTrue(status["capabilities"]["sms_messaging"])

    def test_02_internal_tts_audio_synthesis(self):
        """Verify speech synthesis uses internal TTSEngine (Sarvam Bulbul / Edge-TTS) and produces valid WAV."""
        sample_text = "Hello, this is Alex from Vidur AI."
        audio_id, wav_bytes = synthesize_speech_to_wav(sample_text, language="en")

        self.assertTrue(bool(audio_id))
        self.assertGreater(len(wav_bytes), 1000)
        # Verify RIFF WAV header
        self.assertEqual(wav_bytes[:4], b"RIFF")
        self.assertEqual(wav_bytes[8:12], b"WAVE")

        # Verify retrieval from audio cache
        retrieved_data = get_audio_bytes(audio_id)
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(len(retrieved_data), len(wav_bytes))

    def test_03_internal_llm_pitch_and_thinking(self):
        """Verify sales pitch and response generation use internal AIBrain (Ollama / Sarvam)."""
        brain = AIBrain(
            company_info="Vidur AI Sales Systems",
            products_services="Automated Outbound Voice Agents",
            campaign_goal="Qualify requirements and schedule demo",
            company_name="Apex Logistics India",
            default_language="en",
        )
        # Test pitch generation
        pitch = brain.generate_dynamic_opening_pitch(
            prospect_name="Sanjay",
            company_name="Apex Logistics India",
            requirement="Automated driver verification",
            language="en",
        )
        self.assertTrue(bool(pitch))
        self.assertIn("Sanjay", pitch)

        # Test thinking turns
        sentences = list(brain.think("Yes, tell me about your pricing.", "en"))
        self.assertGreaterEqual(len(sentences), 1)

    def test_04_twilio_outbound_pstn_dispatch(self):
        """Verify TwilioService.make_outbound_call initiates PSTN carrier dispatch."""
        dispatch = TwilioService.make_outbound_call(
            to_phone="+91-98765-43210",
            from_phone="+1-555-0199",
            call_id=uuid.uuid4(),
            language="hi",
            enable_amd=True,
        )
        self.assertEqual(dispatch["provider"], "twilio")
        self.assertTrue(dispatch["provider_call_id"].startswith("CA"))
        self.assertEqual(len(dispatch["provider_call_id"]), 34)

    def test_05_telephony_service_dial_and_hangup(self):
        """Verify TelephonyService.dial_outbound creates call in DB and hangup terminates it."""
        call = TelephonyService.dial_outbound(
            db=self.db,
            lead_id=self.lead.id,
            owner_id=self.owner_id,
            to_phone="+91-98765-43210",
            language="en",
            carrier="twilio",
            enable_amd=True,
        )
        self.assertEqual(call.provider, "twilio")
        self.assertTrue(call.provider_call_id.startswith("CA"))
        self.assertEqual(call.status, "in_progress")

        # Test hangup
        terminated_call = TelephonyService.hangup_call(
            db=self.db,
            call_id=call.id,
            owner_id=self.owner_id,
        )
        self.assertEqual(terminated_call.status, "completed")
        self.assertIsNotNone(terminated_call.completed_at)

    def test_06_twiml_play_generation(self):
        """Verify TwiML generation uses <Play> to deliver internally synthesized audio."""
        audio_url = "http://localhost:8000/api/telephony/audio/sample_123.wav"
        gather_url = "http://localhost:8000/api/telephony/twilio/gather?call_id=xyz"

        greeting_twiml = TwilioService.generate_audio_greeting_twiml(
            audio_url=audio_url,
            gather_action_url=gather_url,
        )
        self.assertIn("<Play>", greeting_twiml)
        self.assertIn("sample_123.wav", greeting_twiml)
        self.assertIn("<Gather", greeting_twiml)

        response_twiml = TwilioService.generate_audio_response_twiml(
            audio_url=audio_url,
            hangup=True,
        )
        self.assertIn("<Play>", response_twiml)
        self.assertIn("<Hangup", response_twiml)

    def test_07_twilio_sms_dispatch(self):
        """Verify TwilioService.send_sms dispatches message with valid SID."""
        sms_res = TwilioService.send_sms(
            to_phone="+91-98765-43210",
            body="Your product demo is scheduled for Thursday at 3 PM.",
        )
        self.assertTrue(sms_res["success"])
        self.assertTrue(sms_res["sid"].startswith("SM"))


if __name__ == "__main__":
    unittest.main()
