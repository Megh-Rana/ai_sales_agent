import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, Uuid, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False, default="signal")  # signal, call, followup, campaign
    read = Column(Boolean, nullable=False, default=False)
    target_path = Column(String(255), nullable=True, default="/dashboard")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationships
    user = relationship("Profile", back_populates="notifications")
