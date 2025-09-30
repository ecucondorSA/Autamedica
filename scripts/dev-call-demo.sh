#!/bin/bash

# Dev Call Demo - Prueba rápida de videollamada sin auth
# =========================================================

set -e

echo "🚀 Iniciando demo de videollamada en modo desarrollo..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
ROOM_ID=${1:-"demo-room-$(date +%s)"}
DOCTOR_PORT=3001
PATIENT_PORT=3002

# Verificar si los servidores ya están corriendo
check_port() {
  lsof -i:$1 >/dev/null 2>&1
}

echo -e "${BLUE}📋 Configuración:${NC}"
echo "   Room ID: $ROOM_ID"
echo "   Doctor Port: $DOCTOR_PORT"
echo "   Patient Port: $PATIENT_PORT"
echo ""

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
  pnpm install
fi

# Build packages si es necesario
echo -e "${YELLOW}🔨 Construyendo packages...${NC}"
pnpm --filter "@autamedica/*" build

# Matar procesos anteriores si existen
if check_port $DOCTOR_PORT; then
  echo -e "${YELLOW}⚠️  Deteniendo servidor de doctors anterior...${NC}"
  kill $(lsof -t -i:$DOCTOR_PORT) 2>/dev/null || true
  sleep 2
fi

if check_port $PATIENT_PORT; then
  echo -e "${YELLOW}⚠️  Deteniendo servidor de patients anterior...${NC}"
  kill $(lsof -t -i:$PATIENT_PORT) 2>/dev/null || true
  sleep 2
fi

# Iniciar servidores en background
echo -e "${GREEN}🏥 Iniciando servidor de Doctors...${NC}"
(cd apps/doctors && pnpm dev --port $DOCTOR_PORT) > /tmp/doctors-dev.log 2>&1 &
DOCTOR_PID=$!

echo -e "${GREEN}👤 Iniciando servidor de Patients...${NC}"
(cd apps/patients && pnpm dev --port $PATIENT_PORT) > /tmp/patients-dev.log 2>&1 &
PATIENT_PID=$!

# Esperar a que los servidores estén listos
echo -e "${YELLOW}⏳ Esperando que los servidores inicien...${NC}"

wait_for_server() {
  local port=$1
  local name=$2
  local max_attempts=30
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:$port >/dev/null 2>&1; then
      echo -e "${GREEN}✅ $name está listo${NC}"
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  echo -e "${RED}❌ $name no pudo iniciar${NC}"
  return 1
}

wait_for_server $DOCTOR_PORT "Servidor de Doctors"
wait_for_server $PATIENT_PORT "Servidor de Patients"

echo ""
echo -e "${GREEN}🎉 ¡Todo listo! Abre estas URLs en diferentes ventanas del navegador:${NC}"
echo ""
echo -e "${BLUE}👨‍⚕️ Doctor:${NC}"
echo "   http://localhost:$DOCTOR_PORT/dev-call?room=$ROOM_ID&as=doctor"
echo ""
echo -e "${BLUE}👤 Paciente:${NC}"
echo "   http://localhost:$PATIENT_PORT/dev-call?room=$ROOM_ID&as=patient"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   - Abre cada URL en una ventana/pestaña diferente"
echo "   - Permite acceso a cámara y micrófono cuando se solicite"
echo "   - Ambos usuarios deben estar en la misma sala (room=$ROOM_ID)"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo "   - Doctors: tail -f /tmp/doctors-dev.log"
echo "   - Patients: tail -f /tmp/patients-dev.log"
echo ""
echo "Presiona Ctrl+C para detener los servidores..."

# Trap para limpiar al salir
trap "echo -e '\n${YELLOW}🛑 Deteniendo servidores...${NC}'; kill $DOCTOR_PID $PATIENT_PID 2>/dev/null; exit" INT TERM

# Mantener el script corriendo
wait $DOCTOR_PID $PATIENT_PID