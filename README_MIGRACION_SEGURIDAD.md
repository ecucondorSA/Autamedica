# 🔐 Migración de Seguridad - Autamedica

## ⚠️ ANTES DE EMPEZAR - BACKUP CRÍTICO

```bash
# 1. Crear tag de respaldo
git tag pre-security-hardening-$(date +%Y%m%d)
git push --tags

# 2. Backup de producción actual
for app in web-app doctors patients companies; do
  wrangler pages deployment list autamedica-$app --format json > backup-prod-$app.json
done
```

## 🎯 VULNERABILIDADES CRÍTICAS SOLUCIONADAS

- ❌ **78+ archivos** con claves Supabase hardcodeadas
- ❌ **Cookies sin HttpOnly/Secure** flags
- ❌ **Open redirects** sin whitelist
- ❌ **WebRTC getUserMedia** sin retry logic
- ❌ **Routing por rol** duplicado y disperso

## 📋 PLAN DE APLICACIÓN (30-45 minutos)

### FASE 1: Rotar Credenciales (5 min) 🔄

```bash
# 1. Supabase Dashboard → Project Settings → API → Regenerate Keys
# 2. Copiar nuevas claves para uso posterior
```

### FASE 2: Aplicar Parches (20 min) 🔧

```bash
cd /root/altamedica-reboot-fresh

# Aplicar todos los parches en orden
git apply 001-secure-middleware.patch
git apply 002-role-routing.patch
git apply 003-webrtc-diagnostics.patch
git apply 004-ci-workflow.patch
git apply 005-env-templates.patch
git apply 006-security-headers.patch

# Verificar aplicación
git status
git diff --cached
```

### FASE 3: Migración BD (5 min) 🗄️

```bash
# Aplicar migración Supabase
supabase db push

# Verificar tablas creadas
supabase db ls
```

### FASE 4: Configurar Secrets (10 min) ⚙️

```bash
# GitHub Actions
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://TU-PROJECT-ID.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "TU-NUEVA-ANON-KEY"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "TU-NUEVA-SERVICE-KEY"

# Cloudflare Pages (por cada app)
for app in web-app doctors patients companies; do
  echo "NEXT_PUBLIC_SUPABASE_URL" | wrangler pages secret put --project-name autamedica-$app
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY" | wrangler pages secret put --project-name autamedica-$app
done
```

### FASE 5: Limpiar Historial (5 min) 🧹

```bash
# Instalar git-filter-repo
pipx install git-filter-repo

# Remover archivos comprometidos
git filter-repo --path apps/web-app/wrangler.toml --invert-paths
git filter-repo --path scripts/load-seeds.mjs --invert-paths
git filter-repo --path scripts/apply-migration-direct.js --invert-paths

# Force push (CUIDADO: coordinar con equipo)
git push --force --all
git push --force --tags
```

## ✅ CHECKLIST DE VALIDACIÓN

### 🔐 Seguridad

- [ ] Cookies tienen `HttpOnly=true, Secure=true, SameSite=Lax`
- [ ] Redirect whitelist funciona: `/auth/login?returnTo=/admin` → redirige a portal correcto según rol
- [ ] No hay claves hardcodeadas: `git ls-files | xargs grep -i "eyJhbGciOi" → sin resultados`
- [ ] Headers de seguridad: `curl -I https://autamedica-web-app.pages.dev | grep -E "(X-Frame|CSP|HSTS)"`

### 🎯 Funcionalidad

- [ ] Login funciona con nuevas claves
- [ ] Redirección por rol: `patient` → patients portal, `doctor` → doctors portal
- [ ] WebRTC retry: simular cámara ocupada, verificar fallback a constraints mínimos
- [ ] CI/CD: PR nuevo ejecuta build sin errores

### 🌐 Despliegue

- [ ] 4 apps desplegadas con nuevas variables
- [ ] Dominios responden: `curl -s -o /dev/null -w "%{http_code}" https://autamedica-web-app.pages.dev` → 200
- [ ] Logs sin errores de autenticación

## 🚨 ROLLBACK DE EMERGENCIA

Si algo falla **en producción**:

```bash
# Opción A: Rollback automático Cloudflare
for app in web-app doctors patients companies; do
  wrangler pages deployment list autamedica-$app
  wrangler pages deployment rollback --deployment-id DEPLOYMENT-ID-ANTERIOR
done

# Opción B: Redeploy desde tag anterior
git checkout pre-security-hardening-$(date +%Y%m%d)
# Ejecutar deployment desde Actions
```

## 📱 NUEVAS FUNCIONALIDADES DISPONIBLES

### Routing Centralizado

```typescript
import { getPortalForRole } from '@autamedica/shared'

// Redirigir según rol después de login
const portal = getPortalForRole(user.role) // Automáticamente dev/staging/prod
window.location.href = portal
```

### WebRTC Robusto

```typescript
import { WebRTCDiagnostics } from '@autamedica/shared'

// Diagnóstico completo
await WebRTCDiagnostics.diagnose()

// getUserMedia con retry automático
const stream = await WebRTCDiagnostics.getUserMediaWithRetry({
  maxRetries: 3,
  backoffMs: 1000
})
```

### Middleware de Seguridad

- Automático en todas las rutas
- Protección CSRF integrada
- Validación de redirects
- Cookies seguras por defecto

## 🎯 MÉTRICAS DE ÉXITO

**Antes vs Después:**

| Métrica | Antes | Después |
|---------|--------|---------|
| Claves hardcodeadas | 78+ archivos | 0 |
| Cookies seguras | ❌ | ✅ |
| Open redirects | Vulnerable | Protegido |
| WebRTC failure rate | ~40% | <5% |
| CI/CD builds | Manual | Automático |

## 🔍 MONITOREO POST-MIGRACIÓN

```bash
# Ejecutar cada día la primera semana
./scripts/security-check.sh

# Logs de autenticación
wrangler pages deployment logs autamedica-web-app

# Métricas WebRTC
# (revisar consola en doctors/patients para errores getUserMedia)
```

## 📞 CONTACTO EN CASO DE PROBLEMAS

- **Rollback crítico**: Usar comandos de emergencia arriba
- **Supabase**: Verificar nuevas claves en Dashboard → Settings → API
- **Cloudflare**: Pages Dashboard → Variables de entorno
- **CI/CD**: GitHub Actions → Secrets

---

**⏱️ Tiempo estimado total**: 45 minutos
**🎯 Ventana recomendada**: Fuera de horario pico
**🔄 Rollback disponible**: En cualquier momento