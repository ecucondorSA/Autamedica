#!/bin/bash
set -euo pipefail

echo "🔐 Aplicando parches de seguridad Autamedica..."
echo "⚠️  ASEGÚRATE de haber creado un backup antes de continuar"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || ! grep -q "@autamedica" package.json; then
  echo "❌ No estás en el directorio del proyecto Autamedica"
  exit 1
fi

# Crear tag de backup
echo "📋 Creando tag de backup..."
git tag "pre-security-hardening-$(date +%Y%m%d-%H%M%S)"
git push --tags

# Verificar que todos los parches existen
patches=(
  "001-secure-middleware.patch"
  "002-role-routing.patch"
  "003-webrtc-diagnostics.patch"
  "004-ci-workflow.patch"
  "005-env-templates.patch"
  "006-security-headers.patch"
)

echo "🔍 Verificando parches..."
for patch in "${patches[@]}"; do
  if [ ! -f "$patch" ]; then
    echo "❌ Parche no encontrado: $patch"
    exit 1
  fi
  echo "✅ $patch"
done

# Aplicar parches en orden
echo ""
echo "🔧 Aplicando parches..."
for patch in "${patches[@]}"; do
  echo "📝 Aplicando $patch..."
  if git apply --check "$patch" 2>/dev/null; then
    git apply "$patch"
    echo "✅ $patch aplicado exitosamente"
  else
    echo "❌ Error aplicando $patch"
    echo "   Verificar conflictos manualmente"
    exit 1
  fi
done

# Hacer el setup script ejecutable
chmod +x scripts/setup-environment.sh

# Verificar aplicación
echo ""
echo "🔍 Verificando aplicación de parches..."
if [ -f "packages/shared/src/role-routing.ts" ]; then
  echo "✅ Role routing creado"
else
  echo "❌ Role routing no encontrado"
fi

if [ -f "packages/shared/src/webrtc-diagnostics.ts" ]; then
  echo "✅ WebRTC diagnostics creado"
else
  echo "❌ WebRTC diagnostics no encontrado"
fi

if [ -f ".github/workflows/ci-monorepo.yml" ]; then
  echo "✅ CI workflow creado"
else
  echo "❌ CI workflow no encontrado"
fi

# Actualizar exports en packages/shared
echo ""
echo "📦 Actualizando exports..."
if ! grep -q "role-routing" packages/shared/src/index.ts; then
  echo "export * from './role-routing';" >> packages/shared/src/index.ts
fi

if ! grep -q "webrtc-diagnostics" packages/shared/src/index.ts; then
  echo "export * from './webrtc-diagnostics';" >> packages/shared/src/index.ts
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  pnpm install
fi

# Verificar que no hay claves hardcodeadas
echo ""
echo "🔍 Verificando seguridad..."
if grep -r "eyJ[A-Za-z0-9_-]" --exclude-dir=node_modules --exclude-dir=.git . >/dev/null 2>&1; then
  echo "⚠️  ADVERTENCIA: Aún hay claves hardcodeadas"
  echo "   Ejecutar rotación antes de continuar"
else
  echo "✅ No se encontraron claves hardcodeadas"
fi

# Commit de los cambios
echo ""
echo "💾 Creando commit..."
git add .
git commit -m "feat: security hardening

- Secure middleware with HttpOnly cookies and redirect whitelist
- Centralized role-based routing system
- WebRTC diagnostics with retry logic
- CI/CD workflow with security scanning
- Environment templates and security headers
- Unified identity system migration

🔐 Security fixes applied via automated patches"

echo ""
echo "🎉 ¡Parches de seguridad aplicados exitosamente!"
echo ""
echo "📋 PRÓXIMOS PASOS CRÍTICOS:"
echo "1. Rotar claves Supabase (Dashboard → API → Regenerate)"
echo "2. Configurar secrets en GitHub Actions"
echo "3. Aplicar migración: supabase db push"
echo "4. Configurar variables en Cloudflare Pages"
echo "5. Limpiar historial: git filter-repo"
echo ""
echo "📖 Ver README_MIGRACION_SEGURIDAD.md para instrucciones detalladas"