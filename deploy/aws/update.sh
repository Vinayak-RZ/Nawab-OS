#!/usr/bin/env bash
# Pull latest main and restart Founder OS on EC2 (called by CI/CD or manually).
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/founder-os}"
APP_USER="${APP_USER:-founder}"
BRANCH="${DEPLOY_BRANCH:-main}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Missing git repo at $APP_DIR — clone first." >&2
  exit 1
fi

echo "==> Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
cd "$APP_DIR"

# Git 2.35+ rejects repos when invoked via sudo unless explicitly trusted.
sudo -u "$APP_USER" git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true

OLD_REV="$(sudo -u "$APP_USER" git rev-parse --short HEAD)"
sudo -u "$APP_USER" git fetch origin "$BRANCH"
# Reset to remote — server must not hold local patches (CI/CD is source of truth)
sudo -u "$APP_USER" git reset --hard "origin/$BRANCH"
NEW_REV="$(sudo -u "$APP_USER" git rev-parse --short HEAD)"
echo "==> Revision $OLD_REV -> $NEW_REV"

echo "==> Dependencies..."
sudo -u "$APP_USER" "$APP_DIR/.venv/bin/pip" install -r "$APP_DIR/requirements.txt" -q

if grep -q '^WHATSAPP_ENABLED=true' /etc/founder-os/env 2>/dev/null; then
  echo "==> WhatsApp bridge..."
  if command -v node >/dev/null 2>&1; then
    sudo -u "$APP_USER" bash -c "cd '$APP_DIR/services/whatsapp-bridge' && npm install --omit=dev -q"
    if [[ -f "$APP_DIR/deploy/aws/nawab-whatsapp-bridge.service" ]]; then
      cp "$APP_DIR/deploy/aws/nawab-whatsapp-bridge.service" /etc/systemd/system/nawab-whatsapp-bridge.service
      systemctl daemon-reload
      systemctl enable nawab-whatsapp-bridge 2>/dev/null || true
      systemctl restart nawab-whatsapp-bridge || true
    fi
  else
    echo "WARN: Node.js not installed — skip WhatsApp bridge (see docs/WHATSAPP.md)" >&2
  fi
fi

echo "==> Restart founder-os..."
systemctl restart founder-os

echo "==> Health check..."
for _ in $(seq 1 30); do
  if curl -sf http://127.0.0.1:8787/api/health >/dev/null 2>&1; then
    curl -sf http://127.0.0.1:8787/api/health
    echo ""
    echo "Deploy OK ($NEW_REV)"
    exit 0
  fi
  sleep 2
done

echo "Deploy failed: service did not become healthy" >&2
journalctl -u founder-os -n 40 --no-pager >&2 || true
exit 1
