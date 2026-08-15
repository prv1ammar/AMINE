from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def list_products(db: Session, *, only_active: bool = True) -> list[Product]:
    stmt = select(Product).order_by(Product.sort_order, Product.id)
    if only_active:
        stmt = stmt.where(Product.is_active.is_(True))
    return list(db.scalars(stmt).all())


def get_product_by_slug(db: Session, slug: str) -> Product | None:
    stmt = select(Product).where(Product.slug == slug)
    return db.scalars(stmt).first()


def get_product_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, data: ProductUpdate) -> Product:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
