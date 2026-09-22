import uuid
from sqlalchemy import Column, String, Text, Float, DateTime, Uuid, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    business_id = Column(
        Uuid,
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    company_name = Column(String(255), nullable=False)
    contact_name = Column(String(255), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    requirement = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    source = Column(String(100), nullable=True, index=True)
    source_url = Column(String(500), nullable=True)
    job_title = Column(String(255), nullable=True)
    company_size = Column(String(100), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False, default="new", index=True)
    
    # Stored intent_score - note: no AI scoring logic here, strictly storage
    intent_score = Column(Float, nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    business = relationship("Business", back_populates="leads")
    intelligence = relationship(
        "LeadIntelligence",
        back_populates="lead",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    calls = relationship(
        "Call",
        back_populates="lead",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
