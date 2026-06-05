#!/usr/bin/env bash
# Run Next.js on 127.0.0.1:3000 only (safe for SSH port forwarding).
set -euo pipefail
cd "$(dirname "$0")/.."

if ! docker compose ps --status running 2>/dev/null | grep -q postgres; then
  echo "Starting Postgres..."
  docker compose up -d
  sleep 2
fi

export HOSTNAME=127.0.0.1
exec npm run dev:tunnel
