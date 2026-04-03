from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import EntryCreate, EntryResponse
from crud import create_entry, get_all_entries, get_entry_by_id
from ai import get_reflection


# APIRouter is like a mini FastAPI app — it lets you define routes
# in a separate file and then include them in main.py.
# this keeps main.py clean and lets you organise routes by feature.
# prefix="/entries" means every route in this file starts with /entries.
router = APIRouter(prefix="/entries", tags=["entries"])


@router.post("/", response_model=EntryResponse)
async def create_journal_entry(
    entry: EntryCreate,       # FastAPI reads the JSON body and validates it against EntryCreate
    db: Session = Depends(get_db)  # Depends(get_db) runs get_db() and injects the session
):
    """
    Receives a journal entry, gets an AI reflection, saves both, returns the result.

    Depends(get_db) is FastAPI's dependency injection system.
    instead of calling get_db() yourself, you declare it as a dependency
    and FastAPI handles calling it, passing the result to your function,
    and running the cleanup (closing the session) after the request finishes.
    this is how FastAPI ensures the DB session is always properly closed.
    """

    # call the Gemini API with the entry text.
    # this is an async call — FastAPI awaits it here,
    # freeing the event loop to handle other requests while we wait.
    reflection = await get_reflection(entry.text)

    # save the entry and reflection to PostgreSQL.
    # even if reflection is None (AI failed), we still save the entry.
    db_entry = create_entry(db=db, text=entry.text, reflection=reflection)

    # FastAPI takes this SQLAlchemy object, validates it against
    # EntryResponse (because of response_model=EntryResponse above),
    # serializes it to JSON, and sends it back to the client.
    return db_entry


@router.get("/", response_model=list[EntryResponse])
def get_entries(db: Session = Depends(get_db)):
    """
    Returns all journal entries, newest first.
    Not used by the frontend in version 1 but useful for debugging —
    you can hit GET /entries in your browser to see everything in the DB.
    """
    return get_all_entries(db)


@router.get("/{entry_id}", response_model=EntryResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    Returns a single entry by id.
    {entry_id} in the path is a path parameter — FastAPI extracts it
    from the URL and passes it as the entry_id argument automatically.
    """
    entry = get_entry_by_id(db, entry_id)
    if entry is None:
        # HTTPException tells FastAPI to return an error response.
        # 404 is the HTTP status code for "not found".
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry