#!/usr/bin/env bash
# 宝塔 / GitHub Webhook 可直接调用：
#   bash /www/wwwroot/lushi/scripts/deploy-server.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
LOG=/tmp/lushi-deploy.log
MP_LOG=/tmp/multiplayer.log
exec >>"$LOG" 2>&1

echo "======== $(date '+%F %T') deploy $ROOT ========"

export PATH="/usr/local/bin:/usr/bin:$PATH"
if command -v nvm >/dev/null 2>&1; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" 2>/dev/null || true
fi

if [ -d .git ]; then
  git fetch origin
  git checkout main
  git pull --ff-only origin main
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node 不在 PATH，请先安装 Node 20+"
  exit 1
fi
echo "node $(node -v)  npm $(npm -v)"

npm install --no-audit --no-fund
npm run build:static

pkill -f "server/multiplayer.ts" 2>/dev/null || true
pkill -f "tsx/dist/cli.mjs server/multiplayer.ts" 2>/dev/null || true
sleep 1

nohup npm run multiplayer >>"$MP_LOG" 2>&1 &
echo "multiplayer pid $!"
sleep 1
if curl -sf --max-time 2 http://127.0.0.1:8787/ >/dev/null; then
  echo "ws 8787 ok"
else
  echo "警告：8787 还没起来，看 $MP_LOG"
fi
echo "done"
