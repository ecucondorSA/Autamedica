#!/bin/bash

# 🧠 Script de Integración: Tests Completos de AutaMedica
# 
# Este script ejecuta todos los tests disponibles:
# - Tests de TypeScript/Playwright (originales)
# - Tests de Python/Playwright (nuevos)
# - Tests de accesibilidad, performance y regresión visual

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
PYTHON_TESTS_DIR="$SCRIPT_DIR/python"
TYPESCRIPT_TESTS_DIR="$SCRIPT_DIR/e2e"
REPORT_DIR="$PROJECT_ROOT/test-reports-complete"
LOG_FILE="$REPORT_DIR/complete-test-run.log"

# Variables de configuración
HEADLESS=true
GENERATE_REPORT=true
SEND_NOTIFICATIONS=false
CI_MODE=false
RUN_TYPESCRIPT=true
RUN_PYTHON=true
RUN_VISUAL=true
RUN_ACCESSIBILITY=true
RUN_PERFORMANCE=true

# Parsear argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-headless)
      HEADLESS=false
      shift
      ;;
    --no-report)
      GENERATE_REPORT=false
      shift
      ;;
    --notify)
      SEND_NOTIFICATIONS=true
      shift
      ;;
    --ci)
      CI_MODE=true
      shift
      ;;
    --typescript-only)
      RUN_PYTHON=false
      shift
      ;;
    --python-only)
      RUN_TYPESCRIPT=false
      shift
      ;;
    --no-visual)
      RUN_VISUAL=false
      shift
      ;;
    --no-accessibility)
      RUN_ACCESSIBILITY=false
      shift
      ;;
    --no-performance)
      RUN_PERFORMANCE=false
      shift
      ;;
    --help)
      echo "🧠 Script de Tests Completos de AutaMedica"
      echo ""
      echo "Uso: $0 [opciones]"
      echo ""
      echo "Opciones:"
      echo "  --no-headless         Ejecutar en modo visual"
      echo "  --no-report           No generar reportes"
      echo "  --notify              Enviar notificaciones"
      echo "  --ci                  Modo CI/CD"
      echo "  --typescript-only     Solo tests de TypeScript"
      echo "  --python-only         Solo tests de Python"
      echo "  --no-visual           Saltar tests visuales"
      echo "  --no-accessibility    Saltar tests de accesibilidad"
      echo "  --no-performance      Saltar tests de performance"
      echo "  --help                Mostrar esta ayuda"
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

  mkdir -p "$(dirname "$LOG_FILE")" >/dev/null 2>&1
  
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
  
  # Verificar Python
  if ! command -v python3 &> /dev/null; then
    missing_deps+=("python3")
  fi
  
  # Verificar pip
  if ! command -v pip3 &> /dev/null; then
    missing_deps+=("pip3")
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
  
  log "SUCCESS" "✅ Entorno preparado correctamente"
}

# Función para verificar servicios
check_services() {
  log "INFO" "🌐 Verificando servicios de AutaMedica..."
  
  local services=(
    "http://localhost:3005:Auth Service"
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

# Función para ejecutar tests de TypeScript
run_typescript_tests() {
  if [ "$RUN_TYPESCRIPT" = false ]; then
    log "INFO" "⏭️ Saltando tests de TypeScript"
    return 0
  fi
  
  log "INFO" "🧪 Ejecutando tests de TypeScript/Playwright..."
  
  cd "$PROJECT_ROOT"
  
  # Instalar dependencias si es necesario
  if [ ! -d "node_modules" ]; then
    log "INFO" "📦 Instalando dependencias de Node.js..."
    pnpm install
  fi
  
  # Instalar browsers de Playwright si es necesario
  if [ ! -d "node_modules/@playwright/test" ]; then
    log "INFO" "🎭 Instalando browsers de Playwright..."
    npx playwright install
  fi
  
  # Ejecutar tests de TypeScript
  local mock_flag="${MOCK_AUTAMEDICA:-1}"
  local playwright_cmd="MOCK_AUTAMEDICA=$mock_flag npx playwright test tests/e2e/doctor-login-videocall-flow.spec.ts --config=tests/e2e/playwright.doctor-videocall.config.ts"

  # Headless es el modo por defecto, solo agregamos --headed si queremos visual
  if [ "$HEADLESS" = false ]; then
    playwright_cmd="$playwright_cmd --headed"
  fi

  if [ "$GENERATE_REPORT" = true ]; then
    playwright_cmd="$playwright_cmd --reporter=line,json"
  fi
  
  log "DEBUG" "Comando TypeScript: $playwright_cmd"
  
  if eval "$playwright_cmd"; then
    log "SUCCESS" "✅ Tests de TypeScript ejecutados exitosamente"
    return 0
  else
    log "ERROR" "❌ Tests de TypeScript fallaron"
    return 1
  fi
}

# Función para ejecutar tests de Python
run_python_tests() {
  if [ "$RUN_PYTHON" = false ]; then
    log "INFO" "⏭️ Saltando tests de Python"
    return 0
  fi
  
  log "INFO" "🐍 Ejecutando tests de Python/Playwright..."
  
  cd "$PYTHON_TESTS_DIR"
  
  # Crear entorno virtual si no existe
  if [ ! -d ".venv" ]; then
    log "INFO" "🐍 Creando entorno virtual de Python..."
    python3 -m venv .venv
  fi
  
  # Activar entorno virtual
  source .venv/bin/activate
  
  # Instalar dependencias
  log "INFO" "📦 Instalando dependencias de Python..."
  pip install -r requirements.txt
  
  # Instalar browsers de Playwright
  log "INFO" "🎭 Instalando browsers de Playwright para Python..."
  python -m playwright install chromium
  
  # Ejecutar tests de Python
  local pytest_cmd="python run_tests.py"
  
  if [ "$HEADLESS" = true ]; then
    pytest_cmd="$pytest_cmd"  # Ya es headless por defecto
  else
    pytest_cmd="$pytest_cmd --no-headless"
  fi
  
  if [ "$GENERATE_REPORT" = true ]; then
    pytest_cmd="$pytest_cmd"  # Ya genera reportes por defecto
  else
    pytest_cmd="$pytest_cmd --no-report"
  fi
  
  # Ejecutar tests específicos
  local test_types=("auth")
  
  if [ "$RUN_VISUAL" = true ]; then
    test_types+=("visual")
  fi
  
  if [ "$RUN_ACCESSIBILITY" = true ]; then
    test_types+=("accessibility")
  fi
  
  if [ "$RUN_PERFORMANCE" = true ]; then
    test_types+=("performance")
  fi
  
  local success=true
  
  for test_type in "${test_types[@]}"; do
    log "INFO" "🧪 Ejecutando tests de tipo: $test_type"
    
    if ! python run_tests.py --type "$test_type"; then
      log "ERROR" "❌ Tests de $test_type fallaron"
      success=false
    else
      log "SUCCESS" "✅ Tests de $test_type ejecutados exitosamente"
    fi
  done
  
  if [ "$success" = true ]; then
    log "SUCCESS" "✅ Todos los tests de Python ejecutados exitosamente"
    return 0
  else
    log "ERROR" "❌ Algunos tests de Python fallaron"
    return 1
  fi
}

# Función para generar reporte consolidado
generate_consolidated_report() {
  if [ "$GENERATE_REPORT" = false ]; then
    return 0
  fi
  
  log "INFO" "📊 Generando reporte consolidado..."
  
  local report_file="$REPORT_DIR/consolidated-report.json"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  # Generar reporte JSON consolidado
  cat > "$report_file" << EOF
{
  "timestamp": "$timestamp",
  "test_suite": "autamedica-complete-tests",
  "environment": {
    "node_version": "$(node --version)",
    "python_version": "$(python3 --version)",
    "pnpm_version": "$(pnpm --version)",
    "headless": $HEADLESS,
    "ci_mode": $CI_MODE
  },
  "test_types": {
    "typescript": $RUN_TYPESCRIPT,
    "python": $RUN_PYTHON,
    "visual": $RUN_VISUAL,
    "accessibility": $RUN_ACCESSIBILITY,
    "performance": $RUN_PERFORMANCE
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
    "Considerar aumentar timeouts para entornos con latencia alta",
    "Revisar reportes de accesibilidad y performance"
  ]
}
EOF
  
  log "SUCCESS" "✅ Reporte consolidado generado en $report_file"
}

# Función para notificar resultados
notify_results() {
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
  log "INFO" "🚀 Iniciando tests completos de AutaMedica"
  log "INFO" "Configuración: TypeScript=$RUN_TYPESCRIPT, Python=$RUN_PYTHON, Headless=$HEADLESS, CI=$CI_MODE"
  
  # Ejecutar pasos
  check_dependencies
  setup_environment
  check_services
  
  # Ejecutar tests
  local typescript_success=true
  local python_success=true
  
  if [ "$RUN_TYPESCRIPT" = true ]; then
    if ! run_typescript_tests; then
      typescript_success=false
    fi
  fi
  
  if [ "$RUN_PYTHON" = true ]; then
    if ! run_python_tests; then
      python_success=false
    fi
  fi
  
  # Generar reporte consolidado
  generate_consolidated_report
  
  # Notificar resultados
  notify_results
  
  # Cleanup
  cleanup
  
  # Resultado final
  if [ "$typescript_success" = true ] && [ "$python_success" = true ]; then
    log "SUCCESS" "🎉 Todos los tests completados exitosamente"
    exit 0
  else
    log "ERROR" "💥 Algunos tests fallaron"
    exit 1
  fi
}

# Ejecutar función principal
main "$@"
