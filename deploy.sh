#!/usr/bin/env bash
# deploy.sh — Deploy ywca-backend to AWS Lambda
#
# Usage:
#   ./deploy.sh          → deploys to dev stage
#   ./deploy.sh prod     → deploys to prod stage
#   ./deploy.sh dev --dry-run  → package only, no upload
#
# Prerequisites:
#   - aws configure done (profile with Lambda, API GW, SSM, IAM permissions)
#   - Node.js 20+ installed
#   - npm install already run

set -euo pipefail

STAGE="${1:-dev}"
DRY_RUN="${2:-}"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ywca-backend → AWS Lambda              ║"
echo "║   Stage: $STAGE                           "
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Check prerequisites ────────────────────────────────────────────────
echo "▶ Checking prerequisites..."

command -v aws   >/dev/null 2>&1 || { echo "❌ aws CLI not found. Install from https://aws.amazon.com/cli/"; exit 1; }
command -v node  >/dev/null 2>&1 || { echo "❌ node not found."; exit 1; }
command -v npx   >/dev/null 2>&1 || { echo "❌ npx not found."; exit 1; }

echo "✅ Prerequisites OK"

# ── 2. Verify AWS credentials ─────────────────────────────────────────────
echo ""
echo "▶ Verifying AWS credentials..."
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "✅ Authenticated as account: $AWS_ACCOUNT"

# ── 3. Install / update dependencies ─────────────────────────────────────
echo ""
echo "▶ Installing dependencies..."
npm ci --omit=dev          # clean install, production only
npm install serverless-http  # ensure Lambda adapter is present
echo "✅ Dependencies installed"

# ── 4. Push SSM parameters (first-time / update) ─────────────────────────
# Uncomment and fill in values the first time you deploy to a new stage.
# After that, comment this block out or manage secrets separately.
#

# ── 5. Install Serverless Framework (if not present) ─────────────────────
if ! npx serverless --version >/dev/null 2>&1; then
  echo ""
  echo "▶ Installing Serverless Framework..."
  npm install --save-dev serverless serverless-offline
fi

# ── 6. Deploy (or dry-run package) ───────────────────────────────────────
echo ""
if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "▶ Packaging only (dry run)..."
  npx serverless package --stage "$STAGE"
  echo ""
  echo "✅ Package created in .serverless/ — nothing was deployed."
else
  echo "▶ Deploying to stage: $STAGE..."
  npx serverless deploy --stage "$STAGE" --verbose
  echo ""
  echo "✅ Deployment complete!"

  # Print the API endpoint
  echo ""
  echo "▶ Your API endpoint:"
  npx serverless info --stage "$STAGE" | grep -E "endpoint|ServiceEndpoint" || true
fi

echo ""
echo "Done 🚀"
