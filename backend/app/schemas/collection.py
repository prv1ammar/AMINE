from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductRead


class CollectionBase(BaseModel):
    slug: str
    name: str
    description: str = ""
    image_placeholder: str = ""
    image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(BaseModel):
    slug: str | None = None
    name: str | None = None
    description: str | None = None
    image_placeholder: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class CollectionRead(CollectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_count: int = 0


class CollectionWithProducts(CollectionRead):
    products: list[ProductRead] = []


class CollectionProductAdd(BaseModel):
    product_id: int
    position: int = 0
