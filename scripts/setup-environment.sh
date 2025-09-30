#!/bin/bash
set -euo pipefail

echo "🔧 Configurando entorno de desarrollo Autamedica..."

# Verificar dependencias
command -v pnpm >/dev/null 2>&1 || {
  echo "❌ pnpm no encontrado. Instalar: npm install -g pnpm"
  exit 1
}

command -v wrangler >/dev/null 2>&1 || {
  echo "⚠️ wrangler no encontrado. Instalar: npm install -g wrangler"
}

# Crear archivos .env desde templates
for app in web-app doctors patients companies; do
  if [ ! -f "apps/$app/.env.local" ]; then
    echo "📝 Creando apps/$app/.env.local..."
    cp .env.template "apps/$app/.env.local"
    echo "⚠️ EDITAR apps/$app/.env.local con tus credenciales"
  fi
done

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# Configurar Husky
if [ ! -d ".husky" ]; then
  echo "🪝 Configurando Husky pre-commit hooks..."
  pnpm add -D husky lint-staged
  npx husky init
  echo -e '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\n\nnpx lint-staged' > .husky/pre-commit
  chmod +x .husky/pre-commit
fi

# Build packages
echo "🏗️ Building packages..."
pnpm build:packages

# Validar configuración
echo "✅ Validando configuración..."
if command -v pnpm docs:validate >/dev/null 2>&1; then
  pnpm docs:validate
else
  echo "⚠️ docs:validate no disponible, saltando..."
fi

# Verificar seguridad
echo "🔍 Verificando seguridad..."
if grep -r "eyJ[A-Za-z0-9_-]" --exclude-dir=node_modules --exclude-dir=.git . >/dev/null 2>&1; then
  echo "❌ ADVERTENCIA: Encontradas claves hardcodeadas"
  echo "   Ejecutar rotación de claves antes de continuar"
else
  echo "✅ No se encontraron claves hardcodeadas"
fi

echo ""
echo "🚀 Entorno configurado exitosamente!"
echo "   Ejecutar: pnpm dev"
echo "⚠️ RECUERDA: Rotar todas las claves Supabase antes de producción"
