import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Uuid, ForeignKey, func, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base

JSONType = JSON().with_variant(JSONB, "postgresql")


class CRMIntegration(Base):
    __tablename__ = "crm_integrations"

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
    crm_type = Column(String(50), nullable=False, default="hubspot", index=True)
    access_token = Column(String(500), nullable=True)
    refresh_token = Column(String(500), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    account_name = Column(String(255), nullable=True, default="HubSpot Sandbox Demo")
    connected = Column(Boolean, nullable=False, default=True)
    auto_sync = Column(Boolean, nullable=False, default=True)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    sync_logs = Column(JSONType, nullable=False, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("Profile", foreign_keys=[owner_id])
    business = relationship("Business", foreign_keys=[business_id])
