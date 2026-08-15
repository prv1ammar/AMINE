from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import newsletter as newsletter_crud
from app.db.session import get_db
from app.schemas.newsletter import NewsletterSubscribeCreate, NewsletterSubscriberRead

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("", response_model=NewsletterSubscriberRead, status_code=201)
def subscribe(payload: NewsletterSubscribeCreate, db: Session = Depends(get_db)) -> NewsletterSubscriberRead:
    existing = newsletter_crud.get_subscriber_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cette adresse est déjà inscrite.")
    return newsletter_crud.create_subscriber(db, payload.email)
