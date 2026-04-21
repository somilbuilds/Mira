from pydantic import BaseModel, field_validator
from datetime import datetime


class EntryCreate(BaseModel):
    text: str

    @field_validator("text", mode="before")
    @classmethod
    def text_must_not_be_empty(cls, value):
        if not value or not value.strip():
            raise ValueError("Journal entry cannot be empty")
        return value.strip()


class EntryResponse(BaseModel):
    id: int
    text: str
    reflection: str | None
    mood: str | None
    created_at: datetime
    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    entry_id: int
    message: str


class ChatMessageResponse(BaseModel):
    id: int
    entry_id: int
    role: str
    content: str
    created_at: datetime
    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    entry_id: int
    messages: list[ChatMessageResponse]