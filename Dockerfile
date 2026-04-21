# ── Dockerfile ──────────────────────────────────────────────────────────────────
# Multi-stage build: keeps final image small.
# Cloud Run expects a container that listens on PORT (default 8080).

FROM python:3.12-slim AS base

# prevents Python from writing .pyc files to disk
ENV PYTHONDONTWRITEBYTECODE=1
# prevents Python from buffering stdout/stderr (important for Cloud Run logs)
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# install system dependencies needed for psycopg binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy application code
COPY . .

# Cloud Run injects PORT automatically. We read it in CMD.
# Default to 8080 if PORT is not set.
EXPOSE 8080

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
