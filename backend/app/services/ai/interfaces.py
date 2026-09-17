"""
Provider-independent abstract interfaces for future AI services.
Contains pure interfaces with type annotations and docstrings ONLY.
No third-party LLM SDKs (OpenAI, Anthropic, Gemini, LangChain) are imported.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from uuid import UUID

from app.schemas.ai import (
    CallAnalysisContract,
    LeadAnalysisContract,
    LeadScoringContract,
    NextBestActionContract,
    SalesPitchContract,
)


class LeadAnalysisServiceInterface(ABC):
    """Abstract contract for analyzing company requirements and generating intelligence."""

    @abstractmethod
    async def analyze_lead(
        self,
        lead_id: UUID,
        company_name: str,
        requirement: Optional[str] = None,
        industry: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> LeadAnalysisContract:
        """Analyze a lead and return a structured research contract."""
        raise NotImplementedError


class LeadScoringServiceInterface(ABC):
    """Abstract contract for predictive scoring of lead conversion propensity."""

    @abstractmethod
    async def score_lead(
        self,
        lead_id: UUID,
        intelligence_data: Optional[Dict[str, Any]] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> LeadScoringContract:
        """Calculate score factors and return a structured scoring contract."""
        raise NotImplementedError


class SalesPitchServiceInterface(ABC):
    """Abstract contract for generating personalized sales angles."""

    @abstractmethod
    async def generate_pitch(
        self,
        lead_id: UUID,
        company_name: str,
        pain_points: Optional[list] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> SalesPitchContract:
        """Generate structured personalized talking points and objection responses."""
        raise NotImplementedError


class CallAnalysisServiceInterface(ABC):
    """Abstract contract for analyzing call transcripts and extracting qualification."""

    @abstractmethod
    async def analyze_call(
        self,
        call_id: UUID,
        transcript: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> CallAnalysisContract:
        """Extract structured qualification, buying signals, and outcome from transcript."""
        raise NotImplementedError


class NextBestActionServiceInterface(ABC):
    """Abstract contract for recommending the next sales step."""

    @abstractmethod
    async def determine_next_action(
        self,
        lead_id: UUID,
        call_history: Optional[list] = None,
        intelligence: Optional[Dict[str, Any]] = None,
    ) -> NextBestActionContract:
        """Recommend immediate or scheduled next sales activity."""
        raise NotImplementedError
