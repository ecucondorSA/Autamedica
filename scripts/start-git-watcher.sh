#!/bin/bash
#
# Start Git Watcher in background
#

REPO_ROOT="/root/altamedica-reboot-fresh"
LOG_FILE="$REPO_ROOT/git-watcher.log"
PID_FILE="$REPO_ROOT/.git-watcher.pid"

cd "$REPO_ROOT"

# Check if already running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "⚠️  Git Watcher ya está corriendo (PID: $OLD_PID)"
    echo "📊 Ver logs: tail -f $LOG_FILE"
    echo "🛑 Detener: ./scripts/stop-git-watcher.sh"
    exit 1
  else
    echo "🧹 Limpiando PID obsoleto..."
    rm -f "$PID_FILE"
  fi
fi

echo "🚀 Iniciando Git Watcher..."

# Start watcher in background
nohup ./scripts/git-watcher.sh > /dev/null 2>&1 &
WATCHER_PID=$!

# Save PID
echo $WATCHER_PID > "$PID_FILE"

echo "✅ Git Watcher iniciado (PID: $WATCHER_PID)"
echo "📊 Ver logs: tail -f $LOG_FILE"
echo "🛑 Detener: ./scripts/stop-git-watcher.sh"
echo ""
echo "Logs iniciales:"
echo "----------------------------------------"
tail -20 "$LOG_FILE" 2>/dev/null || echo "(logs aún no generados)"
