"""
x_twitter_adapter.py — X (Twitter) Public Commercial Intent & RFP Search Adapter.
Discovers B2B requirements, vendor calls, and RFP announcements published on X/Twitter.
Status: Realistic public feed fixture pending X API v2 Bearer Token ($100/mo paywall).
"""

import re
from datetime import datetime, timezone
from typing import List, Optional
from app.services.discovery_adapters.base import RawDiscoveredPost, SourceAdapter

X_TWITTER_CATALOG = [
    {
        "keyword": "SharePoint Implementation",
        "company_name": "Vanguard Media Group",
        "contact_name": "Alexander Hayes",
        "job_title": "Head of Digital Workplace",
        "business_email": "a.hayes@vanguard-media.example.com",
        "contact_phone": "+1 (555) 789-0123",
        "linkedin_profile": "https://www.linkedin.com/in/alex-hayes-workplace",
        "website": "https://vanguardmedia.example.com",
        "industry": "IT Services",
        "location": "New York, NY",
        "company_size": "100–250",
        "requirement": "Anyone have recommendations for certified SharePoint Implementation partners? Migrating our 400-seat digital media archive to M365 SharePoint Online this quarter. DM me or reply! #SharePoint #EnterpriseIT",
        "source_platform": "X (Twitter)",
        "original_post_url": "https://x.com/AlexHayesIT/status/1789201928371902847",
        "intent_score": 93.0,
    },
    {
        "keyword": "Voice AI Calling",
        "company_name": "FinVantage Financial Technologies",
        "contact_name": "Priya Sharma",
        "job_title": "VP of Customer Acquisition",
        "business_email": "priya.sharma@finvantage.example.internal",
        "contact_phone": "+91 98234 56789",
        "linkedin_profile": "https://www.linkedin.com/in/priyasharma-finvantage",
        "website": "https://finvantage.example.internal",
        "industry": "FinTech",
        "location": "Mumbai, India",
        "company_size": "250–500",
        "requirement": "Looking to test AI sales calling solutions for financial advisory appointment booking. Must support Hindi + English speech and low-latency interruptions. Drop SaaS pitch decks in thread. #VoiceAI #SaaS",
        "source_platform": "X (Twitter)",
        "original_post_url": "https://x.com/PriyaFinTech/status/1789481920392817264",
        "intent_score": 95.0,
    },
    {
        "keyword": "Warehouse Automation & Dispatch",
        "company_name": "FastTrack Cargo Freight",
        "contact_name": "Robert Klein",
        "job_title": "Chief Technology Officer",
        "business_email": "robert.k@fasttrackcargo.example.com",
        "contact_phone": "+1 (555) 890-1234",
        "linkedin_profile": "https://www.linkedin.com/in/robertklein-cto",
        "website": "https://fasttrackcargo.example.com",
        "industry": "Logistics",
        "location": "Dallas, TX",
        "company_size": "500–1,000",
        "requirement": "We are seeking a warehouse automation and voice dispatch platform to integrate with our TMS fleet software. Evaluating vendors for a multi-hub pilot in Texas. #LogisticsTech #WarehouseAutomation",
        "source_platform": "X (Twitter)",
        "original_post_url": "https://x.com/RKleinLogistics/status/1790182749102938475",
        "intent_score": 91.0,
    },
]


class XTwitterSourceAdapter(SourceAdapter):
    @property
    def name(self) -> str:
        return "X (Twitter)"

    @property
    def category(self) -> str:
        return "social"

    @property
    def is_live(self) -> bool:
        # Fixture backed pending X API v2 enterprise credentials
        return False

    def search(
        self,
        keyword: str,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        max_results: int = 20,
    ) -> List[RawDiscoveredPost]:
        keyword_lower = (keyword or "").lower().strip()
        industry_filter = (industry or "").lower().strip()
        location_filter = (location or "").lower().strip()

        matched: List[RawDiscoveredPost] = []
        tokens = [
            t for t in re.sub(r"[^a-zA-Z0-9\s]", " ", keyword_lower).split()
            if len(t) > 1 and t not in {"and", "or", "for", "the", "in", "with", "to", "of"}
        ]

        for item in X_TWITTER_CATALOG:
            kw_match = (
                keyword_lower in item["keyword"].lower()
                or keyword_lower in item["requirement"].lower()
                or keyword_lower in item["company_name"].lower()
            )
            if not kw_match:
                if not tokens or not any(
                    tok in item["requirement"].lower()
                    or tok in item["keyword"].lower()
                    or tok in item["company_name"].lower()
                    for tok in tokens
                ):
                    continue

            if industry_filter and industry_filter != "all" and industry_filter not in item["industry"].lower():
                continue

            if location_filter and location_filter != "all" and location_filter not in item["location"].lower() and item["location"].lower() != "global":
                continue

            matched.append(
                RawDiscoveredPost(
                    company_name=item["company_name"],
                    requirement=item["requirement"],
                    source_platform="X (Twitter)",
                    original_post_url=item["original_post_url"],
                    posted_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    keyword=item["keyword"],
                    industry=item["industry"],
                    location=item["location"],
                    intent_score=item["intent_score"],
                    contact_name=item.get("contact_name"),
                    job_title=item.get("job_title"),
                    business_email=item.get("business_email"),
                    contact_phone=item.get("contact_phone"),
                    linkedin_profile=item.get("linkedin_profile"),
                    website=item.get("website"),
                    company_size=item.get("company_size"),
                    is_inferred_from_hiring=False,
                    signal_type="direct_requirement",
                )
            )

            if len(matched) >= max_results:
                break

        return matched
