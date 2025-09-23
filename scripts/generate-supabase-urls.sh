#!/bin/bash

# Script que genera las URLs exactas para configurar en Supabase Dashboard

echo "📋 URLS EXACTAS PARA CONFIGURAR EN SUPABASE DASHBOARD"
echo "===================================================="
echo ""
echo "🔗 Ve a: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/auth/url-configuration"
echo ""

echo "1️⃣  SITE URL (cambiar el actual):"
echo "https://autamedica.com"
echo ""

echo "2️⃣  REDIRECT URLs (agregar estas URLs de Cloudflare Pages):"
echo ""
echo "✅ URL #1: https://autamedica.com/auth/callback"
echo "✅ URL #2: https://doctors.autamedica.com/auth/callback"
echo "✅ URL #3: https://patients.autamedica.com/auth/callback"
echo "✅ URL #4: https://companies.autamedica.com/auth/callback"
echo "✅ URL #5: https://autamedica-web-app.pages.dev/auth/callback"
echo "✅ URL #6: https://autamedica-doctors.pages.dev/auth/callback"
echo ""

echo "📋 PASOS EXACTOS:"
echo "=================="
echo "1. Ir al dashboard de Supabase"
echo "2. En 'Site URL', configurar: https://autamedica.com"
echo "3. En 'Redirect URLs', agregar cada una de las URLs listadas arriba"
echo "4. Guardar cambios"
echo ""

echo "🎯 DESPUÉS DE CONFIGURAR:"
echo "========================"
echo "Probar login en estas URLs:"

echo "• https://autamedica.com"
echo "• https://doctors.autamedica.com"
echo "• https://patients.autamedica.com"
echo "• https://autamedica-web-app.pages.dev"
echo ""
echo "El OAuth con Google debería funcionar correctamente."
