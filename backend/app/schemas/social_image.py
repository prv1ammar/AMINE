from pydantic import BaseModel, ConfigDict


class SocialImageBase(BaseModel):
    caption: str = ""
    image_url: str | None = None
    is_active: bool = True
    sort_order: int = 0


class SocialImageCreate(SocialImageBase):
    pass


class SocialImageUpdate(BaseModel):
    caption: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class SocialImageRead(SocialImageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
