# 🔐 Auth Hub Dedicado - Implementación Completa

## 🎯 **Arquitectura Implementada**

### **Separación Completa de Responsabilidades**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   web-app       │    │   Auth Hub      │    │   Portales      │
│   (Landing)     │───▶│  auth.auto.com  │───▶│  *.auto.com     │
│                 │    │                 │    │                 │
│  • Marketing    │    │  • /auth/login  │    │  • doctors      │
│  • Landing      │    │  • /auth/regist │    │  • patients     │
│  • Redirects    │    │  • /auth/forgot │    │  • companies    │
│                 │    │  • /auth/callbk │    │  • admin        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **Estructura del Auth Hub**

```
apps/auth/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout base con branding AutaMedica
│   │   ├── page.tsx                # Redirect a /auth/login
│   │   └── auth/
│   │       ├── login/page.tsx      # Magic Link login con portal params
│   │       ├── register/page.tsx   # Registro con magic link
│   │       ├── forgot-password/    # Recovery con magic link
│   │       ├── callback/route.ts   # OAuth callback + cookie setting
│   │       └── select-role/page.tsx# Portal selector
│   ├── lib/
│   │   ├── supabase.ts            # Supabase clients
│   │   └── cookies.ts             # Cookie management + portal routing
│   └── middleware.ts              # Security headers + canonical domain
├── next.config.mjs               # Next.js config with security headers
├── tailwind.config.ts            # AutaMedica branding
└── package.json                  # Auth hub dependencies
```

## 🔧 **Funcionalidades Implementadas**

### **1. Magic Link Authentication**
- **Sin contraseñas**: Solo email + magic link
- **Portal preservation**: Mantiene `?portal=doctors` a través del flow
- **ReturnTo support**: Soporte completo para `?returnTo=` URLs
- **Error handling**: Manejo robusto de errores de Supabase

### **2. Cookie SSO Segura**
```typescript
const sessionCookieOptions = {
  name: 'am_session',
  domain: '.autamedica.com',     // Cross-domain SSO
  path: '/',                     // Disponible en todo el ecosistema
  httpOnly: true,                // No accesible via JavaScript
  secure: true,                  // Solo HTTPS
  sameSite: 'none',             // Cross-site requests
  maxAge: 60 * 60 * 8,          // 8 horas
};
```

### **3. Portal Resolution Inteligente**
```typescript
const PORTAL_MAPPING = {
  doctors: 'https://doctors.autamedica.com',
  patients: 'https://patients.autamedica.com',
  companies: 'https://companies.autamedica.com',
  admin: 'https://admin.autamedica.com'
};

function resolvePortalUrl(portal, returnTo) {
  // 1. Validate returnTo if present
  if (returnTo && validateRedirectUrl(returnTo)) return returnTo;

  // 2. Resolve valid portal
  const validPortal = portal && ALLOWED_PORTALS.has(portal) ? portal : 'patients';
  return PORTAL_MAPPING[validPortal];
}
```

### **4. Security Headers Enterprise**
- **X-Frame-Options**: `DENY` (auth pages nunca en frames)
- **CSP strict**: No objects, no unsafe sources
- **CORS configurado**: Solo dominios `*.autamedica.com`
- **Canonical domain**: Enforce `auth.autamedica.com`

## 🚀 **Redirects Implementados**

### **Web-App → Auth Hub**
```typescript
// apps/web-app/src/middleware.ts
if (pathname.startsWith('/auth/')) {
  const targetUrl = new URL(`https://auth.autamedica.com${pathname}`);

  // Preserve query parameters
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(targetUrl, 301); // Permanent redirect
}
```

### **Ejemplos de Redirects**
```bash
# Legacy routes → Auth Hub
https://autamedica-web-app.pages.dev/auth/login?portal=doctors
→ https://auth.autamedica.com/auth/login?portal=doctors

# Protected routes → Auth Hub
https://autamedica-web-app.pages.dev/dashboard (sin auth)
→ https://auth.autamedica.com/auth/login?returnTo=https://...dashboard

# Post-auth → Portal
https://auth.autamedica.com/auth/callback?portal=doctors
→ https://doctors.autamedica.com/ (con cookie am_session)
```

## 🎨 **UI/UX Implementado**

### **Diseño AutaMedica**
- **Gradient background**: Blue → Light Blue
- **Glass morphism**: Cards con `backdrop-blur-lg`
- **Brand colors**: `autamedica-blue`, `autamedica-green`
- **Responsive**: Mobile-first design
- **Accesibilidad**: Focus states, keyboard navigation

### **Portal Selector Visual**
- **4 portales**: Doctors, Patients, Companies, Admin
- **Icons + descriptions**: Cada portal con su identidad
- **CTAs duales**: "Iniciar Sesión" + "Crear Cuenta"
- **Direct links**: Enlaces directos a portales
- **Support info**: Contacto de soporte integrado

## 📊 **Monitoring y Analytics**

### **Headers de Monitoreo**
```typescript
// Redirect tracking
response.headers.set('X-Auth-Redirect-Source', 'web-app');
response.headers.set('X-Auth-Redirect-Target', 'auth-hub');
response.headers.set('X-Auth-Path', pathname);

// Success tracking
response.headers.set('X-Auth-Success', 'true');
response.headers.set('X-Auth-Portal', portal);
response.headers.set('X-Auth-Source', 'auth-hub');
```

### **Script de Monitoreo**
```bash
# Test auth hub health
BASE_URL=https://auth.autamedica.com pnpm monitor:auth

# Expected results:
✅ /auth/login → 200 (Auth Hub)
✅ /auth/register → 200 (Auth Hub)
✅ Portal connectivity checks
```

## 🔗 **Integración Supabase**

### **Configuración Requerida**
```
Site URL: https://auth.autamedica.com

Redirect URLs:
- https://auth.autamedica.com/auth/callback
- https://doctors.autamedica.com/auth/callback
- https://patients.autamedica.com/auth/callback
- https://companies.autamedica.com/auth/callback
- https://admin.autamedica.com/auth/callback
- http://localhost:3005/auth/callback (dev)

CORS Origins: https://*.autamedica.com
```

### **Flow de Autenticación**
1. **Magic Link Request**: User en auth hub → Supabase email
2. **Click Magic Link**: Email → `/auth/callback?code=...`
3. **Code Exchange**: Callback → `exchangeCodeForSession()`
4. **Cookie Setting**: Session → `am_session` cookie con domain `.autamedica.com`
5. **Portal Redirect**: Success → Portal específico con cookie

## 🚀 **Deployment**

### **Puerto de Desarrollo**
```bash
cd apps/auth
pnpm dev  # Puerto 3005
```

### **Cloudflare Pages**
```bash
# Build & Deploy
cd apps/auth
pnpm build:cloudflare
wrangler pages deploy .open-next/dist --project-name=autamedica-auth

# Custom domain: auth.autamedica.com
```

### **DNS Configuration**
```
CNAME auth → autamedica-auth.pages.dev (Proxy ON)
```

## ✅ **Tests de Verificación**

### **1. Redirect Tests**
```bash
curl -I "https://autamedica-web-app.pages.dev/auth/login?portal=doctors"
# Expected: 301 → https://auth.autamedica.com/auth/login?portal=doctors
```

### **2. Auth Hub Tests**
```bash
curl -I "https://auth.autamedica.com/auth/login"
# Expected: 200, Content-Type: text/html
```

### **3. Portal Resolution Tests**
```bash
# Test callback with portal parameter
curl -I "https://auth.autamedica.com/auth/callback?portal=doctors&token=test"
# Expected: 302 → https://doctors.autamedica.com/
```

### **4. Security Headers Tests**
```bash
curl -I "https://auth.autamedica.com/"
# Expected: X-Frame-Options: DENY, CSP headers, etc.
```

## 🎯 **Ventajas Logradas**

### **Separation of Concerns**
- ✅ **Web-app**: Solo marketing y landing
- ✅ **Auth Hub**: Solo autenticación y auth flows
- ✅ **Portales**: Solo funcionalidad específica

### **Security Enterprise**
- ✅ **Single auth source**: Un solo punto de autenticación
- ✅ **Secure cookies**: HTTPOnly, Secure, SameSite=None
- ✅ **Canonical domain**: auth.autamedica.com enforced
- ✅ **CSRF protection**: Supabase PKCE flow

### **Developer Experience**
- ✅ **Clear separation**: Cada app tiene su responsabilidad
- ✅ **Easy testing**: Auth hub en puerto 3005 independiente
- ✅ **Monitoring**: Headers y scripts de health check
- ✅ **Scalability**: Auth hub puede escalar independientemente

### **User Experience**
- ✅ **Single flow**: Un solo lugar para auth
- ✅ **Portal preservation**: Mantiene destino a través del flow
- ✅ **Magic links**: Sin contraseñas, más seguro
- ✅ **Visual consistency**: Branding AutaMedica unificado

## 🔮 **Próximos Pasos**

1. **OAuth Providers**: Agregar Google, Apple, Microsoft
2. **MFA**: Two-factor authentication
3. **Admin Panel**: Gestión de usuarios desde auth hub
4. **Analytics**: Tracking de conversions y drop-offs
5. **A/B Testing**: Testing de diferentes auth flows

---

**🎉 Auth Hub Completamente Implementado y Funcional**
- Puerto: **3005** (desarrollo)
- Domain: **auth.autamedica.com** (producción)
- Status: **Production Ready** ✅