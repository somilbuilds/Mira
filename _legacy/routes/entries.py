from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import EntryCreate, EntryResponse
from crud import create_entry, get_all_entries, get_entry_by_id, get_similar_entries
from ai import embed_text, get_reflection, infer_mood

router = APIRouter(prefix="/entries", tags=["entries"])


@router.post("/", response_model=EntryResponse)
async def create_journal_entry(entry: EntryCreate, db: Session = Depends(get_db)):
    # step 1 — embed
    embedding = await embed_text(entry.text)

    # step 2 — retrieve similar past entries (RAG)
    past_entries: list[str] = []
    if embedding:
        similar = get_similar_entries(db, embedding, exclude_id=-1, limit=3)
        past_entries = [e.text for e in similar]

    # step 3 — mood
    mood = await infer_mood(entry.text)

    # step 4 — reflection with memory
    reflection = await get_reflection(entry.text, past_entries=past_entries or None)

    # step 5 — save
    db_entry = create_entry(db=db, text=entry.text, reflection=reflection, mood=mood, embedding=embedding)
    return db_entry


@router.get("/", response_model=list[EntryResponse])
def get_entries(db: Session = Depends(get_db)):
    return get_all_entries(db)


@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry