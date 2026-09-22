import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Uuid, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(100), nullable=False, index=True)  # login, lead_view, campaign_launch, lead_export, settings_change
    resource = Column(String(255), nullable=True)   # e.g. lead ID, campaign ID, etc.
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    extra_metadata = Column("metadata", JSON, nullable=True)  # alias avoids collision with Base.metadata

    # Relationships
    user = relationship("Profile", back_populates="activity_logs")
