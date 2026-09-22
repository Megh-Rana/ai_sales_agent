import uuid
from sqlalchemy import Column, String, Text, DateTime, Uuid, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class CampaignLead(Base):
    __tablename__ = "campaign_leads"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    campaign_id = Column(
        Uuid,
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lead_id = Column(
        Uuid,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(String(50), nullable=False, default="QUEUED", index=True)
    # Statuses: QUEUED, CONTACTED, QUALIFIED, INTERESTED, CONVERTED, LOST
    custom_opening_hook = Column(Text, nullable=True)
    custom_value_prop = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    campaign = relationship("Campaign", back_populates="campaign_leads")
    lead = relationship("Lead")
