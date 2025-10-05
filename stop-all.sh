#!/bin/bash

# ============================================================================
# AutaMedica - Stop All Services
# ============================================================================

echo "🛑 Stopping AutaMedica Services..."
echo ""

if [ -f /tmp/autamedica.pids ]; then
  PIDS=$(cat /tmp/autamedica.pids)
  echo "Killing processes: $PIDS"
  kill $PIDS 2>/dev/null
  rm /tmp/autamedica.pids
fi

# Cleanup any remaining processes
ps aux | grep -E "(tsx|node.*8888|next.*300)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null

echo "✅ All services stopped"
echo ""
echo "📄 Logs preserved at:"
echo "   /tmp/signaling.log"
echo "   /tmp/patients.log"
echo "   /tmp/doctors.log"
