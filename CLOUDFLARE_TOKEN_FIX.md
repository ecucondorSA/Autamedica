# Fix Error Cloudflare API 10001 - Token Regeneración

## Error Actual
```
Unable to authenticate request [code: 10001]
```

## Solución: Regenerar API Token

### 1. Generar Nuevo Token

**Dashboard Cloudflare:**
1. Ir a: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Usar template: **"Edit Cloudflare Workers"** o crear custom con:
   - **Account → Cloudflare Pages: Edit**
   - (Opcional) **Account → Workers KV Storage: Edit** si se usa KV

### 2. Scopes Requeridos

```
Permissions:
  - Account → Cloudflare Pages → Edit ✅
  - Account → Account Settings → Read (opcional)

Account Resources:
  - Include → [Tu cuenta] (ecucondorSA o equivalente)

Zone Resources:
  - All zones (si usas DNS automation)
```

### 3. Actualizar GitHub Secrets

**GitHub → Settings → Secrets and variables → Actions:**

1. Actualizar `CLOUDFLARE_API_TOKEN` con el nuevo token
2. Verificar `CLOUDFLARE_ACCOUNT_ID` (debe estar configurado)

### 4. Validar Token (Opcional)

```bash
# Reemplazar con tus valores
export CLOUDFLARE_API_TOKEN="tu_nuevo_token"
export CLOUDFLARE_ACCOUNT_ID="tu_account_id"

# Test API
curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects \
  | jq '.success'

# Debe devolver: true
```

### 5. Re-ejecutar Workflow

Una vez actualizado el secret:
1. Ir a Actions en GitHub
2. Re-run del workflow fallido
3. Verificar que companies deploy funciona

## Estado Actual

- ✅ Web-App: Build funciona (esperando fix de next-on-pages)
- ✅ Doctors: Build funciona local (parches aplicados)
- ❌ Companies: Requiere token actualizado (este fix)

---

**Fecha**: 2025-09-30
**Contexto**: FASE 3 - Corrección deployments automáticos
