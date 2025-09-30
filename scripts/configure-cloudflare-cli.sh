#!/bin/bash

# Script para configurar variables de entorno en Cloudflare Pages usando CLI
# Uso: ./scripts/configure-cloudflare-cli.sh

set -e

echo "🚀 Configurando variables de entorno en Cloudflare Pages usando Wrangler CLI..."

# Variables de entorno de AutaMedica
SUPABASE_URL="https://gtyvdircfhmdjiaelqkg.supabase.co"
SUPABASE_ANON_KEY="REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA"

# Lista de proyectos (nombres de los proyectos en Cloudflare Pages)
declare -A PROJECTS
PROJECTS[autamedica-web-app]="https://autamedica.com"
PROJECTS[autamedica-doctors]="https://doctors.autamedica.com"
PROJECTS[autamedica-patients]="https://patients.autamedica.com"
PROJECTS[autamedica-companies]="https://companies.autamedica.com"

# Función para configurar variables de un proyecto
configure_project() {
    local project_name=$1
    local app_url=$2
    
    echo "📱 Configurando proyecto: $project_name"
    
    # Variables comunes para todas las apps
    echo "  🔧 Configurando variables comunes..."
    
    npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL --project-name="$project_name" <<< "$SUPABASE_URL"
    npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --project-name="$project_name" <<< "$SUPABASE_ANON_KEY"
    npx wrangler pages secret put NEXT_PUBLIC_NODE_ENV --project-name="$project_name" <<< "production"
    npx wrangler pages secret put SKIP_ENV_VALIDATION --project-name="$project_name" <<< "true"
    
    # URL específica por app
    echo "  🌐 Configurando URL específica: $app_url"
    npx wrangler pages secret put NEXT_PUBLIC_APP_URL --project-name="$project_name" <<< "$app_url"
    
    echo "  ✅ $project_name configurado exitosamente"
    echo ""
}

# Configurar cada proyecto
for project in "${!PROJECTS[@]}"; do
    configure_project "$project" "${PROJECTS[$project]}"
done

echo "🎉 Todas las variables de entorno configuradas exitosamente en Cloudflare Pages!"
echo ""
echo "🔄 Próximos pasos:"
echo "   1. Las variables están configuradas en producción"
echo "   2. El próximo deployment automáticamente usará estas variables"
echo "   3. Si necesitas redeploy inmediato, usa: wrangler pages deployment create [build-dir] --project-name=[project]"
echo ""
echo "📊 Para verificar las variables configuradas:"
echo "   npx wrangler pages secret list --project-name=[project-name]"