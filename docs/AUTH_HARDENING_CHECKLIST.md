# 🔒 AutaMedica Auth Hardening - Deployment Checklist

## ✅ **Completado - Web-App Hardening**

### 🛡️ **Security Headers**
- [x] **CSP configurado** para dominios `*.autamedica.com` y `*.supabase.co`
- [x] **CORS headers** permitiendo credenciales cross-domain AutaMedica
- [x] **X-Frame-Options**: `SAMEORIGIN`
- [x] **X-Content-Type-Options**: `nosniff`
- [x] **Referrer-Policy**: `strict-origin-when-cross-origin`

### 🔄 **Auth Redirects**
- [x] **Legacy routes eliminadas**: `/auth/login`, `/auth/register`, `/auth/forgot-password`
- [x] **Redirects 301** implementados a `auth.autamedica.com`
- [x] **Preservación de query params** (especialmente `?portal=`)
- [x] **Headers de monitoreo** agregados (`X-Auth-Redirect-Source`, `X-Auth-Redirect-Target`)

### 🍪 **Cookie Management**
- [x] **Validación básica** de formato JWT en middleware
- [x] **Redirects seguros** para sessiones inválidas
- [x] **Manejo de casos edge** (cookie faltante, malformada)

### 🧪 **Testing**
- [x] **Test suites E2E** creados con Playwright
- [x] **Auth flow completo** cubierto por tests
- [x] **Performance tests** para redirects
- [x] **Security validation** tests

---

## 🔄 **Pendiente - Auth Hub Configuration**

### 🍪 **Cookie SSO Setup**
**Ubicación**: Auth Hub (`apps/auth`)

```typescript
// Configuración requerida para am_session cookie
cookies().set('am_session', jwtToken, {
  domain: '.autamedica.com',    // ✅ Cross-domain SSO
  path: '/',                    // ✅ Disponible en todo el ecosistema
  httpOnly: true,               // ✅ No accesible via JavaScript
  secure: true,                 // ✅ Solo HTTPS
  sameSite: 'None',            // ✅ Cross-site requests
  expires: new Date(Date.now() + 8*60*60*1000) // 8 horas
});
```

### 🔐 **Redirect Whitelist**
**Ubicación**: Auth Hub - Security config

```typescript
const ALLOWED_REDIRECT_DOMAINS = [
  'autamedica.com',
  '*.autamedica.com',
  'localhost:3000',      // Development only
  'localhost:3001',      // Development only
  'localhost:3002',      // Development only
  'localhost:3003'       // Development only
];

function validateRedirectUrl(returnTo: string): boolean {
  try {
    const url = new URL(returnTo);
    return ALLOWED_REDIRECT_DOMAINS.some(domain =>
      domain.startsWith('*')
        ? url.hostname.endsWith(domain.slice(2))
        : url.hostname === domain
    );
  } catch {
    return false;
  }
}
```

### 🚪 **Portal Resolution**
**Ubicación**: Auth Hub - Post-login handler

```typescript
const PORTAL_MAPPING = {
  doctors: 'https://doctors.autamedica.com',
  patients: 'https://patients.autamedica.com',
  companies: 'https://companies.autamedica.com',
  admin: 'https://admin.autamedica.com'
} as const;

const ALLOWED_PORTALS = new Set(Object.keys(PORTAL_MAPPING));

function resolvePortalUrl(portal?: string, returnTo?: string): string {
  // 1. Validar returnTo si está presente
  if (returnTo && validateRedirectUrl(returnTo)) {
    return returnTo;
  }

  // 2. Resolver portal válido
  const validPortal = portal && ALLOWED_PORTALS.has(portal) ? portal : 'patients';
  return PORTAL_MAPPING[validPortal as keyof typeof PORTAL_MAPPING];
}
```

---

## 🔍 **Verificación - Supabase Settings**

### 📱 **Auth URLs Configuration**
**Ubicación**: Supabase Dashboard → Authentication → URL Configuration

```
Site URL: https://autamedica.com

Redirect URLs:
- https://auth.autamedica.com/auth/callback
- https://autamedica-web-app.pages.dev/auth/callback
- https://doctors.autamedica.com/auth/callback
- https://patients.autamedica.com/auth/callback
- https://companies.autamedica.com/auth/callback
- http://localhost:3000/auth/callback (dev only)
```

### 🔑 **RLS Policies Check**
**Ubicación**: Supabase Dashboard → Authentication → Policies

```sql
-- Verificar que policies usen organization_id correctamente
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND policyname LIKE '%organization%';
```

---

## 🌐 **Cloudflare Pages Configuration**

### 🔄 **Redirect Rules**
**Ubicación**: Cloudflare Dashboard → Rules → Redirect Rules

```
Rule 1: Legacy Auth Redirect Fallback
- If: (http.request.uri.path matches "^/auth/(login|register|forgot-password)")
- Then: Dynamic redirect
- URL: https://auth.autamedica.com${http.request.uri.path}
- Status: 301 (Permanent)
- Preserve query string: On
```

### 🍪 **Cookie Forwarding**
**Ubicación**: Cloudflare Dashboard → Rules → Transform Rules

```
Rule: Forward Auth Cookies
- If: (http.cookie contains "am_session")
- Then: Set request header
- Header: Authorization
- Value: Bearer ${http.cookie["am_session"]}
```

---

## 🧪 **QA Testing Checklist**

### 🔄 **Auth Flow Testing**
```bash
# 1. Test redirects
curl -I https://autamedica-web-app.pages.dev/auth/login
# Expected: 301 → https://auth.autamedica.com/login

# 2. Test portal preservation
curl -I "https://autamedica-web-app.pages.dev/auth/login?portal=doctors"
# Expected: 301 → https://auth.autamedica.com/login?portal=doctors

# 3. Test security headers
curl -I https://autamedica-web-app.pages.dev/
# Expected: CSP, X-Frame-Options, etc.
```

### 🧪 **E2E Testing**
```bash
# Install browsers and run E2E tests
cd apps/web-app
pnpm exec playwright install
pnpm exec playwright test e2e/auth-hardening.spec.ts
pnpm exec playwright test e2e/auth-flow-complete.spec.ts
```

### 📊 **Monitoring Script**
```bash
# Run auth monitoring script
node scripts/auth-monitoring.js

# Expected output: All checks pass with minimal warnings
```

---

## 🚨 **Production Deployment Steps**

### 1. **Pre-deployment**
- [ ] Run full E2E test suite
- [ ] Verify all environment variables
- [ ] Check Supabase redirect URLs updated
- [ ] Test auth monitoring script

### 2. **Deployment**
- [ ] Deploy Web-App with middleware changes
- [ ] Deploy Auth Hub with cookie/redirect config
- [ ] Update Cloudflare redirect rules
- [ ] Verify DNS propagation

### 3. **Post-deployment**
- [ ] Run auth monitoring script
- [ ] Test critical auth flows manually
- [ ] Monitor error rates for 24h
- [ ] Setup ongoing monitoring alerts

### 4. **Rollback Plan**
```typescript
// Emergency rollback: disable middleware redirects
export function middleware(req: NextRequest) {
  // Temporarily disable auth redirects
  if (process.env.EMERGENCY_DISABLE_AUTH_REDIRECTS === 'true') {
    return NextResponse.next();
  }
  // ... rest of middleware
}
```

---

## 📈 **Monitoring & Alerts**

### 🚨 **Sentry Alerts**
```javascript
// Alert on auth redirect failures
if (response.status !== 301 && request.path.startsWith('/auth/')) {
  Sentry.captureException(new Error('Auth redirect failed'), {
    tags: { path: request.path, status: response.status }
  });
}
```

### 📊 **Analytics Events**
```javascript
// Track auth conversions
analytics.track('auth_redirect', {
  source: 'web-app',
  target: 'auth-hub',
  portal: searchParams.get('portal'),
  path: pathname
});
```

### ⚡ **Performance Monitoring**
```bash
# Monitor redirect performance
while true; do
  time curl -I https://autamedica-web-app.pages.dev/auth/login
  sleep 30
done
```

---

## 🎯 **Success Metrics**

- **Redirect Success Rate**: >99.9%
- **Auth Flow Completion**: >95%
- **Cross-Domain SSO**: Functional
- **Security Headers**: 100% compliance
- **Performance**: <200ms redirect time

---

## 📞 **Emergency Contacts**

- **DevOps Lead**: Deploy rollback procedures
- **Security Team**: Cookie/CSP configuration issues
- **Frontend Team**: Middleware or redirect logic
- **Backend Team**: Auth Hub or Supabase integration

---

*Last updated: $(date)*
*Next review: $(date -d '+1 week')*