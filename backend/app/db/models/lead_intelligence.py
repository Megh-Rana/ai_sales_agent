import uuid
from sqlalchemy import Column, Text, DateTime, Uuid, ForeignKey, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base

JSONType = JSON().with_variant(JSONB, "postgresql")


class LeadIntelligence(Base):
    __tablename__ = "lead_intelligence"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    lead_id = Column(
        Uuid,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    company_description = Column(Text, nullable=True)
    pain_points = Column(JSONType, nullable=True)
    buying_signals = Column(JSONType, nullable=True)
    why_now = Column(Text, nullable=True)
    technology = Column(JSONType, nullable=True)
    hiring_signals = Column(JSONType, nullable=True)
    funding_signals = Column(JSONType, nullable=True)
    competitors = Column(JSONType, nullable=True)
    research_summary = Column(Text, nullable=True)
    qualification = Column(JSONType, nullable=True)
    raw_analysis = Column(JSONType, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    lead = relationship("Lead", back_populates="intelligence")
