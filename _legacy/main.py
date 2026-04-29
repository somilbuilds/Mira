from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from database import Base, engine
from routes import entries, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events for the application.
    On startup: creates all database tables if they don't exist.
    On shutdown: nothing to clean up yet.
    """
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Mira",
    description="A backend-first AI journaling system that reflects your entries back with psychological depth.",
    version="1.0.0",
    lifespan=lifespan
)

app.mount("/static", StaticFiles(directory="frontend"), name="static")
app.include_router(entries.router)
app.include_router(chat.router)


@app.get("/", summary="Serve frontend")
async def serve_frontend():
    """
    Serves the main HTML page when the user visits the root URL.
    FastAPI handles this like any other route — the response just
    happens to be an HTML file instead of JSON.
    """
    return FileResponse("frontend/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)