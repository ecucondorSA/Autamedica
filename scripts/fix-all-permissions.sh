#!/bin/bash
################################################################################
# Fix All Permissions Script - AltaMedica
#
# Corrección comprehensiva de permisos del repositorio
# Ejecutar cuando aparezcan "Permission denied" en git operations
#
# Uso:
#   ./scripts/fix-all-permissions.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

REPO_DIR="/root/altamedica-reboot-fresh"
TARGET_USER="edu"
TARGET_GROUP="edu"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔧 Fix All Permissions - AltaMedica Reboot${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

################################################################################
# 1. Remove locks
################################################################################

log_info "Removiendo locks de Git..."
sudo rm -f "${REPO_DIR}/.git/index.lock" 2>/dev/null || true
sudo rm -f "${REPO_DIR}/.git/HEAD.lock" 2>/dev/null || true
sudo rm -f "${REPO_DIR}/.git/refs/heads/*.lock" 2>/dev/null || true
log_success "Locks eliminados"

################################################################################
# 2. Remove immutable flags
################################################################################

log_info "Removiendo flags inmutables..."
sudo chattr -R -i "${REPO_DIR}/.git/" 2>/dev/null || true
sudo chattr -R -i "${REPO_DIR}/docs/" 2>/dev/null || true
sudo chattr -R -i "${REPO_DIR}/apps/" 2>/dev/null || true
sudo chattr -R -i "${REPO_DIR}/packages/" 2>/dev/null || true
log_success "Flags inmutables removidos"

################################################################################
# 3. Fix ownership recursively
################################################################################

log_info "Corrigiendo ownership a ${TARGET_USER}:${TARGET_GROUP}..."
sudo chown -R ${TARGET_USER}:${TARGET_GROUP} "${REPO_DIR}"
log_success "Ownership corregido recursivamente"

################################################################################
# 4. Fix permissions
################################################################################

log_info "Corrigiendo permisos de archivos y directorios..."

# Directories: 755 (rwxr-xr-x)
sudo find "${REPO_DIR}" -type d -exec chmod 755 {} + 2>/dev/null || true

# Files: 644 (rw-r--r--)
sudo find "${REPO_DIR}" -type f -exec chmod 644 {} + 2>/dev/null || true

# Executables: 755 (rwxr-xr-x)
sudo find "${REPO_DIR}" -type f -name "*.sh" -exec chmod 755 {} + 2>/dev/null || true
sudo find "${REPO_DIR}" -type f -path "*/bin/*" -exec chmod 755 {} + 2>/dev/null || true
sudo find "${REPO_DIR}" -type f -path "*/.husky/*" ! -name "*.md" -exec chmod 755 {} + 2>/dev/null || true

log_success "Permisos corregidos"

################################################################################
# 5. Fix .git specific permissions
################################################################################

log_info "Corrigiendo permisos específicos de .git..."

# .git/objects permissions
sudo find "${REPO_DIR}/.git/objects" -type f -exec chmod 444 {} + 2>/dev/null || true
sudo find "${REPO_DIR}/.git/objects" -type d -exec chmod 755 {} + 2>/dev/null || true

# .git/hooks permissions
sudo find "${REPO_DIR}/.git/hooks" -type f -exec chmod 755 {} + 2>/dev/null || true

log_success "Permisos de .git corregidos"

################################################################################
# 6. Verify critical paths
################################################################################

log_info "Verificando paths críticos..."

CRITICAL_PATHS=(
    ".git/index"
    ".git/HEAD"
    "docs/"
    "apps/"
    "packages/"
)

ALL_OK=true
for path in "${CRITICAL_PATHS[@]}"; do
    FULL_PATH="${REPO_DIR}/${path}"
    if [ -e "$FULL_PATH" ]; then
        OWNER=$(stat -c '%U:%G' "$FULL_PATH")
        if [ "$OWNER" == "${TARGET_USER}:${TARGET_GROUP}" ]; then
            echo "  ✓ ${path} - ${OWNER}"
        else
            echo "  ✗ ${path} - ${OWNER} (expected ${TARGET_USER}:${TARGET_GROUP})"
            ALL_OK=false
        fi
    fi
done

echo ""

if [ "$ALL_OK" = true ]; then
    log_success "Todos los paths críticos tienen ownership correcto"
else
    log_warning "Algunos paths tienen ownership incorrecto"
fi

################################################################################
# 7. Test write permissions
################################################################################

log_info "Probando permisos de escritura como ${TARGET_USER}..."

# Test docs write
TEST_FILE="${REPO_DIR}/docs/.test-permissions-$$"
if sudo -u ${TARGET_USER} touch "$TEST_FILE" 2>/dev/null; then
    sudo rm "$TEST_FILE"
    echo "  ✓ docs/ - escritura OK"
else
    echo "  ✗ docs/ - escritura FAILED"
    ALL_OK=false
fi

# Test git operations
if sudo -u ${TARGET_USER} git -C "${REPO_DIR}" status >/dev/null 2>&1; then
    echo "  ✓ git status - OK"
else
    echo "  ✗ git status - FAILED"
    ALL_OK=false
fi

echo ""

################################################################################
# Summary
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ALL_OK" = true ]; then
    log_success "Permisos corregidos exitosamente"
    echo ""
    echo -e "${GREEN}El usuario '${TARGET_USER}' ahora tiene permisos completos${NC}"
    echo ""
    echo "Podés usar:"
    echo "  ./scripts/as-edu.sh git status"
    echo "  ./scripts/as-edu.sh touch docs/new-file.md"
else
    log_warning "Permisos corregidos con algunas advertencias"
    echo ""
    echo "Revisá los errores arriba"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
