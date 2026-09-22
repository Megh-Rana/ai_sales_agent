from uuid import uuid4
from sqlalchemy import Column, String, Text, Boolean, DateTime, Uuid, func
from app.db.database import Base


class ProductComplianceReview(Base):
    __tablename__ = "product_compliance_reviews"

    id = Column(Uuid, primary_key=True, default=uuid4)
    business_id = Column(Uuid, nullable=True, index=True)
    product_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="needs-review")  # 'auto-approved', 'needs-review', 'approved', 'rejected'
    category = Column(String(100), nullable=False, default="General Commercial")
    is_regulated = Column(Boolean, nullable=False, default=False)
    inconclusive = Column(Boolean, nullable=False, default=False)
    reason = Column(Text, nullable=True)
    blocked_calling = Column(Boolean, nullable=False, default=True)
    reviewed_by = Column(Uuid, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
