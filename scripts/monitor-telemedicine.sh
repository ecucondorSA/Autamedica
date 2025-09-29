#!/bin/bash

# Script de monitoreo para servidores de telemedicina
# Uso: ./scripts/monitor-telemedicine.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Monitor de Telemedicina AutaMedica"
echo "===================================="

servers=("doctors:3001" "patients:3002")

while true; do
    clear
    echo "🔍 Monitor de Telemedicina AutaMedica - $(date)"
    echo "===================================="
    echo ""

    for server in "${servers[@]}"; do
        IFS=':' read -ra ADDR <<< "$server"
        name=${ADDR[0]}
        port=${ADDR[1]}

        if curl -s --max-time 3 "http://localhost:$port" > /dev/null 2>&1; then
            echo -e "✅ ${GREEN}$name${NC}: http://localhost:$port (ACTIVO)"
        else
            echo -e "❌ ${RED}$name${NC}: http://localhost:$port (INACTIVO)"
        fi
    done

    echo ""
    echo "Presiona Ctrl+C para salir..."
    sleep 5
done
