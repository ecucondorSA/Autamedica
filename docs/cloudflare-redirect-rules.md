# 🌐 Cloudflare Redirect Rules - Auth Hardening Backup

## 🎯 Propósito

Estas reglas de Cloudflare Pages actúan como **backup de seguridad** para el middleware de auth hardening. En caso de que el middleware Next.js falle o se deshabilite, Cloudflare manejará los redirects de auth directamente a nivel de CDN.

## 🔧 Configuración en Cloudflare Dashboard

### **Ubicación**: Cloudflare Dashboard → Rules → Redirect Rules

### **Regla 1: Legacy Auth Redirect Fallback**

```
Campo: Nombre de la regla
Valor: Legacy Auth Redirect Fallback - AutaMedica

Campo: If incoming requests match...
- Custom filter expression:
  http.request.uri.path matches "^/auth/(login|register|forgot-password)$"

Campo: Then...
- Type: Dynamic redirect
- URL: concat("https://auth.autamedica.com", http.request.uri.path, if(http.request.uri.query ne "", concat("?", http.request.uri.query), ""))
- Status code: 301 (Permanent)
- Preserve query string: Enabled
```

### **Regla 2: Auth Directory Fallback**

```
Campo: Nombre de la regla
Valor: Auth Directory Fallback - AutaMedica

Campo: If incoming requests match...
- Custom filter expression:
  http.request.uri.path matches "^/auth/?.*"

Campo: Then...
- Type: Dynamic redirect
- URL: concat("https://auth.autamedica.com", http.request.uri.path, if(http.request.uri.query ne "", concat("?", http.request.uri.query), ""))
- Status code: 301 (Permanent)
- Preserve query string: Enabled
```

## 🎛️ Configuración por Variables

### **Para diferentes ambientes:**

**Producción (`autamedica-web-app.pages.dev`):**
```
Destination: https://auth.autamedica.com
```

**Staging (`autamedica-web-app-staging.pages.dev`):**
```
Destination: https://auth-staging.autamedica.com
```

**Development (localhost):**
```
No aplicar reglas de Cloudflare (usar solo middleware)
```

## 🚨 Activación de Emergencia

### **Scenario**: Middleware Next.js falla o se deshabilita

**Pasos:**
1. Acceder a Cloudflare Dashboard
2. Ir a Rules → Redirect Rules
3. **Activar** las reglas "Legacy Auth Redirect Fallback" y "Auth Directory Fallback"
4. Verificar que el redirect funciona:
   ```bash
   curl -I https://autamedica-web-app.pages.dev/auth/login
   # Expected: 301 → https://auth.autamedica.com/login
   ```

### **Rollback**: Restaurar middleware

**Pasos:**
1. Verificar que el middleware está funcionando
2. **Desactivar** las reglas de Cloudflare para evitar conflictos
3. Monitorear con `pnpm monitor:auth`

## 🔍 Validación y Testing

### **Test de Cloudflare Rules**

```bash
# Test auth redirect (con reglas activas)
curl -I "https://autamedica-web-app.pages.dev/auth/login?portal=doctors"
# Expected: 301 → https://auth.autamedica.com/login?portal=doctors

# Test preservación de query params
curl -I "https://autamedica-web-app.pages.dev/auth/register?portal=patients&returnTo=/dashboard"
# Expected: 301 → https://auth.autamedica.com/register?portal=patients&returnTo=/dashboard

# Test auth directory general
curl -I "https://autamedica-web-app.pages.dev/auth/any-other-path"
# Expected: 301 → https://auth.autamedica.com/any-other-path
```

### **Monitoring Script con Cloudflare Test**

```bash
# Test con Cloudflare como backup
CLOUDFLARE_RULES_ACTIVE=true BASE_URL=https://autamedica-web-app.pages.dev pnpm monitor:auth
```

## ⚖️ Middleware vs Cloudflare - Precedencia

### **Orden de Procesamiento:**

1. **Cloudflare Redirect Rules** (nivel CDN)
2. **Next.js Middleware** (nivel aplicación)
3. **Page rendering** (nivel componente)

### **Recomendación:**

- **Producción normal**: Solo middleware Next.js (reglas Cloudflare desactivadas)
- **Emergencia/Fallback**: Activar reglas Cloudflare como backup
- **Nunca ambos simultáneamente**: Evita double-redirects

## 🎯 Ventajas del Backup Cloudflare

### **Performance:**
- **Redirect a nivel CDN** - más rápido que middleware
- **Edge computing** - procesamiento más cercano al usuario
- **Reduce carga** en el servidor Next.js

### **Reliability:**
- **Failover automático** si middleware falla
- **No depende de Node.js** - funciona aunque la app esté down
- **Geograficamente distribuido** - funciona desde cualquier edge

### **Security:**
- **Headers automáticos** de Cloudflare (HTTPS, security headers)
- **DDoS protection** integrada
- **Bot protection** automática

## 📋 Checklist de Implementación

- [ ] **Reglas creadas** en Cloudflare Dashboard
- [ ] **Testing realizado** con curl
- [ ] **Reglas desactivadas** (para usar solo middleware en producción)
- [ ] **Documentación** de activación de emergencia
- [ ] **Monitoring script** testea ambos escenarios
- [ ] **Team training** sobre cuándo activar backup

## 🚨 Casos de Activación

### **Activar Cloudflare Rules cuando:**
- Middleware Next.js falla o es buggy
- Deployment de emergency hotfix
- Performance issues en el servidor
- Maintenance mode requerido

### **Mantener solo Middleware cuando:**
- Operación normal (99% del tiempo)
- Headers personalizados requeridos
- Lógica compleja de routing
- Testing y desarrollo

---

**📞 Emergency Contact**: DevOps team para activación de reglas Cloudflare
**📊 Monitoring**: `pnpm monitor:auth` detecta ambos escenarios automáticamente