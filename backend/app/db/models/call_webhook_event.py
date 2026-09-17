import uuid
from sqlalchemy import Column, String, DateTime, Uuid, ForeignKey, UniqueConstraint, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base

JSONType = JSON().with_variant(JSONB, "postgresql")


class CallWebhookEvent(Base):
    __tablename__ = "call_webhook_events"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    call_id = Column(
        Uuid,
        ForeignKey("calls.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider = Column(String(50), nullable=False, default="generic")
    event_id = Column(String(255), nullable=False)
    event_type = Column(String(100), nullable=False)
    received_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    payload_metadata = Column(JSONType, nullable=True)

    __table_args__ = (
        UniqueConstraint("provider", "event_id", name="uq_provider_event_id"),
    )

    # Relationship
    call = relationship("Call", back_populates="webhook_events")
