"""
routes/chat.py — chat endpoints for multi-turn conversation.

POST /chat/          — send a user message, get Mira's response
GET  /chat/{entry_id} — load full conversation thread for an entry
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatMessageCreate, ChatMessageResponse, ConversationResponse
from crud import (
    get_entry_by_id,
    add_message,
    get_messages_for_entry,
    get_similar_entries,
)
from ai import get_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatMessageResponse)
async def send_message(payload: ChatMessageCreate, db: Session = Depends(get_db)):
    """
    Receives a user message in a conversation tied to an entry.

    Flow:
    1. Load the entry and its existing conversation history.
    2. Save the user's message to DB.
    3. Build conversation list for Gemini.
    4. Retrieve memory (similar past entries via RAG) using the entry's embedding.
    5. Call Gemini to get Mira's response.
    6. Save Mira's response to DB and return it.
    """

    # load the entry this conversation belongs to
    entry = get_entry_by_id(db, payload.entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    # save user message first
    add_message(db, entry_id=entry.id, role="user", content=payload.message)

    # load full conversation history (now includes user's latest message)
    all_msgs = get_messages_for_entry(db, entry.id)
    conversation = [{"role": m.role, "content": m.content} for m in all_msgs]

    # retrieve memory — similar past entries for RAG context
    past_entries: list[str] = []
    if entry.embedding:
        similar = get_similar_entries(db, entry.embedding, exclude_id=entry.id, limit=3)
        past_entries = [e.text for e in similar]

    # call Gemini with full context
    mira_reply = await get_chat_response(
        entry_text=entry.text,
        reflection=entry.reflection or "",
        conversation=conversation,
        past_entries=past_entries if past_entries else None,
    )

    if not mira_reply:
        mira_reply = "I'm here, but something went quiet on my end. Try again?"

    # save and return Mira's response
    mira_msg = add_message(db, entry_id=entry.id, role="mira", content=mira_reply)
    return mira_msg


@router.get("/{entry_id}", response_model=ConversationResponse)
def get_conversation(entry_id: int, db: Session = Depends(get_db)):
    """Returns the full conversation thread for an entry."""
    entry = get_entry_by_id(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")

    messages = get_messages_for_entry(db, entry_id)
    return ConversationResponse(entry_id=entry_id, messages=messages)
