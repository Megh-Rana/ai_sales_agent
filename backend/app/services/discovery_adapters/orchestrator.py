"""
orchestrator.py — Multi-Source Lead Discovery Orchestrator.
Fans out discovery queries across all registered SourceAdapters in parallel,
enforces error resilience (single adapter failure does not block others),
and merges & de-duplicates results across company and requirement similarity.
"""

import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional
from app.core.logging import logger
from app.services.discovery_adapters.base import RawDiscoveredPost, SourceAdapter
from app.services.discovery_adapters.linkedin_adapter import LinkedInSourceAdapter
from app.services.discovery_adapters.x_twitter_adapter import XTwitterSourceAdapter
from app.services.discovery_adapters.website_crawler_adapter import CompanyWebsiteCrawlerAdapter
from app.services.discovery_adapters.freelance_bidding_adapter import FreelanceBiddingAdapter
from app.services.discovery_adapters.job_inference_adapter import JobPostingInferenceAdapter
from app.services.discovery_adapters.search_rfp_adapter import SearchEngineRfpAdapter
from app.services.discovery_adapters.open_jobs_adapter import OpenJobBoardsAdapter


def _normalize_company_stem(name: str) -> str:
    """Normalize company name for fuzzy cross-platform deduplication."""
    cleaned = re.sub(r"[^a-zA-Z0-9\s]", "", name.lower())
    for suffix in ["solutions", "systems", "technologies", "inc", "corp", "llc", "group", "ltd", "holdings"]:
        cleaned = re.sub(rf"\b{suffix}\b", "", cleaned)
    return " ".join(cleaned.split())


class MultiSourceDiscoveryOrchestrator:
    def __init__(self):
        # Register all available source adapters
        self.adapters: Dict[str, SourceAdapter] = {
            "linkedin": LinkedInSourceAdapter(),
            "x_twitter": XTwitterSourceAdapter(),
            "website_crawler": CompanyWebsiteCrawlerAdapter(),
            "freelance_bidding": FreelanceBiddingAdapter(),
            "job_inference": JobPostingInferenceAdapter(),
            "search_rfp": SearchEngineRfpAdapter(),
            "open_jobs": OpenJobBoardsAdapter(),
        }

    def get_adapter_registry(self) -> List[Dict[str, Any]]:
        """Returns metadata for all available source adapters and their live status."""
        return [
            {
                "id": adapter_id,
                "name": adapter.name,
                "category": adapter.category,
                "is_live": adapter.is_live,
            }
            for adapter_id, adapter in self.adapters.items()
        ]

    def _matches_sources(self, adapter: SourceAdapter, requested_sources: Optional[List[str]]) -> bool:
        if not requested_sources:
            return True
        req_lower = [s.lower() for s in requested_sources]
        adapter_name_lower = adapter.name.lower()
        return any(s in adapter_name_lower or adapter_name_lower in s for s in req_lower)

    def fan_out_search(
        self,
        keyword: str,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        requested_sources: Optional[List[str]] = None,
        timeout_seconds: float = 5.0,
    ) -> List[RawDiscoveredPost]:
        """
        Executes search across all matching source adapters in parallel.
        Guarantees resilience: a failure or timeout in one adapter will not abort others.
        """
        active_adapters = [
            adapter for adapter in self.adapters.values()
            if self._matches_sources(adapter, requested_sources)
        ]

        if not active_adapters:
            active_adapters = list(self.adapters.values())

        raw_results: List[RawDiscoveredPost] = []

        def _execute_adapter(adapter: SourceAdapter) -> List[RawDiscoveredPost]:
            try:
                logger.info(f"Dispatching discovery to adapter '{adapter.name}' (live={adapter.is_live})")
                return adapter.search(keyword=keyword, industry=industry, location=location)
            except Exception as e:
                logger.error(f"Adapter '{adapter.name}' encountered error during search: {e}", exc_info=True)
                return []

        with ThreadPoolExecutor(max_workers=len(active_adapters)) as executor:
            future_to_adapter = {
                executor.submit(_execute_adapter, adapter): adapter for adapter in active_adapters
            }
            for future in as_completed(future_to_adapter, timeout=timeout_seconds):
                adapter = future_to_adapter[future]
                try:
                    posts = future.result()
                    raw_results.extend(posts)
                except Exception as exc:
                    logger.warning(f"Discovery adapter '{adapter.name}' generated an exception: {exc}")

        return self._deduplicate_and_merge(raw_results)

    def _deduplicate_and_merge(self, posts: List[RawDiscoveredPost]) -> List[RawDiscoveredPost]:
        """
        Cross-platform deduplication based on:
        1. Exact company name match, OR
        2. Normalized company name stem + requirement keyword overlap.
        Merges contact details and keeps the highest intent score.
        """
        merged_map: Dict[str, RawDiscoveredPost] = {}

        for post in posts:
            stem = _normalize_company_stem(post.company_name)
            key = stem if stem else post.company_name.lower().strip()

            if key not in merged_map:
                merged_map[key] = post
            else:
                existing = merged_map[key]
                # Keep highest intent score
                if post.intent_score > existing.intent_score:
                    existing.intent_score = post.intent_score

                # Merge missing contact info
                if not existing.contact_name and post.contact_name:
                    existing.contact_name = post.contact_name
                if not existing.job_title and post.job_title:
                    existing.job_title = post.job_title
                if not existing.business_email and post.business_email:
                    existing.business_email = post.business_email
                if not existing.contact_phone and post.contact_phone:
                    existing.contact_phone = post.contact_phone
                if not existing.linkedin_profile and post.linkedin_profile:
                    existing.linkedin_profile = post.linkedin_profile
                if not existing.website and post.website:
                    existing.website = post.website

                # If one post is a direct requirement and another is an inferred hiring signal,
                # preserve the direct requirement or combine the signal basis
                if post.is_inferred_from_hiring and not existing.is_inferred_from_hiring:
                    existing.raw_metadata["hiring_signal_detected"] = post.inferred_need_basis
                elif not post.is_inferred_from_hiring and existing.is_inferred_from_hiring:
                    existing.is_inferred_from_hiring = False
                    existing.signal_type = "direct_requirement"
                    existing.raw_metadata["hiring_signal_detected"] = existing.inferred_need_basis

        return list(merged_map.values())
