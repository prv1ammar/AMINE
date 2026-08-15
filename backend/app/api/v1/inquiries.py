from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import inquiry as inquiry_crud
from app.crud import product as product_crud
from app.db.session import get_db
from app.schemas.inquiry import CartItemSnapshot, InquiryCreate, InquiryRead
from app.services.email import notify_new_inquiry

router = APIRouter(prefix="/inquiries", tags=["inquiries"])


@router.post("", response_model=InquiryRead, status_code=201)
def create_inquiry(
    payload: InquiryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> InquiryRead:
    items: list[CartItemSnapshot] = []
    total_cents = 0
    for cart_item in payload.items or []:
        product = product_crud.get_product_by_id(db, cart_item.product_id)
        if not product or not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Un des produits de votre panier n'est plus disponible (id={cart_item.product_id}).",
            )
        line_total = product.price_cents * cart_item.quantity
        total_cents += line_total
        items.append(
            CartItemSnapshot(
                product_id=product.id,
                slug=product.slug,
                name=product.name,
                price_cents=product.price_cents,
                quantity=cart_item.quantity,
                line_total_cents=line_total,
            )
        )

    inquiry = inquiry_crud.create_inquiry(
        db, payload, items=items or None, total_cents=total_cents if items else None
    )
    background_tasks.add_task(
        notify_new_inquiry,
        name=inquiry.name,
        email=inquiry.email,
        phone=inquiry.phone,
        address=inquiry.address,
        subject=inquiry.subject.value,
        message=inquiry.message,
        product_slug=inquiry.product_slug,
        items=inquiry.items,
        total_cents=inquiry.total_cents,
    )
    return inquiry
