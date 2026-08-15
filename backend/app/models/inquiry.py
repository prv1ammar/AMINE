import enum
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class InquirySubject(str, enum.Enum):
    order = "Commander un modèle"
    product_question = "Question sur un produit"
    order_tracking = "Suivi de commande"
    return_exchange = "Retour ou échange"
    other = "Autre"


class InquiryStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    closed = "closed"


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    subject: Mapped[InquirySubject] = mapped_column(
        Enum(InquirySubject), default=InquirySubject.order, nullable=False
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    product_slug: Mapped[str | None] = mapped_column(
        String(80), ForeignKey("products.slug"), nullable=True
    )
    items: Mapped[list | None] = mapped_column(JSON, nullable=True)
    total_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[InquiryStatus] = mapped_column(
        Enum(InquiryStatus), default=InquiryStatus.new, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
