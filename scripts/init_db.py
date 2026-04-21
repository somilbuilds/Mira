#!/usr/bin/env python3
"""
scripts/init_db.py
─────────────────────────────────────────────────────────────────────────────
Initialises the Mira database:
  1. Enables the pgvector extension (CREATE EXTENSION IF NOT EXISTS vector)
  2. Creates all SQLAlchemy tables (entries, chat_messages)
  3. Creates the IVFFlat index on the embedding column for fast vector search

Run this ONCE after creating your Cloud SQL instance, and again after any
model change that adds new tables.

Usage:
  python scripts/init_db.py
"""

import sys
import os

# make sure we can import from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from database import engine, Base, SessionLocal

# import models so SQLAlchemy registers them with Base
import models  # noqa: F401


def init():
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  Initialising Mira database")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    with engine.connect() as conn:
        # step 1 — enable pgvector
        print("\n▶ Enabling pgvector extension...")
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
        print("  ✓ pgvector enabled")

        # step 2 — create tables
        print("\n▶ Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("  ✓ Tables created: entries, chat_messages")

        # step 3 — create IVFFlat index for fast vector similarity search
        # IVFFlat is a good default for moderate dataset sizes (<1M rows).
        # lists=100 means 100 cluster centroids — tune upward for larger datasets.
        # This index is used by pgvector when running cosine distance queries.
        print("\n▶ Creating IVFFlat index on entries.embedding...")
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS entries_embedding_idx
            ON entries
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """))
        conn.commit()
        print("  ✓ Index created")

    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  ✓ Database ready. Run: uvicorn main:app --reload")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


if __name__ == "__main__":
    init()
