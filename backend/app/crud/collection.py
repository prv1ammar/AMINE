from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product, ProductCollection
from app.models.collection import Collection
from app.schemas.collection import CollectionCreate, CollectionUpdate


def list_collections(db: Session, *, only_active: bool = True) -> list[Collection]:
    stmt = select(Collection).order_by(Collection.sort_order, Collection.id)
    if only_active:
        stmt = stmt.where(Collection.is_active.is_(True))
    return list(db.scalars(stmt).all())


def get_collection_by_slug(db: Session, slug: str) -> Collection | None:
    stmt = select(Collection).where(Collection.slug == slug)
    return db.scalars(stmt).first()


def get_collection_by_id(db: Session, collection_id: int) -> Collection | None:
    return db.get(Collection, collection_id)


def create_collection(db: Session, data: CollectionCreate) -> Collection:
    collection = Collection(**data.model_dump())
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


def update_collection(db: Session, collection: Collection, data: CollectionUpdate) -> Collection:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(collection, field, value)
    db.commit()
    db.refresh(collection)
    return collection


def delete_collection(db: Session, collection: Collection) -> None:
    db.delete(collection)
    db.commit()


def list_products_in_collection(db: Session, collection_id: int, *, only_active: bool = True) -> list[Product]:
    stmt = (
        select(Product)
        .join(ProductCollection, ProductCollection.product_id == Product.id)
        .where(ProductCollection.collection_id == collection_id)
        .order_by(ProductCollection.position, Product.id)
    )
    if only_active:
        stmt = stmt.where(Product.is_active.is_(True))
    return list(db.scalars(stmt).all())


def add_product_to_collection(db: Session, collection_id: int, product_id: int, position: int = 0) -> None:
    existing = db.get(ProductCollection, {"product_id": product_id, "collection_id": collection_id})
    if existing:
        existing.position = position
    else:
        db.add(ProductCollection(product_id=product_id, collection_id=collection_id, position=position))
    db.commit()


def remove_product_from_collection(db: Session, collection_id: int, product_id: int) -> bool:
    link = db.get(ProductCollection, {"product_id": product_id, "collection_id": collection_id})
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True


def product_count(db: Session, collection_id: int) -> int:
    stmt = select(ProductCollection).where(ProductCollection.collection_id == collection_id)
    return len(list(db.scalars(stmt).all()))
