from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    slug: str
    name: str
    shape: str
    price_cents: int
    currency: str = "MAD"
    tagline: str = ""
    description: str = ""
    image_placeholder: str = ""
    image_url: str | None = None
    badge: str | None = None
    is_bestseller: bool = False
    is_new: bool = False
    is_active: bool = True
    sort_order: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    slug: str | None = None
    name: str | None = None
    shape: str | None = None
    price_cents: int | None = None
    currency: str | None = None
    tagline: str | None = None
    description: str | None = None
    image_placeholder: str | None = None
    image_url: str | None = None
    badge: str | None = None
    is_bestseller: bool | None = None
    is_new: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
