#!/bin/bash

# ======================================================
# Script para levantar servidores de telemedicina
# AutaMedica - Doctores y Pacientes
# ======================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [[ ! -d "apps/doctors" || ! -d "apps/patients" ]]; then
    error "Este script debe ejecutarse desde la raíz del proyecto AutaMedica"
    exit 1
fi

log "🚀 Iniciando servidores de telemedicina AutaMedica"
echo "=================================================="

# Función para verificar si un puerto está libre
check_port() {
    local port=$1
    if lsof -i:$port > /dev/null 2>&1; then
        warning "Puerto $port ya está en uso. Intentando liberar..."
        lsof -ti:$port | xargs -r kill -9
        sleep 2
        if lsof -i:$port > /dev/null 2>&1; then
            error "No se pudo liberar el puerto $port"
            return 1
        fi
        log "Puerto $port liberado exitosamente"
    fi
    return 0
}

# Verificar y liberar puertos necesarios
info "Verificando disponibilidad de puertos..."
check_port 3001 || exit 1
check_port 3002 || exit 1

# Función para verificar dependencias
check_dependencies() {
    info "Verificando dependencias del proyecto..."

    if ! command -v pnpm &> /dev/null; then
        error "pnpm no está instalado. Por favor instala pnpm primero."
        exit 1
    fi

    if [[ ! -f "package.json" ]]; then
        error "package.json no encontrado en el directorio raíz"
        exit 1
    fi

    log "✅ Dependencias verificadas"
}

# Verificar que las apps existen y tienen package.json
check_apps() {
    info "Verificando aplicaciones de telemedicina..."

    local missing_apps=()

    if [[ ! -f "apps/doctors/package.json" ]]; then
        missing_apps+=("doctors")
    fi

    if [[ ! -f "apps/patients/package.json" ]]; then
        missing_apps+=("patients")
    fi

    if [[ ${#missing_apps[@]} -gt 0 ]]; then
        error "Apps faltantes: ${missing_apps[*]}"
        error "Asegúrate de que las apps doctors y patients están configuradas"
        exit 1
    fi

    log "✅ Aplicaciones verificadas"
}

# Función para instalar dependencias si es necesario
install_dependencies() {
    info "Verificando e instalando dependencias..."

    if [[ ! -d "node_modules" ]]; then
        log "Instalando dependencias del workspace..."
        pnpm install
    fi

    log "✅ Dependencias instaladas"
}

# Función para iniciar servidor en background con manejo de errores
start_server() {
    local app_name=$1
    local port=$2
    local filter_name=$3

    info "Iniciando servidor $app_name en puerto $port..."

    # Crear directorio de logs si no existe
    mkdir -p logs

    # Iniciar servidor en background
    pnpm --filter @autamedica/$filter_name dev -- -p $port > logs/$app_name.log 2>&1 &
    local pid=$!

    # Guardar PID para poder terminar el proceso después
    echo $pid > logs/${app_name}_pid.txt

    # Esperar un momento para que el servidor se inicie
    sleep 3

    # Verificar que el proceso sigue corriendo
    if ! kill -0 $pid 2>/dev/null; then
        error "El servidor $app_name falló al iniciar"
        if [[ -f "logs/$app_name.log" ]]; then
            error "Últimas líneas del log:"
            tail -10 logs/$app_name.log
        fi
        return 1
    fi

    # Verificar que el puerto responde
    local retries=10
    while [[ $retries -gt 0 ]]; do
        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            log "✅ Servidor $app_name iniciado exitosamente en puerto $port"
            return 0
        fi
        retries=$((retries - 1))
        sleep 2
    done

    warning "Servidor $app_name iniciado pero no responde en puerto $port (puede estar inicializando)"
    return 0
}

# Función para mostrar estado de servidores
show_server_status() {
    echo ""
    log "📊 Estado de servidores de telemedicina:"
    echo "=================================================="

    # Verificar estado de cada servidor
    local servers=("doctors:3001" "patients:3002")

    for server in "${servers[@]}"; do
        IFS=':' read -ra ADDR <<< "$server"
        local name=${ADDR[0]}
        local port=${ADDR[1]}

        if curl -s "http://localhost:$port" > /dev/null 2>&1; then
            log "✅ $name: http://localhost:$port (ACTIVO)"
        else
            warning "⚠️  $name: http://localhost:$port (NO RESPONDE)"
        fi
    done

    echo ""
}

# Función para crear script de monitoreo
create_monitoring_script() {
    info "Creando script de monitoreo..."

cat > scripts/monitor-telemedicine.sh << 'EOF'
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
EOF

    chmod +x scripts/monitor-telemedicine.sh
    log "✅ Script de monitoreo creado en scripts/monitor-telemedicine.sh"
}

# Función para mostrar URLs finales
show_final_urls() {
    echo ""
    log "🎉 Servidores de telemedicina iniciados!"
    echo "=================================================="
    echo ""
    echo -e "${BLUE}📱 Portal Doctores:${NC}  http://localhost:3001"
    echo -e "${BLUE}👤 Portal Pacientes:${NC} http://localhost:3002"
    echo ""
    echo -e "${YELLOW}📊 Para monitorear:${NC}    ./scripts/monitor-telemedicine.sh"
    echo -e "${YELLOW}📝 Logs en:${NC}           ./logs/"
    echo ""
    echo -e "${GREEN}💡 Tip:${NC} Abre ambas URLs en diferentes pestañas para probar la telemedicina"
    echo ""
}

# Función de limpieza al salir
cleanup() {
    warning "Recibida señal de terminación. Limpiando..."

    if [[ -f "logs/doctors_pid.txt" ]]; then
        local doctors_pid=$(cat logs/doctors_pid.txt)
        kill $doctors_pid 2>/dev/null || true
        rm -f logs/doctors_pid.txt
    fi

    if [[ -f "logs/patients_pid.txt" ]]; then
        local patients_pid=$(cat logs/patients_pid.txt)
        kill $patients_pid 2>/dev/null || true
        rm -f logs/patients_pid.txt
    fi

    log "Limpieza completada"
    exit 0
}

# Configurar manejo de señales
trap cleanup SIGINT SIGTERM

# Ejecución principal
main() {
    log "Iniciando proceso de configuración..."

    check_dependencies
    check_apps
    install_dependencies

    log "🏥 Iniciando servidores de telemedicina..."

    # Iniciar servidor de doctores
    start_server "doctors" 3001 "doctors" || {
        error "Falló al iniciar servidor de doctores"
        exit 1
    }

    # Iniciar servidor de pacientes
    start_server "patients" 3002 "patients" || {
        error "Falló al iniciar servidor de pacientes"
        cleanup
        exit 1
    }

    # Crear script de monitoreo
    create_monitoring_script

    # Mostrar estado y URLs finales
    show_server_status
    show_final_urls

    # Mantener el script corriendo
    info "Servidores ejecutándose en background..."
    info "Presiona Ctrl+C para detener todos los servidores"

    # Esperar hasta que el usuario termine el script
    while true; do
        sleep 10
        # Verificar que los procesos siguen corriendo
        if [[ -f "logs/doctors_pid.txt" ]]; then
            local doctors_pid=$(cat logs/doctors_pid.txt)
            if ! kill -0 $doctors_pid 2>/dev/null; then
                error "Servidor de doctores se detuvo inesperadamente"
                break
            fi
        fi

        if [[ -f "logs/patients_pid.txt" ]]; then
            local patients_pid=$(cat logs/patients_pid.txt)
            if ! kill -0 $patients_pid 2>/dev/null; then
                error "Servidor de pacientes se detuvo inesperadamente"
                break
            fi
        fi
    done
}

# Ejecutar función principal
main "$@"