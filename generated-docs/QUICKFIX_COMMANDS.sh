#!/bin/bash
# AutaMedica - Quick Fix Commands (FASE 1 + FASE 2)
# Ejecutar con precaución, revisar cada sección antes de correr

set -e  # Exit on error

echo "🚀 AutaMedica Quick Fix Script"
echo "================================"
echo ""

# =============================================================================
# FASE 1: EMERGENCIA (Restaurar Disponibilidad)
# =============================================================================

echo "📍 FASE 1: EMERGENCIA - Restaurar Doctors App"
echo "----------------------------------------------"

# 1. Verificar último deployment de doctors
echo "1. Listando deployments de doctors app..."
wrangler pages deployment list --project-name=autamedica-doctors | head -n 20

echo ""
read -p "¿Ver el ID del deployment anterior funcional? Ingresa el ID para rollback (o ENTER para skip): " PREV_DEPLOY_ID

if [ -n "$PREV_DEPLOY_ID" ]; then
  echo "🔄 Haciendo rollback a deployment: $PREV_DEPLOY_ID"
  wrangler pages deployment rollback "$PREV_DEPLOY_ID" --project-name=autamedica-doctors
  echo "✅ Rollback completado"
else
  echo "⏭️  Rollback skipped - considera redeploy manual"
fi

echo ""
echo "2. Verificando doctors app..."
curl -I https://doctors.autamedica.com/ | head -n 15

echo ""
echo "----------------------------------------------"
echo ""

# =============================================================================
# FASE 2: SEGURIDAD CRÍTICA
# =============================================================================

echo "📍 FASE 2: SEGURIDAD CRÍTICA - Headers & Dependencies"
echo "------------------------------------------------------"

# 1. Fix Dependencies (pnpm overrides)
echo "1. Aplicando pnpm overrides para path-to-regexp y send..."

# Backup package.json
cp package.json package.json.backup

# Usar node para inyectar overrides en package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (!pkg.pnpm) pkg.pnpm = {};
if (!pkg.pnpm.overrides) pkg.pnpm.overrides = {};

pkg.pnpm.overrides['path-to-regexp'] = '^0.1.12';
pkg.pnpm.overrides['send'] = '^0.19.0';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('✅ Overrides agregados a package.json');
"

echo "2. Reinstalando dependencias con overrides..."
pnpm install

echo "3. Re-auditando dependencias..."
pnpm audit --prod | head -n 50

echo ""
echo "----------------------------------------------"
echo ""

# 2. Implementar Security Headers
echo "4. Implementando security headers en todas las apps..."

# Crear _headers para patients
echo "Creando apps/patients/public/_headers..."
mkdir -p apps/patients/public
cp _headers.example apps/patients/public/_headers || cat > apps/patients/public/_headers << 'EOF'
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.co; connect-src 'self' https://gtyvdircfhmdjiaelqkg.supabase.co wss:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; report-uri /api/csp-report
EOF

# Crear _headers para doctors
echo "Creando apps/doctors/public/_headers..."
mkdir -p apps/doctors/public
cp _headers.example apps/doctors/public/_headers || cat > apps/doctors/public/_headers << 'EOF'
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(self), camera=(self), payment=(), usb=()
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.supabase.co; connect-src 'self' https://gtyvdircfhmdjiaelqkg.supabase.co wss: https://eduardo-4vew3u6i.livekit.cloud; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; report-uri /api/csp-report
EOF

# Crear _headers para auth
echo "Creando apps/auth/public/_headers..."
mkdir -p apps/auth/public
cp _headers.example apps/auth/public/_headers || cat > apps/auth/public/_headers << 'EOF'
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://gtyvdircfhmdjiaelqkg.supabase.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; report-uri /api/csp-report
EOF

echo "✅ Security headers creados para patients, doctors, auth"
echo ""

# 3. Fix CORS en Auth App
echo "5. Corrigiendo CORS wildcard en Auth App..."
echo "   ⚠️  MANUAL REQUIRED: Editar apps/auth/src/middleware.ts"
echo ""
echo "   Ubicación: apps/auth/src/middleware.ts"
echo "   Buscar: Access-Control-Allow-Origin: *"
echo "   Reemplazar con:"
echo ""
cat << 'EOF'
const allowedOrigins = [
  'https://patients.autamedica.com',
  'https://doctors.autamedica.com',
  'https://companies.autamedica.com',
  'https://www.autamedica.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
EOF

echo ""
echo "----------------------------------------------"
echo ""

# 4. Remover Information Disclosure Headers
echo "6. Configurando next.config.js para remover X-Powered-By..."

for app in patients doctors auth; do
  echo "   Actualizando apps/$app/next.config.js..."

  if [ -f "apps/$app/next.config.js" ]; then
    # Backup
    cp "apps/$app/next.config.js" "apps/$app/next.config.js.backup"

    # Agregar poweredByHeader: false si no existe
    if ! grep -q "poweredByHeader" "apps/$app/next.config.js"; then
      node -e "
        const fs = require('fs');
        let content = fs.readFileSync('apps/$app/next.config.js', 'utf8');

        // Agregar poweredByHeader: false al config
        if (content.includes('const nextConfig = {')) {
          content = content.replace(
            'const nextConfig = {',
            'const nextConfig = {\n  poweredByHeader: false,'
          );
        } else if (content.includes('module.exports = {')) {
          content = content.replace(
            'module.exports = {',
            'module.exports = {\n  poweredByHeader: false,'
          );
        }

        fs.writeFileSync('apps/$app/next.config.js', content);
      " || echo "   ⚠️  Manual edit required for apps/$app/next.config.js"
    fi
  fi
done

echo "✅ next.config.js actualizado para patients, doctors, auth"
echo ""

echo "----------------------------------------------"
echo ""

# =============================================================================
# VALIDACIÓN
# =============================================================================

echo "📍 VALIDACIÓN - Verificando cambios"
echo "------------------------------------"

echo "1. Verificando overrides en package.json..."
grep -A 5 '"overrides"' package.json || echo "⚠️  Overrides no encontrados"

echo ""
echo "2. Verificando archivos _headers creados..."
ls -la apps/patients/public/_headers apps/doctors/public/_headers apps/auth/public/_headers 2>/dev/null || echo "⚠️  Algunos _headers no creados"

echo ""
echo "3. Estado de git (archivos modificados)..."
git status --short | head -n 20

echo ""
echo "======================================"
echo "✅ QUICK FIXES APLICADOS"
echo "======================================"
echo ""
echo "📋 PRÓXIMOS PASOS MANUALES:"
echo ""
echo "1. ✏️  Editar apps/auth/src/middleware.ts (fix CORS)"
echo "2. 🔍 Revisar cambios con: git diff"
echo "3. 🧪 Testear localmente: pnpm dev"
echo "4. 🚀 Deploy de las 3 apps:"
echo "   - pnpm build:packages && pnpm build:apps"
echo "   - wrangler pages deploy ..."
echo "5. ✅ Re-run test suite:"
echo "   - bash scripts/run-audit-preprod.sh"
echo "   - node scripts/node_fetch_check.mjs"
echo ""
echo "⏱️  Tiempo estimado de deploy: 15-30 minutos"
echo ""
