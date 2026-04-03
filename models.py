from sqlalchemy import Integer, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base
from datetime import datetime


# this class IS the database table.
# when SQLAlchemy sees a class that inherits from Base with a __tablename__,
# it knows to create a table with that name in PostgreSQL.
# each class attribute with mapped_column() becomes a column in the table.
class Entry(Base):
    __tablename__ = "entries"

    # Integer primary key — PostgreSQL will auto-increment this.
    # every row gets a unique id automatically. you never set this manually.
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Text stores strings of arbitrary length — unlike String(255) which
    # has a character limit. journal entries can be long so we use Text.
    text: Mapped[str] = mapped_column(Text, nullable=False)

    # the AI reflection — also arbitrary length text.
    # nullable=True means this column is allowed to be empty in the database.
    # we store it here so we never have to call the AI twice for the same entry.
    reflection: Mapped[str] = mapped_column(Text, nullable=True)

    # server_default=func.now() means PostgreSQL itself sets this timestamp
    # the moment the row is inserted — not Python. this is more reliable
    # because it uses the database server's clock, not the application's.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )