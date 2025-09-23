#!/bin/bash

# Script para abrir Cursor como root de forma segura
# Basado en soluciones documentadas en GitHub y Stack Overflow 2024

PROJECT_DIR="/root/altamedica-reboot"
CURSOR_EXECUTABLE="/home/edu/Descargas/squashfs-root/usr/share/cursor/cursor"
CURSOR_ROOT_DIR="~/.cursor-root"

echo "🚀 Abriendo Cursor como root de forma segura..."
echo "📁 Proyecto: $PROJECT_DIR"
echo "⚙️ Configuración: $CURSOR_ROOT_DIR"

# Crear directorio de configuración si no existe
mkdir -p ~/.cursor-root

# Verificar que el ejecutable existe
if [ ! -f "$CURSOR_EXECUTABLE" ]; then
    echo "❌ No se encuentra Cursor en: $CURSOR_EXECUTABLE"
    echo "💡 Verifica la ruta del ejecutable de Cursor"
    exit 1
fi

# Abrir Cursor con parámetros seguros para root
"$CURSOR_EXECUTABLE" "$PROJECT_DIR" \
  --user-data-dir="$CURSOR_ROOT_DIR" \
  --no-sandbox \
  --disable-gpu \
  --disable-chromium-sandbox \
  --disable-gpu-sandbox \
  --disable-dev-shm-usage \
  --disable-extensions-file-access-check \
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-backgrounding-occluded-windows \
  --ignore-certificate-errors \
  --allow-running-insecure-content \
  --disable-features=VizDisplayCompositor \
  --disable-seccomp-filter-sandbox \
  --verbose

echo "✅ Cursor iniciado con configuración segura para root"