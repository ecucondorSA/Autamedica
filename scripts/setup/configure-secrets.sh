#!/bin/bash
set -euo pipefail

echo "🔐 Configuración de Secrets para AutaMedica"
echo "==========================================="
echo

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo "Instala con: sudo apt install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ No autenticado con GitHub"
    echo "Ejecuta: gh auth login"
    exit 1
fi

echo "📋 Necesitas estos valores de Supabase Dashboard:"
echo "  1. JWT Secret (Settings → API → JWT Settings)"
echo "  2. Nueva anon key (después de rotar)"
echo

# Function to safely read secret
read_secret() {
    local prompt="$1"
    local var_name="$2"
    echo -n "$prompt"
    read -s value
    echo
    eval "$var_name='$value'"
}

# Get values
read_secret "Ingresa SUPABASE_JWT_SECRET: " jwt_secret
read_secret "Ingresa nueva NEXT_PUBLIC_SUPABASE_ANON_KEY: " anon_key

echo
echo "🚀 Configurando secrets en GitHub..."

# Set GitHub secrets
gh secret set SUPABASE_JWT_SECRET --body "$jwt_secret" && echo "✅ SUPABASE_JWT_SECRET configurado"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "$anon_key" && echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configurado"

# Also set for Cloudflare Pages compatibility
gh secret set SUPABASE_URL --body "https://gtyvdircfhmdjiaelqkg.supabase.co" && echo "✅ SUPABASE_URL configurado"

echo
echo "📋 Verificando secrets configurados:"
gh secret list | grep -E "SUPABASE|NEXT_PUBLIC" || true

echo
echo "✅ Secrets configurados exitosamente!"
echo
echo "📝 Próximos pasos:"
echo "  1. Revisar el PR: https://github.com/ecucondorSA/Autamedica/pull/6"
echo "  2. Hacer merge cuando esté listo"
echo "  3. Los workflows de CI/CD usarán automáticamente los nuevos secrets"
echo
echo "⚠️  IMPORTANTE: También actualiza estos valores en:"
echo "  - Cloudflare Pages (cada proyecto)"
echo "  - Archivos .env.local locales"