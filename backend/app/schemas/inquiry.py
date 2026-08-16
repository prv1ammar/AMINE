from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models.inquiry import InquiryStatus, InquirySubject


class CartItemInput(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=20)


class CartItemSnapshot(BaseModel):
    product_id: int
    slug: str
    name: str
    price_cents: int
    quantity: int
    line_total_cents: int


class InquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=2000)
    subject: InquirySubject = InquirySubject.order
    message: str = Field(default="", max_length=4000)
    product_slug: str | None = None
    items: list[CartItemInput] | None = None

    @model_validator(mode="after")
    def require_contact_details_for_orders(self) -> "InquiryCreate":
        if self.subject == InquirySubject.order or self.items:
            missing = [
                label
                for label, value in (("téléphone", self.phone), ("adresse", self.address))
                if not value or not value.strip()
            ]
            if missing:
                raise ValueError(
                    f"Merci de préciser votre {' et votre '.join(missing)} pour passer commande."
                )
        if not self.items and not self.message.strip():
            raise ValueError("Merci de préciser votre message.")
        return self


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus


class InquiryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None
    address: str | None
    subject: InquirySubject
    message: str
    product_slug: str | None
    items: list[CartItemSnapshot] | None = None
    delivery_cents: int | None = None
    total_cents: int | None = None
    status: InquiryStatus
    created_at: datetime
    updated_at: datetime
