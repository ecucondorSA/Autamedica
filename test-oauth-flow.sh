#!/bin/bash
set -euo pipefail

echo "🔐 Test de OAuth Flow con PKCE"
echo "==============================="
echo

echo "✅ Verificaciones:"
echo

# 1. Check if callback route exists
if [ -f "apps/web-app/src/app/auth/callback/route.ts" ]; then
  echo "✅ Callback route handler existe"
else
  echo "❌ Falta callback route handler"
fi

# 2. Check environment variables
if grep -q "NEXT_PUBLIC_SITE_URL" apps/web-app/.env.local 2>/dev/null; then
  echo "✅ NEXT_PUBLIC_SITE_URL configurado"
  grep "NEXT_PUBLIC_SITE_URL" apps/web-app/.env.local
else
  echo "❌ Falta NEXT_PUBLIC_SITE_URL en .env.local"
fi

# 3. Check auth helpers installation
if grep -q "@supabase/auth-helpers-nextjs" apps/web-app/package.json; then
  echo "✅ Auth helpers instalado"
else
  echo "❌ Falta @supabase/auth-helpers-nextjs"
fi

echo
echo "📋 Para probar el flujo completo:"
echo
echo "1. Asegúrate que el servidor está corriendo:"
echo "   http://localhost:3000"
echo
echo "2. Ve al login:"
echo "   http://localhost:3000/auth/login"
echo
echo "3. Intenta login con GitHub/Google"
echo
echo "4. Verifica en Network tab del browser:"
echo "   - El OAuth inicia desde localhost:3000"
echo "   - El callback vuelve a localhost:3000/auth/callback?code=..."
echo "   - Debe existir 'code' parameter"
echo
echo "5. Si funciona, deberías ser redirigido al portal correcto"
echo
echo "⚠️  Si ves error 'Invalid Request':"
echo "   - Verifica las Redirect URLs en Supabase Dashboard"
echo "   - Deben incluir: http://localhost:3000/auth/callback"