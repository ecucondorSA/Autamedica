#!/bin/bash
#
# Stop Git Watcher
#

REPO_ROOT="/root/altamedica-reboot-fresh"
PID_FILE="$REPO_ROOT/.git-watcher.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "⚠️  Git Watcher no está corriendo (no se encontró PID file)"

  # Buscar proceso manualmente
  PIDS=$(pgrep -f "git-watcher.sh")
  if [ -n "$PIDS" ]; then
    echo "🔍 Procesos git-watcher encontrados: $PIDS"
    echo "🛑 Matando procesos..."
    pkill -f "git-watcher.sh"
    echo "✅ Procesos detenidos"
  fi

  exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
  echo "🛑 Deteniendo Git Watcher (PID: $PID)..."
  kill "$PID"
  sleep 2

  # Force kill if still running
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "⚠️  Forzando detención..."
    kill -9 "$PID"
  fi

  rm -f "$PID_FILE"
  echo "✅ Git Watcher detenido"
else
  echo "⚠️  PID $PID no está corriendo"
  rm -f "$PID_FILE"
fi
