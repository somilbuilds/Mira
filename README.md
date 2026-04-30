<div align="center">

<br />

```
███╗   ███╗██╗██████╗  █████╗
████╗ ████║██║██╔══██╗██╔══██╗
██╔████╔██║██║██████╔╝███████║
██║╚██╔╝██║██║██╔══██╗██╔══██║
██║ ╚═╝ ██║██║██║  ██║██║  ██║
╚═╝     ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
```

### **Mind Reflective Agent**

*An AI-powered dream journal that tracks, analyzes, and remembers your dreams with psychological depth.*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-00B388?style=for-the-badge&logo=pinecone&logoColor=white)](https://www.pinecone.io/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](./LICENSE)

<br />

[![Status](https://img.shields.io/badge/Status-Under_Construction-yellow?style=flat-square&logo=construction)]()
[![Live](https://img.shields.io/badge/Live_Site-Access_on_Request-red?style=flat-square&logo=globe)]()
[![Repo](https://img.shields.io/badge/GitHub-somilbuilds%2FMira-181717?style=flat-square&logo=github)](https://github.com/somilbuilds/Mira)

</div>

---

> **⚠️ Construction Notice:** Mira is actively being developed and is not yet open to the public. The live deployment is **gated by request** - the site is offline until specifically enabled. This is intentional. If you're here, you found it early.

---

## What Is Mira?

Most dream apps are glorified notepads. Mira is a tracking system.

When you log a dream, you're not just typing free text, you're recording structured data: the people involved, their roles, the location, lucidity level, whether it was a nightmare. Gemini analyzes the entry, rewrites it as a vivid literary reconstruction, and extracts three dominant sentiments. That entry is then embedded into vector space and stored in Pinecone.

When you open the RAG chat, Mira isn't just an LLM with a system prompt. It retrieves semantically similar past dreams and injects them as context, so when you ask about recurring themes or specific people, it's actually searching your history, not hallucinating patterns.

The memory layer is the product. Everything else is interface.

---

## Architecture Overview

```
User writes entry
       │
       ▼
  Next.js Frontend
       │
       ▼
  API Routes (Next.js)
       │
  ┌────┴────────────────────┐
  │                         │
  ▼                         ▼
Firebase Auth          Gemini 2.5 Flash
(Google SSO)           → Vivid summary
                       → 3 dominant sentiments
                            │
                            ▼
                      gemini-embedding-001
                       → 768-dim vector
                            │
                            ▼
                      Pinecone Vector DB
                    (semantic long-term memory)
                            │
                            ▼
                     RAG Chat Interface
               (retrieves similar past entries
                and injects into context window)
```

---

## Features

**Dream Logging**
- Structured entry fields: people count, names, roles, location, lucidity level (0–5), nightmare toggle
- Free-text dream description alongside structured metadata
- AI-generated vivid reconstruction of each dream, rephrased with literary depth by Gemini 2.5 Flash
- 3 dominant sentiments extracted per entry and stored alongside the embedding

**Memory Layer (RAG)**
- Every entry embedded into Pinecone as a 768-dimensional vector via `gemini-embedding-001`
- Similarity search retrieves semantically related past entries in real-time
- Retrieved context injected into the LLM prompt, Mira references your history when it talks to you

**Chat Layer**
- Global RAG chat room: converse with Mira about all your past entries at once
- Multi-tab chat sessions, create, delete, switch between conversations
- Mark conversations as ★ Important to commit them back into the memory layer, the AI learns from your past chats, not just your entries

**Insight Layer**
- Sentiment calendar, visual grid showing logged days, colored dots representing extracted moods
- Mood Insights panel, analytics across your entry history
- Pattern recognition across time (in progress)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 15 + React | App shell, routing, SSR |
| **Styling** | CSS Modules + Custom vars | Dark-first design system |
| **Auth** | Firebase (Google SSO) | Identity, session management |
| **AI — Generation** | Gemini 2.5 Flash | Entry analysis, chat responses |
| **AI — Embeddings** | gemini-embedding-001 | 768-dim semantic vectors |
| **Vector DB** | Pinecone | Long-term semantic memory, similarity search |
| **API** | Next.js API Routes | `/entries`, `/chat`, `/insights` |
| **Deployment** | Vercel | CI/CD, serverless functions |

---

## Project Structure

```
mira/
├── app/
│   ├── api/
│   │   ├── entries/        # Journal entry CRUD + AI analysis
│   │   ├── chat/           # RAG chat endpoints
│   │   └── insights/       # Analytics and pattern endpoints
│   ├── app/                # Application pages and routing
│   ├── globals.css         # Design tokens, CSS variables
│   └── layout.js           # Root layout
│
├── components/
│   ├── Calendar.js         # Sentiment visualization calendar
│   ├── ChatPanel.js        # Entry-level chat (legacy)
│   ├── EntryHistory.js     # Past entries list
│   ├── GlobalChat.js       # Main RAG interface
│   ├── JournalWriter.js    # Entry creation form
│   └── MoodInsights.js     # Analytics panel
│
├── lib/
│   ├── auth-context.js     # Firebase auth provider
│   ├── firebase.js         # Firebase client init
│   ├── firebase-admin.js   # Firebase admin init
│   ├── gemini.js           # Gemini wrappers: chat, analysis, embeddings
│   └── pinecone.js         # Vector DB operations
│
├── _legacy/                # v1 FastAPI backend (archived)
├── context.md              # Full project and builder context
└── next.config.js
```

---

## The Build History

Mira didn't start here. It started as a FastAPI + PostgreSQL backend built in pure Python - no framework magic, no shortcuts.

**v1 — Backend-first (archived in `_legacy/`)**
- FastAPI server on Uvicorn
- PostgreSQL + SQLAlchemy ORM, connection pooling, ACID transactions
- `POST /entries` → Gemini call → save to DB → return reflection
- Vanilla HTML frontend served by FastAPI
- Used psycopg3 (`psycopg[binary]==3.3.3`) because psycopg2 has no Python 3.13 wheel
- Migrated from `gemini-1.5-flash` to `gemini-2.5-flash` when 1.5 was deprecated

**v2 — Current (Next.js + Pinecone + RAG)**
- Full migration to Next.js for better auth, routing, and deployment ergonomics
- Firebase replaced the custom auth layer
- Pinecone replaced FAISS, persistent, cloud-native vector storage
- RAG implemented: every entry embedded, every chat retrieves top-K semantically similar entries
- Multi-session chat with memory commitment (★ Important flag)
- Deployed to Vercel

---

## By the Numbers

| Metric | Value |
|---|---|
| Commits | 25+ |
| API Routes | 6 active endpoints |
| AI Models in use | 2 (Flash + Embedding) |
| Vector dimensions | 768 per entry |
| Build time on Vercel | ~50s |
| Languages in repo | JS · Python · HTML · CSS · Shell |
| Lines of context documented | 266 |

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/somilbuilds/Mira.git
cd Mira
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in the root:

```env
# Google Gemini
GEMINI_API_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX=

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`

---

## Roadmap

- [x] v1 - FastAPI + PostgreSQL backend (archived)
- [x] Firebase Google Auth
- [x] Gemini AI entry analysis (summary + sentiments)
- [x] Pinecone vector embeddings
- [x] RAG global chat interface
- [x] Multi-tab chat sessions
- [x] Sentiment calendar
- [x] Vercel deployment
- [ ] Mood pattern analytics across time
- [ ] Weekly reflection emails
- [ ] Mobile-responsive polish
- [ ] Public launch (access on request until then)

---

## Access

The deployed site is **offline by default.** This is intentional, Mira is in active development and not yet ready for open usage.

If you want access, reach out directly.

> **GitHub:** [@somilbuilds](https://github.com/somilbuilds)

---

Mira sits at a deliberate convergence, systems engineering, cognitive psychology, and neuroscience. Dream research is one of the few places where all three fields have something real to say and none of them has the full picture alone. The architecture reflects that: structured data capture (CS), sentiment and pattern extraction (psychology), semantic vector memory (the closest a machine gets to how associative memory actually works in the brain).

This isn't a chatbot with a journal bolted on. It's an attempt to build something that behaves the way memory does — not chronologically, but by meaning.

---


<div align="center">

**Built by [somilbuilds](https://github.com/somilbuilds)**

<br />

[![MIT License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Pinecone](https://img.shields.io/badge/Pinecone-00B388?style=flat-square)](https://www.pinecone.io/)
[![Firebase](https://img.shields.io/badge/Firebase-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

</div>
