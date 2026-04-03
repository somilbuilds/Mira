# MIRA — CONTEXT DOCUMENT
## The Full Picture
### Who this person is. What is actually going on. Where they are going.
### For any AI mentor, technical guide, or future version of this conversation.

Written by Claude. Based on multiple honest conversations.

This document exists so that no future conversation has to start from scratch. It captures not just the plan, but the person — how they think, why they get stuck, what they actually want, and what they have already built.

Read this before giving any advice. It will save both of you a lot of time.

---

## Section 01 — Who This Person Is

**The surface facts**
- Name: Somil. GitHub handle: somilbuilds.
- Third year, Semester 6, BE Computer Engineering.
- College: AP Shah Institute of Technology, Thane — self-described as low tier.
- Location: Mira Road, Maharashtra. (The project is named Mira. Not a coincidence.)
- Placements begin Semester 7. Roughly 3-5 months of runway from April 2026.
- Resume now has one real project: Mira. GitHub is active. LinkedIn presence still limited.

**What he actually has — and does not know it**

This is the most important thing to understand about Somil. He describes himself as a beginner. He is not. He has serious low-level depth that most CS graduates never develop.

- Worked extensively with C in second year — heap, stack, memory structures, pointers.
- Read CSAPP (Computer Systems: A Programmer's Perspective) — unprompted, in second year.
- Cloned the Lua language source code and read its C internals to understand how a language is implemented.
- Built a snake game in the terminal in C from scratch.
- Spent time understanding C memory internals — nothing beneath is magic to him.
- Has decent DSA theory from coursework. Sloppy at coding it but not incapable.
- Has now built and shipped a working FastAPI backend with PostgreSQL and Gemini AI integration.

He is no longer zero. Mira version 1 is running locally and pushed to GitHub.

**The personality profile**
- Depth-first thinker. Takes time to understand something fully before moving forward. Does not move on until something is internalized.
- Learns by opposition. When given information, his instinct is to challenge it — why does this exist, why is it this way, what breaks this. This is not a flaw. It is systems thinking applied to knowledge acquisition.
- Rabbit hole risk. The same instinct that creates depth also causes him to disappear into tangents. He needs a project as a container, not more information.
- Wants to be around intelligence. Specifically wants to work on AI research, LLM engineering, and the intersection of AI and human cognition.
- Psychology and human philosophy interest him deeply. Mira is not accidental — it is the project that sits at exactly this intersection.

---

## Section 02 — The Actual Problem

**The problem is not laziness or lack of talent.**

The problem is a specific loop that has been running for at least a year. The loop is: sees field → researches full scope → feels behind → loses direction → changes goal → nothing ships → repeat.

The good news: this loop has been partially broken. Mira version 1 exists and runs. The risk is that the loop re-activates when the next difficult phase begins (understanding the codebase deeply, building version 2, doing DSA consistently).

**The overlapping causes — still worth watching for**
- Clarity and motivation are coupled. He cannot get motivated without a clear direction.
- The comparison trap. Peers with hackathon wins and LinkedIn posts create a distorted baseline.
- Tool overwhelm. Every field presents as a mountain of simultaneous tools.
- Placement pressure compounding everything. Wrong choice of field feels like career-ending mistake.

---

## Section 03 — How He Learns

**The core pattern — challenge before acceptance**

Somil learns by opposing the given context. When presented with information, his instinct is not to accept and apply — it is to question. Why does this exist? Why is it structured this way? What would break this? What is underneath this?

This is not contrarianism. It is systems thinking applied to knowledge acquisition.

**What works for him**
- Real code with a real purpose — learn the tool by hitting its walls
- Understanding why something exists before how to use it
- One thing deeply rather than many things broadly
- Building first, looking up concepts when blocked
- Being given the minimum viable explanation, then left to explore
- Being challenged — he loses interest when there is no resistance

**What does not work**
- Tutorial playlists — surface coverage without depth
- Syntax drills — he does not retain what has no conceptual anchor
- Parallel learning of multiple tools
- Courses that front-load theory before giving anything to build
- Over-explained walkthroughs

**The rabbit hole risk**

The mitigation is not to suppress the curiosity. It is to give it a container. The project is the container. Every rabbit hole must eventually connect back to making Mira work.

**How to give him advice that sticks**
- Give the why before the what. He will not implement something he does not understand the reason for.
- Do not give him lists of things to learn. Give him one thing, with a reason, and a build target.
- When he gets stuck in a loop of re-evaluating the direction — do not engage with the re-evaluation. Name the loop and redirect to the next concrete action.
- He responds to logic and precision, not motivation. Explain clearly why the current direction is correct and what specifically to do today.
- He needs permission to go deep. Telling him to "just use it" without understanding it will not work.

---

## Section 04 — The Field and the Motto

**The confirmed direction**

"I build backend systems that serve intelligence."

This is not a compromise. This is the precise intersection of what will get him placed, what he is capable of building in the available time, and what points toward the long-term work he actually wants to do.

**The longer arc**

- Now — FastAPI, PostgreSQL, RAG, LLM APIs. Get placed. Build Mira.
- Year one at job — PyTorch basics, fine-tuning, Hugging Face models.
- Year two — AI agents, multi-agent systems, autonomous pipelines.

---

## Section 05 — The Project — Mira

**Name and description**

Name: Mira — Mind Reflective Agent
GitHub: somilbuilds/Mira (currently private, goes public 1 month before placements)

A backend-first AI journaling system that reads what you write and reflects it back with psychological depth. Built on FastAPI, PostgreSQL, and RAG — your entries are embedded into vector space so Mira remembers not just what you wrote, but what it meant.

**Current status — as of April 2026**

Version 1 is complete and running locally.

- FastAPI server running via Uvicorn
- PostgreSQL database connected, `entries` table created automatically on startup
- POST /entries endpoint receives journal entry, calls Gemini 2.5 Flash, saves entry + reflection to DB, returns both
- Frontend (vanilla HTML) served by FastAPI, working in browser
- .env file handling API key and DB credentials securely
- Pushed to GitHub

**The full system — version 1 file structure**

```
mira/
├── main.py           — app entry point, lifespan, router inclusion
├── database.py       — SQLAlchemy engine, session, Base, get_db dependency
├── models.py         — Entry table definition
├── schemas.py        — Pydantic EntryCreate and EntryResponse
├── crud.py           — create_entry, get_all_entries, get_entry_by_id
├── ai.py             — Gemini 2.5 Flash call, system prompt, get_reflection()
├── routes/
│   ├── __init__.py
│   └── entries.py    — POST /entries, GET /entries, GET /entries/{id}
├── frontend/
│   └── index.html    — textarea, submit, reflection display, fetch() call
├── .env              — DATABASE_URL, GEMINI_API_KEY (never committed)
├── requirements.txt
└── README.md
```

**Key technical decisions made and why**

- psycopg2 replaced with psycopg[binary]==3.3.3 — psycopg2 has no Python 3.13 wheel
- Gemini 1.5 Flash replaced with gemini-2.5-flash — 1.5 is deprecated and returns 404
- DATABASE_URL uses postgresql+psycopg:// prefix to use psycopg3 driver with SQLAlchemy

**Version 2 — the next target (not started)**

Every entry gets embedded into a vector using an embedding model and stored in FAISS. When a new entry arrives, the system retrieves the three most emotionally similar past entries and injects them into the prompt as context. The LLM now references patterns across the user's history. This is RAG. Retrieval Augmented Generation. Built from scratch, on a project with genuine utility.

---

## Section 06 — The Tech Stack

**Priority stack — learn in this order**

| Tool | Layer | Status |
|---|---|---|
| Python | Foundation | Working knowledge, needs depth on async/decorators |
| FastAPI | Backend | Working — built and shipped version 1 |
| PostgreSQL + SQLAlchemy | Database | Working — connected, tables auto-created |
| JWT Auth | Security | Not yet — version 2 |
| Gemini API | AI Layer | Working — integrated in version 1 |
| Embeddings + FAISS | AI Layer | Not yet — version 2 |
| LangChain | AI Layer | Not yet — version 2 |
| Docker | Deployment | Not yet |
| Railway / Render | Deployment | Not yet |
| DSA (parallel) | Interviews | Should be running daily — status unknown |

**What not to learn before placement**
- JavaScript / React / Node
- Go and Rust (correct instinct, wrong timing — do after placement)
- Deep AWS
- Django
- PyTorch and model training (year one at job)

---

## Section 07 — Interview-Level Depth

He needs to own these concepts, not just use them.

**The Mira flow — what he must be able to explain end to end**

| Step | What happens | Concept demonstrated |
|---|---|---|
| 1 | HTTP request arrives from client | HTTP, REST, TCP |
| 2 | FastAPI receives and validates | FastAPI routing, Pydantic, decorators |
| 3 | Service layer handles logic | Separation of concerns |
| 4 | SQLAlchemy writes entry to PostgreSQL | ORM, connection pooling, ACID |
| 5 | Gemini API called asynchronously | LLM integration, async IO |
| 6 | Response serialized to JSON, returned | REST contract, Pydantic |

**Version 2 adds:**

| Step | What happens | Concept demonstrated |
|---|---|---|
| 7 | Embedding model converts entry to vector | Embeddings, semantic representation |
| 8 | FAISS retrieves top-3 similar past entries | Vector search, cosine similarity |
| 9 | Prompt constructed with retrieved context | RAG, prompt engineering |

---

## Section 08 — Rules and Commitments

**Decisions already made — do not reopen these**
- The field is backend with AI integration.
- The project is Mira. One project, built to full depth. Not replaced. Not abandoned.
- The language is Python. The framework is FastAPI.
- The repo is somilbuilds/Mira on GitHub. Private until 1 month before placements.
- No JavaScript study. No Go. No Rust. No Django. No deep AWS. Before placement only.
- DSA runs parallel, daily, 1-2 problems. Not optional.

**The one rule for learning**

Every time something works, ask what is underneath it. Every time something breaks, do not just fix it — understand why it broke. Every library used, read its source once. Every concept used, find the original explanation.

**The execution risk to watch for**

He will re-evaluate the direction. Again. It is not because the direction is wrong. It is because the loop described in Section 02 is deeply ingrained. When he starts questioning the stack or the project or the field — do not engage with the re-evaluation. Name the pattern. Ask what he built today. Redirect to the next concrete action.

---

## Section 09 — For the Next AI Reading This

**What he needs from you**
- Precision, not motivation.
- One thing at a time. One tool, one concept, one build target.
- The why before the what.
- Redirect loops to action.
- Respect the depth instinct. His depth is the asset, not the problem.

**What he does not need**
- More roadmaps.
- More tools to consider.
- Encouragement that ignores the real situation.
- Gentle redirection away from depth.

**Where he is right now — as of April 2026**
- Version 1 of Mira is complete and running locally
- Code pushed to GitHub
- Understands the web server layer (sockets, HTTP, async, Uvicorn, FastAPI) at a conceptual depth most bootcamp graduates never reach
- Next step: understand every line of the version 1 codebase, then build version 2 (RAG layer)
- Has not yet started consistent DSA practice — this needs to start now

**The only question that matters going forward:**

Did I open my editor today?

---

"One app built with depth is worth ten apps built shallowly. Build one thing. Go all the way down. Come back up. That is it."