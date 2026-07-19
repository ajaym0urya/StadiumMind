#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# GCP One-Time Bootstrap Script for StadiumMind AI
# Run this ONCE manually before first deployment to configure GCP infrastructure.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (gcloud auth login)
#   - Billing enabled on the project
#
# Usage:
#   chmod +x infra/gcp-bootstrap.sh
#   ./infra/gcp-bootstrap.sh <your-gcp-project-id>
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ID="${1:-your-gcp-project-id}"
REGION="us-central1"
REPO_NAME="stadiummind"
SA_NAME="stadiummind-deployer"
GITHUB_ORG="your-github-org"
GITHUB_REPO="StadiumMind"

echo "🚀 Bootstrapping StadiumMind GCP project: $PROJECT_ID"
echo "   Region: $REGION"
echo ""

# Set default project
gcloud config set project "$PROJECT_ID"

# ── 1. Enable Required APIs ───────────────────────────────────────────────────
echo "📡 Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  secretmanager.googleapis.com \
  --project="$PROJECT_ID"
echo "✅ APIs enabled."

# ── 2. Create Artifact Registry Repository ───────────────────────────────────
echo "📦 Creating Artifact Registry repository: $REPO_NAME..."
gcloud artifacts repositories create "$REPO_NAME" \
  --repository-format=docker \
  --location="$REGION" \
  --description="StadiumMind AI Docker images" \
  --project="$PROJECT_ID" || echo "  (Already exists — skipping)"
echo "✅ Artifact Registry ready."

# ── 3. Create Service Account for GitHub Actions Deployer ────────────────────
echo "🔑 Creating service account: $SA_NAME..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="StadiumMind GitHub Actions Deployer" \
  --project="$PROJECT_ID" || echo "  (Already exists — skipping)"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant required IAM roles
echo "🔐 Granting IAM roles to $SA_EMAIL..."
for ROLE in \
  "roles/run.admin" \
  "roles/artifactregistry.writer" \
  "roles/secretmanager.secretAccessor" \
  "roles/iam.serviceAccountUser"
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --quiet
  echo "  ✅ Granted: $ROLE"
done

# ── 4. Set Up Workload Identity Federation (keyless auth) ────────────────────
echo "🔒 Configuring Workload Identity Federation..."
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-actions-provider"

# Create pool
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --project="$PROJECT_ID" || echo "  (Pool already exists — skipping)"

POOL_RESOURCE=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
  --location="global" \
  --project="$PROJECT_ID" \
  --format="value(name)")

# Create OIDC provider for GitHub Actions
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --workload-identity-pool="$POOL_NAME" \
  --location="global" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${GITHUB_ORG}/${GITHUB_REPO}'" \
  --project="$PROJECT_ID" || echo "  (Provider already exists — skipping)"

PROVIDER_RESOURCE=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --workload-identity-pool="$POOL_NAME" \
  --location="global" \
  --project="$PROJECT_ID" \
  --format="value(name)")

# Bind service account to Workload Identity Pool (only GitHub Actions can impersonate)
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_RESOURCE}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"

echo "✅ Workload Identity Federation configured."

# ── 5. Store Gemini API Key in Secret Manager ────────────────────────────────
echo "🔐 Creating Gemini API Key secret..."
gcloud secrets create "stadiummind-gemini-api-key" \
  --replication-policy="automatic" \
  --project="$PROJECT_ID" || echo "  (Secret already exists — skipping)"

echo ""
echo "📝 Set the actual secret value by running:"
echo "   echo -n 'YOUR_GEMINI_API_KEY' | gcloud secrets versions add stadiummind-gemini-api-key --data-file=- --project=$PROJECT_ID"

# ── 6. Print GitHub Secrets to Configure ─────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Bootstrap complete! Add these secrets to GitHub:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  GCP_PROJECT_ID            →  $PROJECT_ID"
echo "  GCP_SERVICE_ACCOUNT       →  $SA_EMAIL"
echo "  GCP_WORKLOAD_IDENTITY_PROVIDER → $PROVIDER_RESOURCE"
echo ""
echo "  Go to: https://github.com/$GITHUB_ORG/$GITHUB_REPO/settings/secrets/actions"
echo ""
