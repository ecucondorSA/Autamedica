#!/bin/bash

# ============================================================================
# AutaMedica - Start All Services (Single Command)
# ============================================================================

echo "🚀 Starting AutaMedica Videoconsulta System"
echo "==========================================="
echo ""

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
ps aux | grep -E "(tsx|node.*8888|next.*300)" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null
sleep 2

# Build packages if needed
echo "📦 Ensuring packages are built..."
cd /root/Autamedica
if [ ! -d "packages/shared/dist" ] || [ ! -d "packages/types/dist" ]; then
  echo "   Building core packages (this may take a minute)..."
  pnpm build:packages > /dev/null 2>&1
  echo "   ✅ Packages ready"
else
  echo "   ✅ Packages already built"
fi
echo ""

# Start all services in background
echo "📡 Starting Signaling Server (port 8888)..."
cd /root/Autamedica/apps/signaling-server
pnpm dev > /tmp/signaling.log 2>&1 &
SIGNALING_PID=$!

echo "👤 Starting Patients App (port 3002)..."
cd /root/Autamedica/apps/patients
pnpm dev > /tmp/patients.log 2>&1 &
PATIENTS_PID=$!

echo "👨‍⚕️ Starting Doctors App (port 3001)..."
cd /root/Autamedica/apps/doctors
pnpm dev > /tmp/doctors.log 2>&1 &
DOCTORS_PID=$!

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo ""
echo "🔍 Checking service status..."
echo ""

if curl -s http://localhost:8888/health > /dev/null 2>&1; then
  echo "✅ Signaling Server: RUNNING (http://localhost:8888)"
else
  echo "⚠️  Signaling Server: Starting... (check /tmp/signaling.log)"
fi

if curl -s http://localhost:3002 > /dev/null 2>&1; then
  echo "✅ Patients App: RUNNING (http://localhost:3002)"
else
  echo "⚠️  Patients App: Starting... (check /tmp/patients.log)"
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
  echo "✅ Doctors App: RUNNING (http://localhost:3001)"
else
  echo "⚠️  Doctors App: Starting... (check /tmp/doctors.log)"
fi

echo ""
echo "==========================================="
echo "🎉 AutaMedica System Ready!"
echo "==========================================="
echo ""
echo "📱 Open these URLs in your browser:"
echo ""
echo "   👤 Patient:  http://localhost:3002/consultation/test-001"
echo "   👨‍⚕️ Doctor:   http://localhost:3001/consultation/test-001"
echo ""
echo "==========================================="
echo ""
echo "📋 Process IDs:"
echo "   Signaling: $SIGNALING_PID"
echo "   Patients:  $PATIENTS_PID"
echo "   Doctors:   $DOCTORS_PID"
echo ""
echo "📄 Logs:"
echo "   tail -f /tmp/signaling.log"
echo "   tail -f /tmp/patients.log"
echo "   tail -f /tmp/doctors.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $SIGNALING_PID $PATIENTS_PID $DOCTORS_PID"
echo ""
echo "Press Ctrl+C to stop monitoring (services will keep running)"
echo ""

# Save PIDs for later
echo "$SIGNALING_PID $PATIENTS_PID $DOCTORS_PID" > /tmp/autamedica.pids

# Monitor logs
echo "📊 Monitoring logs (Ctrl+C to exit)..."
echo ""
tail -f /tmp/signaling.log /tmp/patients.log /tmp/doctors.log
