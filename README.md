# Mira — Mind Reflective Agent

A backend-first AI journaling system. Write an entry, Mira reflects it back with psychological depth.

Built with FastAPI, PostgreSQL, and the Gemini API.

---

## What it does

You type a journal entry. Mira saves it to a database, sends it to an AI with a carefully designed reflection prompt, and returns a psychologically-informed response. Every entry is stored so the system can build on your history in version 2.

---

## Stack

- **FastAPI** — async Python web framework
- **Uvicorn** — ASGI server that runs FastAPI
- **PostgreSQL** — relational database for storing entries
- **SQLAlchemy** — ORM for talking to PostgreSQL from Python
- **Pydantic** — data validation for requests and responses
- **Google Gemini** — the AI that generates reflections
- **python-dotenv** — loads secrets from .env file

---

## Setup

### 1. Clone and create virtual environment

```bash
git clone https://github.com/somilbuilds/Mira.git
cd Mira
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create the database

Make sure PostgreSQL is running locally. Then:

```bash
psql -U postgres
CREATE DATABASE mira_db;
\q
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your actual PostgreSQL connection string and Gemini API key.

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### 5. Run the server

```bash
python main.py
```

Open your browser at `http://localhost:8000`

---

## Project structure

```
mira/
├── main.py          # app entry point
├── database.py      # DB connection and session
├── models.py        # SQLAlchemy table definitions
├── schemas.py       # Pydantic request/response models
├── crud.py          # database operations
├── ai.py            # Gemini API integration
├── routes/
│   └── entries.py   # API route handlers
├── frontend/
│   └── index.html   # single page UI
├── .env.example     # environment variable template
├── requirements.txt
└── README.md
```

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/entries/` | Submit a journal entry, get a reflection |
| GET | `/entries/` | Get all entries (newest first) |
| GET | `/entries/{id}` | Get a single entry by id |

Interactive API docs available at `http://localhost:8000/docs` when the server is running.

---

## Version roadmap

**Version 1 (current)** — entry in, reflection out, saved to DB

**Version 2 (next)** — RAG layer: entries embedded into vector space, similar past entries retrieved and injected as context, richer reflections that reference patterns across your history