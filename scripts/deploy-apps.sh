#!/usr/bin/env bash
set -e

echo "🚀 AutaMedica - Deployment Script"
echo "=================================="
echo ""

APP=${1:-all}

deploy_app() {
  local app_name=$1
  local project_name="autamedica-${app_name}"

  echo "📦 Deploying ${app_name}..."
  echo "  Project: ${project_name}"
  echo ""

  # Build
  echo "  🔨 Building..."
  pnpm --filter "@autamedica/${app_name}" build

  if [ $? -ne 0 ]; then
    echo "  ❌ Build failed for ${app_name}"
    return 1
  fi

  echo "  ✅ Build successful"
  echo ""

  # Deploy
  echo "  📤 Deploying to Cloudflare Pages..."
  wrangler pages deploy "apps/${app_name}/.next" \
    --project-name "$project_name" \
    --branch main \
    --commit-dirty=true

  if [ $? -ne 0 ]; then
    echo "  ❌ Deployment failed for ${app_name}"
    return 1
  fi

  echo ""
  echo "  ✅ ${app_name} deployed successfully!"
  echo "  🌐 URL: https://${project_name}.pages.dev"
  echo "  🌐 Custom: https://${app_name}.autamedica.com (after DNS config)"
  echo ""
}

case $APP in
  doctors)
    deploy_app "doctors"
    ;;
  patients)
    deploy_app "patients"
    ;;
  web-app)
    deploy_app "web-app"
    ;;
  all)
    echo "Deploying all apps..."
    echo ""
    deploy_app "doctors"
    deploy_app "patients"
    ;;
  *)
    echo "Usage: $0 {doctors|patients|web-app|all}"
    echo ""
    echo "Examples:"
    echo "  $0 doctors          # Deploy solo doctors"
    echo "  $0 patients         # Deploy solo patients"
    echo "  $0 all              # Deploy doctors y patients"
    echo ""
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment completado!"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Verificar deployments en Cloudflare Dashboard"
echo "  2. Configurar DNS (si no está hecho)"
echo "  3. Agregar variables de entorno"
echo "  4. Ejecutar smoke tests"
echo ""
echo "🔗 Quick links:"
echo "  Doctors:  https://autamedica-doctors.pages.dev"
echo "  Patients: https://autamedica-patients.pages.dev"
echo ""
