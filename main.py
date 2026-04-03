from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from database import Base, engine
from routes import entries


# asynccontextmanager lets us run setup code before the app starts
# and teardown code when it stops. This is the modern FastAPI way
# of doing startup logic — older code uses @app.on_event("startup")
@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs once when the server starts.
    # create_all looks at every class that inherits from Base (in models.py)
    # and creates the corresponding table in PostgreSQL if it doesn't exist yet.
    # If the table already exists, it does nothing — safe to run every time.
    Base.metadata.create_all(bind=engine)
    yield
    # anything after yield runs on shutdown — nothing to do here yet


app = FastAPI(
    title="Mira",
    description="A backend-first AI journaling system",
    version="1.0.0",
    lifespan=lifespan
)

# mount the frontend folder so FastAPI can serve the HTML file
# "/static" is the URL prefix, "frontend" is the actual folder on disk
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# include the entries router — all routes defined in routes/entries.py
# will now be available on this app
app.include_router(entries.router)


# serve the frontend HTML when someone visits the root URL
@app.get("/")
async def serve_frontend():
    return FileResponse("frontend/index.html")


# this block only runs if you execute main.py directly with `python main.py`
# it will not run when something else imports main.py
if __name__ == "__main__":
    import uvicorn
    # host="0.0.0.0" means accept connections from any network interface
    # not just localhost — important for when you deploy later
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)