from datetime import datetime, timezone
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.db.models.business import Business
from app.db.models.call import Call
from app.db.models.call_webhook_event import CallWebhookEvent
from app.db.models.lead import Lead
from app.schemas.call import CallCreate, CallUpdate
from app.schemas.webhook import CallWebhookPayload, CallWebhookResponse
from app.services.call_lifecycle import validate_call_transition


class CallService:
    @staticmethod
    def create_call(db: Session, call_in: CallCreate, owner_id: UUID) -> Call:
        # Validate foreign key: Lead must exist AND belong to a business owned by the user
        lead = db.scalars(
            select(Lead)
            .join(Business, Lead.business_id == Business.id)
            .where(
                Lead.id == call_in.lead_id,
                Business.owner_id == owner_id,
            )
        ).first()
        if not lead:
            raise ValueError(f"Lead with ID {call_in.lead_id} does not exist.")

        call = Call(
            lead_id=call_in.lead_id,
            status=call_in.status.value if hasattr(call_in.status, "value") else str(call_in.status),
            language=call_in.language,
            duration=call_in.duration,
            transcript=call_in.transcript,  # Raw storage, no AI analysis performed
            outcome=call_in.outcome,
            provider=call_in.provider,
            provider_call_id=call_in.provider_call_id,
            metadata_json=call_in.metadata_json,
        )
        db.add(call)
        db.commit()
        db.refresh(call)
        return call

    @staticmethod
    def get_call(db: Session, call_id: UUID, owner_id: UUID) -> Optional[Call]:
        stmt = (
            select(Call)
            .join(Lead, Call.lead_id == Lead.id)
            .join(Business, Lead.business_id == Business.id)
            .where(
                Call.id == call_id,
                Business.owner_id == owner_id,
            )
        )
        return db.scalars(stmt).first()

    @staticmethod
    def list_calls(
        db: Session,
        owner_id: UUID,
        lead_id: Optional[UUID] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Call], int]:
        query = (
            select(Call)
            .join(Lead, Call.lead_id == Lead.id)
            .join(Business, Lead.business_id == Business.id)
            .where(Business.owner_id == owner_id)
        )
        count_query = (
            select(func.count(Call.id))
            .join(Lead, Call.lead_id == Lead.id)
            .join(Business, Lead.business_id == Business.id)
            .where(Business.owner_id == owner_id)
        )

        if lead_id is not None:
            query = query.where(Call.lead_id == lead_id)
            count_query = count_query.where(Call.lead_id == lead_id)

        if status is not None:
            query = query.where(Call.status == status)
            count_query = count_query.where(Call.status == status)

        total = db.scalar(count_query) or 0

        offset = (page - 1) * page_size
        query = query.order_by(Call.created_at.desc()).offset(offset).limit(page_size)

        items = list(db.scalars(query).all())
        return items, total

    @staticmethod
    def update_call(
        db: Session, call_id: UUID, call_in: CallUpdate, owner_id: UUID
    ) -> Optional[Call]:
        call = CallService.get_call(db, call_id, owner_id=owner_id)
        if not call:
            return None

        update_data = call_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "status" and value is not None:
                new_status = value.value if hasattr(value, "value") else str(value)
                validate_call_transition(call.status, new_status)
                call.status = new_status
                if new_status == "completed" and not call.completed_at:
                    call.completed_at = datetime.now(timezone.utc)
            else:
                setattr(call, field, value)

        db.commit()
        db.refresh(call)
        return call

    @staticmethod
    def process_call_webhook(
        db: Session, call_id: UUID, payload: CallWebhookPayload
    ) -> CallWebhookResponse:
        """
        Processes voice provider webhook with strict idempotency and lifecycle checks.
        Never trust arbitrary user IDs; call is verified directly.
        """
        call = db.scalars(select(Call).where(Call.id == call_id)).first()
        if not call:
            raise ValueError(f"Call with ID '{call_id}' does not exist.")

        # Validate provider_call_id linkage if present
        if payload.provider_call_id:
            if call.provider_call_id and call.provider_call_id != payload.provider_call_id:
                raise ValueError(
                    f"Provider call ID mismatch: expected '{call.provider_call_id}', got '{payload.provider_call_id}'."
                )
            if not call.provider_call_id:
                call.provider_call_id = payload.provider_call_id

        if not call.provider:
            call.provider = payload.provider

        # 1. Idempotency Check: check if this (provider, event_id) was already recorded
        existing_event = db.scalars(
            select(CallWebhookEvent).where(
                CallWebhookEvent.provider == payload.provider,
                CallWebhookEvent.event_id == payload.event_id,
            )
        ).first()

        if existing_event:
            return CallWebhookResponse(
                status="ignored",
                call_id=call.id,
                current_status=call.status,
                message=f"Duplicate event '{payload.event_id}' from provider '{payload.provider}' ignored.",
            )

        # 2. State Transition Validation
        if payload.status:
            target_status = payload.status.lower()
            validate_call_transition(call.status, target_status)
            call.status = target_status
            if target_status == "completed" and not call.completed_at:
                call.completed_at = datetime.now(timezone.utc)

        # 3. Update Call Properties
        if payload.duration is not None:
            call.duration = payload.duration

        if payload.transcript:
            call.transcript = payload.transcript

        if payload.outcome:
            call.outcome = payload.outcome

        if payload.metadata:
            merged = dict(call.metadata_json or {})
            merged.update(payload.metadata)
            call.metadata_json = merged

        # 4. Record Webhook Event for Audit and Idempotency
        webhook_event = CallWebhookEvent(
            call_id=call.id,
            provider=payload.provider,
            event_id=payload.event_id,
            event_type=payload.event_type,
            payload_metadata=payload.metadata,
        )
        db.add(webhook_event)

        db.commit()
        db.refresh(call)

        return CallWebhookResponse(
            status="processed",
            call_id=call.id,
            current_status=call.status,
            message=f"Event '{payload.event_id}' processed successfully.",
        )
