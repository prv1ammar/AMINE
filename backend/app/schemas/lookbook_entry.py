from pydantic import BaseModel, ConfigDict


class LookbookEntryBase(BaseModel):
    eyebrow: str = ""
    title: str
    body: str = ""
    image_placeholder: str = ""
    image_url: str | None = None
    link_url: str = "/collection"
    is_active: bool = True
    sort_order: int = 0


class LookbookEntryCreate(LookbookEntryBase):
    pass


class LookbookEntryUpdate(BaseModel):
    eyebrow: str | None = None
    title: str | None = None
    body: str | None = None
    image_placeholder: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class LookbookEntryRead(LookbookEntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
