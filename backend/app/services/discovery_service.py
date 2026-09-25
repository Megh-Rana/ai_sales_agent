import re
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid5, NAMESPACE_DNS
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from app.db.models.lead import Lead
from app.db.models.lead_intelligence import LeadIntelligence
from app.db.models.business import Business
from app.db.models.profile import Profile
from app.schemas.discovery import (
    DiscoveryScanRequest,
    DiscoveredLeadEnrichment,
    DiscoveryScanResponse,
)


# Public Source Catalog of Requirement Posts (LinkedIn, B2B RFP Portals, Freelance Tech Boards)
PUBLIC_REQUIREMENT_CATALOG = [
    {
        "keyword": "SharePoint Implementation",
        "company_name": "GlobalNet IT Solutions",
        "contact_name": "Marcus Sterling",
        "job_title": "VP of Information Technology",
        "business_email": None,  # Contact email not publicly exposed on LinkedIn post
        "contact_phone": None,   # Phone not publicly exposed on post
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
    {
        "keyword": "Warehouse Automation & Dispatch",
        "company_name": "Acme Logistics Solutions",
        "contact_name": "David Reynolds",
        "job_title": "VP of Transportation & Logistics",
        "business_email": "meghrana2007@gmail.com",
        "contact_phone": "+918320441189",
        "linkedin_profile": "https://www.linkedin.com/in/david-reynolds-logistics",
        "website": "https://acmelogistics.example.com",
        "industry": "Logistics",
        "location": "Chicago, IL",
        "company_size": "250–500",
        "requirement": "Warehouse Automation & Dispatch: Seeking AI-assisted warehouse automation, route optimization, and automated outbound voice dispatch to handle regional freight deliveries.",
        "source_platform": "Public B2B RFP Directories",
        "original_post_url": "https://transport-exchange-b2b.example.internal/rfp/logistics-dispatch-ai-7729",
        "intent_score": 94.0,
    },
    {
        "keyword": "Enterprise ERP Integration",
        "company_name": "Nexus Retail Technologies",
        "contact_name": "Elena Rostova",
        "job_title": "Head of Enterprise Systems",
        "business_email": None,  # Non-public contact
        "contact_phone": None,   # Non-public contact
        "linkedin_profile": "https://www.linkedin.com/in/elena-rostova-erp",
        "website": "https://nexus-retail.example.internal",
        "industry": "IT Services",
        "location": "London, UK",
        "company_size": "500–1,000",
        "requirement": "RFP open: Integration partner needed to bridge legacy SAP systems with cloud CRM and omnichannel POS.",
        "source_platform": "Public B2B RFP Directories",
        "original_post_url": "https://rfp-hub.example.internal/rfps/it-nexus-erp-migration-2026",
        "intent_score": 91.0,
    },
    {
        "keyword": "Enterprise Cloud Migration",
        "company_name": "SyntheSys Global Systems",
        # Case: Anonymous / No contact info available publicly in post
        "contact_name": None,
        "job_title": None,
        "business_email": None,
        "contact_phone": None,
        "linkedin_profile": None,
        "website": "https://synthesys-global.example.internal",
        "industry": "IT Services",
        "location": "Global",
        "company_size": "500–1,000",
        "requirement": "Public Tender RFP: Enterprise multi-tenant database migration and SOC2 audit compliance consulting team needed.",
        "source_platform": "Public B2B RFP Directories",
        "original_post_url": "https://rfp-directory.example.internal/tenders/it-services-cloud-migration-8821",
        "intent_score": 88.0,
    },
    {
        "keyword": "Healthcare Telephony Automation",
        "company_name": "BioHealth Logistics Tech",
        "contact_name": "Jordan Taylor",
        "job_title": "Director of Operations",
        "business_email": "jordan.t@biohealth.example.internal",
        "contact_phone": "+1 (555) 012-3456",
        "linkedin_profile": "https://www.linkedin.com/in/jordan-taylor-ops",
        "website": "https://biohealth-logistics.example.internal",
        "industry": "Healthcare",
        "location": "Boston, MA",
        "company_size": "50–200",
        "requirement": "Seeking compliant patient dispatch and appointment confirmation telephony automation system.",
        "source_platform": "Freelance Job Boards",
        "original_post_url": "https://freelance-tech-board.example.internal/projects/healthcare-telephony-ai-4410",
        "intent_score": 85.0,
    },
]


class DiscoveryService:
    @staticmethod
    def _normalize_enrichment_field(val: Optional[str]) -> str:
        """Returns the trimmed value or explicitly 'unavailable' (never silently blank/undefined)."""
        if not val or not str(val).strip():
            return "unavailable"
        return str(val).strip()

    @staticmethod
    def scan_public_sources(
        db: Session,
        request: Optional[DiscoveryScanRequest] = None,
        owner_id: Optional[UUID] = None,
        keywords: Optional[str] = None,
        keyword: Optional[str] = None,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        sources: Optional[List[str]] = None,
        max_results: Optional[int] = None,
    ) -> DiscoveryScanResponse:
        # Normalize request parameters
        target_keyword = keyword or keywords or (request.keyword if request else "")
        target_industry = industry or (request.industry if request else None)
        target_location = location or (request.location if request else None)
        target_sources = sources or (request.sources if request and request.sources else None)

        if request is None:
            request = DiscoveryScanRequest(
                keyword=target_keyword,
                industry=target_industry,
                location=target_location,
                sources=target_sources
            )

        # Determine business ID for persistence
        business = None
        if owner_id:
            business = db.scalars(select(Business).where(Business.owner_id == owner_id)).first()
        if not business:
            business = db.scalars(select(Business)).first()

        if not business:
            profile = db.scalars(select(Profile)).first()
            if not profile:
                profile = Profile(
                    id=uuid5(NAMESPACE_DNS, "default-discovery-user"),
                    email="admin@sales-platform.internal",
                    full_name="Platform Admin",
                    role="admin"
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)

            business = Business(
                id=uuid5(NAMESPACE_DNS, "default-discovery-business"),
                owner_id=profile.id,
                name="Default Discovery Business",
                industry="IT Services",
                description="Auto-generated business context for public discovery persistence",
                contact_email="admin@sales-platform.internal"
            )
            db.add(business)
            db.commit()
            db.refresh(business)

        business_id = business.id

        # Execute multi-source fan-out search across all registered adapters in parallel
        from app.services.discovery_adapters.orchestrator import MultiSourceDiscoveryOrchestrator
        orchestrator = MultiSourceDiscoveryOrchestrator()
        discovered_posts = orchestrator.fan_out_search(
            keyword=request.keyword,
            industry=request.industry,
            location=request.location,
            requested_sources=request.sources,
        )

        matched_results: List[DiscoveredLeadEnrichment] = []

        for post in discovered_posts:
            # Prepare deterministic UUID based on company name
            lead_uuid = uuid5(NAMESPACE_DNS, f"discovered-{post.company_name}")

            # Persist directly into the database leads table (Single Source of Truth)
            if business_id:
                existing_lead = db.scalars(select(Lead).where(Lead.id == lead_uuid)).first()
                if not existing_lead:
                    existing_by_name = db.scalars(
                        select(Lead).where(Lead.company_name == post.company_name)
                    ).first()
                    existing_lead = existing_by_name

                if not existing_lead:
                    new_lead = Lead(
                        id=lead_uuid,
                        business_id=business_id,
                        company_name=post.company_name,
                        contact_name=post.contact_name or "Decision Maker",
                        contact_email=post.business_email,
                        contact_phone=post.contact_phone,
                        requirement=post.requirement,
                        industry=post.industry,
                        location=post.location,
                        source=post.source_platform,
                        source_url=post.original_post_url,
                        job_title=post.job_title,
                        company_size=post.company_size,
                        linkedin_url=post.linkedin_profile,
                        website=post.website,
                        status="new",
                        intent_score=post.intent_score,
                    )
                    db.add(new_lead)
                    db.commit()
                    db.refresh(new_lead)
                    lead_db_id = new_lead.id
                else:
                    # Update enrichment fields if previously null
                    if not existing_lead.job_title and post.job_title:
                        existing_lead.job_title = post.job_title
                    if not existing_lead.company_size and post.company_size:
                        existing_lead.company_size = post.company_size
                    if not existing_lead.linkedin_url and post.linkedin_profile:
                        existing_lead.linkedin_url = post.linkedin_profile
                    if not existing_lead.website and post.website:
                        existing_lead.website = post.website
                    db.commit()
                    lead_db_id = existing_lead.id

                # Populate or update lead intelligence record
                existing_intel = db.scalars(select(LeadIntelligence).where(LeadIntelligence.lead_id == lead_db_id)).first()
                if not existing_intel:
                    intel = LeadIntelligence(
                        lead_id=lead_db_id,
                        why_now=post.inferred_need_basis or f"Discovered on {post.source_platform}",
                        hiring_signals=[{"role": post.job_title, "basis": post.inferred_need_basis}] if post.is_inferred_from_hiring else [],
                        buying_signals=[{"platform": post.source_platform, "url": post.original_post_url}],
                        raw_analysis=post.raw_metadata,
                    )
                    db.add(intel)
                    db.commit()
            else:
                lead_db_id = lead_uuid

            # Auto-enrichment normalization: populate or mark explicitly 'unavailable'
            enriched = DiscoveredLeadEnrichment(
                id=lead_db_id,
                name=DiscoveryService._normalize_enrichment_field(post.contact_name),
                business_email=DiscoveryService._normalize_enrichment_field(post.business_email),
                phone=DiscoveryService._normalize_enrichment_field(post.contact_phone),
                linkedin_profile=DiscoveryService._normalize_enrichment_field(post.linkedin_profile),
                company_name=post.company_name,
                website=DiscoveryService._normalize_enrichment_field(post.website),
                job_title=DiscoveryService._normalize_enrichment_field(post.job_title),
                industry=post.industry,
                location=post.location or "Global",
                company_size=DiscoveryService._normalize_enrichment_field(post.company_size),
                original_post_url=post.original_post_url,
                source_platform=post.source_platform,
                discovery_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                intent_score=post.intent_score,
                requirement=post.requirement,
                signal_type=post.signal_type,
                is_inferred_from_hiring=post.is_inferred_from_hiring,
                inferred_need_basis=post.inferred_need_basis,
            )
            matched_results.append(enriched)

        return DiscoveryScanResponse(
            total_discovered=len(matched_results),
            query=request,
            leads=matched_results,
        )

    @staticmethod
    def get_discovered_leads(
        db: Session,
        owner_id: Optional[UUID] = None,
        keyword: Optional[str] = None,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 50,
    ) -> List[DiscoveredLeadEnrichment]:
        query = select(Lead)
        if owner_id:
            query = query.join(Business, Lead.business_id == Business.id).where(Business.owner_id == owner_id)

        if keyword:
            kw = f"%{keyword.strip()}%"
            query = query.where(or_(Lead.company_name.ilike(kw), Lead.requirement.ilike(kw)))
        if industry and industry.lower() != "all":
            query = query.where(Lead.industry.ilike(f"%{industry.strip()}%"))
        if location and location.lower() != "all" and location.lower() != "global":
            query = query.where(Lead.location.ilike(f"%{location.strip()}%"))

        leads = db.scalars(query.limit(limit)).all()
        results = []
        for l in leads:
            results.append(
                DiscoveredLeadEnrichment(
                    id=l.id,
                    name=DiscoveryService._normalize_enrichment_field(l.contact_name),
                    business_email=DiscoveryService._normalize_enrichment_field(l.contact_email),
                    phone=DiscoveryService._normalize_enrichment_field(l.contact_phone),
                    linkedin_profile=DiscoveryService._normalize_enrichment_field(l.linkedin_url),
                    company_name=l.company_name,
                    website=DiscoveryService._normalize_enrichment_field(l.website),
                    job_title=DiscoveryService._normalize_enrichment_field(l.job_title),
                    industry=l.industry or "Technology",
                    location=l.location or "Global",
                    company_size=DiscoveryService._normalize_enrichment_field(l.company_size),
                    original_post_url=l.source_url or "https://discovery.example.internal",
                    source_platform=l.source or "Discovery",
                    discovery_date=l.created_at.strftime("%Y-%m-%d") if l.created_at else datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                    intent_score=l.intent_score or 80.0,
                    requirement=l.requirement or "",
                )
            )
        return results
