from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import product as product_crud
from app.db.session import get_db
from app.schemas.product import ProductRead

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def read_products(db: Session = Depends(get_db)) -> list[ProductRead]:
    return product_crud.list_products(db)


@router.get("/{slug}", response_model=ProductRead)
def read_product(slug: str, db: Session = Depends(get_db)) -> ProductRead:
    product = product_crud.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Modèle introuvable.")
    return product
