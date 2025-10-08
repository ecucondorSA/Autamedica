#!/bin/bash
# Script de instalación para Playwright Debugger Enterprise
# Autamedica

set -e

echo "🔍 Playwright Debugger Enterprise - Instalación"
echo "==============================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Python 3.11+
echo "Verificando Python..."
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $PYTHON_VERSION"

# Verificar que sea >= 3.11
MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)
if [ "$MAJOR" -lt 3 ] || ([ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 11 ]); then
    echo -e "${RED}❌ Se requiere Python 3.11 o superior${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python OK${NC}"
echo ""

# Crear entorno virtual
echo "Creando entorno virtual..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Entorno virtual creado${NC}"
else
    echo -e "${YELLOW}⚠️  Entorno virtual ya existe${NC}"
fi
echo ""

# Activar entorno virtual
echo "Activando entorno virtual..."
source venv/bin/activate
echo -e "${GREEN}✅ Entorno virtual activado${NC}"
echo ""

# Actualizar pip
echo "Actualizando pip..."
pip install --upgrade pip
echo ""

# Instalar dependencias
echo "Instalando dependencias..."
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# Instalar navegadores Playwright
echo "Instalando navegadores Playwright..."
playwright install chromium
echo -e "${GREEN}✅ Chromium instalado${NC}"
echo ""

# Instalar package en modo editable
echo "Instalando package..."
pip install -e .
echo -e "${GREEN}✅ Package instalado${NC}"
echo ""

# Crear archivo .env desde .env.example
echo "Configurando .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ .env creado desde .env.example${NC}"
    echo -e "${YELLOW}⚠️  Revisa y edita .env según tus necesidades${NC}"
else
    echo -e "${YELLOW}⚠️  .env ya existe, no se sobrescribe${NC}"
fi
echo ""

# Verificar visor de imágenes
echo "Verificando visor de imágenes..."
if command -v eog &> /dev/null; then
    echo -e "${GREEN}✅ eog (Eye of GNOME) disponible${NC}"
elif command -v feh &> /dev/null; then
    echo -e "${GREEN}✅ feh disponible${NC}"
    echo "Configura SCREENSHOT_VIEWER=feh en .env"
elif command -v gpicview &> /dev/null; then
    echo -e "${GREEN}✅ gpicview disponible${NC}"
    echo "Configura SCREENSHOT_VIEWER=gpicview en .env"
else
    echo -e "${YELLOW}⚠️  No se encontró visor de imágenes${NC}"
    echo "Instala uno: sudo apt install eog"
fi
echo ""

# Crear directorios
echo "Creando directorios..."
mkdir -p screenshots reports logs data
echo -e "${GREEN}✅ Directorios creados${NC}"
echo ""

echo "==============================================="
echo -e "${GREEN}✅ Instalación completada exitosamente!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Activa el entorno virtual: source venv/bin/activate"
echo "2. Revisa/edita el archivo .env"
echo "3. Inicia tus apps de Autamedica (pnpm dev)"
echo "4. Ejecuta: python -m src.cli debug --app web-app"
echo ""
echo "Comandos disponibles:"
echo "  python -m src.cli debug --app web-app"
echo "  python -m src.cli watch --apps web-app,doctors"
echo "  python -m src.cli analyze --latest"
echo "  python -m src.cli sessions"
echo ""
