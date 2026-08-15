import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.admin_user import AdminUser
from app.models.product import Product

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_auth_headers(db_session) -> dict[str, str]:
    admin = AdminUser(email="admin@lhtstore.com", hashed_password=hash_password("changeme123"))
    db_session.add(admin)
    db_session.commit()
    token = create_access_token(subject=admin.email)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def sample_product(db_session) -> Product:
    product = Product(
        slug="le-classique",
        name="Le Classique",
        shape="Rectangle",
        price_cents=8900,
        tagline="Monture rectangle intemporelle",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product
