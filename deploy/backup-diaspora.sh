#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_ROOT="/root/docker/diaspora-project/backups"
STAMP=$(date +%Y%m%d_%H%M%S)
DEST="$BACKUP_ROOT/$STAMP"
mkdir -p "$DEST"

docker compose --env-file .env.production exec -T postgres \
  pg_dump -U diaspora diaspora | gzip > "$DEST/diaspora.sql.gz"

if [[ -d uploads ]]; then
  tar -czf "$DEST/uploads.tar.gz" uploads
fi

find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +

echo "Backup written to $DEST"
