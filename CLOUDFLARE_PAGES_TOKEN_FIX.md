# Fix Cloudflare Pages - Error 10000 Authentication

## Problema Detectado

El token `CLOUDFLARE_API_TOKEN` actual **NO tiene permisos de Cloudflare Pages**.

**Error actual:**
```
Authentication error [code: 10000]
A request to the Cloudflare API (/accounts/***/pages/projects/autamedica-companies) failed.
```

**Test del token:**
```bash
curl -s -H "Authorization: Bearer hLBfsN_GczlzfHK4VW7RrVfUdlyOyPL6vZSM7tIV" \
  "https://api.cloudflare.com/client/v4/accounts/c0b54d14e90c0959dca0e3ed8fe82cfe/pages/projects"

# Respuesta:
{
  "success": false,
  "errors": [{ "code": 10000, "message": "Authentication error" }]
}
```

## Solución: Regenerar Token con Permisos Correctos

### 1. Ir a Cloudflare Dashboard
https://dash.cloudflare.com/profile/api-tokens

### 2. Crear NUEVO Token con Permisos de Pages

**Template:** Usa "Edit Cloudflare Workers" o crea Custom Token

**Permisos Requeridos:**
```
Account Permissions:
✅ Cloudflare Pages → Edit
✅ Workers Scripts → Edit (opcional, si usas Workers)

Account Resources:
✅ Include → Specific account → [Tu cuenta ecucondorSA]

Zone Resources:
✅ All zones (o específico si prefieres)
```

### 3. Reemplazar en GitHub Secrets

**GitHub → Settings → Secrets and variables → Actions**

Actualizar:
- `CLOUDFLARE_API_TOKEN` = [nuevo token con permisos Pages]
- `CLOUDFLARE_ACCOUNT_ID` = `c0b54d14e90c0959dca0e3ed8fe82cfe` (verificar que esté correcto)

### 4. Verificar Token (Opcional)

```bash
# Test básico
curl -s -H "Authorization: Bearer [NUEVO_TOKEN]" \
  https://api.cloudflare.com/client/v4/user/tokens/verify | jq '.success'
# Debe devolver: true

# Test de acceso a Pages
curl -s -H "Authorization: Bearer [NUEVO_TOKEN]" \
  "https://api.cloudflare.com/client/v4/accounts/c0b54d14e90c0959dca0e3ed8fe82cfe/pages/projects" \
  | jq '.success'
# Debe devolver: true
```

### 5. Re-ejecutar Workflow

Una vez actualizado el secret, el workflow funcionará correctamente.

---

**Nota:** El token actual `hLBfsN_GczlzfHK4VW7RrVfUdlyOyPL6vZSM7tIV` funciona para verificación general pero **NO tiene acceso a Pages**.

**Fecha:** 2025-10-01
**Contexto:** Fixing FASE 3 deployments - Error code 10000 en all apps
