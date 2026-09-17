from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.db.models.business import Business
from app.db.models.profile import Profile
from app.schemas.business import BusinessCreate, BusinessUpdate


class BusinessService:
    @staticmethod
    def get_or_create_profile(
        db: Session, user_id: UUID, email: Optional[str] = None
    ) -> Profile:
        """Ensures an application profile exists for the authenticated user."""
        profile = db.scalars(select(Profile).where(Profile.id == user_id)).first()
        if not profile:
            profile = Profile(id=user_id, email=email)
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @staticmethod
    def create_business(
        db: Session, business_in: BusinessCreate, owner_id: UUID, owner_email: Optional[str] = None
    ) -> Business:
        # Guarantee profile exists for foreign key
        BusinessService.get_or_create_profile(db, owner_id, owner_email)

        business = Business(
            owner_id=owner_id,
            name=business_in.name,
            industry=business_in.industry,
            description=business_in.description,
            website=business_in.website,
            location=business_in.location,
            contact_email=business_in.contact_email,
            contact_phone=business_in.contact_phone,
        )
        db.add(business)
        db.commit()
        db.refresh(business)
        return business

    @staticmethod
    def get_business(
        db: Session, business_id: UUID, owner_id: UUID
    ) -> Optional[Business]:
        stmt = select(Business).where(
            Business.id == business_id,
            Business.owner_id == owner_id
        )
        return db.scalars(stmt).first()

    @staticmethod
    def list_businesses(
        db: Session, owner_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[Business], int]:
        total_stmt = select(func.count(Business.id)).where(Business.owner_id == owner_id)
        total = db.scalar(total_stmt) or 0

        offset = (page - 1) * page_size
        stmt = (
            select(Business)
            .where(Business.owner_id == owner_id)
            .order_by(Business.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = list(db.scalars(stmt).all())
        return items, total

    @staticmethod
    def update_business(
        db: Session, business_id: UUID, business_in: BusinessUpdate, owner_id: UUID
    ) -> Optional[Business]:
        business = BusinessService.get_business(db, business_id, owner_id)
        if not business:
            return None

        update_data = business_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(business, field, value)

        db.commit()
        db.refresh(business)
        return business

    @staticmethod
    def delete_business(
        db: Session, business_id: UUID, owner_id: UUID
    ) -> bool:
        business = BusinessService.get_business(db, business_id, owner_id)
        if not business:
            return False

        db.delete(business)
        db.commit()
        return True
