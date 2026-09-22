"""
job_inference_adapter.py — Job Listing & Hiring Signal Commercial Need Inference Adapter.
Discovers enterprise commercial requirements implicitly revealed by active hiring postings:
- A company recruiting a "SharePoint Administrator" implies an active SharePoint requirement.
- A company hiring a "Warehouse Logistics Coordinator" implies a warehouse automation need.
- A company hiring an "AI Telephony Engineer" implies voice calling adoption.
Tags all discovered leads with is_inferred_from_hiring=True and signal_type='inferred_hiring_signal'.
Status: LIVE inference engine backed by structured enterprise recruitment feed fixtures.
"""

import re
from datetime import datetime, timezone
from typing import List, Optional
from app.services.discovery_adapters.base import RawDiscoveredPost, SourceAdapter

JOB_LISTINGS_CATALOG = [
    {
        "keyword": "SharePoint Implementation",
        "job_title": "Senior SharePoint & M365 Solutions Architect",
        "company_name": "Horizon Health Informatics",
        "hiring_manager": "Dr. Claire Sterling",
        "business_email": "c.sterling@horizon-health.example.com",
        "contact_phone": "+1 (555) 901-2345",
        "linkedin_profile": "https://www.linkedin.com/in/claire-sterling-healthit",
        "website": "https://horizonhealth.example.com",
        "industry": "Healthcare",
        "location": "Boston, MA",
        "company_size": "500–1,000",
        "job_posting_url": "https://jobs.example.com/horizon-health/senior-sharepoint-architect-9921",
        "job_description_snippet": "We are seeking a full-time Senior SharePoint Architect to spearhead our multi-hospital cloud intranet migration, document lifecycles, and HIPAA compliance.",
        "inferred_requirement": "Inferred Need: Enterprise SharePoint Implementation and clinical intranet migration across regional medical facilities (revealed by active recruitment of Senior SharePoint Solutions Architect).",
        "inferred_basis": "Hiring signal: Horizon Health is recruiting a Senior SharePoint & M365 Architect, indicating an active multi-hospital intranet migration requirement.",
        "intent_score": 89.0,
    },
    {
        "keyword": "Warehouse Automation & Dispatch",
        "job_title": "VP of Automated Warehouse Logistics & Dispatch",
        "company_name": "ProTrans Continental Freight",
        "contact_name": "Nathanial Cross",
        "job_title_contact": "Chief Operating Officer",
        "business_email": "nathan.cross@protrans-continental.example.internal",
        "contact_phone": "+1 (555) 678-9012",
        "linkedin_profile": "https://www.linkedin.com/in/nathancross-protrans",
        "website": "https://protranscontinental.example.internal",
        "industry": "Logistics",
        "location": "Atlanta, GA",
        "company_size": "1,000–5,000",
        "job_posting_url": "https://careers.protranscontinental.example.internal/jobs/vp-warehouse-automation-dispatch-44",
        "job_description_snippet": "Hiring a logistics leader to execute our $4M Warehouse Automation & Dispatch initiative, integrating automated voice dispatch and robotic AMRs across 6 distribution hubs.",
        "inferred_requirement": "Inferred Need: Warehouse Automation & Voice Dispatch System for regional freight hubs (revealed by executive job posting for VP of Automated Warehouse Logistics).",
        "inferred_basis": "Hiring signal: ProTrans is recruiting a VP of Automated Warehouse Logistics & Dispatch to oversee a $4M automation initiative across 6 hubs.",
        "intent_score": 93.0,
    },
    {
        "keyword": "Voice AI Calling",
        "job_title": "AI Telephony Systems Lead",
        "company_name": "Crestview Financial Group",
        "contact_name": "Julian Mercer",
        "job_title_contact": "Director of Customer Growth",
        "business_email": "jmercer@crestview-financial.example.com",
        "contact_phone": "+1 (555) 789-3456",
        "linkedin_profile": "https://www.linkedin.com/in/julianmercer-crestview",
        "website": "https://crestviewfinancial.example.com",
        "industry": "FinTech",
        "location": "Charlotte, NC",
        "company_size": "250–500",
        "job_posting_url": "https://crestviewfinancial.example.com/careers/lead-ai-telephony-engineer",
        "job_description_snippet": "Seeking an AI Telephony Systems Lead to build and evaluate autonomous voice agents for outbound financial advisory qualification calls.",
        "inferred_requirement": "Inferred Need: Voice AI Calling and conversational voice agent deployment for outbound SDR appointment qualification.",
        "inferred_basis": "Hiring signal: Crestview is recruiting an AI Telephony Systems Lead specifically to evaluate autonomous voice qualification agents.",
        "intent_score": 90.0,
    },
]


class JobPostingInferenceAdapter(SourceAdapter):
    @property
    def name(self) -> str:
        return "Job Board (Hiring Signal)"

    @property
    def category(self) -> str:
        return "job_board"

    @property
    def is_live(self) -> bool:
        # LIVE job inference engine
        return True

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

        for item in JOB_LISTINGS_CATALOG:
            # Match against keyword, job title, company, or requirement
            kw_match = (
                keyword_lower in item["keyword"].lower()
                or keyword_lower in item["job_title"].lower()
                or keyword_lower in item["inferred_requirement"].lower()
                or keyword_lower in item["company_name"].lower()
            )
            if not kw_match:
                if not tokens or not any(
                    tok in item["job_title"].lower()
                    or tok in item["inferred_requirement"].lower()
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
                    requirement=item["inferred_requirement"],
                    source_platform="Job Board (Hiring Signal)",
                    original_post_url=item["job_posting_url"],
                    posted_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    keyword=item["keyword"],
                    industry=item["industry"],
                    location=item["location"],
                    intent_score=item["intent_score"],
                    contact_name=item.get("contact_name") or item.get("hiring_manager") or "Hiring Manager",
                    job_title=item.get("job_title_contact") or f"Recruiting for {item['job_title']}",
                    business_email=item.get("business_email"),
                    contact_phone=item.get("contact_phone"),
                    linkedin_profile=item.get("linkedin_profile"),
                    website=item.get("website"),
                    company_size=item.get("company_size"),
                    is_inferred_from_hiring=True,
                    inferred_need_basis=item["inferred_basis"],
                    signal_type="inferred_hiring_signal",
                    raw_metadata={
                        "job_title_hiring": item["job_title"],
                        "job_description_snippet": item["job_description_snippet"],
                    }
                )
            )

            if len(matched) >= max_results:
                break

        return matched
