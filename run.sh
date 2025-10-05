#!/bin/bash

# ============================================================================
# AutaMedica - ONE COMMAND TO RULE THEM ALL
# Compila packages y arranca sistema completo
# ============================================================================

set -e

echo "🎯 AutaMedica Videoconsulta - Complete Startup"
echo "=============================================="
echo ""

cd /root/Autamedica

# Step 0: Check dependencies
echo "🔍 Checking dependencies..."
if [ ! -d "node_modules/@livekit/components-styles" ]; then
  echo "   Installing missing dependencies..."
  pnpm install
fi
echo "   ✅ Dependencies OK"
echo ""

# Step 1: Build packages
echo "📦 Step 1/3: Building packages..."
pnpm build:packages
echo "   ✅ Packages built"
echo ""

# Step 2: Clean processes
echo "🧹 Step 2/3: Cleaning up..."
ps aux | grep -E "(tsx|node.*8888|next.*300)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null
sleep 2
echo "   ✅ Processes cleaned"
echo ""

# Step 3: Start services
echo "🚀 Step 3/3: Starting services..."
./start-all.sh
