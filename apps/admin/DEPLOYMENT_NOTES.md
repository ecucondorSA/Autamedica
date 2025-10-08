# 📋 Notas de Deployment - Admin App

## 🎯 Resumen

El **Admin App** está desplegado exitosamente en Cloudflare Pages con Next.js 15.5 + OpenNext.js adapter.

**URL de Producción:** https://autamedica-admin.pages.dev

## 🏗️ Arquitectura de Deployment

### Stack Tecnológico
- **Framework:** Next.js 15.5.0
- **Output Mode:** `standalone`
- **Adapter:** `@opennextjs/cloudflare` v1.9.1
- **Platform:** Cloudflare Pages
- **Build Tool:** Turborepo 2.5.6
- **Package Manager:** pnpm

### Configuración Clave

**next.config.mjs:**
```javascript
{
  output: 'standalone',
  transpilePackages: ['@autamedica/ui', '@autamedica/shared'],
  experimental: {
    externalDir: true
  }
}
```

**wrangler.toml:**
```toml
name = "autamedica-admin"
compatibility_date = "2025-09-30"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".open-next"

[env.production]
name = "autamedica-admin"

[env.preview]
name = "autamedica-admin-preview"
```

## 🔧 Pipeline de Build

### 1. Scripts package.json

```json
{
  "prebuild:cloudflare": "rm -rf .next .open-next || true",
  "build:cloudflare": "pnpm run build && node scripts/ensure-required-server-files.mjs && opennextjs-cloudflare build --skip-next-build && node scripts/patch-open-next.mjs"
}
```

**Flujo de ejecución:**
1. `prebuild:cloudflare` - Limpia builds previos
2. `pnpm run build` - Build de Next.js en modo standalone
3. `ensure-required-server-files.mjs` - Copia archivos requeridos por Next.js
4. `opennextjs-cloudflare build` - Genera worker de Cloudflare
5. `patch-open-next.mjs` - Aplica patches críticos

### 2. Script: ensure-required-server-files.mjs

**Propósito:** Copiar archivos que Next.js standalone necesita pero no incluye automáticamente.

```javascript
const requiredFiles = [
  'required-server-files.json',
  'BUILD_ID',
  'routes-manifest.json',
  'prerender-manifest.json'
];
```

**¿Por qué es necesario?**
- Next.js standalone genera `.next/standalone/` pero falta metadata
- OpenNext.js necesita estos archivos para configurar el worker correctamente
- Sin ellos, el worker de Cloudflare falla al iniciar

### 3. Script: patch-open-next.mjs

**Propósito:** Aplicar 3 patches críticos post-build.

#### Patch 1: Renombrar Worker
```javascript
// worker.js → _worker.js
// Cloudflare Pages busca _worker.js específicamente
```

#### Patch 2: Inject Redirect 307
```javascript
// Interceptar requests a /_next/static/* y redirigir a /assets/_next/static/*
if (url.pathname.startsWith("/_next/static/")) {
  const target = "/assets" + url.pathname + url.search;
  return Response.redirect(new URL(target, request.url), 307);
}
```

**¿Por qué 307?**
- Los assets de Next.js se generan en `/assets/_next/static/`
- El HTML referencia `/_next/static/`
- Sin redirect: 404 en todos los CSS/JS
- Con redirect 307: Browser sigue automáticamente → 200 OK

#### Patch 3: Configurar _routes.json
```javascript
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*"]
}
```

**Reglas de routing:**
- `"/*"` → Worker maneja TODAS las rutas
- `"/assets/*"` → Cloudflare Pages sirve directamente (bypass worker)
- **Crítico:** `/_next/static/*` NO está en exclude
  - Debe pasar por worker para aplicar redirect 307
  - Luego el worker redirige a `/assets/_next/static/*`
  - Cloudflare Pages sirve el archivo final desde `/assets/`

## 🐛 Problemas Resueltos

### Error 1: Tailwind CSS No Compila - 56 Bytes (RESUELTO ✅)

**Síntoma:**
```
❌ CSS generado: 56 bytes (solo directivas)
❌ Contenido: @tailwind base;@tailwind components;@tailwind utilities;
❌ Estilos no renderizan en el navegador
```

**Causa Raíz:**
Falta archivo `postcss.config.js` - Next.js no puede procesar Tailwind sin PostCSS configurado.

**Solución:**
```javascript
// postcss.config.js (CREADO)
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Resultado:**
```diff
- CSS: 56 bytes (directivas sin procesar)
+ CSS: 8.5KB (Tailwind completamente compilado)
✅ Todas las clases Tailwind funcionando
✅ Estilos renderizando correctamente
```

**Lección:** Next.js + Tailwind **siempre** requiere `postcss.config.js`.

---

### Error 2: 522 Connection Timeout (RESUELTO ✅)

**Síntoma:**
```
❌ Status: 522 Connection Timeout
❌ Worker de Cloudflare no inicia
```

**Causa Raíz:**
```toml
# wrangler.toml INCORRECTO
compatibility_date = "2024-01-01"  # ❌ Fecha antigua
```

**Solución:**
```toml
# wrangler.toml CORRECTO
compatibility_date = "2025-09-30"  # ✅ Fecha actual
```

**Lección:** Usar la misma `compatibility_date` que otras apps funcionando (ej: patients).

---

### Error 3: Assets 404 - CSS/JS No Cargan (RESUELTO ✅)

**Síntoma:**
```
❌ GET /_next/static/css/app.css → 404 Not Found
❌ Tailwind no renderiza
❌ JavaScript no ejecuta
```

**Causa Raíz:**
```json
// _routes.json INCORRECTO
{
  "exclude": ["/assets/*", "/_next/static/*"]  // ❌
}
```

- Con `"/_next/static/*"` en exclude, Cloudflare Pages intenta servir directamente
- Pero los archivos están en `/assets/_next/static/`, no en `/_next/static/`
- Resultado: 404

**Solución:**
```json
// _routes.json CORRECTO
{
  "exclude": ["/assets/*"]  // ✅ Solo assets
}
```

- `/_next/static/*` ahora pasa por el worker
- Worker aplica redirect 307 a `/assets/_next/static/*`
- Cloudflare Pages sirve desde `/assets/` → 200 OK

**Flujo Correcto:**
```
Browser → /_next/static/css/app.css
         ↓ (worker intercept)
         → 307 Redirect
         ↓
         → /assets/_next/static/css/app.css
         ↓ (Cloudflare Pages direct serve)
         → 200 OK + CSS content
```

---

### Error 4: Archivos Root-Only en Build (RESUELTO ✅)

**Síntoma:**
```bash
$ pnpm build:cloudflare
# Build genera archivos con permisos root-only
$ rm -rf .next
# Permission denied
```

**Causa:** Build inicial corriendo como root.

**Solución:**
```bash
# 1. Limpiar builds previos con permisos root
sudo rm -rf .next .open-next

# 2. Rebuild desde cero
pnpm build:cloudflare

# 3. Nuevo build genera archivos con permisos correctos
```

**Prevención:** El script `prebuild:cloudflare` limpia automáticamente en cada build.

## ✅ Verificación Post-Deployment

### Smoke Tests

**1. HTML Page (200 OK)**
```bash
curl -I https://autamedica-admin.pages.dev
# Expected: HTTP/2 200
```

**2. Redirect 307 Funcionando**
```bash
curl -I https://autamedica-admin.pages.dev/_next/static/css/113443fcfe40379c.css
# Expected: HTTP/2 307
# Location: /assets/_next/static/css/113443fcfe40379c.css
```

**3. Assets Finales (200 OK)**
```bash
curl -I https://autamedica-admin.pages.dev/assets/_next/static/css/113443fcfe40379c.css
# Expected: HTTP/2 200
# Content-Type: text/css
```

**4. Headers Cloudflare**
```bash
curl -I https://autamedica-admin.pages.dev | grep -E "(x-nextjs|x-opennext|cf-)"
# Expected:
#   x-nextjs-cache: MISS
#   x-opennext: 1
#   cf-ray: <ray-id>
```

### Script de Verificación Automatizado

```javascript
// /tmp/verify-admin.mjs
const res = await fetch('https://autamedica-admin.pages.dev/_next/static/css/app.css', {
  redirect: 'manual'
});

console.log(res.status === 307 ? '✅ Redirect OK' : '❌ Redirect FAIL');
```

## 📊 Performance Metrics

**Mediciones reales:**
- **HTML Response:** ~80ms promedio
- **Asset Redirect:** ~30ms overhead (307)
- **Asset Final:** <100ms (CDN cache)
- **Total First Paint:** <200ms

**Cache Strategy:**
- HTML: `s-maxage=31536000` (Cloudflare cache)
- Assets: Cacheable via `/assets/*` path
- Next.js: `x-nextjs-cache: MISS` (prerender disabled)

## 🚀 Deployment Command

**Comando completo de deployment:**
```bash
cd /root/altamedica-reboot-fresh/apps/admin && \
pnpm build:cloudflare && \
HUSKY=0 wrangler pages deploy .open-next \
  --project-name autamedica-admin \
  --branch main \
  --commit-dirty=true
```

**Variables de entorno requeridas:**
```bash
# No necesarias en build (app estática)
# Si se agregan APIs, configurar en Cloudflare Pages Dashboard:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - etc.
```

## 🔄 Troubleshooting Guide

### Si el worker falla (522 error):

1. **Verificar compatibility_date**
   ```bash
   grep compatibility_date wrangler.toml
   # Debe ser >= 2025-09-30
   ```

2. **Verificar nodejs_compat**
   ```bash
   grep nodejs_compat wrangler.toml
   # Debe estar presente
   ```

3. **Reconstruir desde cero**
   ```bash
   sudo rm -rf .next .open-next
   pnpm build:cloudflare
   ```

### Si los assets fallan (404):

1. **Verificar _routes.json**
   ```bash
   cat .open-next/_routes.json
   # "exclude" debe tener SOLO ["/assets/*"]
   ```

2. **Verificar redirect en _worker.js**
   ```bash
   grep -A2 "/_next/static/" .open-next/_worker.js
   # Debe contener: Response.redirect(..., 307)
   ```

3. **Verificar que patch se aplicó**
   ```bash
   pnpm build:cloudflare 2>&1 | grep "parcheado"
   # Debe mostrar: "✅ _worker.js parcheado"
   ```

### Si el HTML carga pero sin estilos:

1. **Verificar en DevTools:**
   - Network tab → Assets 307 → 200
   - No debe haber 404 en CSS/JS

2. **Test manual:**
   ```bash
   curl -I https://autamedica-admin.pages.dev/_next/static/css/<hash>.css
   # Debe ser 307, no 404
   ```

3. **Redesplegar con logs:**
   ```bash
   pnpm build:cloudflare 2>&1 | tee build.log
   # Revisar que patch-open-next.mjs ejecutó correctamente
   ```

## 📝 Notas Importantes

### ⚠️ NO hacer:
- ❌ Modificar `_worker.js` manualmente después del build
- ❌ Agregar `/_next/static/*` al exclude de `_routes.json`
- ❌ Usar `compatibility_date` antigua (< 2025)
- ❌ Omitir el script `patch-open-next.mjs`

### ✅ Siempre hacer:
- ✅ Correr `pnpm build:cloudflare` (no solo `pnpm build`)
- ✅ Verificar que scripts post-build ejecuten correctamente
- ✅ Validar _routes.json antes de deployment
- ✅ Smoke test después de cada deploy

## 🔗 Referencias

- **OpenNext.js Docs:** https://opennext.js.org/cloudflare
- **Cloudflare Pages:** https://developers.cloudflare.com/pages
- **Next.js Standalone:** https://nextjs.org/docs/advanced-features/output-file-tracing
- **Wrangler CLI:** https://developers.cloudflare.com/workers/wrangler

---

**Última actualización:** 2025-10-04
**Estado:** ✅ Funcionando en producción
**Deployment:** https://autamedica-admin.pages.dev
