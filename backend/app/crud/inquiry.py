from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inquiry import Inquiry, InquiryStatus
from app.schemas.inquiry import CartItemSnapshot, InquiryCreate


def create_inquiry(
    db: Session,
    data: InquiryCreate,
    *,
    items: list[CartItemSnapshot] | None = None,
    total_cents: int | None = None,
    delivery_cents: int | None = None,
) -> Inquiry:
    payload = data.model_dump(exclude={"items"})
    inquiry = Inquiry(
        **payload,
        items=[item.model_dump() for item in items] if items else None,
        total_cents=total_cents,
        delivery_cents=delivery_cents,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry


def list_inquiries(db: Session) -> list[Inquiry]:
    stmt = select(Inquiry).order_by(Inquiry.created_at.desc())
    return list(db.scalars(stmt).all())


def get_inquiry_by_id(db: Session, inquiry_id: int) -> Inquiry | None:
    return db.get(Inquiry, inquiry_id)


def update_inquiry_status(db: Session, inquiry: Inquiry, status: InquiryStatus) -> Inquiry:
    inquiry.status = status
    db.commit()
    db.refresh(inquiry)
    return inquiry
