# Guía de Deployment: Web-App en Cloudflare Pages

## 🎯 Estado Actual

**Branch:** `deploy/auth-cloudflare`
**Último commit:** `fe0a414` - fix(web-app): actualizar build:cloudflare script
**Build local:** ✅ Exitoso

## 🔧 Configuración Requerida en Cloudflare Pages Dashboard

### 1. Acceder a Settings

1. https://dash.cloudflare.com/
2. Tu Account → Workers & Pages
3. Click "autamedica-web-app"
4. Tab "Settings"

### 2. Cambiar Production Branch

**Ubicación:** Settings → Builds and deployments → Production branch

Cambiar de: `main` → A: `deploy/auth-cloudflare`

**Razón:** Los commits de corrección están en `deploy/auth-cloudflare`.

### 3. Configurar Build Command

**Ubicación:** Settings → Builds and deployments → Build configuration → Edit

```
Framework preset: None ⚠️ (NO Next.js)
Build command: cd apps/web-app && pnpm run build:cloudflare
Build output directory: apps/web-app/.next
Root directory: (vacío)
```

### 4. Verificar Environment Variables

Settings → Environment variables (ya configuradas en wrangler.toml)

### 5. Crear Nuevo Deployment

Deployments tab → "Create deployment" → branch: `deploy/auth-cloudflare`

## 📊 Resultado Esperado

Build exitoso en ~2-3 minutos
URL: https://autamedica-web-app.pages.dev
