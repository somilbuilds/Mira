from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JournalEntry(BaseModel):
    entry: str

@app.get("/")
def home():
    return {"message": "Mira backend running"}

@app.post("/journal")
def reflect(entry: JournalEntry):
    user_text = entry.entry

    # mock reflection (we'll replace with Gemini later)
    reflection = f"You said: '{user_text}'. That sounds important. What do you think is driving this feeling?"

    return {
        "reflection": reflection
    }