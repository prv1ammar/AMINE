"""Create an admin user. Run with: python -m app.create_admin <email> <password>"""

import sys

from app.core.security import hash_password
from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.models.admin_user import AdminUser


def create_admin(email: str, password: str) -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.query(AdminUser).filter(AdminUser.email == email).first():
            print(f"Admin '{email}' already exists.")
            return
        db.add(AdminUser(email=email, hashed_password=hash_password(password)))
        db.commit()
        print(f"Admin '{email}' created.")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m app.create_admin <email> <password>")
        sys.exit(1)
    create_admin(sys.argv[1], sys.argv[2])
