#!/bin/bash

# 🔧 Script para alinear dependencias en todo el monorepo
# Corrige inconsistencias de versiones detectadas

set -e

echo "🔧 Alineando dependencias del monorepo AltaMedica..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Versiones estándar (Next.js 15.5 requiere React 19)
REACT_VERSION="19.0.0"
REACT_DOM_VERSION="19.0.0"
NEXT_VERSION="15.5.4"
TYPESCRIPT_VERSION="5.9.2"
SUPABASE_VERSION="2.57.4"

echo -e "${BLUE}📦 Versiones objetivo:${NC}"
echo "   React: $REACT_VERSION (Next.js 15.5 requiere React 19)"
echo "   Next.js: $NEXT_VERSION"
echo "   TypeScript: $TYPESCRIPT_VERSION"
echo "   Supabase: $SUPABASE_VERSION"
echo ""

# Función para actualizar package.json con jq
update_package_json() {
  local file=$1
  local package=$2
  local version=$3

  if [ -f "$file" ]; then
    # Usar node para actualizar JSON de forma segura
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('$file', 'utf8'));
      if (pkg.dependencies && pkg.dependencies['$package']) {
        pkg.dependencies['$package'] = '$version';
      }
      if (pkg.devDependencies && pkg.devDependencies['$package']) {
        pkg.devDependencies['$package'] = '$version';
      }
      if (pkg.peerDependencies && pkg.peerDependencies['$package']) {
        pkg.peerDependencies['$package'] = '$version';
      }
      fs.writeFileSync('$file', JSON.stringify(pkg, null, 2) + '\n');
    "
  fi
}

echo -e "${YELLOW}1️⃣  Alineando React y React-DOM...${NC}"

# Apps
for app in apps/*/package.json; do
  if [ -f "$app" ]; then
    echo "   📝 $(dirname $app)"
    update_package_json "$app" "react" "$REACT_VERSION"
    update_package_json "$app" "react-dom" "$REACT_DOM_VERSION"
    update_package_json "$app" "@types/react" "19.1.0"
    update_package_json "$app" "@types/react-dom" "19.1.1"
  fi
done

# Packages
for pkg in packages/*/package.json; do
  if [ -f "$pkg" ]; then
    # Solo actualizar si tiene React como dependencia
    if grep -q '"react"' "$pkg"; then
      echo "   📝 $(dirname $pkg)"
      # Para packages, usar peerDependencies con rango
      update_package_json "$pkg" "react" "^19.0.0"
      update_package_json "$pkg" "react-dom" "^19.0.0"
    fi
  fi
done

echo ""
echo -e "${YELLOW}2️⃣  Alineando TypeScript...${NC}"

for pkg in packages/*/package.json apps/*/package.json; do
  if [ -f "$pkg" ]; then
    if grep -q '"typescript"' "$pkg"; then
      echo "   📝 $(dirname $pkg)"
      update_package_json "$pkg" "typescript" "^$TYPESCRIPT_VERSION"
    fi
  fi
done

echo ""
echo -e "${YELLOW}3️⃣  Alineando Supabase...${NC}"

for pkg in packages/*/package.json apps/*/package.json; do
  if [ -f "$pkg" ]; then
    if grep -q '"@supabase/supabase-js"' "$pkg"; then
      echo "   📝 $(dirname $pkg)"
      update_package_json "$pkg" "@supabase/supabase-js" "^$SUPABASE_VERSION"
    fi
  fi
done

echo ""
echo -e "${YELLOW}4️⃣  Alineando Next.js...${NC}"

for app in apps/*/package.json; do
  if [ -f "$app" ]; then
    if grep -q '"next"' "$app"; then
      echo "   📝 $(dirname $app)"
      update_package_json "$app" "next" "$NEXT_VERSION"
    fi
  fi
done

echo ""
echo -e "${GREEN}✅ Alineación completada${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "   1. Revisar cambios: git diff"
echo "   2. Reinstalar dependencias: pnpm install"
echo "   3. Verificar builds: pnpm build:packages"
echo "   4. Commit cambios si todo OK"
echo ""
