"""
linkedin_adapter.py — LinkedIn Public Post & RFP Discovery Adapter.
Queries public business requirement posts, procurement announcements, and executive requests on LinkedIn.
Status: Catalog-backed fixture pending LinkedIn Marketing Developer Partner Program approval.
"""

import re
from datetime import datetime, timezone
from typing import List, Optional
from app.services.discovery_adapters.base import RawDiscoveredPost, SourceAdapter

LINKEDIN_CATALOG = [
    {
        "keyword": "SharePoint Implementation",
        "company_name": "GlobalNet IT Solutions",
        "contact_name": "Marcus Sterling",
        "job_title": "VP of Information Technology",
        "business_email": None,
        "contact_phone": None,
        "linkedin_profile": "https://www.linkedin.com/in/marcus-sterling-it",
        "website": "https://globalnet-it.example.com",
        "industry": "IT Services",
        "location": "Global",
        "company_size": "250–500",
        "requirement": "Looking for a SharePoint Implementation Partner to lead enterprise document management migration across 12 global offices.",
        "source_platform": "LinkedIn",
        "original_post_url": "https://www.linkedin.com/posts/globalnet-it_looking-for-a-sharepoint-implementation-partner-activity-719382019481",
        "intent_score": 96.0,
    },
    {
        "keyword": "Voice AI Calling",
        "company_name": "CloudScale Telephony Systems",
        "contact_name": "Sarah Jenkins",
        "job_title": "VP of Growth & Sales Ops",
        "business_email": "sarah.j@cloudscalesystems.io",
        "contact_phone": "+1 (555) 342-9102",
        "linkedin_profile": "https://www.linkedin.com/in/sarahjenkins-growth",
        "website": "https://cloudscalesystems.io",
        "industry": "B2B SaaS",
        "location": "Austin, TX",
        "company_size": "100–250",
        "requirement": "Evaluating autonomous voice AI agents to handle Tier-1 inbound qualification and warm SDR appointment booking.",
        "source_platform": "LinkedIn",
        "original_post_url": "https://www.linkedin.com/posts/cloudscale-telephony-ai-evaluation-98273",
        "intent_score": 92.0,
    },
    {
        "keyword": "Warehouse Automation & Dispatch",
        "company_name": "Apex Intralogistics & Warehouse Systems",
        "contact_name": "Marcus Brody",
        "job_title": "VP of Warehouse Operations & Logistics",
        "business_email": "marcus.brody@apexintralogistics.example.internal",
        "contact_phone": "+1 (555) 098-7654",
        "linkedin_profile": "https://www.linkedin.com/in/marcus-brody-warehouse",
        "website": "https://apexintralogistics.example.internal",
        "industry": "Logistics",
        "location": "Chicago, IL",
        "company_size": "500–1,000",
        "requirement": "Warehouse Automation & Dispatch: Implementing autonomous mobile robots (AMRs) and automated AI voice dispatch to eliminate loading dock queue delays.",
        "source_platform": "LinkedIn",
        "original_post_url": "https://www.linkedin.com/posts/apex-intralogistics-warehouse-automation-dispatch-rfp",
        "intent_score": 96.0,
    },
]


class LinkedInSourceAdapter(SourceAdapter):
    @property
    def name(self) -> str:
        return "LinkedIn"

    @property
    def category(self) -> str:
        return "social"

    @property
    def is_live(self) -> bool:
        # Stubbed / Realistic catalog pending enterprise LinkedIn Partner OAuth tokens
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

        for item in LINKEDIN_CATALOG:
            # 1. Keyword check
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

            # 2. Industry check
            if industry_filter and industry_filter != "all" and industry_filter not in item["industry"].lower():
                continue

            # 3. Location check
            if location_filter and location_filter != "all" and location_filter not in item["location"].lower() and item["location"].lower() != "global":
                continue

            matched.append(
                RawDiscoveredPost(
                    company_name=item["company_name"],
                    requirement=item["requirement"],
                    source_platform="LinkedIn",
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
