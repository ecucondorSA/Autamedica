#!/bin/bash

# ============================================================================
# AutaMedica Videoconsulta - Ultimate Start Script
# Maneja todas las dependencias y errores automáticamente
# ============================================================================

set -e

echo "🎯 AutaMedica Videoconsulta"
echo "==========================="
echo ""

cd /root/Autamedica

# Clean previous processes
echo "🧹 Cleaning processes..."
ps aux | grep -E "(tsx|node.*8888|next.*300)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null
sleep 1

# Install deps if needed
echo "📥 Checking dependencies..."
pnpm install --silent 2>&1 | grep -v "Progress" || true

# Build packages
echo "📦 Building packages..."
pnpm build:packages 2>&1 | grep -v "WARN\|Progress" || true

# Start services
echo ""
echo "🚀 Starting services..."
echo ""

cd apps/signaling-server
pnpm dev > /tmp/signaling.log 2>&1 &
echo "   ✅ Signaling Server starting (port 8888)"

cd ../patients
pnpm dev > /tmp/patients.log 2>&1 &
echo "   ✅ Patients App starting (port 3002)"

cd ../doctors
pnpm dev > /tmp/doctors.log 2>&1 &
echo "   ✅ Doctors App starting (port 3001)"

cd ../..

echo ""
echo "⏳ Waiting for services (30 seconds)..."
sleep 30

echo ""
echo "🔍 Checking health..."
curl -s http://localhost:8888/health > /dev/null && echo "   ✅ Signaling: OK" || echo "   ⚠️  Signaling: Check /tmp/signaling.log"
curl -s http://localhost:3002 > /dev/null && echo "   ✅ Patients: OK" || echo "   ⚠️  Patients: Check /tmp/patients.log"
curl -s http://localhost:3001 > /dev/null && echo "   ✅ Doctors: OK" || echo "   ⚠️  Doctors: Check /tmp/doctors.log"

echo ""
echo "========================================="
echo "🎉 System Ready!"
echo "========================================="
echo ""
echo "📱 Open in browser:"
echo ""
echo "   Patient:  http://localhost:3002/consultation/test-001"
echo "   Doctor:   http://localhost:3001/consultation/test-001"
echo ""
echo "📄 Logs:"
echo "   tail -f /tmp/signaling.log"
echo "   tail -f /tmp/patients.log"
echo "   tail -f /tmp/doctors.log"
echo ""
echo "🛑 To stop: ./stop-all.sh"
echo ""
