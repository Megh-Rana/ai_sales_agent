import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, Uuid, ForeignKey, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base

JSONType = JSON().with_variant(JSONB, "postgresql")


class Call(Base):
    __tablename__ = "calls"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    lead_id = Column(
        Uuid,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    status = Column(String(50), nullable=False, default="scheduled")
    language = Column(String(20), nullable=True, default="en")
    duration = Column(Integer, nullable=True)  # duration in seconds
    transcript = Column(Text, nullable=True)   # raw transcript storage, no AI analysis
    outcome = Column(String(100), nullable=True)
    provider = Column(String(50), nullable=True)
    provider_call_id = Column(String(255), nullable=True, index=True)
    metadata_json = Column(JSONType, nullable=True)
    analysis = Column(JSONType, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    lead = relationship("Lead", back_populates="calls")
    webhook_events = relationship(
        "CallWebhookEvent",
        back_populates="call",
        cascade="all, delete-orphan",
        order_by="CallWebhookEvent.received_at.desc()"
    )
