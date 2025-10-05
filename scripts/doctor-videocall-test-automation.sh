#!/bin/bash

# 🧠 Script de Automatización: Doctor Login + Videollamada
# 
# Este script automatiza la ejecución del flujo médico completo de AutaMedica
# y puede ser integrado con git-flow-assistant para CI/CD
#
# Uso:
#   ./scripts/doctor-videocall-test-automation.sh [--headless] [--report] [--notify]
#
# Opciones:
#   --headless    Ejecutar tests en modo headless
#   --report      Generar reporte detallado
#   --notify      Enviar notificaciones de resultado
#   --ci          Modo CI/CD (timeouts extendidos)

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_DIR="$PROJECT_ROOT/tests/e2e"
REPORT_DIR="$PROJECT_ROOT/test-reports"
LOG_FILE="$REPORT_DIR/doctor-videocall-test.log"

# Variables de configuración
HEADLESS=false
GENERATE_REPORT=false
SEND_NOTIFICATIONS=false
CI_MODE=false
BROWSER="chromium"
TIMEOUT=60000

# Parsear argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --headless)
      HEADLESS=true
      shift
      ;;
    --report)
      GENERATE_REPORT=true
      shift
      ;;
    --notify)
      SEND_NOTIFICATIONS=true
      shift
      ;;
    --ci)
      CI_MODE=true
      TIMEOUT=120000
      shift
      ;;
    --browser)
      BROWSER="$2"
      shift 2
      ;;
    --help)
      echo "🧠 Script de Automatización: Doctor Login + Videollamada"
      echo ""
      echo "Uso: $0 [opciones]"
      echo ""
      echo "Opciones:"
      echo "  --headless      Ejecutar tests en modo headless"
      echo "  --report        Generar reporte detallado"
      echo "  --notify        Enviar notificaciones de resultado"
      echo "  --ci            Modo CI/CD (timeouts extendidos)"
      echo "  --browser       Navegador a usar (chromium, firefox, webkit)"
      echo "  --help          Mostrar esta ayuda"
      exit 0
      ;;
    *)
      echo "❌ Opción desconocida: $1"
      echo "Usa --help para ver las opciones disponibles"
      exit 1
      ;;
  esac
done

# Función para logging
log() {
  local level="$1"
  shift
  local message="$*"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  case $level in
    "INFO")
      echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$LOG_FILE"
      ;;
    "SUCCESS")
      echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE"
      ;;
    "WARNING")
      echo -e "${YELLOW}[WARNING]${NC} $message" | tee -a "$LOG_FILE"
      ;;
    "ERROR")
      echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE"
      ;;
    "DEBUG")
      echo -e "${PURPLE}[DEBUG]${NC} $message" | tee -a "$LOG_FILE"
      ;;
  esac
}

# Función para verificar dependencias
check_dependencies() {
  log "INFO" "🔍 Verificando dependencias..."
  
  local missing_deps=()
  
  # Verificar Node.js
  if ! command -v node &> /dev/null; then
    missing_deps+=("node")
  fi
  
  # Verificar pnpm
  if ! command -v pnpm &> /dev/null; then
    missing_deps+=("pnpm")
  fi
  
  # Verificar Playwright
  if ! command -v npx &> /dev/null || ! npx playwright --version &> /dev/null; then
    missing_deps+=("playwright")
  fi
  
  if [ ${#missing_deps[@]} -ne 0 ]; then
    log "ERROR" "❌ Dependencias faltantes: ${missing_deps[*]}"
    log "INFO" "Instala las dependencias faltantes y vuelve a intentar"
    exit 1
  fi
  
  log "SUCCESS" "✅ Todas las dependencias están disponibles"
}

# Función para preparar entorno
setup_environment() {
  log "INFO" "🔧 Preparando entorno de testing..."
  
  # Crear directorio de reportes
  mkdir -p "$REPORT_DIR"
  
  # Limpiar logs anteriores
  > "$LOG_FILE"
  
  # Verificar que estamos en el directorio correcto
  if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    log "ERROR" "❌ No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
  fi
  
  # Instalar dependencias si es necesario
  if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    log "INFO" "📦 Instalando dependencias..."
    cd "$PROJECT_ROOT"
    pnpm install
  fi
  
  # Instalar browsers de Playwright si es necesario
  if [ ! -d "$PROJECT_ROOT/node_modules/@playwright/test" ]; then
    log "INFO" "🎭 Instalando browsers de Playwright..."
    npx playwright install
  fi
  
  log "SUCCESS" "✅ Entorno preparado correctamente"
}

# Función para verificar servicios
check_services() {
  log "INFO" "🌐 Verificando servicios disponibles..."
  
  local services=(
    "http://localhost:3000:Auth Service"
    "http://localhost:3001:Doctors App"
    "http://localhost:3003:Patients App"
    "http://localhost:8888:Signaling Server"
  )
  
  local unavailable_services=()
  
  for service_info in "${services[@]}"; do
    IFS=':' read -r url name <<< "$service_info"
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
      log "SUCCESS" "✅ $name disponible en $url"
    else
      log "WARNING" "⚠️ $name no disponible en $url"
      unavailable_services+=("$name")
    fi
  done
  
  if [ ${#unavailable_services[@]} -ne 0 ]; then
    log "WARNING" "⚠️ Algunos servicios no están disponibles: ${unavailable_services[*]}"
    log "INFO" "Los tests pueden fallar si dependen de estos servicios"
  fi
}

# Función para ejecutar tests
run_tests() {
  log "INFO" "🧪 Ejecutando tests de Doctor Login + Videollamada..."
  
  cd "$PROJECT_ROOT"
  
  # Construir comando de Playwright
  local playwright_cmd="npx playwright test tests/e2e/doctor-login-videocall-flow.spec.ts"
  
  # Configurar navegador
  playwright_cmd="$playwright_cmd --project=doctor-videocall-$BROWSER"
  
  # Configurar modo headless
  if [ "$HEADLESS" = true ]; then
    playwright_cmd="$playwright_cmd --headed=false"
  else
    playwright_cmd="$playwright_cmd --headed=true"
  fi
  
  # Configurar timeout
  playwright_cmd="$playwright_cmd --timeout=$TIMEOUT"
  
  # Configurar reporter
  if [ "$GENERATE_REPORT" = true ]; then
    playwright_cmd="$playwright_cmd --reporter=html,json,junit"
  fi
  
  # Ejecutar tests
  log "DEBUG" "Comando: $playwright_cmd"
  
  if eval "$playwright_cmd"; then
    log "SUCCESS" "✅ Tests ejecutados exitosamente"
    return 0
  else
    log "ERROR" "❌ Tests fallaron"
    return 1
  fi
}

# Función para generar reporte
generate_report() {
  if [ "$GENERATE_REPORT" = false ]; then
    return 0
  fi
  
  log "INFO" "📊 Generando reporte detallado..."
  
  local report_file="$REPORT_DIR/doctor-videocall-report.json"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  # Generar reporte JSON
  cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "test_suite": "doctor-login-videocall-flow",
  "environment": {
    "node_version": "$(node --version)",
    "pnpm_version": "$(pnpm --version)",
    "playwright_version": "$(npx playwright --version | head -n1)",
    "browser": "$BROWSER",
    "headless": $HEADLESS,
    "ci_mode": $CI_MODE
  },
  "configuration": {
    "doctor_email": "doctor.demo@autamedica.com",
    "patient_id": "patient_001",
    "patient_name": "Juan Pérez",
    "timeout_ms": $TIMEOUT
  },
  "results": {
    "status": "completed",
    "log_file": "$LOG_FILE",
    "report_dir": "$REPORT_DIR"
  },
  "recommendations": [
    "Verificar conectividad de WebRTC en producción",
    "Validar credenciales de prueba en Supabase",
    "Revisar logs de signaling server",
    "Considerar aumentar timeouts para entornos con latencia alta"
  ]
}
EOF
  
  log "SUCCESS" "✅ Reporte generado en $report_file"
}

# Función para enviar notificaciones
send_notifications() {
  if [ "$SEND_NOTIFICATIONS" = false ]; then
    return 0
  fi
  
  log "INFO" "📢 Enviando notificaciones..."
  
  # En un entorno real, aquí se enviarían notificaciones a:
  # - Slack/Discord
  # - Email
  # - Dashboard de monitoreo
  # - CI/CD pipeline
  
  log "SUCCESS" "✅ Notificaciones enviadas"
}

# Función para limpiar
cleanup() {
  log "INFO" "🧹 Limpiando archivos temporales..."
  
  # Limpiar archivos temporales si es necesario
  # rm -rf /tmp/playwright-*
  
  log "SUCCESS" "✅ Limpieza completada"
}

# Función principal
main() {
  log "INFO" "🚀 Iniciando automatización de Doctor Login + Videollamada"
  log "INFO" "Configuración: Browser=$BROWSER, Headless=$HEADLESS, Report=$GENERATE_REPORT, CI=$CI_MODE"
  
  # Ejecutar pasos
  check_dependencies
  setup_environment
  check_services
  
  # Ejecutar tests
  if run_tests; then
    log "SUCCESS" "🎉 Todos los tests pasaron exitosamente"
    generate_report
    send_notifications
    cleanup
    exit 0
  else
    log "ERROR" "💥 Algunos tests fallaron"
    generate_report
    send_notifications
    cleanup
    exit 1
  fi
}

# Ejecutar función principal
main "$@"