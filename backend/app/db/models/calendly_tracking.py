import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Uuid, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class CalendlyTracking(Base):
    """
    Tracks Calendly booking links dispatched to leads during AI voice calls.
    Monitors whether the lead books within the 24-hour window, and drives
    automated follow-up re-dialing (up to 3 attempts) if unbooked.
    """
    __tablename__ = "calendly_trackings"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    lead_id = Column(
        Uuid,
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    call_id = Column(
        Uuid,
        ForeignKey("calls.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    phone_number = Column(String(50), nullable=False)
    calendly_url = Column(String(500), nullable=False)
    sms_sid = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    email_delivery_id = Column(String(100), nullable=True)
    
    # Status: 'pending', 'booked', 'recalled', 'expired', 'cancelled'
    status = Column(String(50), nullable=False, default="pending", index=True)
    
    # Click tracking via smart redirect
    link_clicked = Column(Boolean, default=False, nullable=False)
    link_clicked_at = Column(DateTime(timezone=True), nullable=True)

    # Booking confirmation details (from Calendly Webhook or sync)
    scheduled_event_uri = Column(String(500), nullable=True)
    event_start_time = Column(DateTime(timezone=True), nullable=True)
    booked_at = Column(DateTime(timezone=True), nullable=True)

    # Follow-up recall schedule (default: 24h after SMS dispatch)
    followup_due_at = Column(DateTime(timezone=True), nullable=False, index=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    last_recalled_at = Column(DateTime(timezone=True), nullable=True)
    recall_call_id = Column(
        Uuid,
        ForeignKey("calls.id", ondelete="SET NULL"),
        nullable=True
    )
    
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    lead = relationship("Lead")
    call = relationship("Call", foreign_keys=[call_id])
    recall_call = relationship("Call", foreign_keys=[recall_call_id])
