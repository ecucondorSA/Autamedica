#!/bin/bash
################################################################################
# As Edu Script - Execute commands as edu user
#
# Wrapper para ejecutar comandos como usuario 'edu' desde root
# Soluciona problemas de permisos en git operations
#
# Uso:
#   ./scripts/as-edu.sh git status
#   ./scripts/as-edu.sh touch docs/new-file.md
#   ./scripts/as-edu.sh "git add . && git status"
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO_DIR="/root/altamedica-reboot-fresh"

if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Se requiere un comando${NC}"
    echo ""
    echo "Uso: $0 <comando>"
    echo ""
    echo "Ejemplos:"
    echo "  $0 git status"
    echo "  $0 touch docs/new-file.md"
    echo "  $0 'git add . && git commit -m \"mensaje\"'"
    exit 1
fi

cd "$REPO_DIR"

echo -e "${BLUE}🔧 Ejecutando como usuario 'edu':${NC} $@"
echo ""

# Execute command as edu user
sudo -u edu bash -c "cd $REPO_DIR && $@"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Comando exitoso${NC}"
else
    echo ""
    echo -e "${RED}❌ Comando falló con código: $EXIT_CODE${NC}"
fi

exit $EXIT_CODE
