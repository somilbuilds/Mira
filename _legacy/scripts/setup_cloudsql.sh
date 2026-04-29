#!/bin/bash
# scripts/setup_cloudsql.sh
# ── creates Cloud SQL (PostgreSQL) instance with pgvector ─────────────────────
# Run ONCE during initial project setup.
# After this, pgvector lives in the DB permanently.

set -euo pipefail

source .env

PROJECT_ID="${GOOGLE_CLOUD_PROJECT}"
REGION="${GOOGLE_CLOUD_REGION:-us-central1}"
INSTANCE_NAME="mira-db"
DB_NAME="${DB_NAME:-mira}"
DB_USER="${DB_USER:-mira}"
DB_PASS="${DB_PASS}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setting up Cloud SQL for Mira"
echo "  Instance: ${INSTANCE_NAME} in ${REGION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

gcloud config set project "${PROJECT_ID}"

# ── step 1: create Cloud SQL instance (PostgreSQL 16) ─────────────────────────
# --database-flags=cloudsql.enable_pgvector=on  ← enables pgvector extension
echo ""
echo "▶ Creating Cloud SQL instance (this takes 3–5 minutes)..."
gcloud sql instances create "${INSTANCE_NAME}" \
  --database-version=POSTGRES_16 \
  --region="${REGION}" \
  --tier=db-f1-micro \
  --database-flags=cloudsql.enable_pgvector=on \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=04:00 \
  --quiet

# ── step 2: set root password ─────────────────────────────────────────────────
echo ""
echo "▶ Setting root password..."
gcloud sql users set-password postgres \
  --instance="${INSTANCE_NAME}" \
  --password="${DB_PASS}"

# ── step 3: create database ───────────────────────────────────────────────────
echo ""
echo "▶ Creating database: ${DB_NAME}..."
gcloud sql databases create "${DB_NAME}" \
  --instance="${INSTANCE_NAME}"

# ── step 4: create application user ───────────────────────────────────────────
echo ""
echo "▶ Creating DB user: ${DB_USER}..."
gcloud sql users create "${DB_USER}" \
  --instance="${INSTANCE_NAME}" \
  --password="${DB_PASS}"

# ── step 5: get connection name ───────────────────────────────────────────────
CONNECTION_NAME=$(gcloud sql instances describe "${INSTANCE_NAME}" \
  --format='value(connectionName)')

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ Cloud SQL instance created."
echo ""
echo "  Connection name: ${CONNECTION_NAME}"
echo ""
echo "  Add this to your .env:"
echo "  CLOUD_SQL_CONNECTION_NAME=${CONNECTION_NAME}"
echo ""
echo "  Next: run scripts/init_db.sh to enable pgvector and create tables."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
