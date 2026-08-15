from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.newsletter import NewsletterSubscriber


def get_subscriber_by_email(db: Session, email: str) -> NewsletterSubscriber | None:
    stmt = select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    return db.scalars(stmt).first()


def create_subscriber(db: Session, email: str) -> NewsletterSubscriber:
    subscriber = NewsletterSubscriber(email=email)
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    return subscriber


def list_subscribers(db: Session) -> list[NewsletterSubscriber]:
    stmt = select(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc())
    return list(db.scalars(stmt).all())
