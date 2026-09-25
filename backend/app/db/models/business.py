import os
import uuid
from sqlalchemy import Column, String, Text, DateTime, Uuid, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    owner_id = Column(
        Uuid,
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    calendly_url = Column(String(500), nullable=True, default=os.getenv("DEFAULT_CALENDLY_URL", "https://calendly.com/meghrana2007/30min"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("Profile", back_populates="businesses")
    leads = relationship(
        "Lead",
        back_populates="business",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
