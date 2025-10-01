# 🔍 Análisis Completo de Errores de Deployment - GitHub Issues

## 📊 Resumen Ejecutivo

**Fecha**: 2025-09-30
**Run ID**: 18148401531
**Estado**: 3 problemas críticos identificados

---

## ❌ Problema 1: Auth App - Edge Runtime Requerido

### Error Exacto:
```
⚡️ ERROR: Failed to produce a Cloudflare Pages build from the project.

The following routes were not configured to run with the Edge Runtime:
  - /api/health
  - /api/session-sync
  - /auth/callback
  - /auth/login

Please make sure that all your non-static routes export the following edge runtime route segment config:
  export const runtime = 'edge';
```

### Causa Raíz:
`@cloudflare/next-on-pages` requiere que **todas las rutas dinámicas** usen Edge Runtime, ya que Cloudflare Workers solo soporta Edge Runtime, no Node.js runtime.

### Solución:
Agregar `export const runtime = 'edge';` a todas las rutas dinámicas en `apps/auth/src/app/`:

**Archivos a modificar:**
1. `api/health/route.ts`
2. `api/session-sync/route.ts`
3. `auth/callback/route.ts` (o `page.tsx`)
4. `auth/login/page.tsx`

**Ejemplo:**
```typescript
// apps/auth/src/app/api/health/route.ts
export const runtime = 'edge';

export async function GET() {
  return Response.json({ status: 'ok' });
}
```

**Estado**: ⏳ Pendiente de implementación

---

## ❌ Problema 2: Token Cloudflare - Permisos Insuficientes

### Error Exacto:
```
✘ [ERROR] A request to the Cloudflare API (/accounts/***/pages/projects/autamedica-web-app) failed.

Authentication error [code: 10000]
```

### Investigación GitHub Issues:
- **Issue #2611**: https://github.com/cloudflare/workers-sdk/issues/2611
- **Issue #4669**: https://github.com/cloudflare/workers-sdk/issues/4669

### Causa Raíz:
El token de API requiere **DOS permisos**, no solo uno:

1. ✅ **Account → Cloudflare Pages → Edit** (documentado)
2. ⚠️ **User → User Details → Read** (NO documentado pero requerido)

**Fuente**: GitHub issue #2611 confirma que wrangler necesita leer detalles del usuario.

### Solución:

#### Opción A: Crear Nuevo Token (RECOMENDADO)

**Ir a**: https://dash.cloudflare.com/profile/api-tokens

**Configuración exacta:**
```
Token name: GitHub Actions - Pages Deploy (v2)

Permissions:
  Account → Cloudflare Pages → Edit ✅
  User → User Details → Read ✅

Account Resources:
  Include → Specific account → [Tu cuenta]

Client IP Address Filtering:
  [DEJAR VACÍO - sin filtro IP para GitHub Actions]

TTL:
  [Sin expiración o fecha lejana]
```

#### Opción B: Editar Token Existente

1. Ir a dashboard de tokens
2. Editar el token actual
3. **Agregar**: User → User Details → Read
4. **Quitar**: Filtro de IP (si existe)

### Verificar Token:
```bash
# Test 1: Verificar token básico
curl -s -H "Authorization: Bearer TU_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify | jq '.success'

# Test 2: Verificar acceso a Pages
curl -s -H "Authorization: Bearer TU_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects" \
  | jq '.success'

# Ambos deben devolver: true
```

**Estado**: ⏳ Pendiente de actualizar token en GitHub Secrets

---

## ❌ Problema 3: Doctors App - Module Not Found

### Error Exacto:
```
Failed to compile.

./src/app/call/[roomId]/CallPageClient.tsx
Module not found: Can't resolve '@autamedica/telemedicine'
```

### Causa Raíz:
El package `@autamedica/telemedicine` no está siendo construido antes del build de doctors.

### Solución:
Verificar que `build:packages` incluya telemedicine:

```json
// package.json (root)
{
  "scripts": {
    "build:packages": "turbo run build --filter=@autamedica/types --filter=@autamedica/shared --filter=@autamedica/auth --filter=@autamedica/hooks --filter=@autamedica/tailwind-config --filter=@autamedica/telemedicine --filter=@autamedica/ui --filter=@autamedica/utils"
  }
}
```

**Estado**: ✅ Ya incluido en build:packages desde commit anterior

---

## 📋 Checklist de Deployment

### Fase 1: Fixes de Código
- [ ] Auth: Agregar `export const runtime = 'edge';` a rutas
  - [ ] `/api/health/route.ts`
  - [ ] `/api/session-sync/route.ts`
  - [ ] `/auth/callback/route.ts` o `page.tsx`
  - [ ] `/auth/login/page.tsx` (si es Server Component con API calls)

### Fase 2: Token Cloudflare
- [ ] Crear nuevo token con 2 permisos:
  - [ ] Account → Cloudflare Pages → Edit
  - [ ] User → User Details → Read
- [ ] Sin filtro de IP
- [ ] Verificar con curl (ambos tests = true)
- [ ] Actualizar `CLOUDFLARE_API_TOKEN` en GitHub Secrets

### Fase 3: Verificación
- [ ] Commit y push de cambios de Edge Runtime
- [ ] Re-ejecutar workflow de deployment
- [ ] Verificar logs:
  - [ ] Web-App: Deploy exitoso
  - [ ] Auth: Build exitoso + Deploy exitoso
  - [ ] Doctors: Build exitoso + Deploy exitoso
  - [ ] Companies: Build exitoso + Deploy exitoso

---

## 🎯 Orden de Ejecución

### Primero: Fixes de Código (Local)
```bash
# 1. Agregar runtime edge a rutas de Auth
# 2. Commit
git add apps/auth/src/app
git commit -m "fix(auth): add edge runtime to dynamic routes for Cloudflare Pages"
```

### Segundo: Token (Dashboard Cloudflare)
1. Crear token con 2 permisos
2. Copiar token generado
3. GitHub → Settings → Secrets → Actualizar `CLOUDFLARE_API_TOKEN`

### Tercero: Deploy
```bash
# Push cambios
git push origin main

# O ejecutar workflow manualmente
gh workflow run "Desplegar Producción (Pages)"
```

---

## 📚 Referencias

- **Cloudflare Pages Direct Upload**: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- **Next.js Edge Runtime**: https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
- **GitHub Issue #2611**: https://github.com/cloudflare/workers-sdk/issues/2611
- **Next-on-Pages Docs**: https://github.com/cloudflare/next-on-pages

---

## ⚠️ Advertencia sobre next-on-pages

El workflow usa `@cloudflare/next-on-pages@latest` que está **deprecado**:

```
npm warn deprecated @cloudflare/next-on-pages@1.13.16:
Please use the OpenNext adapter instead: https://opennext.js.org/cloudflare
```

**Acción futura**: Migrar a OpenNext cuando esté estable para Next.js 15.5.4.

---

**Estado actual**:
- ✅ Código workflow corregido
- ⏳ Fixes de Edge Runtime pendientes
- ⏳ Token pendiente de actualizar

**Próximo paso**: Implementar Fase 1 (agregar runtime edge)
