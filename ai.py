import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

# configure the Gemini client with our API key.
# genai is the official Google Generative AI Python library.
# it handles the HTTP request to Google's servers for us —
# similar to how SQLAlchemy handles the connection to PostgreSQL.
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# create the model instance once at module load time.
# gemini-1.5-flash is fast and free-tier friendly — good for development.
model = genai.GenerativeModel("gemini-2.5-flash")

# the system prompt defines Mira's personality and behaviour.
# this is sent with every request — it tells the AI what role it's playing.
# it never changes per request. the user's journal entry is what changes.
SYSTEM_PROMPT = """You are Mira — a psychologically-informed journaling companion.

When someone shares a journal entry with you, your job is to reflect it back 
with depth, warmth, and honesty. You are not a therapist. You do not diagnose. 
You do not give advice unless explicitly asked.

What you do:
- Name what you observe beneath the surface of what was written
- Identify emotional patterns or tensions present in the entry  
- Reflect the person's own words and feelings back to them in a new light
- End with one gentle, open question that invites deeper reflection

Keep your response concise — 3 to 5 sentences plus the closing question.
Write as if you are speaking directly to the person, not about them."""


async def get_reflection(entry_text: str) -> str | None:
    """
    Sends the journal entry to Gemini and returns the reflection.
    Returns None if the API call fails — so the app doesn't crash
    just because the AI is unavailable.

    This function is async because the API call involves network I/O —
    it has to send a request to Google's servers and wait for a response.
    making it async means the event loop can handle other requests
    while this one is waiting for Gemini to respond.
    """
    try:
        # combine system prompt and user entry into a single prompt.
        # gemini-flash doesn't have a separate system_instruction parameter
        # in the same way as GPT-4, so we prepend it to the message.
        full_prompt = f"{SYSTEM_PROMPT}\n\nJournal entry:\n{entry_text}"

        # generate_content_async is the async version of generate_content.
        # the await here is what suspends this coroutine while waiting
        # for Google's API to respond — freeing the event loop.
        response = await model.generate_content_async(full_prompt)

        # response.text is the actual string the model returned.
        return response.text

    except Exception as e:
        # log the error so we can see what went wrong in the terminal,
        # but return None instead of crashing the entire request.
        # the route handler will deal with a None reflection gracefully.
        print(f"Gemini API error: {e}")
        return None