# Deployment Notes - Patients App

## 📋 Deployment Pipeline

### Build Pipeline Configuration

The patients app uses a custom Cloudflare Pages deployment pipeline with OpenNext.js adapter:

```bash
# 1. Prebuild - Limpiar build artifacts previos
prebuild:cloudflare: rm -rf .next .open-next || true

# 2. Build completo con patches
build:cloudflare: pnpm run build && \
                  node scripts/ensure-required-server-files.mjs && \
                  opennextjs-cloudflare build --skip-next-build && \
                  node scripts/patch-open-next.mjs
```

### Pipeline Steps

1. **Clean**: Eliminar `.next` y `.open-next` directories
2. **Build**: Next.js standard build (`next build`)
3. **Ensure Server Files**: Garantizar archivos requeridos por OpenNext
4. **OpenNext Build**: Convertir a Cloudflare Pages format (sin rebuild)
5. **Patch**: Aplicar fix 307 redirect para static assets

## 🔧 Patch Logic

### 307 Redirect Fix (`/_next/static/*` → `/assets/_next/*`)

El script `patch-open-next.mjs` modifica `_worker.js` para:

1. **Interceptar requests** a `/_next/static/*`
2. **Reescribir URL** a `/assets/_next/static/*`
3. **Retornar 307 redirect** temporal

**Código del patch:**
```javascript
if (url.pathname.startsWith("/_next/static/")) {
    const target = "/assets" + url.pathname + url.search;
    return Response.redirect(new URL(target, request.url), 307);
}
```

### `_routes.json` Configuration

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/_next/static/*"]
}
```

**Propósito:**
- `include: ["/*"]` - Todas las rutas pasan por el Worker
- `exclude: ["/assets/*", "/_next/static/*"]` - Assets servidos directamente desde CDN (sin Worker)

## ✅ Smoke Tests

### Test 1: HTML Page (200 OK)

```bash
curl -I https://autamedica-patients.pages.dev/
```

**Expected:**
```
HTTP/2 200
content-type: text/html
```

**Verificación:**
- Status code: `200`
- Content-Type: `text/html`
- Response time: < 500ms

### Test 2: Static Asset Redirect (307 → 200)

```bash
# Request original path
curl -I https://autamedica-patients.pages.dev/_next/static/chunks/main.js
```

**Expected:**
```
HTTP/2 307 Temporary Redirect
location: /assets/_next/static/chunks/main.js
```

**Then following redirect:**
```bash
curl -I https://autamedica-patients.pages.dev/assets/_next/static/chunks/main.js
```

**Expected:**
```
HTTP/2 200
content-type: application/javascript
```

**Verificación:**
- Primera request: `307` redirect
- Location header: `/assets/_next/static/...`
- Segunda request (auto-redirect): `200 OK`
- Content-Type: `application/javascript` o `text/css`

### Test 3: Direct Asset Access (200 OK)

```bash
curl -I https://autamedica-patients.pages.dev/assets/_next/static/css/app.css
```

**Expected:**
```
HTTP/2 200
content-type: text/css
cf-cache-status: HIT
```

**Verificación:**
- Status code: `200`
- Cloudflare cache activo (`cf-cache-status: HIT`)
- Content-Type correcto para el asset

## 🚀 Deployment Commands

### Local Development

```bash
cd apps/patients
pnpm dev           # Puerto 3003
```

### Build Local

```bash
cd apps/patients
pnpm build:cloudflare
```

### Deploy to Cloudflare Pages

```bash
cd apps/patients
pnpm build:cloudflare
wrangler pages deploy .open-next \
  --project-name=autamedica-patients \
  --branch=main \
  --commit-dirty=true
```

### Preview Deployment

```bash
wrangler pages deploy .open-next \
  --project-name=autamedica-patients \
  --branch=preview
```

## 🔍 Troubleshooting

### Error: 404 en static assets

**Causa:** Patch no aplicado correctamente

**Solución:**
```bash
# Re-run patch
node scripts/patch-open-next.mjs

# Verificar patch aplicado
grep "/_next/static/" .open-next/_worker.js
```

### Error: _routes.json missing

**Causa:** Script no generó `_routes.json`

**Solución:**
```bash
# Verificar que existe
ls -la .open-next/_routes.json

# Re-run build completo
pnpm build:cloudflare
```

### Error: Redirect loop

**Causa:** `_routes.json` mal configurado

**Solución:**
- Verificar excludes incluyen `/assets/*` y `/_next/static/*`
- Evitar includes que conflictúen con excludes

## 📊 Performance Metrics

**Expected metrics en producción:**

- **HTML First Paint**: < 800ms
- **Static Assets (CDN)**: < 100ms
- **API Routes**: < 200ms
- **307 Redirect overhead**: < 50ms

## 🔐 Environment Variables

**⚠️ CRÍTICO: Variables Server-Side Requeridas**

El portal de pacientes requiere **variables de entorno duplicadas** para operaciones client-side Y server-side:

### Server-Side (Next.js SSR/Middleware)
```bash
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # Para callback OAuth
```

### Client-Side (Browser)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

### Auth Configuration
```bash
AUTH_COOKIE_DOMAIN=.autamedica.com  # Para SSO cross-subdomain
NODE_ENV=production
```

**Documentación**: Ver `apps/patients/.env.example` para configuración completa

## 📝 Changelog

### [2025-10-04] - Auth Integration Fixes
- ✅ **Habilitado Auth Hub sync** en `session-sync.ts` (eliminado `return null`)
- ✅ **Eliminado middleware duplicado** `src/middleware.ts` (solo usar `middleware.ts`)
- ✅ **Refactorizado `supabaseClient.ts`** para SSR real (eliminado mock)
  - Usa `createServerClient()` de `@autamedica/auth` en SSR
  - Mantiene `createBrowserClient()` para cliente
  - Error explicativo si se usa incorrectamente
- ✅ **Login page** usa `@autamedica/auth` centralizado
- ✅ **Variables de entorno** server-side documentadas (`.env.example`)
- ✅ **`getDomainConfig()`** corregido: `.autamedica.com` en producción (no `.pages.dev`)

### [Previous] - Cloudflare Deployment Fix
- ✅ Agregado `prebuild:cloudflare` hook
- ✅ Refactorizado `build:cloudflare` pipeline
- ✅ Creado `patch-open-next.mjs` con redirect logic
- ✅ Configurado `_routes.json` para asset optimization
- ✅ Smoke tests documentados

---

**Última actualización**: 2025-10-04
**Ambiente**: Cloudflare Pages con OpenNext.js adapter
**Status**: ✅ OPERATIVO (Auth integrado)
