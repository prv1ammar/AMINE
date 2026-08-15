from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import collection as collection_crud
from app.db.session import get_db
from app.schemas.collection import CollectionRead, CollectionWithProducts

router = APIRouter(prefix="/collections", tags=["collections"])


@router.get("", response_model=list[CollectionRead])
def read_collections(db: Session = Depends(get_db)) -> list[CollectionRead]:
    collections = collection_crud.list_collections(db)
    return [
        CollectionRead.model_validate(c, from_attributes=True).model_copy(
            update={"product_count": collection_crud.product_count(db, c.id)}
        )
        for c in collections
    ]


@router.get("/{slug}", response_model=CollectionWithProducts)
def read_collection(slug: str, db: Session = Depends(get_db)) -> CollectionWithProducts:
    collection = collection_crud.get_collection_by_slug(db, slug)
    if not collection or not collection.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection introuvable.")
    products = collection_crud.list_products_in_collection(db, collection.id)
    return CollectionWithProducts.model_validate(collection, from_attributes=True).model_copy(
        update={"product_count": len(products), "products": products}
    )
