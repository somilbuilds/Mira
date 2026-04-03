from pydantic import BaseModel, field_validator
from datetime import datetime


# Pydantic models define the SHAPE of data coming in and going out.
# they are completely separate from SQLAlchemy models (models.py).
# SQLAlchemy models = shape of data IN the database.
# Pydantic models = shape of data IN the request/response.

# when FastAPI receives a POST request, it takes the JSON body and tries
# to construct the matching Pydantic model. if the data doesn't match
# (wrong type, missing field), FastAPI automatically returns a 422 error
# with a clear explanation — before your code even runs.


# what comes IN when someone submits a journal entry
class EntryCreate(BaseModel):
    text: str

    # validators run automatically when the model is constructed.
    # this one ensures nobody submits an empty entry or just whitespace.
    # mode="before" means it runs before type validation — on the raw value.
    @field_validator("text", mode="before")
    @classmethod
    def text_must_not_be_empty(cls, value):
        if not value or not value.strip():
            raise ValueError("Journal entry cannot be empty")
        return value.strip()  # remove leading/trailing whitespace


# what goes OUT in the response after an entry is created
class EntryResponse(BaseModel):
    id: int
    text: str
    reflection: str | None  # None is valid — if AI call fails, this is null
    created_at: datetime

    # this tells Pydantic it's allowed to read data from a SQLAlchemy object
    # not just from a plain dictionary. without this, Pydantic wouldn't know
    # how to read attributes off an ORM model instance.
    model_config = {"from_attributes": True}