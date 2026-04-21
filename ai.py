import os
import re
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_gemini = genai.GenerativeModel("gemini-2.5-flash")

_REFLECTION_SYSTEM = """You are Mira — a psychologically-informed journaling companion.

When someone shares a journal entry with you, your job is to reflect it back 
with depth, warmth, and honesty. You are not a therapist. You do not diagnose. 
You do not give advice unless explicitly asked.

What you do:
- Name what you observe beneath the surface of what was written
- Identify emotional patterns or tensions present in the entry  
- Reflect the person's own words and feelings back to them in a new light
- If past entries are provided, subtly acknowledge the pattern without being clinical
- End with one gentle, open question that invites deeper reflection

Keep your response concise — 3 to 5 sentences plus the closing question.
Write as if you are speaking directly to the person, not about them."""

_MOOD_SYSTEM = """Read this journal entry and return exactly ONE lowercase word that best 
captures the dominant emotional tone. Valid words: calm, content, grateful, hopeful, 
anxious, stressed, overwhelmed, frustrated, angry, sad, grief, lonely, confused, 
numb, tired, restless, excited, proud.
Reply with ONLY that one word. No punctuation. No explanation."""

_CHAT_SYSTEM = """You are Mira — a psychologically-informed journaling companion.
The user previously wrote a journal entry. You reflected on it. Now they want to talk.
Respond with warmth, precision, and brevity (2–4 sentences).
Never diagnose. Never give unsolicited advice.
If the person seems in real distress, gently suggest speaking to someone they trust."""


async def embed_text(text: str) -> list[float] | None:
    """Vertex AI text-embedding-004 → 768-dim vector."""
    try:
        import vertexai
        from vertexai.language_models import TextEmbeddingModel
        import asyncio

        PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
        REGION = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
        vertexai.init(project=PROJECT_ID, location=REGION)

        model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, lambda: model.get_embeddings([text]))
        return result[0].values
    except Exception as e:
        print(f"[mira] embed_text error: {e}")
        return None


async def get_reflection(entry_text: str, past_entries: list[str] | None = None) -> str | None:
    try:
        memory_block = ""
        if past_entries:
            joined = "\n\n".join(f"- {e}" for e in past_entries)
            memory_block = f"\n\nEmotionally similar past entries (memory):\n{joined}\n"

        full_prompt = f"{_REFLECTION_SYSTEM}{memory_block}\n\nJournal entry:\n{entry_text}"
        response = await _gemini.generate_content_async(full_prompt)
        return response.text
    except Exception as e:
        print(f"[mira] get_reflection error: {e}")
        return None


async def infer_mood(entry_text: str) -> str | None:
    try:
        response = await _gemini.generate_content_async(
            f"{_MOOD_SYSTEM}\n\nEntry:\n{entry_text}"
        )
        mood = re.sub(r"[^a-z]", "", response.text.strip().lower().split()[0])
        return mood if mood else None
    except Exception as e:
        print(f"[mira] infer_mood error: {e}")
        return None


async def get_chat_response(
    entry_text: str,
    reflection: str,
    conversation: list[dict],
    past_entries: list[str] | None = None,
) -> str | None:
    try:
        memory_block = ""
        if past_entries:
            joined = "\n\n".join(f"- {e}" for e in past_entries)
            memory_block = f"\nMemory (similar past entries):\n{joined}\n"

        history_str = "\n".join(
            f"{'User' if m['role'] == 'user' else 'Mira'}: {m['content']}"
            for m in conversation
        )

        full_prompt = (
            f"{_CHAT_SYSTEM}"
            f"\n\nOriginal entry:\n{entry_text}"
            f"\n\nYour initial reflection:\n{reflection}"
            f"{memory_block}"
            f"\n\nConversation:\n{history_str}"
            f"\n\nMira:"
        )
        response = await _gemini.generate_content_async(full_prompt)
        return response.text
    except Exception as e:
        print(f"[mira] get_chat_response error: {e}")
        return None