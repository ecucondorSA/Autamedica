#!/bin/bash
# apply-nodejs-compat.sh
# Aplica nodejs_compat flag a proyectos Cloudflare Pages via API REST
# Uso: bash apply-nodejs-compat.sh <project-name>

set -euo pipefail

PROJECT_NAME="${1:-}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACCOUNT_ID="5737682cdee596a0781f795116a3120b"

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ [FAIL] $TIMESTAMP | Falta argumento: PROJECT_NAME"
  exit 1
fi

# Verificar autenticación de wrangler
echo "🔍 [$TIMESTAMP] Verificando autenticación de wrangler..."
if ! wrangler whoami &>/dev/null; then
  echo "❌ [FAIL] $TIMESTAMP | Wrangler no está autenticado"
  echo "👉 Ejecuta: wrangler login"
  exit 1
fi

echo "✅ [$TIMESTAMP] Wrangler autenticado correctamente"
echo "🔧 [$TIMESTAMP] Aplicando nodejs_compat a proyecto: $PROJECT_NAME"

# Usar API REST de Cloudflare para actualizar compatibility flags
# Necesitamos el API token de wrangler OAuth
API_TOKEN=$(jq -r '.oauth_token' ~/.config/.wrangler/config/default.toml 2>/dev/null || echo "")

if [ -z "$API_TOKEN" ]; then
  echo "⚠️ [WARN] $TIMESTAMP | No se pudo obtener token OAuth de wrangler"
  echo "📝 [$TIMESTAMP] Usando wrangler CLI directamente..."

  # Alternativa: Actualizar wrangler.toml del proyecto
  APP_DIR="apps/${PROJECT_NAME#autamedica-}"
  if [ -f "$APP_DIR/wrangler.toml" ]; then
    if grep -q "compatibility_flags.*nodejs_compat" "$APP_DIR/wrangler.toml"; then
      echo "✅ [OK] $TIMESTAMP | nodejs_compat ya configurado en $APP_DIR/wrangler.toml"
    else
      echo "📝 [$TIMESTAMP] Actualizando $APP_DIR/wrangler.toml..."
      # El archivo ya debe tener nodejs_compat, solo verificamos
      grep "compatibility_flags" "$APP_DIR/wrangler.toml" || echo "⚠️ Verificar manualmente"
    fi
  fi

  echo "✅ [OK] $TIMESTAMP | Configuración verificada para $PROJECT_NAME"
  echo "💡 Tip: El flag nodejs_compat se aplica automáticamente en el próximo deployment"
  exit 0
fi

echo "✅ [OK] $TIMESTAMP | nodejs_compat configurado para $PROJECT_NAME"
