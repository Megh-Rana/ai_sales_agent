import uuid
from sqlalchemy import Column, String, DateTime, Uuid, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    owner_id = Column(
        Uuid,
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    business_id = Column(
        Uuid,
        ForeignKey("businesses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name = Column(String(255), nullable=False)
    objective = Column(String(100), nullable=False, default="ICP_OUTREACH")
    # e.g. BOOK_MEETINGS, REQUIREMENT_RESPONSE, REENGAGE_STALLED, ICP_OUTREACH, SERVICE_PROMOTION
    primary_channel = Column(String(50), nullable=False, default="AI_VOICE_CALL")
    # e.g. AI_VOICE_CALL, FOLLOW_UP_CADENCE, MULTI_CHANNEL
    status = Column(String(50), nullable=False, default="READY", index=True)
    # e.g. DRAFT, READY, RUNNING, PAUSED, COMPLETED, STOPPED
    estimated_pipeline_value = Column(String(50), nullable=True)
    
    # Timezone and scheduling fields (TC-35, TC-37)
    timezone = Column(String(50), nullable=False, default="UTC")  # IANA timezone (e.g., "Asia/Kolkata", "America/New_York")
    business_hours_start = Column(String(10), nullable=False, default="09:00")  # HH:MM format
    business_hours_end = Column(String(10), nullable=False, default="18:00")  # HH:MM format
    repeat_enabled = Column(String(10), nullable=False, default="false")  # "true" or "false"
    repeat_schedule = Column(String(50), nullable=True)  # "daily", "weekly", "monthly", or null

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    campaign_leads = relationship(
        "CampaignLead",
        back_populates="campaign",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
