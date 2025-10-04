#!/bin/bash

# 🌐 Script de Configuración Automática para Cloudflare Pages
# Configura todas las apps del monorepo para deployment en Cloudflare

set -e

echo "🌐 Configurando AutaMedica para Cloudflare Pages..."

# Apps a configurar
APPS=("doctors" "patients" "companies")

# Función para configurar cada app
setup_app() {
    local app=$1
    echo "⚙️ Configurando $app..."
    
    cd "apps/$app"
    
    # Instalar OpenNext adapter
    echo "📦 Instalando @opennextjs/cloudflare..."
    pnpm add @opennextjs/cloudflare
    
    # Copiar configuración de OpenNext
    echo "📝 Copiando configuración OpenNext..."
    cp ../web-app/open-next.config.ts .
    
    # Actualizar next.config.js
    echo "🔧 Actualizando next.config.js..."
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile shared packages for monorepo
  transpilePackages: ['@autamedica/types', '@autamedica/shared', '@autamedica/auth'],
  
  // Cloudflare-specific optimizations
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
EOF
    
    # Actualizar package.json con scripts de Cloudflare
    echo "📜 Actualizando package.json..."
    if command -v jq &> /dev/null; then
        # Usar jq si está disponible
        jq '.scripts["build:cloudflare"] = "next build && npx @opennextjs/cloudflare"' package.json > temp.json && mv temp.json package.json
        jq '.scripts["deploy:cloudflare"] = "pnpm build:cloudflare && wrangler pages deploy .open-next/dist --project-name autamedica-'$app'"' package.json > temp.json && mv temp.json package.json
    else
        # Método manual si no hay jq
        echo "⚠️ jq no disponible, actualiza manualmente package.json con:"
        echo '  "build:cloudflare": "next build && npx @opennextjs/cloudflare",'
        echo '  "deploy:cloudflare": "pnpm build:cloudflare && wrangler pages deploy .open-next/dist --project-name autamedica-'$app'"'
    fi
    
    cd ../..
    echo "✅ $app configurado correctamente"
}

# Configurar cada app
for app in "${APPS[@]}"; do
    if [ -d "apps/$app" ]; then
        setup_app $app
    else
        echo "⚠️ Directorio apps/$app no encontrado, saltando..."
    fi
done

echo ""
echo "🎉 ¡Configuración de Cloudflare completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecutar: wrangler login"
echo "2. Para cada app, ejecutar: cd apps/{app} && pnpm deploy:cloudflare"
echo "3. O usar Cloudflare Dashboard con la configuración en CLOUDFLARE_DEPLOYMENT_GUIDE.md"
echo ""
echo "🚀 Apps configuradas para Cloudflare:"
for app in "${APPS[@]}"; do
    if [ -d "apps/$app" ]; then
        echo "   ✅ apps/$app"
    fi
done