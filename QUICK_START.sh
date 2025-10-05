#!/bin/bash
# Quick verification before starting

echo "🔍 Verificación Pre-Inicio"
echo "=========================="
echo ""

# Check 1: Env vars
if [ -f "apps/signaling-server/.env" ]; then
  echo "✅ Signaling server .env existe"
else
  echo "❌ Falta apps/signaling-server/.env"
  exit 1
fi

# Check 2: LiveKit credentials
if grep -q "LIVEKIT_API_KEY=APIdeCcSqaJyrTG" apps/signaling-server/.env; then
  echo "✅ LiveKit credentials configuradas"
else
  echo "❌ Faltan credenciales LiveKit"
  exit 1
fi

# Check 3: Ports free
if lsof -ti:8888 > /dev/null 2>&1; then
  echo "⚠️  Puerto 8888 en uso - liberando..."
  lsof -ti:8888 | xargs kill -9 2>/dev/null
  sleep 1
fi

if lsof -ti:3001 > /dev/null 2>&1; then
  echo "⚠️  Puerto 3001 en uso - liberando..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null
  sleep 1
fi

if lsof -ti:3002 > /dev/null 2>&1; then
  echo "⚠️  Puerto 3002 en uso - liberando..."
  lsof -ti:3002 | xargs kill -9 2>/dev/null
  sleep 1
fi

echo "✅ Puertos 8888, 3001, 3002 libres"

# Check 4: Node modules
if [ ! -d "node_modules" ]; then
  echo "⚠️  Instalando dependencias..."
  pnpm install
fi

echo "✅ Dependencias instaladas"
echo ""
echo "🚀 TODO LISTO - Puedes ejecutar:"
echo ""
echo "   ./START_VIDEOCONSULTA.sh"
echo ""
