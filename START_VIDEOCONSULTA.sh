#!/bin/bash

# ============================================================================
# AutaMedica Videoconsulta - Start Script
# Levanta los 3 servidores necesarios
# ============================================================================

echo "🎥 AutaMedica Videoconsulta - Iniciando Servidores"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running in correct directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Ejecuta este script desde /root/Autamedica"
  exit 1
fi

echo -e "${BLUE}📡 Paso 1:${NC} Iniciando Signaling Server (puerto 8888)..."
echo ""

cd apps/signaling-server
pnpm dev &
SIGNALING_PID=$!
cd ../..

sleep 3

echo -e "${GREEN}✓${NC} Signaling Server corriendo (PID: $SIGNALING_PID)"
echo ""

echo -e "${BLUE}👤 Paso 2:${NC} Iniciando Patients App (puerto 3002)..."
echo ""

cd apps/patients
pnpm dev &
PATIENTS_PID=$!
cd ../..

sleep 3

echo -e "${GREEN}✓${NC} Patients App corriendo (PID: $PATIENTS_PID)"
echo ""

echo -e "${BLUE}👨‍⚕️ Paso 3:${NC} Iniciando Doctors App (puerto 3001)..."
echo ""

cd apps/doctors
pnpm dev &
DOCTORS_PID=$!
cd ../..

sleep 5

echo ""
echo "================================================================"
echo -e "${GREEN}✅ TODOS LOS SERVIDORES LISTOS${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}🌐 URLs para probar:${NC}"
echo ""
echo "  👤 Paciente:  http://localhost:3002/consultation/test-001"
echo "  👨‍⚕️ Doctor:    http://localhost:3001/consultation/test-001"
echo ""
echo "================================================================"
echo ""
echo -e "${YELLOW}ℹ️  Para detener los servidores:${NC}"
echo ""
echo "  kill $SIGNALING_PID $PATIENTS_PID $DOCTORS_PID"
echo ""
echo "  O presiona Ctrl+C"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Deteniendo servidores...'; kill $SIGNALING_PID $PATIENTS_PID $DOCTORS_PID 2>/dev/null; exit 0" INT

# Keep script running
wait
