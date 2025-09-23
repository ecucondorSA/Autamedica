#!/bin/bash

# Script para actualizar Supabase con todas las URLs activas del ecosistema Cloudflare Pages
# Incluye dominios productivos y los previews generados por Cloudflare

echo "🔧 Configurando Supabase con URLs de Cloudflare Pages..."
echo ""

PROJECT_REF="gtyvdircfhmdjiaelqkg"
ACCESS_TOKEN="sbp_aa74b7707840d07be814d4f92adde20dd35d3c16"

# Dominios productivos (pueden sobreescribirse vía variables de entorno)
WEBAPP_URL="${WEBAPP_URL:-https://autamedica.com}"
DOCTORS_URL="${DOCTORS_URL:-https://doctors.autamedica.com}"
PATIENTS_URL="${PATIENTS_URL:-https://patients.autamedica.com}"
COMPANIES_URL="${COMPANIES_URL:-https://companies.autamedica.com}"

# Dominios de preview generados por Cloudflare Pages
WEBAPP_PREVIEW_URL="${WEBAPP_PREVIEW_URL:-https://autamedica-web-app.pages.dev}"
DOCTORS_PREVIEW_URL="${DOCTORS_PREVIEW_URL:-https://autamedica-doctors.pages.dev}"
PATIENTS_PREVIEW_URL="${PATIENTS_PREVIEW_URL:-https://autamedica-patients.pages.dev}"
COMPANIES_PREVIEW_URL="${COMPANIES_PREVIEW_URL:-https://autamedica-companies.pages.dev}"

echo "📍 Proyecto: $PROJECT_REF"
echo "🔗 URLs a configurar:"
echo "   - Web (prod): $WEBAPP_URL"
echo "   - Doctors (prod): $DOCTORS_URL"
echo "   - Patients (prod): $PATIENTS_URL"
echo "   - Companies (prod): $COMPANIES_URL"
echo "   - Web (preview): $WEBAPP_PREVIEW_URL"
echo "   - Doctors (preview): $DOCTORS_PREVIEW_URL"
echo "   - Patients (preview): $PATIENTS_PREVIEW_URL"
echo "   - Companies (preview): $COMPANIES_PREVIEW_URL"
echo ""

# Método 1: Configurar Site URL principal
echo "🔄 Configurando Site URL principal..."
curl -s -X PATCH \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"SITE_URL\": \"$WEBAPP_URL\"}" \
  && echo "✅ Site URL configurado" \
  || echo "⚠️  Site URL requiere configuración manual"

echo ""

# Método 2: Lista completa de redirect URLs
echo "🔄 Configurando redirect URLs..."

ALLOWED_URLS="$WEBAPP_URL/**,$DOCTORS_URL/**,$PATIENTS_URL/**,$COMPANIES_URL/**,$WEBAPP_PREVIEW_URL/**,$DOCTORS_PREVIEW_URL/**,$PATIENTS_PREVIEW_URL/**,$COMPANIES_PREVIEW_URL/**,http://localhost:3000/**,http://localhost:3001/**,http://localhost:3002/**,http://localhost:3003/**"

curl -s -X PATCH \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"SITE_URL\": \"$WEBAPP_URL\",
    \"URI_ALLOW_LIST\": \"$ALLOWED_URLS\"
  }" \
  && echo "✅ Redirect URLs configuradas" \
  || echo "⚠️  Redirect URLs requieren configuración manual"

echo ""

# Método 3: Configuración mediante Management API
echo "🔄 Intentando configuración avanzada..."

curl -s -X PUT \
  "https://api.supabase.com/v1/projects/$PROJECT_REF" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"auth_site_url\": \"$WEBAPP_URL\",
    \"auth_additional_redirect_urls\": [
      \"$WEBAPP_URL/auth/callback\",
      \"$DOCTORS_URL/auth/callback\",
      \"$PATIENTS_URL/auth/callback\",
      \"$COMPANIES_URL/auth/callback\",
      \"$WEBAPP_PREVIEW_URL/auth/callback\",
      \"$DOCTORS_PREVIEW_URL/auth/callback\",
      \"$PATIENTS_PREVIEW_URL/auth/callback\",
      \"$COMPANIES_PREVIEW_URL/auth/callback\",
      \"https://autamedica.com/auth/callback\",
      \"https://doctors.autamedica.com/auth/callback\",
      \"https://patients.autamedica.com/auth/callback\",
      \"https://companies.autamedica.com/auth/callback\"
    ]
  }" \
  && echo "✅ Configuración avanzada aplicada" \
  || echo "⚠️  Configuración avanzada requiere acceso manual"

echo ""
echo "✅ Configuración de Supabase completada"
echo ""
echo "🎯 URLs CONFIGURADAS:"
echo "======================================"
echo "Site URL: $WEBAPP_URL"
echo ""
echo "Redirect URLs:"
echo "✅ $WEBAPP_URL/auth/callback"
echo "✅ $DOCTORS_URL/auth/callback"
echo "✅ $PATIENTS_URL/auth/callback"
echo "✅ $COMPANIES_URL/auth/callback"
echo "✅ $WEBAPP_PREVIEW_URL/auth/callback"
echo "✅ $DOCTORS_PREVIEW_URL/auth/callback"
echo "✅ $PATIENTS_PREVIEW_URL/auth/callback"
echo "✅ $COMPANIES_PREVIEW_URL/auth/callback"
echo "✅ https://autamedica.com/auth/callback"
echo "✅ https://doctors.autamedica.com/auth/callback"
echo "✅ https://patients.autamedica.com/auth/callback"
echo "✅ https://companies.autamedica.com/auth/callback"
echo ""
echo "🚀 PRUEBA EL LOGIN EN:"
echo "====================="
echo "• $DOCTORS_URL"
echo "• $PATIENTS_URL"
echo "• $WEBAPP_URL"
echo ""
echo "⚠️  Si algún método falló, configura manualmente en:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/auth/url-configuration"
