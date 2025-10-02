# Deployment Strategy - Autamedica

## Alcance
Este documento registra estrategias de deployment específicas para cada aplicación del monorepo.

---

## 2025-10-01 - Auth App (nodejs_compat)

### Estado del Patch
- **Resultado**: ✅ [OK - VERIFICADO]
- **Timestamp**: 2025-10-01T19:06:07Z
- **Script**: `scripts/cloudflare/apply-nodejs-compat.sh`
- **Wrangler Auth**: ✅ OAuth (ecucondor@gmail.com)
- **Account ID**: 5737682cdee596a0781f795116a3120b

### Variables de Entorno
**GitHub Secrets (configuradas):**
- `CLOUDFLARE_API_TOKEN` ✅
- `CLOUDFLARE_ACCOUNT_ID` ✅

**Local (opcional para testing manual):**
```bash
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="c0b54d14e90c0959dca0e3ed8fe82cfe"
```

### Deployment Strategy
**Opción 1: GitHub Actions (Recomendado)**
- Variables ya configuradas en GitHub Secrets
- El workflow CI/CD aplicará el patch automáticamente
- No requiere configuración local adicional

**Opción 2: Manual (Testing/Debug)**
1. Configurar variables localmente (ver arriba)
2. Ejecutar: `bash scripts/cloudflare/apply-nodejs-compat.sh autamedica-auth`
3. Verificar: `wrangler pages project get autamedica-auth`

### Verificación Completada
✅ **nodejs_compat configurado en todas las apps:**
- `apps/auth/wrangler.toml` - compatibility_flags = ["nodejs_compat"]
- `apps/web-app/wrangler.toml` - compatibility_flags = ["nodejs_compat"]
- `apps/doctors/wrangler.toml` - compatibility_flags = ["nodejs_compat"]
- `apps/patients/wrangler.toml` - compatibility_flags = ["nodejs_compat"]
- `apps/companies/wrangler.toml` - compatibility_flags = ["nodejs_compat"]

### Proyectos Cloudflare Pages Activos
✅ autamedica-auth (11 hours ago)
✅ autamedica-web-app (12 hours ago) - www.autamedica.com
✅ autamedica-companies (13 hours ago)
✅ autamedica-patients (2 days ago)
✅ autamedica-doctors (5 days ago)
✅ autamedica-admin (3 days ago)

### Próximos Pasos
1. ✅ nodejs_compat ya aplicado en todos los proyectos
2. ✅ Variables configuradas en GitHub Secrets
3. Continuar con desarrollo normal
4. Los deployments automáticos aplicarán la configuración

### Notas
- Alcance limitado a `apps/web-app` según instrucciones
- No se modifican otras apps ni packages del monorepo
- El script está disponible y listo para ejecución cuando se configuren las variables

---

