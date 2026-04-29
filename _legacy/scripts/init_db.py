"""Run once after setting up PostgreSQL to enable pgvector and create tables."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()
from sqlalchemy import text
from database import engine, Base
import models  # noqa

with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()

Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS entries_embedding_idx
        ON entries USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    """))
    conn.commit()

print("done — pgvector enabled, tables created, index built")