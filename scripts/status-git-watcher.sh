#!/bin/bash
#
# Check Git Watcher status
#

REPO_ROOT="/root/altamedica-reboot-fresh"
LOG_FILE="$REPO_ROOT/git-watcher.log"
PID_FILE="$REPO_ROOT/.git-watcher.pid"

echo "🔍 Git Watcher Status"
echo "========================================"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")

  if ps -p "$PID" > /dev/null 2>&1; then
    echo "✅ Estado: CORRIENDO"
    echo "📍 PID: $PID"

    # Mostrar info del proceso
    echo ""
    echo "📊 Información del proceso:"
    ps -p "$PID" -o pid,ppid,cmd,%mem,%cpu,etime

    # Últimos logs
    echo ""
    echo "📝 Últimos logs (10 líneas):"
    echo "----------------------------------------"
    tail -10 "$LOG_FILE" 2>/dev/null || echo "(sin logs)"
  else
    echo "❌ Estado: DETENIDO (PID obsoleto)"
    echo "🧹 Limpiando PID file..."
    rm -f "$PID_FILE"
  fi
else
  echo "❌ Estado: DETENIDO"
  echo "💡 Iniciar con: ./scripts/start-git-watcher.sh"
fi

echo ""
echo "========================================"
echo "Comandos disponibles:"
echo "  🚀 Iniciar:  ./scripts/start-git-watcher.sh"
echo "  🛑 Detener:  ./scripts/stop-git-watcher.sh"
echo "  📊 Logs:     tail -f $LOG_FILE"
