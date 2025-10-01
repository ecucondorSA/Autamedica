# 🔑 Token Cloudflare - Permisos Exactos Requeridos

## ✅ Token Actual: Parcialmente Correcto

**Token probado**: `1BzGaxD8smNT0ia5xk3A2GlfWeb6fzH_REML7fIG`

### Test Results:
```bash
# ✅ Token válido y activo
curl -H "Authorization: Bearer TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
# → success: true, status: active

# ✅ Puede leer User Details
curl -H "Authorization: Bearer TOKEN" \
  https://api.cloudflare.com/client/v4/user
# → success: true, email: ecucondor@gmail.com

# ❌ NO puede acceder a Pages
curl -H "Authorization: Bearer TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/c0b54d14e90c0959dca0e3ed8fe82cfe/pages/projects
# → success: false
```

## 🎯 Diagnóstico

**Tiene**: ✅ User → User Details → Read
**Falta**: ❌ Account → Cloudflare Pages → Edit

---

## 📋 Permisos COMPLETOS Requeridos

Para que `wrangler pages deploy` funcione en GitHub Actions, el token necesita **exactamente 2 permisos**:

### 1. Account Permissions
```
Permission: Account
Resource: Cloudflare Pages
Access: Edit
```

### 2. User Permissions (CRÍTICO pero no documentado)
```
Permission: User
Resource: User Details
Access: Read
```

**Fuente**: GitHub Issue #2611 - https://github.com/cloudflare/workers-sdk/issues/2611

---

## 🔧 Cómo Crear el Token Correcto

### Paso 1: Dashboard Cloudflare
https://dash.cloudflare.com/profile/api-tokens

### Paso 2: Create Custom Token

Click en **"Create Token"** → **"Create Custom Token"**

### Paso 3: Configuración Exacta

**Token name**: `GitHub Actions - Pages Full Access`

**Permissions** (agregar ambos):

1. **Primera fila**:
   - Type: `Account`
   - Item: `Cloudflare Pages`
   - Permission: `Edit`

2. **Segunda fila** (hacer click en "+ Add more"):
   - Type: `User`
   - Item: `User Details`
   - Permission: `Read`

**Account Resources**:
```
Include → Specific account → ecucondorSA (o tu cuenta)
```

**Client IP Address Filtering**:
```
[DEJAR COMPLETAMENTE VACÍO]
```
⚠️ GitHub Actions usa IPs dinámicas, no se puede filtrar por IP.

**TTL (Time to Live)**:
```
Opción 1: Never expire (recomendado para CI/CD)
Opción 2: Fecha muy lejana (ej: 1 año)
```

### Paso 4: Crear y Copiar Token

1. Click "Continue to summary"
2. Click "Create Token"
3. **COPIAR EL TOKEN INMEDIATAMENTE** (no se volverá a mostrar)

---

## ✅ Verificar Token Nuevo

Una vez creado, verificar con estos comandos:

```bash
export NEW_TOKEN="tu_token_aqui"
export ACCOUNT_ID="c0b54d14e90c0959dca0e3ed8fe82cfe"

# Test 1: Token válido
curl -s -H "Authorization: Bearer $NEW_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify | jq '.success'
# Debe devolver: true

# Test 2: User Details (necesario para wrangler)
curl -s -H "Authorization: Bearer $NEW_TOKEN" \
  https://api.cloudflare.com/client/v4/user | jq '.success'
# Debe devolver: true

# Test 3: Pages Access (el crítico)
curl -s -H "Authorization: Bearer $NEW_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" | jq '.success'
# Debe devolver: true

# ✅ Los 3 tests deben ser TRUE
```

---

## 🔄 Actualizar en GitHub

### Paso 1: Ir a GitHub Settings
```
https://github.com/ecucondorSA/Autamedica/settings/secrets/actions
```

### Paso 2: Actualizar Secret
1. Click en `CLOUDFLARE_API_TOKEN`
2. Click "Update secret"
3. Pegar el nuevo token
4. Click "Update secret"

### Paso 3: Verificar Variable Cuenta
Confirmar que existe `CLOUDFLARE_ACCOUNT_ID` con valor:
```
c0b54d14e90c0959dca0e3ed8fe82cfe
```

---

## 🚀 Re-ejecutar Deployment

Una vez actualizado el token:

```bash
# Opción 1: Via CLI
gh workflow run "Desplegar Producción (Pages)" --ref main

# Opción 2: Via Web
# GitHub → Actions → Desplegar Producción → Run workflow
```

---

## 📊 Comparación de Tokens

| Token | User Details | Pages Access | Estado |
|-------|-------------|--------------|--------|
| Token anterior (5 intentos) | ❌ | ❌ | No funciona |
| Token actual (1BzGaxD...) | ✅ | ❌ | Falta Pages |
| Token necesario | ✅ | ✅ | Crear nuevo |

---

## ⚠️ Errores Comunes

### Error: "Authentication error [code: 10000]"

**Significa que falta uno de los 2 permisos**:
- Si puede verificar token pero no acceder a Pages → Falta "Cloudflare Pages → Edit"
- Si no puede ni verificar → Token inválido o expirado
- Si puede Pages pero falla en deployment → Falta "User Details → Read"

### Error: "Invalid IP address"

Si aparece este error, el token tiene filtro de IP configurado. **Remover completamente** el filtro de IP.

---

## 📝 Documentación Oficial

- **Cloudflare Pages CI/CD**: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- **Create API Token**: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- **GitHub Issue #2611**: https://github.com/cloudflare/workers-sdk/issues/2611 (fuente del User Details requirement)

---

**Resumen**: El token actual tiene 50% de los permisos. Necesita agregar "Cloudflare Pages → Edit".

**Estado actual**:
- ✅ User Details → Read
- ❌ Cloudflare Pages → Edit ← **AGREGAR ESTE**
