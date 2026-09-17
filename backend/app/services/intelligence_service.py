from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models.business import Business
from app.db.models.lead import Lead
from app.db.models.lead_intelligence import LeadIntelligence
from app.schemas.intelligence import (
    LeadIntelligenceCreate,
    LeadIntelligenceUpdate,
)


class IntelligenceService:
    @staticmethod
    def get_lead_intelligence(
        db: Session, lead_id: UUID, owner_id: UUID
    ) -> Optional[LeadIntelligence]:
        stmt = (
            select(LeadIntelligence)
            .join(Lead, LeadIntelligence.lead_id == Lead.id)
            .join(Business, Lead.business_id == Business.id)
            .where(
                LeadIntelligence.lead_id == lead_id,
                Business.owner_id == owner_id,
            )
            .order_by(LeadIntelligence.created_at.desc())
        )
        return db.scalars(stmt).first()

    @staticmethod
    def create_lead_intelligence(
        db: Session, lead_id: UUID, intel_in: LeadIntelligenceCreate, owner_id: UUID
    ) -> LeadIntelligence:
        # Verify lead exists and belongs to a business owned by the user
        lead = db.scalars(
            select(Lead)
            .join(Business, Lead.business_id == Business.id)
            .where(
                Lead.id == lead_id,
                Business.owner_id == owner_id,
            )
        ).first()
        if not lead:
            raise ValueError(f"Lead with ID {lead_id} does not exist.")

        intelligence = LeadIntelligence(
            lead_id=lead_id,
            company_description=intel_in.company_description,
            pain_points=intel_in.pain_points,
            buying_signals=intel_in.buying_signals,
            why_now=intel_in.why_now,
            technology=intel_in.technology,
            hiring_signals=intel_in.hiring_signals,
            funding_signals=intel_in.funding_signals,
            competitors=intel_in.competitors,
            research_summary=intel_in.research_summary,
        )
        db.add(intelligence)
        db.commit()
        db.refresh(intelligence)
        return intelligence

    @staticmethod
    def upsert_lead_intelligence(
        db: Session, lead_id: UUID, intel_in: LeadIntelligenceUpdate, owner_id: UUID
    ) -> LeadIntelligence:
        # Verify lead exists and belongs to a business owned by the user
        lead = db.scalars(
            select(Lead)
            .join(Business, Lead.business_id == Business.id)
            .where(
                Lead.id == lead_id,
                Business.owner_id == owner_id,
            )
        ).first()
        if not lead:
            raise ValueError(f"Lead with ID {lead_id} does not exist.")

        existing = IntelligenceService.get_lead_intelligence(db, lead_id, owner_id=owner_id)
        if existing:
            update_data = intel_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(existing, field, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            return IntelligenceService.create_lead_intelligence(
                db, lead_id, LeadIntelligenceCreate(**intel_in.model_dump()), owner_id=owner_id
            )
