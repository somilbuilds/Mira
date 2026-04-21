#!/bin/bash
# scripts/deploy.sh
# ── deploys Mira to Cloud Run with Cloud SQL backend ──────────────────────────
# Run this from the project root: bash scripts/deploy.sh
# Prerequisites: gcloud CLI installed and authenticated, Docker installed.

set -euo pipefail

# ── load config from .env ──────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in your values."
  exit 1
fi

source .env

PROJECT_ID="${GOOGLE_CLOUD_PROJECT}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
SERVICE_NAME="mira"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploying Mira to Cloud Run"
echo "  Project : ${PROJECT_ID}"
echo "  Region  : ${REGION}"
echo "  Image   : ${IMAGE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── step 1: authenticate and set project ──────────────────────────────────────
gcloud config set project "${PROJECT_ID}"

# ── step 2: enable required APIs (idempotent — safe to re-run) ────────────────
echo ""
echo "▶ Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  aiplatform.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com \
  --quiet

# ── step 3: build and push Docker image ───────────────────────────────────────
echo ""
echo "▶ Building and pushing Docker image..."
gcloud builds submit --tag "${IMAGE}" .

# ── step 4: deploy to Cloud Run ───────────────────────────────────────────────
echo ""
echo "▶ Deploying to Cloud Run..."

# Build the Cloud SQL connection string for Cloud Run
# Cloud Run connects to Cloud SQL via the Cloud SQL Auth Proxy (automatic)
PROD_DB_URL="postgresql+psycopg://${DB_USER}:${DB_PASS}@/${DB_NAME}?host=/cloudsql/${CLOUD_SQL_CONNECTION_NAME}"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances "${CLOUD_SQL_CONNECTION_NAME}" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --set-env-vars "GOOGLE_CLOUD_REGION=${REGION}" \
  --set-env-vars "DATABASE_URL=${PROD_DB_URL}" \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ Deployment complete."
echo ""
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --format 'value(status.url)')
echo "  Mira is live at: ${SERVICE_URL}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
