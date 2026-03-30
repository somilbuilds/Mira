# Reflective AI Journal — Context Document

## 🧠 Project Vision

A backend-driven AI journaling system that helps users:

* write personal thoughts
* receive intelligent reflections
* discover emotional patterns over time

Core idea:

> “I build backend systems that serve intelligence.”

This is not just a journaling app — it is a system that processes human thoughts and returns structured insight.

---

## 🎯 Goals

### Primary Goals

* Build a working backend system using FastAPI
* Store and manage user journal entries
* Integrate LLM API to generate reflections
* Design a system that can evolve into RAG

### Secondary Goals

* Learn API architecture deeply
* Understand data flow (request → processing → response)
* Build something explainable in interviews

---

## 🧱 System Architecture (High Level)

1. User writes journal entry (frontend)
2. Request sent to backend API
3. Backend:

   * validates request
   * stores entry in database
   * sends text to LLM API
4. LLM returns reflection
5. Backend stores reflection
6. Response sent back to user

---

## ⚙️ Tech Stack

### Backend (Core)

* Python
* FastAPI
* PostgreSQL (later)
* SQLite (initial)

### AI Layer

* LLM API (Gemini / OpenAI)

### Frontend (Minimal)

* HTML
* Tailwind CSS
* Vanilla JS (later for API calls)

---

## 🧩 Version 1 (MVP)

### Features

* User can write a journal entry
* Entry is saved in database
* LLM generates reflection
* Reflection is shown to user

### Data Model (Basic)

* id
* user_id (later)
* entry_text
* reflection_text
* timestamp

---

## 🔄 Request Flow (Detailed)

1. Frontend sends POST request:
   /journal

2. FastAPI receives request

3. Route handler:

   * extracts text
   * calls service layer

4. Service layer:

   * stores entry in DB
   * calls LLM API

5. LLM:

   * processes prompt
   * returns reflection

6. Backend:

   * saves reflection
   * returns JSON response

---

## 🧠 LLM Behavior Design

System prompt (example):
“You are a thoughtful psychological mirror. Reflect the user’s thoughts with depth, identify emotional patterns, and ask one meaningful follow-up question.”

---

## 🚀 Version 2 (RAG Integration)

This is the most important upgrade.

### Problem

LLM only sees current entry → no memory

### Solution

Add semantic memory using embeddings

---

## 🔍 RAG Pipeline

1. Every journal entry is converted into an embedding (vector)

2. Store embeddings in vector database (FAISS)

3. When user writes new entry:

   * convert new entry to embedding
   * search for similar past entries

4. Retrieve top 3 relevant entries

5. Inject into LLM prompt:

Example:
“User previously wrote:

* entry A
* entry B

Now current entry:

* entry C

Reflect with awareness of past patterns.”

---

## 🧠 What This Enables

* Emotional continuity
* Pattern detection over time
* Personalized responses

This is what makes the system “intelligent”

---

## 📦 Future Improvements

### Backend

* JWT Authentication
* User accounts
* API rate limiting

### AI

* Better prompt engineering
* Structured output (JSON)
* Emotion tagging

### Data

* Search by meaning (semantic search)
* Timeline visualization

---

## 🧪 What You Must Understand (Interview Depth)

* How FastAPI handles requests
* What happens when API is called (HTTP → function)
* How database stores and retrieves data
* What embeddings are (vector representation)
* What RAG is (retrieval + generation)
* Why stateless APIs matter

---

## 💬 How to Explain This Project

Short version:
“I built a backend system using FastAPI where users can write journal entries and receive AI-generated reflections. I then extended it using embeddings and RAG so the system retrieves past similar entries and provides context-aware responses.”

---

## 🔥 Final Note

This project is not about UI or features.

It is about:

* understanding systems
* building intelligence layers
* explaining your work clearly

One deep project > ten shallow ones.

---
