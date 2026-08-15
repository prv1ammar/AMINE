import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.core.config import get_settings
from app.crud import collection as collection_crud
from app.crud import inquiry as inquiry_crud
from app.crud import lookbook_entry as lookbook_entry_crud
from app.crud import newsletter as newsletter_crud
from app.crud import product as product_crud
from app.crud import social_image as social_image_crud
from app.db.session import get_db
from app.schemas.collection import (
    CollectionCreate,
    CollectionProductAdd,
    CollectionRead,
    CollectionUpdate,
    CollectionWithProducts,
)
from app.schemas.inquiry import InquiryRead, InquiryStatusUpdate
from app.schemas.lookbook_entry import LookbookEntryCreate, LookbookEntryRead, LookbookEntryUpdate
from app.schemas.newsletter import NewsletterSubscriberRead
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.social_image import SocialImageCreate, SocialImageRead, SocialImageUpdate

settings = get_settings()
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


# ── Products ──────────────────────────────────────────────────────────────
@router.get("/products", response_model=list[ProductRead])
def admin_list_products(db: Session = Depends(get_db)) -> list[ProductRead]:
    return product_crud.list_products(db, only_active=False)


@router.post("/products", response_model=ProductRead, status_code=201)
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> ProductRead:
    if product_crud.get_product_by_slug(db, payload.slug):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce slug existe déjà.")
    return product_crud.create_product(db, payload)


@router.put("/products/{product_id}", response_model=ProductRead)
def admin_update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)) -> ProductRead:
    product = product_crud.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit introuvable.")
    return product_crud.update_product(db, product, payload)


@router.delete("/products/{product_id}", status_code=204)
def admin_delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    product = product_crud.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit introuvable.")
    product_crud.delete_product(db, product)


# ── Collections ───────────────────────────────────────────────────────────
@router.get("/collections", response_model=list[CollectionRead])
def admin_list_collections(db: Session = Depends(get_db)) -> list[CollectionRead]:
    collections = collection_crud.list_collections(db, only_active=False)
    return [
        CollectionRead.model_validate(c, from_attributes=True).model_copy(
            update={"product_count": collection_crud.product_count(db, c.id)}
        )
        for c in collections
    ]


@router.post("/collections", response_model=CollectionRead, status_code=201)
def admin_create_collection(payload: CollectionCreate, db: Session = Depends(get_db)) -> CollectionRead:
    if collection_crud.get_collection_by_slug(db, payload.slug):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ce slug existe déjà.")
    collection = collection_crud.create_collection(db, payload)
    return CollectionRead.model_validate(collection, from_attributes=True)


@router.put("/collections/{collection_id}", response_model=CollectionRead)
def admin_update_collection(
    collection_id: int, payload: CollectionUpdate, db: Session = Depends(get_db)
) -> CollectionRead:
    collection = collection_crud.get_collection_by_id(db, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection introuvable.")
    collection = collection_crud.update_collection(db, collection, payload)
    return CollectionRead.model_validate(collection, from_attributes=True).model_copy(
        update={"product_count": collection_crud.product_count(db, collection.id)}
    )


@router.delete("/collections/{collection_id}", status_code=204)
def admin_delete_collection(collection_id: int, db: Session = Depends(get_db)) -> None:
    collection = collection_crud.get_collection_by_id(db, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection introuvable.")
    collection_crud.delete_collection(db, collection)


@router.get("/collections/{collection_id}/products", response_model=CollectionWithProducts)
def admin_get_collection_products(collection_id: int, db: Session = Depends(get_db)) -> CollectionWithProducts:
    collection = collection_crud.get_collection_by_id(db, collection_id)
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection introuvable.")
    products = collection_crud.list_products_in_collection(db, collection_id, only_active=False)
    return CollectionWithProducts.model_validate(collection, from_attributes=True).model_copy(
        update={"product_count": len(products), "products": products}
    )


@router.post("/collections/{collection_id}/products", status_code=204)
def admin_add_product_to_collection(
    collection_id: int, payload: CollectionProductAdd, db: Session = Depends(get_db)
) -> None:
    if not collection_crud.get_collection_by_id(db, collection_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection introuvable.")
    if not product_crud.get_product_by_id(db, payload.product_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produit introuvable.")
    collection_crud.add_product_to_collection(db, collection_id, payload.product_id, payload.position)


@router.delete("/collections/{collection_id}/products/{product_id}", status_code=204)
def admin_remove_product_from_collection(
    collection_id: int, product_id: int, db: Session = Depends(get_db)
) -> None:
    removed = collection_crud.remove_product_from_collection(db, collection_id, product_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Association introuvable.")


# ── Inquiries ─────────────────────────────────────────────────────────────
@router.get("/inquiries", response_model=list[InquiryRead])
def admin_list_inquiries(db: Session = Depends(get_db)) -> list[InquiryRead]:
    return inquiry_crud.list_inquiries(db)


@router.patch("/inquiries/{inquiry_id}", response_model=InquiryRead)
def admin_update_inquiry(inquiry_id: int, payload: InquiryStatusUpdate, db: Session = Depends(get_db)) -> InquiryRead:
    inquiry = inquiry_crud.get_inquiry_by_id(db, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Demande introuvable.")
    return inquiry_crud.update_inquiry_status(db, inquiry, payload.status)


# ── Newsletter ────────────────────────────────────────────────────────────
@router.get("/newsletter", response_model=list[NewsletterSubscriberRead])
def admin_list_newsletter(db: Session = Depends(get_db)) -> list[NewsletterSubscriberRead]:
    return newsletter_crud.list_subscribers(db)


# ── Social images ─────────────────────────────────────────────────────────
@router.get("/social-images", response_model=list[SocialImageRead])
def admin_list_social_images(db: Session = Depends(get_db)) -> list[SocialImageRead]:
    return social_image_crud.list_social_images(db, only_active=False)


@router.post("/social-images", response_model=SocialImageRead, status_code=201)
def admin_create_social_image(payload: SocialImageCreate, db: Session = Depends(get_db)) -> SocialImageRead:
    return social_image_crud.create_social_image(db, payload)


@router.put("/social-images/{social_image_id}", response_model=SocialImageRead)
def admin_update_social_image(
    social_image_id: int, payload: SocialImageUpdate, db: Session = Depends(get_db)
) -> SocialImageRead:
    social_image = social_image_crud.get_social_image_by_id(db, social_image_id)
    if not social_image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image introuvable.")
    return social_image_crud.update_social_image(db, social_image, payload)


@router.delete("/social-images/{social_image_id}", status_code=204)
def admin_delete_social_image(social_image_id: int, db: Session = Depends(get_db)) -> None:
    social_image = social_image_crud.get_social_image_by_id(db, social_image_id)
    if not social_image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image introuvable.")
    social_image_crud.delete_social_image(db, social_image)


# ── Lookbook entries ──────────────────────────────────────────────────────
@router.get("/lookbook-entries", response_model=list[LookbookEntryRead])
def admin_list_lookbook_entries(db: Session = Depends(get_db)) -> list[LookbookEntryRead]:
    return lookbook_entry_crud.list_lookbook_entries(db, only_active=False)


@router.post("/lookbook-entries", response_model=LookbookEntryRead, status_code=201)
def admin_create_lookbook_entry(payload: LookbookEntryCreate, db: Session = Depends(get_db)) -> LookbookEntryRead:
    return lookbook_entry_crud.create_lookbook_entry(db, payload)


@router.put("/lookbook-entries/{entry_id}", response_model=LookbookEntryRead)
def admin_update_lookbook_entry(
    entry_id: int, payload: LookbookEntryUpdate, db: Session = Depends(get_db)
) -> LookbookEntryRead:
    entry = lookbook_entry_crud.get_lookbook_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrée introuvable.")
    return lookbook_entry_crud.update_lookbook_entry(db, entry, payload)


@router.delete("/lookbook-entries/{entry_id}", status_code=204)
def admin_delete_lookbook_entry(entry_id: int, db: Session = Depends(get_db)) -> None:
    entry = lookbook_entry_crud.get_lookbook_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrée introuvable.")
    lookbook_entry_crud.delete_lookbook_entry(db, entry)


# ── Image uploads ─────────────────────────────────────────────────────────
@router.post("/uploads")
async def admin_upload_image(file: UploadFile) -> dict[str, str]:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Format d'image non supporté.")

    contents = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"L'image dépasse {settings.max_upload_size_mb} Mo.",
        )

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "").suffix.lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{extension}"
    (upload_dir / filename).write_bytes(contents)

    return {"url": f"/uploads/{filename}"}
