from app.services.discovery_adapters.base import RawDiscoveredPost, SourceAdapter
from app.services.discovery_adapters.linkedin_adapter import LinkedInSourceAdapter
from app.services.discovery_adapters.x_twitter_adapter import XTwitterSourceAdapter
from app.services.discovery_adapters.website_crawler_adapter import CompanyWebsiteCrawlerAdapter
from app.services.discovery_adapters.freelance_bidding_adapter import FreelanceBiddingAdapter
from app.services.discovery_adapters.job_inference_adapter import JobPostingInferenceAdapter
from app.services.discovery_adapters.orchestrator import MultiSourceDiscoveryOrchestrator

__all__ = [
    "RawDiscoveredPost",
    "SourceAdapter",
    "LinkedInSourceAdapter",
    "XTwitterSourceAdapter",
    "CompanyWebsiteCrawlerAdapter",
    "FreelanceBiddingAdapter",
    "JobPostingInferenceAdapter",
    "MultiSourceDiscoveryOrchestrator",
]
