import csv
import io
import re
from typing import List, Optional, Set, Tuple
from uuid import UUID
from sqlalchemy import func, select, desc, asc
from sqlalchemy.orm import Session
from app.db.models.business import Business
from app.db.models.lead import Lead
from app.schemas.ingestion import LeadImportError, LeadImportResponse
from app.schemas.lead import LeadCreate, LeadUpdate

MAX_CSV_SIZE = 5 * 1024 * 1024  # 5 MB maximum upload limit
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_STATUSES = {"new", "contacted", "qualified", "lost"}


def normalize_company_name(name: str) -> str:
    """Trim leading/trailing whitespace and collapse internal repeated spacing."""
    if not name:
        return ""
    return re.sub(r"\s+", " ", name).strip()


def normalize_email(email: Optional[str]) -> Optional[str]:
    """Trim whitespace and convert email address to lowercase."""
    if not email:
        return None
    cleaned = email.strip().lower()
    return cleaned if cleaned else None


class LeadService:
    @staticmethod
    def create_lead(db: Session, lead_in: LeadCreate, owner_id: UUID) -> Lead:
        # Validate foreign key: Business must exist AND belong to owner_id
        business = db.scalars(
            select(Business).where(
                Business.id == lead_in.business_id,
                Business.owner_id == owner_id,
            )
        ).first()
        if not business:
            raise ValueError(f"Business with ID {lead_in.business_id} does not exist.")

        lead = Lead(
            business_id=lead_in.business_id,
            company_name=normalize_company_name(lead_in.company_name),
            contact_name=lead_in.contact_name.strip() if lead_in.contact_name else None,
            contact_email=normalize_email(lead_in.contact_email),
            contact_phone=lead_in.contact_phone.strip() if lead_in.contact_phone else None,
            requirement=lead_in.requirement,
            industry=lead_in.industry,
            location=lead_in.location,
            source=lead_in.source,
            source_url=lead_in.source_url,
            job_title=lead_in.job_title,
            company_size=lead_in.company_size,
            linkedin_url=lead_in.linkedin_url,
            website=lead_in.website,
            status=lead_in.status.value if hasattr(lead_in.status, "value") else str(lead_in.status),
            intent_score=lead_in.intent_score,
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def get_lead(db: Session, lead_id: UUID, owner_id: UUID) -> Optional[Lead]:
        stmt = (
            select(Lead)
            .join(Business, Lead.business_id == Business.id)
            .where(
                Lead.id == lead_id,
                Business.owner_id == owner_id,
            )
        )
        return db.scalars(stmt).first()

    @staticmethod
    def list_leads(
        db: Session,
        owner_id: UUID,
        business_id: Optional[UUID] = None,
        status: Optional[str] = None,
        industry: Optional[str] = None,
        location: Optional[str] = None,
        source: Optional[str] = None,
        min_intent_score: Optional[float] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc",
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Lead], int]:
        query = select(Lead).join(Business, Lead.business_id == Business.id).where(Business.owner_id == owner_id)
        count_query = (
            select(func.count(Lead.id))
            .join(Business, Lead.business_id == Business.id)
            .where(Business.owner_id == owner_id)
        )

        # Database-level filtering
        if business_id is not None:
            query = query.where(Lead.business_id == business_id)
            count_query = count_query.where(Lead.business_id == business_id)

        if status is not None:
            query = query.where(Lead.status == status)
            count_query = count_query.where(Lead.status == status)

        if industry is not None:
            query = query.where(Lead.industry.ilike(f"%{industry}%"))
            count_query = count_query.where(Lead.industry.ilike(f"%{industry}%"))

        if location is not None:
            query = query.where(Lead.location.ilike(f"%{location}%"))
            count_query = count_query.where(Lead.location.ilike(f"%{location}%"))

        if source is not None:
            query = query.where(Lead.source == source)
            count_query = count_query.where(Lead.source == source)

        if min_intent_score is not None:
            query = query.where(Lead.intent_score >= min_intent_score)
            count_query = count_query.where(Lead.intent_score >= min_intent_score)

        # Count total matching rows in database
        total = db.scalar(count_query) or 0

        # Database-level sorting
        sort_column_map = {
            "created_at": Lead.created_at,
            "intent_score": Lead.intent_score,
            "company_name": Lead.company_name,
            "status": Lead.status,
        }
        sort_column = sort_column_map.get(sort_by, Lead.created_at)

        if sort_order and sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Database-level pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        items = list(db.scalars(query).all())
        return items, total

    @staticmethod
    def update_lead(
        db: Session, lead_id: UUID, lead_in: LeadUpdate, owner_id: UUID
    ) -> Optional[Lead]:
        lead = LeadService.get_lead(db, lead_id, owner_id=owner_id)
        if not lead:
            return None

        update_data = lead_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "status" and value is not None:
                value = value.value if hasattr(value, "value") else str(value)
            elif field == "company_name" and value is not None:
                value = normalize_company_name(value)
            elif field == "contact_email" and value is not None:
                value = normalize_email(value)
            setattr(lead, field, value)

        db.commit()
        db.refresh(lead)
        return lead

    @staticmethod
    def delete_lead(db: Session, lead_id: UUID, owner_id: UUID) -> bool:
        lead = LeadService.get_lead(db, lead_id, owner_id=owner_id)
        if not lead:
            return False

        db.delete(lead)
        db.commit()
        return True

    @staticmethod
    def is_duplicate_lead(
        db: Session,
        business_id: UUID,
        norm_email: Optional[str],
        norm_company: str,
        seen_emails: Set[str],
        seen_companies: Set[str],
    ) -> bool:
        """
        Determines whether a lead is a duplicate within the same business.
        1. In-batch deduplication: checks against leads already processed in this CSV.
        2. Database deduplication:
           - Primary: matching contact_email under the same business_id.
           - Secondary: matching company_name under the same business_id.
        Never deduplicates across different businesses.
        """
        # Check current batch
        if norm_email and norm_email in seen_emails:
            return True
        if not norm_email and norm_company in seen_companies:
            return True

        # Check database
        if norm_email:
            existing_email = db.scalars(
                select(Lead.id).where(
                    Lead.business_id == business_id,
                    func.lower(func.trim(Lead.contact_email)) == norm_email,
                )
            ).first()
            if existing_email:
                return True

        existing_company = db.scalars(
            select(Lead.id).where(
                Lead.business_id == business_id,
                func.lower(func.trim(Lead.company_name)) == norm_company,
            )
        ).first()
        if existing_company:
            return True

        return False

    @staticmethod
    def find_existing_duplicate_lead(
        db: Session,
        business_id: UUID,
        norm_email: Optional[str],
        norm_company: str,
    ) -> Optional[Lead]:
        """Finds existing matching lead by contact_email or company_name under the same business."""
        if norm_email:
            existing = db.scalars(
                select(Lead).where(
                    Lead.business_id == business_id,
                    func.lower(func.trim(Lead.contact_email)) == norm_email,
                )
            ).first()
            if existing:
                return existing

        return db.scalars(
            select(Lead).where(
                Lead.business_id == business_id,
                func.lower(func.trim(Lead.company_name)) == norm_company,
            )
        ).first()

    @staticmethod
    def import_lead_records(
        db: Session,
        business_id: UUID,
        owner_id: UUID,
        records: List[dict],
        source_name: str = "import",
        resolutions: Optional[dict] = None,
    ) -> LeadImportResponse:
        """
        Shared lead ingestion engine used identically by CSV Import and CRM (HubSpot/Salesforce) Import.
        Enforces validation, deterministic deduplication, and optional per-record merge/skip resolution.
        """
        # Validate business existence and ownership
        business = db.scalars(
            select(Business).where(
                Business.id == business_id,
                Business.owner_id == owner_id,
            )
        ).first()
        if not business:
            raise ValueError(f"Business with ID '{business_id}' does not exist or access denied.")

        total_rows = len(records)
        created = 0
        skipped = 0
        merged = 0
        failed = 0
        errors: List[LeadImportError] = []
        duplicates: List[dict] = []

        seen_emails: Set[str] = set()
        seen_companies: Set[str] = set()
        leads_to_create: List[Lead] = []

        resolution_map = {str(k).strip().lower(): str(v).strip().lower() for k, v in (resolutions or {}).items()}

        for row_num, raw_row in enumerate(records, start=1):
            row = {k.strip().lower(): v for k, v in raw_row.items() if k}

            raw_company = str(row.get("company_name") or "").strip()
            company_name = normalize_company_name(raw_company)
            if not company_name:
                failed += 1
                errors.append(LeadImportError(row=row_num, reason="Required field 'company_name' is missing or empty."))
                continue

            if len(company_name) > 255:
                failed += 1
                errors.append(LeadImportError(row=row_num, reason="'company_name' exceeds 255 characters."))
                continue

            # Contact Email validation
            raw_email = str(row.get("contact_email") or "").strip()
            norm_email = normalize_email(raw_email)
            if raw_email and not norm_email:
                norm_email = None
            elif norm_email:
                if not EMAIL_REGEX.match(norm_email) or len(norm_email) > 255:
                    failed += 1
                    errors.append(LeadImportError(row=row_num, reason=f"Invalid email format '{raw_email}'."))
                    continue

            # Intent Score validation
            raw_score = row.get("intent_score")
            intent_score: Optional[float] = None
            if raw_score is not None and str(raw_score).strip() != "":
                try:
                    score_val = float(str(raw_score).strip())
                    if score_val < 0.0 or score_val > 100.0:
                        failed += 1
                        errors.append(LeadImportError(row=row_num, reason=f"intent_score '{raw_score}' out of range (0-100)."))
                        continue
                    intent_score = score_val
                except ValueError:
                    failed += 1
                    errors.append(LeadImportError(row=row_num, reason=f"intent_score '{raw_score}' is not a valid number."))
                    continue

            # Status validation
            raw_status = row.get("status")
            status_val = "new"
            if raw_status and str(raw_status).strip() != "":
                st = str(raw_status).strip().lower()
                if st not in ALLOWED_STATUSES:
                    failed += 1
                    errors.append(LeadImportError(row=row_num, reason=f"Invalid status '{raw_status}'. Allowed: {', '.join(sorted(ALLOWED_STATUSES))}."))
                    continue
                status_val = st

            # Deduplication Check
            norm_company_lower = company_name.lower()
            is_in_batch_dup = (
                (norm_email and norm_email in seen_emails) or
                (not norm_email and norm_company_lower in seen_companies)
            )

            existing_db_lead = LeadService.find_existing_duplicate_lead(
                db, business_id, norm_email, norm_company_lower
            )

            if is_in_batch_dup or existing_db_lead:
                # Determine resolution choice if provided
                existing_id_str = str(existing_db_lead.id) if existing_db_lead else None
                decision = None
                if existing_id_str and existing_id_str.lower() in resolution_map:
                    decision = resolution_map[existing_id_str.lower()]
                elif norm_email and norm_email.lower() in resolution_map:
                    decision = resolution_map[norm_email.lower()]
                elif norm_company_lower in resolution_map:
                    decision = resolution_map[norm_company_lower]
                elif raw_company and raw_company.lower() in resolution_map:
                    decision = resolution_map[raw_company.lower()]

                if decision == "merge" and existing_db_lead:
                    # Update existing lead with incoming fields
                    if row.get("requirement"):
                        existing_db_lead.requirement = str(row["requirement"]).strip()
                    if row.get("contact_phone"):
                        existing_db_lead.contact_phone = str(row["contact_phone"]).strip()
                    if row.get("contact_name"):
                        existing_db_lead.contact_name = str(row["contact_name"]).strip()
                    if row.get("industry"):
                        existing_db_lead.industry = str(row["industry"]).strip()
                    if row.get("job_title"):
                        existing_db_lead.job_title = str(row["job_title"]).strip()
                    if row.get("company_size"):
                        existing_db_lead.company_size = str(row["company_size"]).strip()
                    if row.get("website"):
                        existing_db_lead.website = str(row["website"]).strip()
                    if row.get("linkedin_url"):
                        existing_db_lead.linkedin_url = str(row["linkedin_url"]).strip()
                    if intent_score is not None:
                        existing_db_lead.intent_score = intent_score
                    if status_val != "new":
                        existing_db_lead.status = status_val
                    db.commit()
                    merged += 1
                else:
                    skipped += 1

                if existing_db_lead:
                    duplicates.append({
                        "row": row_num,
                        "conflict_field": "email" if (norm_email and existing_db_lead.contact_email == norm_email) else "company_name",
                        "conflict_value": norm_email or company_name,
                        "incoming_data": row,
                        "existing_lead_id": existing_db_lead.id,
                        "existing_data": {
                            "id": str(existing_db_lead.id),
                            "company_name": existing_db_lead.company_name,
                            "contact_name": existing_db_lead.contact_name,
                            "contact_email": existing_db_lead.contact_email,
                            "contact_phone": existing_db_lead.contact_phone,
                            "requirement": existing_db_lead.requirement,
                            "status": existing_db_lead.status,
                            "intent_score": existing_db_lead.intent_score,
                        }
                    })
                continue

            # Register in current batch tracking
            if norm_email:
                seen_emails.add(norm_email)
            seen_companies.add(norm_company_lower)

            # Build lead model
            lead = Lead(
                business_id=business_id,
                company_name=company_name,
                contact_name=str(row.get("contact_name") or "").strip() or None,
                contact_email=norm_email,
                contact_phone=str(row.get("contact_phone") or "").strip() or None,
                requirement=str(row.get("requirement") or "").strip() or None,
                industry=str(row.get("industry") or "").strip() or None,
                location=str(row.get("location") or "").strip() or None,
                source=str(row.get("source") or "").strip() or source_name,
                source_url=str(row.get("source_url") or "").strip() or None,
                job_title=str(row.get("job_title") or "").strip() or None,
                company_size=str(row.get("company_size") or "").strip() or None,
                linkedin_url=str(row.get("linkedin_url") or "").strip() or None,
                website=str(row.get("website") or "").strip() or None,
                status=status_val,
                intent_score=intent_score,
            )
            leads_to_create.append(lead)

        # Atomic persistence for valid non-duplicates
        if leads_to_create:
            try:
                for lead in leads_to_create:
                    db.add(lead)
                db.commit()
                created = len(leads_to_create)
            except Exception as e:
                db.rollback()
                raise RuntimeError(f"Database error while committing imported leads: {str(e)}")

        return LeadImportResponse(
            total_rows=total_rows,
            created=created,
            skipped=skipped,
            merged=merged,
            failed=failed,
            errors=errors,
            duplicates=duplicates,
        )

    @staticmethod
    def import_leads_csv(
        db: Session,
        business_id: UUID,
        owner_id: UUID,
        file_bytes: bytes,
        filename: str,
        resolutions: Optional[dict] = None,
    ) -> LeadImportResponse:
        """
        Parses and imports leads from CSV with validation, normalization,
        and deterministic deduplication under transaction boundaries.
        Reuses the shared LeadService.import_lead_records engine.
        """
        # 1. File size & format checks
        if len(file_bytes) > MAX_CSV_SIZE:
            raise ValueError("File exceeds the maximum upload limit of 5 MB.")

        if not filename.lower().endswith(".csv"):
            raise ValueError("Invalid file format. Only CSV files (.csv) are accepted.")

        # 2. Decode CSV content (UTF-8 with or without BOM)
        try:
            content = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                content = file_bytes.decode("latin-1")
            except Exception:
                raise ValueError("Could not decode file. Please upload a valid UTF-8 encoded CSV.")

        if not content.strip():
            return LeadImportResponse(total_rows=0, created=0, skipped=0, failed=0, errors=[])

        # 3. Parse CSV
        stream = io.StringIO(content.strip())
        reader = csv.DictReader(stream)

        if not reader.fieldnames:
            raise ValueError("CSV file has no headers.")

        header_map = {h.strip().lower(): h for h in reader.fieldnames if h}
        if "company_name" not in header_map:
            raise ValueError("CSV is missing the required column: 'company_name'.")

        records: List[dict] = []
        for raw_row in reader:
            records.append({k.strip().lower(): v for k, v in raw_row.items() if k})

        return LeadService.import_lead_records(
            db=db,
            business_id=business_id,
            owner_id=owner_id,
            records=records,
            source_name="csv_import",
            resolutions=resolutions,
        )
