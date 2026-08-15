from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud import lookbook_entry as lookbook_entry_crud
from app.db.session import get_db
from app.schemas.lookbook_entry import LookbookEntryRead

router = APIRouter(prefix="/lookbook-entries", tags=["lookbook-entries"])


@router.get("", response_model=list[LookbookEntryRead])
def read_lookbook_entries(db: Session = Depends(get_db)) -> list[LookbookEntryRead]:
    return lookbook_entry_crud.list_lookbook_entries(db)
