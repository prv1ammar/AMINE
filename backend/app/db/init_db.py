from app.db.base import Base
from app.db.session import engine
from app.models import (  # noqa: F401
    Product,
    ProductCollection,
    Collection,
    Inquiry,
    NewsletterSubscriber,
    AdminUser,
    SocialImage,
    LookbookEntry,
)


def init_db() -> None:
    """Create all tables. Used for local/dev bootstrap; production should use Alembic migrations."""
    Base.metadata.create_all(bind=engine)
