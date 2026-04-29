from sqlalchemy.orm import Session
from sqlalchemy import text
from models import Entry, ChatMessage


def create_entry(db: Session, text: str, reflection: str | None, mood: str | None, embedding: list | None) -> Entry:
    db_entry = Entry(text=text, reflection=reflection, mood=mood, embedding=embedding)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_all_entries(db: Session) -> list[Entry]:
    return db.query(Entry).order_by(Entry.created_at.desc()).all()


def get_entry_by_id(db: Session, entry_id: int) -> Entry | None:
    return db.query(Entry).filter(Entry.id == entry_id).first()


def get_similar_entries(db: Session, embedding: list, exclude_id: int = -1, limit: int = 3) -> list[Entry]:
    vec_str = "[" + ",".join(str(x) for x in embedding) + "]"
    return (
        db.query(Entry)
        .filter(Entry.id != exclude_id)
        .filter(Entry.embedding.isnot(None))
        .order_by(text(f"embedding <=> '{vec_str}'::vector"))
        .limit(limit)
        .all()
    )


def add_message(db: Session, entry_id: int, role: str, content: str) -> ChatMessage:
    message = ChatMessage(entry_id=entry_id, role=role, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_messages_for_entry(db: Session, entry_id: int) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.entry_id == entry_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )