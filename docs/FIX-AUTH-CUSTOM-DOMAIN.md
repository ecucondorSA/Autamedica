# Fix auth.autamedica.com - Error 522

**Fecha:** 2025-10-01
**Status:** 🚨 ACCIÓN REQUERIDA
**Causa raíz:** Custom domain no configurado en Cloudflare Pages

---

## 🔍 Diagnóstico

### Problema Identificado
- ✅ DNS está correcto (A records apuntan a Cloudflare)
- ❌ Custom domain `auth.autamedica.com` NO está agregado al proyecto Pages
- ✅ Build funciona correctamente
- ✅ Deployments funcionan correctamente

### Comparación
```
autamedica-web-app → www.autamedica.com ✅ (configurado)
autamedica-auth    → auth.autamedica.com ❌ (NO configurado)
```

---

## ✅ Solución: Agregar Custom Domain

### Opción 1: Via Cloudflare Dashboard (Recomendado - 2 minutos)

1. **Ir al proyecto Pages:**
   ```
   https://dash.cloudflare.com/5737682cdee596a0781f795116a3120b/pages/view/autamedica-auth
   ```

2. **Click en tab "Custom domains"**

3. **Click botón "Set up a custom domain"**

4. **Ingresar el dominio:**
   ```
   auth.autamedica.com
   ```

5. **Click "Continue"**
   - Cloudflare detectará que el dominio ya está en tu cuenta
   - Cloudflare configurará automáticamente el SSL

6. **Esperar 30-60 segundos para propagación**

7. **Verificar:**
   ```bash
   curl -I https://auth.autamedica.com
   # Debería devolver 200 o 301 (no 522)
   ```

---

### Opción 2: Via API REST (Requiere API Token)

Si tenés un API Token con permisos `Pages:Edit`:

```bash
export CLOUDFLARE_API_TOKEN="tu-api-token"

curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/5737682cdee596a0781f795116a3120b/pages/projects/autamedica-auth/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"auth.autamedica.com"}'
```

---

## 🧪 Validación Post-Fix

Después de agregar el custom domain:

```bash
# Test 1: Root
curl -I https://auth.autamedica.com
# Esperado: HTTP 200 o 301 (no 522)

# Test 2: Login
curl -I https://auth.autamedica.com/login
# Esperado: HTTP 200 o 301 (no 522)

# Test 3: Contenido
curl -sS https://auth.autamedica.com | head -50
# Esperado: HTML content (no "error code: 522")
```

---

## 📊 Estado Actual

### DNS Configuration ✅
```
auth.autamedica.com → 104.21.68.243 (Cloudflare)
auth.autamedica.com → 172.67.200.72 (Cloudflare)
```

### Cloudflare Pages Project ✅
```
Project: autamedica-auth
Account: 5737682cdee596a0781f795116a3120b
Default domain: autamedica-auth.pages.dev
```

### Latest Deployment ✅
```
ID: 2791b8e1-5c4d-492e-8d46-cf290ae41471
Branch: auth-preview-2025-10-01
Status: Active
Preview URL: https://auth-preview-2025-10-01.autamedica-auth.pages.dev
```

### Custom Domain ❌
```
Status: NOT CONFIGURED
Action: Add auth.autamedica.com to project
```

---

## 📝 Notas Adicionales

### ¿Por qué no funciona wrangler CLI?

Wrangler v4.38.0 no tiene comando para agregar custom domains. Opciones:
- Dashboard (recomendado)
- API REST directa
- Actualizar a wrangler v5+ (cuando esté disponible)

### ¿Por qué el DNS ya está correcto?

Cloudflare gestiona el dominio `autamedica.com` completo. Los A records apuntan a Cloudflare, pero falta **vincular** el subdominio al proyecto Pages específico.

### ¿Cuánto tarda la propagación?

- Configuración: instantánea
- SSL certificate: 30-60 segundos
- Propagación DNS global: ya está (DNS correcto)

---

## 🎯 Resumen

**1 solo paso:** Agregar `auth.autamedica.com` como custom domain al proyecto `autamedica-auth` via Dashboard.

**Link directo:**
https://dash.cloudflare.com/5737682cdee596a0781f795116a3120b/pages/view/autamedica-auth/domains

---

**Documentación generada:** 2025-10-01T20:17:55Z
