from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import social_image as social_image_crud
from app.db.session import get_db
from app.schemas.social_image import SocialImageRead

router = APIRouter(prefix="/social-images", tags=["social-images"])


@router.get("", response_model=list[SocialImageRead])
def read_social_images(db: Session = Depends(get_db)) -> list[SocialImageRead]:
    return social_image_crud.list_social_images(db)
