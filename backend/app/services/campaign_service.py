from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session, joinedload
from app.db.models.campaign import Campaign
from app.db.models.campaign_lead import CampaignLead
from app.db.models.lead import Lead
from app.db.models.business import Business
from app.schemas.campaign import CampaignCreate, CampaignLeadCreate, CampaignResponse, CampaignLeadResponse


class CampaignService:
    @staticmethod
    def create_campaign(db: Session, campaign_in: CampaignCreate, owner_id: UUID) -> CampaignResponse:
        # Determine business_id
        business_id = campaign_in.business_id
        if not business_id:
            first_business = db.scalars(select(Business).where(Business.owner_id == owner_id)).first()
            if first_business:
                business_id = first_business.id

        campaign = Campaign(
            owner_id=owner_id,
            business_id=business_id,
            name=campaign_in.name.strip(),
            objective=campaign_in.objective,
            primary_channel=campaign_in.primary_channel,
            status=campaign_in.status,
            estimated_pipeline_value=campaign_in.estimated_pipeline_value or "₹42.5L",
        )
        db.add(campaign)
        db.commit()
        db.refresh(campaign)

        # Collect lead IDs from lead_ids or leads list
        incoming_lead_map = {}
        for lead_item in campaign_in.leads:
            incoming_lead_map[lead_item.lead_id] = lead_item

        all_lead_ids = list(set(list(campaign_in.lead_ids) + list(incoming_lead_map.keys())))

        # Validate that all leads exist in DB
        if all_lead_ids:
            existing_leads = db.scalars(select(Lead).where(Lead.id.in_(all_lead_ids))).all()
            existing_lead_ids = {lead.id for lead in existing_leads}

            campaign_lead_entries = []
            for lid in all_lead_ids:
                if lid in existing_lead_ids:
                    item_info = incoming_lead_map.get(lid)
                    hook = item_info.custom_opening_hook if item_info else None
                    val_prop = item_info.custom_value_prop if item_info else None
                    status = item_info.status if (item_info and item_info.status) else "QUEUED"

                    clead = CampaignLead(
                        campaign_id=campaign.id,
                        lead_id=lid,
                        status=status,
                        custom_opening_hook=hook,
                        custom_value_prop=val_prop,
                    )
                    campaign_lead_entries.append(clead)

            if campaign_lead_entries:
                db.add_all(campaign_lead_entries)
                db.commit()

        return CampaignService.get_campaign(db, campaign.id, owner_id)

    @staticmethod
    def list_campaigns(db: Session, owner_id: UUID) -> List[CampaignResponse]:
        campaigns = db.scalars(
            select(Campaign)
            .where(Campaign.owner_id == owner_id)
            .order_by(desc(Campaign.created_at))
        ).all()

        results = []
        for camp in campaigns:
            # Query live counts
            leads_query = (
                select(CampaignLead, Lead)
                .join(Lead, CampaignLead.lead_id == Lead.id)
                .where(CampaignLead.campaign_id == camp.id)
            )
            camp_leads_rows = db.execute(leads_query).all()

            target_count = len(camp_leads_rows)
            contacted = sum(1 for cl, l in camp_leads_rows if cl.status in ("CONTACTED", "QUALIFIED", "INTERESTED", "CONVERTED") or l.status in ("contacted", "qualified", "interested", "converted"))
            qualified = sum(1 for cl, l in camp_leads_rows if cl.status in ("QUALIFIED", "INTERESTED", "CONVERTED") or l.status in ("qualified", "interested", "converted"))
            meetings = sum(1 for cl, l in camp_leads_rows if cl.status == "CONVERTED" or l.status == "converted")
            conv_rate = round((meetings / target_count * 100), 1) if target_count > 0 else 0.0

            leads_resp = [
                CampaignLeadResponse(
                    id=cl.id,
                    campaign_id=cl.campaign_id,
                    lead_id=cl.lead_id,
                    status=cl.status,
                    custom_opening_hook=cl.custom_opening_hook or l.requirement,
                    custom_value_prop=cl.custom_value_prop,
                    created_at=cl.created_at,
                    company_name=l.company_name,
                    contact_name=l.contact_name or l.company_name,
                    contact_phone=l.contact_phone or "+91 98765 43210",
                    contact_role="Executive",
                    industry=l.industry or "Technology",
                    intent_score=l.intent_score or 85.0,
                )
                for cl, l in camp_leads_rows
            ]

            objective_labels = {
                "REQUIREMENT_RESPONSE": "Public Requirement Response",
                "BOOK_MEETINGS": "Meeting Booking",
                "ICP_OUTREACH": "ICP Outreach",
                "SERVICE_PROMOTION": "Service Promotion",
            }

            results.append(
                CampaignResponse(
                    id=camp.id,
                    owner_id=camp.owner_id,
                    business_id=camp.business_id,
                    name=camp.name,
                    objective=camp.objective,
                    objective_label=objective_labels.get(camp.objective, camp.objective),
                    primary_channel=camp.primary_channel,
                    status=camp.status,
                    estimated_pipeline_value=camp.estimated_pipeline_value or "₹42.5L",
                    target_audience_count=target_count,
                    contacted_count=contacted,
                    qualified_count=qualified,
                    meetings_booked_count=meetings,
                    conversion_rate=conv_rate,
                    created_at=camp.created_at,
                    started_at=camp.started_at,
                    completed_at=camp.completed_at,
                    leads=leads_resp,
                )
            )

        return results

    @staticmethod
    def get_campaign(db: Session, campaign_id: UUID, owner_id: UUID) -> Optional[CampaignResponse]:
        camp = db.scalars(
            select(Campaign).where(Campaign.id == campaign_id, Campaign.owner_id == owner_id)
        ).first()
        if not camp:
            return None

        leads_query = (
            select(CampaignLead, Lead)
            .join(Lead, CampaignLead.lead_id == Lead.id)
            .where(CampaignLead.campaign_id == camp.id)
        )
        camp_leads_rows = db.execute(leads_query).all()

        target_count = len(camp_leads_rows)
        contacted = sum(1 for cl, l in camp_leads_rows if cl.status in ("CONTACTED", "QUALIFIED", "INTERESTED", "CONVERTED") or l.status in ("contacted", "qualified", "interested", "converted"))
        qualified = sum(1 for cl, l in camp_leads_rows if cl.status in ("QUALIFIED", "INTERESTED", "CONVERTED") or l.status in ("qualified", "interested", "converted"))
        meetings = sum(1 for cl, l in camp_leads_rows if cl.status == "CONVERTED" or l.status == "converted")
        conv_rate = round((meetings / target_count * 100), 1) if target_count > 0 else 0.0

        leads_resp = [
            CampaignLeadResponse(
                id=cl.id,
                campaign_id=cl.campaign_id,
                lead_id=cl.lead_id,
                status=cl.status,
                custom_opening_hook=cl.custom_opening_hook or l.requirement,
                custom_value_prop=cl.custom_value_prop,
                created_at=cl.created_at,
                company_name=l.company_name,
                contact_name=l.contact_name or l.company_name,
                contact_phone=l.contact_phone or "+91 98765 43210",
                contact_role="Executive",
                industry=l.industry or "Technology",
                intent_score=l.intent_score or 85.0,
            )
            for cl, l in camp_leads_rows
        ]

        objective_labels = {
            "REQUIREMENT_RESPONSE": "Public Requirement Response",
            "BOOK_MEETINGS": "Meeting Booking",
            "ICP_OUTREACH": "ICP Outreach",
            "SERVICE_PROMOTION": "Service Promotion",
        }

        return CampaignResponse(
            id=camp.id,
            owner_id=camp.owner_id,
            business_id=camp.business_id,
            name=camp.name,
            objective=camp.objective,
            objective_label=objective_labels.get(camp.objective, camp.objective),
            primary_channel=camp.primary_channel,
            status=camp.status,
            estimated_pipeline_value=camp.estimated_pipeline_value or "₹42.5L",
            target_audience_count=target_count,
            contacted_count=contacted,
            qualified_count=qualified,
            meetings_booked_count=meetings,
            conversion_rate=conv_rate,
            created_at=camp.created_at,
            started_at=camp.started_at,
            completed_at=camp.completed_at,
            leads=leads_resp,
        )

    @staticmethod
    def add_leads_to_campaign(
        db: Session, campaign_id: UUID, lead_ids: List[UUID], owner_id: UUID
    ) -> CampaignResponse:
        camp = db.scalars(
            select(Campaign).where(Campaign.id == campaign_id, Campaign.owner_id == owner_id)
        ).first()
        if not camp:
            raise ValueError(f"Campaign with ID {campaign_id} not found.")

        # Find existing leads attached to avoid duplicates
        existing_cleads = db.scalars(
            select(CampaignLead.lead_id).where(CampaignLead.campaign_id == campaign_id)
        ).all()
        existing_set = set(existing_cleads)

        new_entries = []
        for lid in lead_ids:
            if lid not in existing_set:
                new_entries.append(
                    CampaignLead(
                        campaign_id=campaign_id,
                        lead_id=lid,
                        status="QUEUED",
                    )
                )

        if new_entries:
            db.add_all(new_entries)
            db.commit()

        return CampaignService.get_campaign(db, campaign_id, owner_id)

    @staticmethod
    def update_campaign_lead_status(
        db: Session, campaign_id: UUID, lead_id: UUID, new_status: str, owner_id: UUID
    ) -> Optional[CampaignLeadResponse]:
        camp = db.scalars(
            select(Campaign).where(Campaign.id == campaign_id, Campaign.owner_id == owner_id)
        ).first()
        if not camp:
            return None

        clead = db.scalars(
            select(CampaignLead).where(
                CampaignLead.campaign_id == campaign_id,
                CampaignLead.lead_id == lead_id
            )
        ).first()
        if not clead:
            return None

        clead.status = new_status
        db.commit()
        db.refresh(clead)

        lead = db.scalars(select(Lead).where(Lead.id == lead_id)).first()
        return CampaignLeadResponse(
            id=clead.id,
            campaign_id=clead.campaign_id,
            lead_id=clead.lead_id,
            status=clead.status,
            custom_opening_hook=clead.custom_opening_hook,
            custom_value_prop=clead.custom_value_prop,
            created_at=clead.created_at,
            company_name=lead.company_name if lead else None,
            contact_name=lead.contact_name if lead else None,
            contact_phone=lead.contact_phone if lead else None,
            contact_role="Executive",
            industry=lead.industry if lead else None,
            intent_score=lead.intent_score if lead else None,
        )
