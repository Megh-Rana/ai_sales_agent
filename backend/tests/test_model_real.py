"""
Pytest-compatible test suite for live Ollama model validation.
Ensures zero mock data and genuine conversational and structured capabilities.
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config
from ai.brain import AIBrain
from ai.core.factory import get_ai_provider


def test_provider_is_not_mock():
    """Verify default provider is ollama and not MockProvider."""
    provider = get_ai_provider()
    assert provider.provider_name == "ollama", f"Expected 'ollama' but got '{provider.provider_name}'"
    assert "mock" not in provider.model.lower()


def test_real_model_generation():
    """Verify genuine model generation with zero mock placeholders."""
    provider = get_ai_provider()
    res = provider.generate("Give me one sales tip in 10 words.")
    assert len(res.strip()) > 10
    assert not res.startswith("mock_")
    assert "deterministic mock" not in res.lower()


def test_ai_brain_live_dialogue():
    """Verify AIBrain produces real conversational turns without mock fallback."""
    ai = AIBrain(
        company_info="Nexara AI",
        products_services="Automated Sales Agents",
        campaign_goal="Book Demo",
        agent_name="Sarah",
        company_name="Nexara AI"
    )
    opening = ai.get_opening("Rajesh")
    assert "Sarah" in opening
    assert "Nexara AI" in opening

    reply = ai.generate_response("What does your product cost?", language="en")
    assert len(reply) > 20
    assert not reply.startswith("mock_")
    assert "deterministic mock" not in reply.lower()
