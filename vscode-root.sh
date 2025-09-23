#!/bin/bash

# Script para abrir VS Code como root de forma segura
# Basado en soluciones documentadas en GitHub y Stack Overflow 2024

PROJECT_DIR="/root/altamedica-reboot"
VSCODE_ROOT_DIR="~/.vscode-root"

echo "🚀 Abriendo VS Code como root de forma segura..."
echo "📁 Proyecto: $PROJECT_DIR"
echo "⚙️ Configuración: $VSCODE_ROOT_DIR"

# Crear directorio de configuración si no existe
mkdir -p ~/.vscode-root

# Abrir VS Code con parámetros seguros para root
code "$PROJECT_DIR" \
  --user-data-dir="$VSCODE_ROOT_DIR" \
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

echo "✅ VS Code iniciado con configuración segura para root"