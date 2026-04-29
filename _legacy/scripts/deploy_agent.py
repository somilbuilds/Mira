#!/usr/bin/env python3
"""
scripts/deploy_agent.py
─────────────────────────────────────────────────────────────────────────────
Deploys the Mira ADK agent to Vertex AI Agent Engine.

Agent Engine is Google's managed runtime for ADK agents — it handles:
  - Scaling                  (zero to N instances automatically)
  - Session management       (conversation state stored server-side)
  - Logging + tracing        (every tool call logged in Cloud Logging)
  - IAM access control       (only authorised callers can invoke the agent)

After deployment, the agent has a resource name like:
  projects/PROJECT/locations/REGION/reasoningEngines/AGENT_ID

You call it from FastAPI via the Vertex AI SDK (not used in v2 — the agent
is deployed here as a reference, FastAPI calls Gemini directly for now).
In v3, replace the direct Gemini calls in ai.py with calls to this agent.

Usage:
  python scripts/deploy_agent.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import vertexai
from vertexai.preview import reasoning_engines
from adk_agents.mira_agent import root_agent

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
REGION = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")
STAGING_BUCKET = f"gs://{PROJECT_ID}-mira-agent-staging"

def deploy():
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  Deploying Mira agent to Vertex AI Agent Engine")
    print(f"  Project: {PROJECT_ID}  |  Region: {REGION}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    vertexai.init(project=PROJECT_ID, location=REGION, staging_bucket=STAGING_BUCKET)

    print("\n▶ Wrapping agent for Agent Engine...")
    app = reasoning_engines.AdkApp(
        agent=root_agent,
        enable_tracing=True,
    )

    print("▶ Deploying... (this takes 2–4 minutes)")
    remote_app = reasoning_engines.ReasoningEngine.create(
        app,
        requirements=[
            "google-adk==0.5.0",
            "google-generativeai==0.8.3",
            "google-cloud-aiplatform==1.71.1",
            "vertexai==1.71.1",
        ],
        display_name="mira-agent",
        description="Mira — journaling companion with emotional memory",
    )

    print(f"\n  ✓ Agent deployed.")
    print(f"\n  Resource name:")
    print(f"  {remote_app.resource_name}")
    print(f"\n  Add to .env:")
    print(f"  AGENT_ENGINE_ID={remote_app.resource_name.split('/')[-1]}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


if __name__ == "__main__":
    deploy()
