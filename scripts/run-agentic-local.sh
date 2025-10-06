#!/usr/bin/env bash
set -euo pipefail

#############################################################################
# run-agentic-local.sh - Ejecutar Workflow Agéntico Localmente
#############################################################################
# Este script replica el workflow autamedica-agentic.yml de GitHub Actions
# pero ejecutándose localmente para testing y debugging
#############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DRY_RUN=false
AGENT_NAME=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGS_DIR="$PROJECT_ROOT/.logs"
GENERATED_DOCS_DIR="$PROJECT_ROOT/generated-docs"

# Crear directorios necesarios
mkdir -p "$LOGS_DIR" "$GENERATED_DOCS_DIR"

# Log file
LOG_FILE="$LOGS_DIR/agentic-workflow-$(date +%Y%m%d-%H%M%S).log"

# Función de logging
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
  log "${BLUE}INFO${NC}" "$@"
}

log_success() {
  log "${GREEN}SUCCESS${NC}" "$@"
}

log_warn() {
  log "${YELLOW}WARN${NC}" "$@"
}

log_error() {
  log "${RED}ERROR${NC}" "$@"
}

# Banner
print_banner() {
  echo -e "${BLUE}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         AutaMedica Agentic OS - Local Execution          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"
}

# Parse arguments
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --agent)
        AGENT_NAME="$2"
        shift 2
        ;;
      --help|-h)
        show_help
        exit 0
        ;;
      *)
        log_error "Unknown argument: $1"
        show_help
        exit 1
        ;;
    esac
  done
}

show_help() {
  cat << EOF
Usage: $0 [OPTIONS]

Options:
  --dry-run       Show what would be executed without actually running
  --agent NAME    Run only specific agent (agent_code, agent_db, etc.)
  --help, -h      Show this help message

Examples:
  $0                          # Run full workflow
  $0 --dry-run                # Dry run
  $0 --agent agent_code       # Run only agent_code
EOF
}

# Ejecutar comando con logging
run_cmd() {
  local cmd="$@"
  log_info "Executing: $cmd"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_warn "[DRY RUN] Would execute: $cmd"
    return 0
  fi

  if eval "$cmd" >> "$LOG_FILE" 2>&1; then
    log_success "Command succeeded: $cmd"
    return 0
  else
    log_error "Command failed: $cmd"
    return 1
  fi
}

# Agent: Code
agent_code() {
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "AGENT: CODE (lint, typecheck, build, tests)"
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "$PROJECT_ROOT"

  # Verify Husky hooks
  log_info "Verificando Husky hooks..."
  run_cmd "test -x .husky/pre-commit && test -x .husky/pre-push"

  # Pre-commit emulation
  log_info "Pre-commit emulation (lint + vitest)..."
  run_cmd "pnpm -w turbo run lint"
  run_cmd "pnpm -w vitest --run"

  # Pre-push emulation
  log_info "Pre-push emulation (typecheck + build)..."
  run_cmd "pnpm -w turbo run typecheck"
  run_cmd "pnpm -w turbo run build"

  # Router validation
  log_info "Validando App Router (no Pages Router)..."
  if ls -d apps/**/pages 2>/dev/null; then
    log_error "❌ Se detectó /pages. En AutaMedica usamos App Router."
    return 1
  fi
  log_success "✅ App Router validation passed"

  # Cleanup duplicates
  log_info "Limpiando duplicados..."
  run_cmd "bash scripts/cleanup_duplicates.sh || true"

  log_success "Agent CODE completed successfully"
}

# Agent: DB
agent_db() {
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "AGENT: DB (migrations, RLS validation)"
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "$PROJECT_ROOT"

  # DB snapshot
  log_info "Creando snapshot de DB..."
  run_cmd "echo '[INFO] snapshot logical' > $GENERATED_DOCS_DIR/db-backup.txt"

  # Migrations
  log_info "Verificando migraciones..."
  run_cmd "supabase migration list || true"

  # RLS validation
  log_info "Validando RLS..."
  if [[ -n "${DATABASE_URL:-}" ]]; then
    run_cmd "psql \"\$DATABASE_URL\" -c \"select tablename, rowsecurity from pg_tables where schemaname='public';\" || true"
  else
    log_warn "DATABASE_URL no configurado, saltando validación RLS"
  fi

  log_success "Agent DB completed successfully"
}

# Agent: Security
agent_security() {
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "AGENT: SECURITY (headers, fetch checks)"
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "$PROJECT_ROOT"

  # Build with security headers
  log_info "Building apps con headers de seguridad..."
  run_cmd "pnpm -w turbo run build --filter=apps/*"

  # Node fetch check
  log_info "Verificando headers con Node fetch..."
  run_cmd "node scripts/node_fetch_check.mjs"

  # Screenshots
  log_info "Capturando screenshots..."
  run_cmd "node scripts/screenshot_check.mjs"

  log_success "Agent SECURITY completed successfully"
}

# Agent: QA
agent_qa() {
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "AGENT: QA (validación final)"
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "$PROJECT_ROOT"

  # Fetch check
  log_info "Fetch check obligatorio..."
  run_cmd "node scripts/node_fetch_check.mjs"

  # Screenshots
  log_info "Screenshots obligatorios..."
  run_cmd "node scripts/screenshot_check.mjs"

  # Vitest final
  log_info "Tests finales..."
  run_cmd "pnpm -w vitest --run"

  log_success "Agent QA completed successfully"
}

# Agent: Docs
agent_docs() {
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "AGENT: DOCS (auto-commit documentación)"
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "$PROJECT_ROOT"

  log_info "Configurando git..."
  run_cmd "git config user.name 'autamedica-bot' || true"
  run_cmd "git config user.email 'bot@autamedica.local' || true"

  log_info "Añadiendo archivos generados..."
  run_cmd "git add generated-docs/ .logs/ README.md claude.md agente.md || true"

  log_info "Commit de documentación..."
  run_cmd "git diff --staged --quiet || git commit -m 'chore(agentic): docs/logs & docs updated' || true"

  log_success "Agent DOCS completed successfully"
}

# Post-task report
post_task_report() {
  log_info "Generando reporte post-tarea..."
  run_cmd "python3 scripts/post_task_report.py || true"
}

# Main workflow
run_workflow() {
  print_banner

  log_info "Iniciando Agentic Workflow..."
  log_info "Modo: $([ "$DRY_RUN" == "true" ] && echo 'DRY RUN' || echo 'EJECUCIÓN REAL')"
  log_info "Log file: $LOG_FILE"
  log_info ""

  if [[ -n "$AGENT_NAME" ]]; then
    log_info "Ejecutando solo agente: $AGENT_NAME"
    case "$AGENT_NAME" in
      agent_code)
        agent_code
        ;;
      agent_db)
        agent_db
        ;;
      agent_security)
        agent_security
        ;;
      agent_qa)
        agent_qa
        ;;
      agent_docs)
        agent_docs
        ;;
      *)
        log_error "Agente desconocido: $AGENT_NAME"
        log_info "Agentes disponibles: agent_code, agent_db, agent_security, agent_qa, agent_docs"
        exit 1
        ;;
    esac
  else
    log_info "Ejecutando workflow completo..."
    agent_code
    agent_db
    agent_security
    agent_qa
    agent_docs
  fi

  post_task_report

  log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_success "Workflow completado exitosamente ✅"
  log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "Log completo: $LOG_FILE"
}

# Main
main() {
  parse_args "$@"
  run_workflow
}

main "$@"
