#!/bin/bash
set -euo pipefail

echo "🔐 Finalización de Configuración de Seguridad - AutaMedica"
echo "=========================================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI no instalado${NC}"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ No autenticado con GitHub${NC}"
    echo "Ejecuta: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI autenticado${NC}"
echo

# Check existing secrets
echo "📋 Secrets actualmente configurados:"
gh secret list | grep -E "SUPABASE|NEXT_PUBLIC" || echo "Ninguno encontrado"
echo

# Check if JWT secret is set
if ! gh secret list | grep -q "SUPABASE_JWT_SECRET"; then
    echo -e "${YELLOW}⚠️  FALTA: SUPABASE_JWT_SECRET${NC}"
    echo
    echo "Para obtenerlo:"
    echo "  1. Ejecuta: supabase dashboard"
    echo "  2. Ve a Settings → API → JWT Settings"
    echo "  3. Copia el JWT Secret"
    echo
    echo -n "Ingresa el JWT Secret (o presiona Enter para omitir): "
    read -s jwt_secret
    echo

    if [ -n "$jwt_secret" ]; then
        gh secret set SUPABASE_JWT_SECRET --body "$jwt_secret"
        echo -e "${GREEN}✅ SUPABASE_JWT_SECRET configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  SUPABASE_JWT_SECRET no configurado - requerido para middleware${NC}"
    fi
else
    echo -e "${GREEN}✅ SUPABASE_JWT_SECRET ya configurado${NC}"
fi

# Set additional required secrets
echo
echo "📋 Configurando secrets adicionales..."

# Cloudflare Pages URLs
gh secret set NEXT_PUBLIC_BASE_URL_PATIENTS --body "https://autamedica-patients.pages.dev" 2>/dev/null && echo "✅ NEXT_PUBLIC_BASE_URL_PATIENTS"
gh secret set NEXT_PUBLIC_BASE_URL_DOCTORS --body "https://autamedica-doctors.pages.dev" 2>/dev/null && echo "✅ NEXT_PUBLIC_BASE_URL_DOCTORS"
gh secret set NEXT_PUBLIC_BASE_URL_COMPANIES --body "https://autamedica-companies.pages.dev" 2>/dev/null && echo "✅ NEXT_PUBLIC_BASE_URL_COMPANIES"
gh secret set NEXT_PUBLIC_BASE_URL_ADMIN --body "https://autamedica-admin.pages.dev" 2>/dev/null && echo "✅ NEXT_PUBLIC_BASE_URL_ADMIN"
gh secret set NEXT_PUBLIC_BASE_URL_WEB_APP --body "https://autamedica-web-app.pages.dev" 2>/dev/null && echo "✅ NEXT_PUBLIC_BASE_URL_WEB_APP"

# Security settings
gh secret set NEXT_PUBLIC_ALLOWED_REDIRECTS --body "https://autamedica-*.pages.dev,https://*.autamedica.com" 2>/dev/null && echo "✅ NEXT_PUBLIC_ALLOWED_REDIRECTS"

echo
echo "📋 Verificación final de secrets:"
echo
gh secret list | grep -E "SUPABASE|NEXT_PUBLIC|CLOUDFLARE" | awk '{print "  ✅", $1}'

echo
echo "🚀 Estado del PR de seguridad:"
gh pr view 6 --json state,url,mergeable | grep -E "state|url|mergeable" || echo "PR #6 no encontrado"

echo
echo -e "${GREEN}✅ Configuración completada${NC}"
echo
echo "📝 Próximos pasos:"
echo "  1. Revisa el PR: https://github.com/ecucondorSA/Autamedica/pull/6"
echo "  2. Rota el anon key en Supabase Dashboard"
echo "  3. Actualiza NEXT_PUBLIC_SUPABASE_ANON_KEY con la nueva key"
echo "  4. Haz merge del PR"
echo "  5. Los deployments usarán automáticamente los nuevos secrets"
echo
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  - El anon key actual está expuesto en el código"
echo "  - Debes rotarla después del merge"
echo "  - Actualiza también en Cloudflare Pages"