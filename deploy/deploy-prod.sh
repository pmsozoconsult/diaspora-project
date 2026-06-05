#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if systemctl is-active --quiet diaspora-dev; then
  echo "Stopping diaspora-dev before production build..."
  sudo systemctl stop diaspora-dev
  RESTART_DEV=1
else
  RESTART_DEV=0
fi

docker compose --env-file .env.production up -d

npm ci
npx prisma generate
npx prisma db push
set -a
source .env.production
set +a
npm run build

sudo systemctl restart diaspora-prod

if [[ "$RESTART_DEV" -eq 1 ]]; then
  echo "Not restarting diaspora-dev automatically. Start manually if needed:"
  echo "  sudo systemctl start diaspora-dev"
fi

echo "Production deploy complete."
