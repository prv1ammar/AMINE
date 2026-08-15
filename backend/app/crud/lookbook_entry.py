from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.lookbook_entry import LookbookEntry
from app.schemas.lookbook_entry import LookbookEntryCreate, LookbookEntryUpdate


def list_lookbook_entries(db: Session, *, only_active: bool = True) -> list[LookbookEntry]:
    stmt = select(LookbookEntry).order_by(LookbookEntry.sort_order, LookbookEntry.id)
    if only_active:
        stmt = stmt.where(LookbookEntry.is_active.is_(True))
    return list(db.scalars(stmt).all())


def get_lookbook_entry_by_id(db: Session, entry_id: int) -> LookbookEntry | None:
    return db.get(LookbookEntry, entry_id)


def create_lookbook_entry(db: Session, data: LookbookEntryCreate) -> LookbookEntry:
    entry = LookbookEntry(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def update_lookbook_entry(db: Session, entry: LookbookEntry, data: LookbookEntryUpdate) -> LookbookEntry:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_lookbook_entry(db: Session, entry: LookbookEntry) -> None:
    db.delete(entry)
    db.commit()
