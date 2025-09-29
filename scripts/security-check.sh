#!/bin/bash
set -euo pipefail

echo "🔍 Ejecutando verificación de seguridad Autamedica..."
echo "Fecha: $(date)"
echo ""

# Variables de configuración
FAILED_CHECKS=0
WARNINGS=0

# Función para reportar fallos
fail_check() {
  echo "❌ $1"
  ((FAILED_CHECKS++))
}

# Función para reportar warnings
warn_check() {
  echo "⚠️  $1"
  ((WARNINGS++))
}

# Función para reportar éxito
pass_check() {
  echo "✅ $1"
}

echo "1. 🔐 VERIFICACIÓN DE CREDENCIALES HARDCODEADAS"
echo "================================================"

# Buscar JWT tokens
if grep -r "eyJ[A-Za-z0-9_-]" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.patch" . >/dev/null 2>&1; then
  fail_check "JWT tokens hardcodeados encontrados"
  echo "   Archivos afectados:"
  grep -r "eyJ[A-Za-z0-9_-]" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.patch" . | head -5
else
  pass_check "No se encontraron JWT tokens hardcodeados"
fi

# Buscar claves de API
if grep -ri "supabase.*key\|api.*key\|secret.*key" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.patch" . | grep -v "process.env\|ensureEnv\|TU-.*-KEY" >/dev/null 2>&1; then
  fail_check "Posibles claves de API hardcodeadas"
  echo "   Revisar manualmente:"
  grep -ri "supabase.*key\|api.*key\|secret.*key" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="*.patch" . | grep -v "process.env\|ensureEnv\|TU-.*-KEY" | head -3
else
  pass_check "No se encontraron claves de API hardcodeadas"
fi

echo ""
echo "2. 🍪 VERIFICACIÓN DE COOKIES SEGURAS"
echo "======================================"

# Verificar configuración de cookies en middleware
if [ -f "apps/web-app/middleware.ts" ]; then
  if grep -q "httpOnly.*true" apps/web-app/middleware.ts && grep -q "secure.*process.env.NODE_ENV.*production" apps/web-app/middleware.ts; then
    pass_check "Cookies configuradas con HttpOnly y Secure"
  else
    fail_check "Cookies sin configuración de seguridad adecuada"
  fi
else
  fail_check "Middleware no encontrado"
fi

echo ""
echo "3. 🔒 VERIFICACIÓN DE HEADERS DE SEGURIDAD"
echo "=========================================="

# Verificar headers por app
apps=("web-app" "doctors" "patients" "companies")
for app in "${apps[@]}"; do
  if [ -f "apps/$app/public/_headers" ]; then
    if grep -q "X-Frame-Options: DENY" "apps/$app/public/_headers" && grep -q "Content-Security-Policy" "apps/$app/public/_headers"; then
      pass_check "Headers de seguridad en $app"
    else
      warn_check "Headers incompletos en $app"
    fi
  else
    warn_check "Headers no encontrados en $app"
  fi
done

echo ""
echo "4. 🛡️ VERIFICACIÓN DE PERMISOS CSP"
echo "=================================="

# Verificar CSP para apps que usan WebRTC
webrtc_apps=("doctors" "patients")
for app in "${webrtc_apps[@]}"; do
  if [ -f "apps/$app/public/_headers" ]; then
    if grep -q "camera=(self)" "apps/$app/public/_headers" && grep -q "microphone=(self)" "apps/$app/public/_headers"; then
      pass_check "Permisos WebRTC configurados en $app"
    else
      fail_check "Permisos WebRTC mal configurados en $app"
    fi
  fi
done

echo ""
echo "5. 🌐 VERIFICACIÓN DE VARIABLES DE ENTORNO"
echo "=========================================="

# Verificar templates
if [ -f ".env.template" ]; then
  if grep -q "TU-.*-KEY" .env.template; then
    pass_check "Template de variables con placeholders"
  else
    warn_check "Template de variables sin placeholders seguros"
  fi
else
  warn_check "Template de variables no encontrado"
fi

# Verificar que no hay .env en root
if [ -f ".env" ]; then
  fail_check "Archivo .env en root (riesgo de leak)"
else
  pass_check "No hay .env en root"
fi

echo ""
echo "6. 🔍 VERIFICACIÓN DE IMPORTS RESTRINGIDOS"
echo "=========================================="

# Verificar que no hay deep imports
if grep -r "from.*@autamedica.*src" --include="*.ts" --include="*.tsx" apps/ packages/ >/dev/null 2>&1; then
  fail_check "Deep imports detectados"
  echo "   Ejemplos:"
  grep -r "from.*@autamedica.*src" --include="*.ts" --include="*.tsx" apps/ packages/ | head -3
else
  pass_check "No hay deep imports"
fi

echo ""
echo "7. 🔄 VERIFICACIÓN DE CONFIGURACIÓN CI/CD"
echo "========================================"

if [ -f ".github/workflows/ci-monorepo.yml" ]; then
  if grep -q "security-scan" .github/workflows/ci-monorepo.yml; then
    pass_check "CI/CD con security scanning"
  else
    warn_check "CI/CD sin security scanning"
  fi
else
  warn_check "Workflow CI/CD no encontrado"
fi

echo ""
echo "8. 📁 VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS"
echo "============================================"

# Verificar archivos críticos
critical_files=(
  "packages/shared/src/role-routing.ts"
  "packages/shared/src/webrtc-diagnostics.ts"
  "supabase/migrations/20250929_unified_identity_system.sql"
)

for file in "${critical_files[@]}"; do
  if [ -f "$file" ]; then
    pass_check "Archivo crítico: $file"
  else
    fail_check "Archivo crítico faltante: $file"
  fi
done

echo ""
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "========================="
echo "✅ Verificaciones exitosas: $((24 - FAILED_CHECKS - WARNINGS))"
echo "⚠️  Warnings: $WARNINGS"
echo "❌ Fallos críticos: $FAILED_CHECKS"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
  echo "🎉 ¡Verificación de seguridad EXITOSA!"
  if [ $WARNINGS -gt 0 ]; then
    echo "   Revisar warnings para mejoras opcionales"
  fi
  exit 0
else
  echo "🚨 FALLOS CRÍTICOS DETECTADOS"
  echo "   Resolver antes de deployment a producción"
  exit 1
fi