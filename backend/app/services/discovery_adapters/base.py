"""
base.py — Base interface and data models for Lead Discovery Source Adapters.
Every public source category (LinkedIn, X/Twitter, Company Websites, Job Boards, Bidding Sites)
implements the SourceAdapter interface.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class RawDiscoveredPost:
    """Standardized entity returned by any public discovery source adapter."""
    company_name: str
    requirement: str
    source_platform: str
    original_post_url: str
    posted_date: str
    keyword: str
    industry: str
    location: str
    intent_score: float = 85.0
    contact_name: Optional[str] = None
    job_title: Optional[str] = None
    business_email: Optional[str] = None
    contact_phone: Optional[str] = None
    linkedin_profile: Optional[str] = None
    website: Optional[str] = None
    company_size: Optional[str] = "50–200"
    is_inferred_from_hiring: bool = False
    inferred_need_basis: Optional[str] = None
    signal_type: str = "direct_requirement"  # 'direct_requirement' | 'inferred_hiring_signal'
    raw_metadata: Dict[str, Any] = field(default_factory=dict)


class SourceAdapter(ABC):
    """Abstract Base Class for public lead source adapters."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the platform (e.g. 'LinkedIn', 'X (Twitter)', 'Company Website RFP')."""
        pass

    @property
    @abstractmethod
    def category(self) -> str:
        """Category type: 'social', 'website_crawler', 'bidding_portal', 'job_board'."""
        pass

    @property
    @abstractmethod
    def is_live(self) -> bool:
        """True if connected to live web scraping/API; False if running on structured public fixtures."""
        pass

    @abstractmethod
    def search(
        self,
        keyword: str,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        max_results: int = 20,
    ) -> List[RawDiscoveredPost]:
        """
        Execute search across the source platform.
        Must return a list of RawDiscoveredPost objects or raise an exception on hard failure.
        """
        pass
