from sqlalchemy.orm import Session
from models import Entry


# CRUD stands for Create, Read, Update, Delete — the four basic database operations.
# keeping these functions here, separate from the routes, is called
# "separation of concerns". your route handler decides WHAT to do.
# your crud functions decide HOW to do it with the database.
# this makes testing easier and keeps each file focused on one job.


def create_entry(db: Session, text: str, reflection: str | None) -> Entry:
    """
    Creates a new Entry row in the database and returns it.

    db       — the active database session (passed in from the route)
    text     — the original journal entry text
    reflection — the AI's reflection (can be None if the AI call failed)
    """

    # create a new Entry object in Python — not in the database yet.
    # this is just a Python object at this point.
    db_entry = Entry(text=text, reflection=reflection)

    # add it to the session — SQLAlchemy now knows about this object
    # and will include it in the next commit. still not in the DB yet.
    db.add(db_entry)

    # commit — this is the moment the INSERT statement actually runs
    # against PostgreSQL. the transaction is finalized here.
    # if anything fails before this point, nothing is saved.
    db.commit()

    # refresh — after committing, PostgreSQL has filled in values we didn't set:
    # the auto-generated id and the server-set created_at timestamp.
    # refresh pulls those values back from the database into our Python object
    # so we can return them in the response.
    db.refresh(db_entry)

    return db_entry


def get_all_entries(db: Session) -> list[Entry]:
    """
    Returns all entries from the database, newest first.
    Not used in version 1 routes but useful to have for debugging.
    """
    return db.query(Entry).order_by(Entry.created_at.desc()).all()


def get_entry_by_id(db: Session, entry_id: int) -> Entry | None:
    """
    Returns a single entry by its id, or None if it doesn't exist.
    """
    return db.query(Entry).filter(Entry.id == entry_id).first()