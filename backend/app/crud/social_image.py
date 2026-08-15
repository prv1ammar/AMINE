from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.social_image import SocialImage
from app.schemas.social_image import SocialImageCreate, SocialImageUpdate


def list_social_images(db: Session, *, only_active: bool = True) -> list[SocialImage]:
    stmt = select(SocialImage).order_by(SocialImage.sort_order, SocialImage.id)
    if only_active:
        stmt = stmt.where(SocialImage.is_active.is_(True))
    return list(db.scalars(stmt).all())


def get_social_image_by_id(db: Session, social_image_id: int) -> SocialImage | None:
    return db.get(SocialImage, social_image_id)


def create_social_image(db: Session, data: SocialImageCreate) -> SocialImage:
    social_image = SocialImage(**data.model_dump())
    db.add(social_image)
    db.commit()
    db.refresh(social_image)
    return social_image


def update_social_image(db: Session, social_image: SocialImage, data: SocialImageUpdate) -> SocialImage:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(social_image, field, value)
    db.commit()
    db.refresh(social_image)
    return social_image


def delete_social_image(db: Session, social_image: SocialImage) -> None:
    db.delete(social_image)
    db.commit()
