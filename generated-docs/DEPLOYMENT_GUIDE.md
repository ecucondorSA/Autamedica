# Guía de Deployment - AutaMedica Apps
**Fecha**: 2025-10-05
**Apps Listas**: Doctors, Patients
**Plataforma**: Cloudflare Pages

---

## ✅ Pre-requisitos Verificados

- ✅ Doctors app: Build exitoso (9 rutas)
- ✅ Patients app: Build exitoso (24 rutas)
- ✅ Packages core: 100% compilando
- ✅ Type system: Completo con .d.ts
- ✅ Server/client boundary: Fixed

---

## 🚀 Deployment: Doctors App

### Build Stats
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    12.5 kB         275 kB
├ ○ /appointments                        1.25 kB         150 kB
├ ƒ /call/[roomId]                       1.07 kB         165 kB
├ ƒ /consultation/[id]                    143 kB         246 kB
├ ○ /dev-call                            9.62 kB         112 kB
└ ... (9 rutas totales)

Middleware: 34.1 kB
```

### Comandos de Deployment

#### Opción 1: Cloudflare Pages CLI (Recomendado)

```bash
cd /root/Autamedica

# Asegurar build actualizado
pnpm --filter '@autamedica/doctors' build

# Deploy a Cloudflare Pages
wrangler pages deploy apps/doctors/.next \
  --project-name autamedica-doctors \
  --branch main \
  --commit-dirty=true

# Verificar deployment
curl -I https://autamedica-doctors.pages.dev
```

#### Opción 2: GitHub Integration

```bash
# 1. Push código
git add apps/doctors
git commit -m "feat(doctors): deploy production build"
git push origin main

# 2. En Cloudflare Dashboard:
# - Crear proyecto "autamedica-doctors"
# - Build command: pnpm turbo run build --filter=@autamedica/doctors
# - Build output: apps/doctors/.next
# - Root directory: (dejar vacío)
```

### Variables de Entorno Requeridas

**En Cloudflare Pages Dashboard** → autamedica-doctors → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://doctors.autamedica.com/auth/callback

# App Config
NEXT_PUBLIC_APP_URL=https://doctors.autamedica.com
NODE_ENV=production
```

### DNS Configuration

**En Cloudflare DNS** → autamedica.com:

```
Type: CNAME
Name: doctors
Content: autamedica-doctors.pages.dev
Proxy: ✓ Proxied (orange cloud)
TTL: Auto
```

---

## 🚀 Deployment: Patients App

### Build Stats
```
Route (app)                                 Size  First Load JS
┌ ○ /                                    9.82 kB         179 kB
├ ○ /anamnesis                           4.92 kB         172 kB
├ ƒ /appointments                        23.1 kB         125 kB
├ ○ /community                           8.12 kB         197 kB
├ ○ /help                                2.28 kB         172 kB
├ ƒ /preventive-health                    172 kB         276 kB
├ ○ /reproductive-health                 5.22 kB         177 kB
└ ... (24 rutas totales)
```

### Comandos de Deployment

#### Opción 1: Cloudflare Pages CLI (Recomendado)

```bash
cd /root/Autamedica

# Asegurar build actualizado
pnpm --filter '@autamedica/patients' build

# Deploy a Cloudflare Pages
wrangler pages deploy apps/patients/.next \
  --project-name autamedica-patients \
  --branch main \
  --commit-dirty=true

# Verificar deployment
curl -I https://autamedica-patients.pages.dev
```

#### Opción 2: GitHub Integration

```bash
# 1. Push código
git add apps/patients
git commit -m "feat(patients): deploy production build"
git push origin main

# 2. En Cloudflare Dashboard:
# - Crear proyecto "autamedica-patients"
# - Build command: pnpm turbo run build --filter=@autamedica/patients
# - Build output: apps/patients/.next
# - Root directory: (dejar vacío)
```

### Variables de Entorno Requeridas

**En Cloudflare Pages Dashboard** → autamedica-patients → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://patients.autamedica.com/auth/callback

# App Config
NEXT_PUBLIC_APP_URL=https://patients.autamedica.com
NODE_ENV=production
```

### DNS Configuration

**En Cloudflare DNS** → autamedica.com:

```
Type: CNAME
Name: patients
Content: autamedica-patients.pages.dev
Proxy: ✓ Proxied (orange cloud)
TTL: Auto
```

---

## 🔧 Script de Deployment Automatizado

Crear archivo `scripts/deploy-apps.sh`:

```bash
#!/usr/bin/env bash
set -e

echo "🚀 AutaMedica - Deployment Script"
echo "=================================="

APP=${1:-all}

deploy_app() {
  local app_name=$1
  local project_name="autamedica-${app_name}"

  echo ""
  echo "📦 Deploying $app_name..."

  # Build
  pnpm --filter "@autamedica/${app_name}" build

  # Deploy
  wrangler pages deploy "apps/${app_name}/.next" \
    --project-name "$project_name" \
    --branch main \
    --commit-dirty=true

  echo "✅ $app_name deployed to https://${project_name}.pages.dev"
}

case $APP in
  doctors)
    deploy_app "doctors"
    ;;
  patients)
    deploy_app "patients"
    ;;
  all)
    deploy_app "doctors"
    deploy_app "patients"
    ;;
  *)
    echo "Usage: $0 {doctors|patients|all}"
    exit 1
    ;;
esac

echo ""
echo "✅ Deployment completado!"
```

**Uso**:
```bash
chmod +x scripts/deploy-apps.sh

# Deploy ambas apps
./scripts/deploy-apps.sh all

# Deploy solo doctors
./scripts/deploy-apps.sh doctors

# Deploy solo patients
./scripts/deploy-apps.sh patients
```

---

## 🧪 Post-Deployment Validation

### 1. Smoke Tests

```bash
# Doctors
curl -I https://doctors.autamedica.com
curl -I https://doctors.autamedica.com/appointments
curl -I https://doctors.autamedica.com/auth/callback

# Patients
curl -I https://patients.autamedica.com
curl -I https://patients.autamedica.com/dashboard
curl -I https://patients.autamedica.com/appointments
```

**Expected**: Status 200 o 307 (redirects)

### 2. Security Headers

```bash
# Verificar HSTS
curl -sI https://doctors.autamedica.com | grep -i "strict-transport"

# Verificar Cloudflare
curl -sI https://doctors.autamedica.com | grep -i "cf-ray"
```

**Expected**:
```
strict-transport-security: max-age=63072000
cf-ray: [ray-id]
```

### 3. Performance Check

```bash
# Lighthouse CI (opcional)
npm install -g lighthouse

lighthouse https://doctors.autamedica.com --output html --output-path ./doctors-lighthouse.html
lighthouse https://patients.autamedica.com --output html --output-path ./patients-lighthouse.html
```

---

## 🔄 Rollback Procedure

Si algo falla en producción:

```bash
# Opción 1: Cloudflare Dashboard
# Pages → autamedica-doctors → Deployments → Previous deployment → Rollback

# Opción 2: CLI (deploy versión anterior)
git checkout [commit-anterior]
pnpm --filter '@autamedica/doctors' build
wrangler pages deploy apps/doctors/.next --project-name autamedica-doctors
```

---

## 📊 Monitoring Post-Deploy

### Cloudflare Analytics

1. **Pages Dashboard** → autamedica-doctors → Analytics
   - Requests
   - Data transfer
   - Build minutes

2. **Web Analytics** (opcional)
   - Configurar en Cloudflare Dashboard
   - Agregar snippet a apps

### Error Tracking (Recomendado)

**Opción 1: Sentry**
```bash
npm install @sentry/nextjs

# next.config.js
const { withSentryConfig } = require('@sentry/nextjs');
module.exports = withSentryConfig(nextConfig, sentryOptions);
```

**Opción 2: Cloudflare Logs**
```bash
wrangler pages deployment tail autamedica-doctors
```

---

## 🎯 Checklist de Deployment

### Pre-Deployment
- [x] Build exitoso local
- [x] Type checking passed
- [x] Lint passed
- [x] Environment variables preparadas
- [ ] DNS configurado
- [ ] Cloudflare project creado

### Durante Deployment
- [ ] Deploy ejecutado sin errores
- [ ] Build logs revisados
- [ ] Deployment URL accesible

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Security headers verificados
- [ ] Custom domain funcionando
- [ ] SSL/TLS activo
- [ ] Redirects correctos

---

## ⚠️ Issues Conocidos

### 1. AUTH_DEV_BYPASS Warning
**Mensaje**: `AUTH_DEV_BYPASS is enabled but not supported`
**Impacto**: Solo warning, no afecta producción
**Fix**: Variables de entorno correctas en Cloudflare
**Prioridad**: Baja

### 2. Suspense Boundaries
**Status**: ✅ Fixed en doctors/dev-call
**Verificar**: No warnings en build output
**Prioridad**: N/A (resuelto)

### 3. Companies App
**Status**: ⚠️ Pendiente (DTS issue en supabase-client)
**Impacto**: No afecta doctors ni patients
**Próximo**: Fix separado
**Prioridad**: Media

---

## 📚 Referencias

### Cloudflare Pages
- [Next.js Deployment](https://developers.cloudflare.com/pages/framework-guides/nextjs)
- [Environment Variables](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables)
- [Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

### Wrangler CLI
- [Installation](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- [Pages Commands](https://developers.cloudflare.com/workers/wrangler/commands/#pages)

### Next.js
- [Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🆘 Troubleshooting

### Build Fails Locally

```bash
# Limpiar todo
rm -rf node_modules .next .turbo dist
pnpm install
pnpm turbo build --filter=@autamedica/doctors

# Si persiste, check logs
pnpm turbo build --filter=@autamedica/doctors --verbose
```

### Deployment Fails

```bash
# Verificar wrangler auth
wrangler whoami

# Re-login si es necesario
wrangler login

# Verbose deployment
wrangler pages deploy apps/doctors/.next \
  --project-name autamedica-doctors \
  --verbose
```

### DNS No Resuelve

```bash
# Verificar propagación
dig doctors.autamedica.com
nslookup doctors.autamedica.com

# Cloudflare DNS flush (Dashboard)
# DNS → autamedica.com → Purge Everything
```

---

## 📞 Soporte

**Logs de Build**:
```bash
# Cloudflare Dashboard
Pages → autamedica-doctors → Deployments → [latest] → View logs
```

**Logs en Tiempo Real**:
```bash
wrangler pages deployment tail autamedica-doctors
```

**Re-ejecutar Auditoría**:
```bash
cd /root/Autamedica
./scripts/run-audit-preprod.sh
```

---

**Generado**: 2025-10-05 23:10 UTC
**Apps Ready**: Doctors ✅, Patients ✅
**Próximo Deploy**: Ejecutar comandos arriba
**Status**: 🚀 READY FOR PRODUCTION
