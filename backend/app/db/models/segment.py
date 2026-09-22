import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, Uuid, ForeignKey, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base

JSONType = JSON().with_variant(JSONB, "postgresql")


class Segment(Base):
    __tablename__ = "segments"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    owner_id = Column(
        Uuid,
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    business_id = Column(
        Uuid,
        ForeignKey("businesses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    filters = Column(JSONType, nullable=False, default=dict)
    lead_count = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("Profile", foreign_keys=[owner_id])
    business = relationship("Business", foreign_keys=[business_id])
