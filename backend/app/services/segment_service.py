from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.db.models.segment import Segment
from app.schemas.segment import SegmentCreate, SegmentUpdate


class SegmentService:
    @staticmethod
    def create_segment(
        db: Session,
        segment_in: SegmentCreate,
        owner_id: Optional[UUID] = None,
    ) -> Segment:
        segment = Segment(
            name=segment_in.name,
            description=segment_in.description,
            filters=segment_in.filters,
            lead_count=segment_in.lead_count,
            business_id=segment_in.business_id,
            owner_id=owner_id,
        )
        db.add(segment)
        db.commit()
        db.refresh(segment)
        return segment

    @staticmethod
    def list_segments(
        db: Session,
        owner_id: Optional[UUID] = None,
        business_id: Optional[UUID] = None,
    ) -> List[Segment]:
        query = db.query(Segment)
        if owner_id:
            query = query.filter((Segment.owner_id == owner_id) | (Segment.owner_id.is_(None)))
        if business_id:
            query = query.filter(Segment.business_id == business_id)
        return query.order_by(Segment.created_at.desc()).all()

    @staticmethod
    def get_segment(
        db: Session,
        segment_id: UUID,
        owner_id: Optional[UUID] = None,
    ) -> Optional[Segment]:
        query = db.query(Segment).filter(Segment.id == segment_id)
        if owner_id:
            query = query.filter((Segment.owner_id == owner_id) | (Segment.owner_id.is_(None)))
        return query.first()

    @staticmethod
    def update_segment(
        db: Session,
        segment_id: UUID,
        segment_in: SegmentUpdate,
        owner_id: Optional[UUID] = None,
    ) -> Optional[Segment]:
        segment = SegmentService.get_segment(db, segment_id, owner_id=owner_id)
        if not segment:
            return None
        update_data = segment_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(segment, key, value)
        db.commit()
        db.refresh(segment)
        return segment

    @staticmethod
    def delete_segment(
        db: Session,
        segment_id: UUID,
        owner_id: Optional[UUID] = None,
    ) -> bool:
        segment = SegmentService.get_segment(db, segment_id, owner_id=owner_id)
        if not segment:
            return False
        db.delete(segment)
        db.commit()
        return True
