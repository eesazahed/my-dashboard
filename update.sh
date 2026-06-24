#!/usr/bin/env bash
set -euo pipefail

# Run from the repo root on Nest after pushing to GitHub:
#   ./update.sh

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

SERVICE_NAME="${SERVICE_NAME:-my-dashboard}"
BRANCH="${BRANCH:-main}"

if [ -f "$APP_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$APP_DIR/.env"
  set +a
fi

DB_PATH="${DATABASE_PATH:-$APP_DIR/data/dashboard.db}"
DB_DIR="$(dirname "$DB_PATH")"

echo "==> My Dashboard update"
echo "    App:  $APP_DIR"
echo "    DB:   $DB_PATH"

mkdir -p "$DB_DIR"

if [ -f "$DB_PATH" ]; then
  BACKUP_PATH="${DB_PATH}.pre-update-$(date +%Y%m%d-%H%M%S)"
  echo "==> Backing up database"
  cp "$DB_PATH" "$BACKUP_PATH"
else
  echo "==> No existing database at $DB_PATH (first deploy or new path)"
fi

echo "==> Pulling from GitHub ($BRANCH)"
git pull origin "$BRANCH"

echo "==> Installing dependencies"
npm install

echo "==> Building"
npm run build

echo "==> Restarting $SERVICE_NAME"
systemctl --user daemon-reload
systemctl --user restart "$SERVICE_NAME"

sleep 1

if systemctl --user is-active --quiet "$SERVICE_NAME"; then
  echo "==> Service is running"
else
  echo "==> Service failed to start — check logs:"
  journalctl --user -u "$SERVICE_NAME" -n 30 --no-pager
  exit 1
fi

if [ -f "$DB_PATH" ]; then
  echo "==> Database still present"
else
  echo "==> WARNING: database file missing after update"
  echo "    Restore from the .pre-update backup in $DB_DIR if needed"
fi

echo "==> Done"
