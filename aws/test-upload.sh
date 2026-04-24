#!/bin/bash
# Quick smoke-test for POST /uploads
# Usage: ./aws/test-upload.sh <path-to-file> <firebase-id-token>
set -e

FILE="${1:?usage: $0 <path-to-file> <firebase-id-token>}"
TOKEN="${2:?usage: $0 <path-to-file> <firebase-id-token>}"
API="${API_URL:-http://localhost:5050}"

echo "Uploading $FILE to $API/uploads ..."
curl -sS -X POST "$API/uploads" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@${FILE}" | tee /tmp/upload-response.json
echo ""
echo "---"
URL=$(python3 -c 'import json,sys; print(json.load(open("/tmp/upload-response.json"))["data"]["imageurl"])' 2>/dev/null || true)
if [ -n "$URL" ]; then
  echo "Public URL: $URL"
  echo "HEAD check:"
  curl -sS -I "$URL" | head -5
fi
