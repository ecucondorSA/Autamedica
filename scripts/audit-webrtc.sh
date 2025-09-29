#!/usr/bin/env bash
set -euo pipefail

APP="${1:-doctors}"   # usar: scripts/audit-webrtc.sh doctors|patients
APP_DIR="apps/${APP}"
PKG_TELE="packages/telemedicine"
SIGNAL_URL_DEFAULT="wss://autamedica-signaling-server.ecucondor.workers.dev/connect"
ROOM="diagnostic-$(date +%s)"

echo "== App objetivo: ${APP} ========================="
node -v || true; pnpm -v || true; echo

echo "== 1) Tipos/Build ==========================="
pnpm --filter @autamedica/types build
[ -d "$PKG_TELE" ] && (cd "$PKG_TELE" && pnpm build || true)
echo

echo "== 2) Envs ${APP} =========================="
ENV_FILE="$APP_DIR/.env.local"
if [ -f "$ENV_FILE" ]; then
  grep -E '^NEXT_PUBLIC_(SUPABASE_URL|SUPABASE_ANON_KEY|SIGNALING_URL|ICE_SERVERS|WEBRTC_DEBUG|APP_ENV)=' "$ENV_FILE" || true
else
  echo "⚠️  Falta $ENV_FILE"
fi
SIGNAL_URL=$(grep -E '^NEXT_PUBLIC_SIGNALING_URL=' "$ENV_FILE" | cut -d= -f2- || echo "$SIGNAL_URL_DEFAULT")
echo "SIGNAL_URL: $SIGNAL_URL"
echo

echo "== 3) Señalización (wscat) ================="
if command -v wscat >/dev/null 2>&1; then
  USER_TYPE=$([ "$APP" = "doctors" ] && echo "doctor" || echo "patient")
  echo "Testing as $USER_TYPE for room $ROOM"
  timeout 5 wscat -c "${SIGNAL_URL}?roomId=${ROOM}&userId=${APP}-pc&userType=${USER_TYPE}" -x '{"type":"ping","from":"pc"}' || echo "⚠️  wscat pc"
  timeout 5 wscat -c "${SIGNAL_URL}?roomId=${ROOM}&userId=${APP}-phone&userType=${USER_TYPE}" -x '{"type":"ping","from":"phone"}' || echo "⚠️  wscat phone"
else
  echo "⚠️  Instalar: npm i -g wscat"
fi
echo

echo "== 4) Next dev (${APP}) ===================="
cd "$APP_DIR"
rm -rf .next
PORT=$([ "$APP" = "doctors" ] && echo 3005 || echo 3006)
if lsof -ti:$PORT >/dev/null 2>&1; then
  echo "Killing existing process on port $PORT"
  lsof -ti:$PORT | xargs -r kill -9
fi
npx next dev -p $PORT >/tmp/next_${APP}.log 2>&1 &
DEV_PID=$!
sleep 6
if curl -fsS "http://localhost:$PORT/webrtc-test" >/dev/null 2>&1; then
  echo "✅ /webrtc-test en http://localhost:$PORT/webrtc-test"
else
  echo "⚠️  No responde. Log:"
  tail -n 50 /tmp/next_${APP}.log || true
fi

echo
echo "== 5) Abrir en 2 dispositivos =============="
IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo "PC:    http://localhost:$PORT/webrtc-test"
echo "Móvil: http://$IP:$PORT/webrtc-test"
echo
echo "Para parar: kill $DEV_PID"