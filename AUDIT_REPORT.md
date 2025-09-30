# 🔒 Reporte de Auditoría: LOGIN/AUTH/REDIRECT - AutaMedica

**Fecha**: 2025-09-29
**Estado**: ⚠️ **CRÍTICO** - Requiere correcciones inmediatas

## 📋 Resumen Ejecutivo

Se identificaron **5 vulnerabilidades críticas** y **3 issues de configuración** que requieren atención inmediata.

## 🚨 Hallazgos Críticos

### 1. ❌ **CREDENCIALES HARDCODEADAS EN MIDDLEWARE**
**Severidad**: CRÍTICA
**Archivo**: `apps/doctors/middleware.ts:28-29`

```typescript
// ACTUAL (VULNERABLE)
const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Fix requerido**:
```typescript
// CORREGIDO
import { ensureEnv } from "@autamedica/shared";

const supabaseUrl = ensureEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
```

### 2. ⚠️ **COOKIES SIN SECURE FLAG**
**Severidad**: ALTA
**Archivo**: `packages/auth/src/client/supabase.ts:45-51`

```typescript
// ACTUAL (PARCIALMENTE SEGURO)
const cookieOptions = [
  `${name}=${encodeURIComponent(value)}`,
  `path=/`,
  `domain=${domainConfig.cookie}`,
  `max-age=${options.maxAge || sessionConfig.maxAge}`,
  `SameSite=Lax`,
  // FALTA: 'Secure' flag para HTTPS
]
```

**Fix requerido**:
```typescript
// CORREGIDO
const cookieOptions = [
  `${name}=${encodeURIComponent(value)}`,
  `path=/`,
  `domain=${domainConfig.cookie}`,
  `max-age=${options.maxAge || sessionConfig.maxAge}`,
  `SameSite=Lax`,
  `Secure`, // AÑADIDO: Obligatorio para producción
  // HttpOnly se maneja server-side
]
```

### 3. ⚠️ **REDIRECTS NO VALIDADOS**
**Severidad**: ALTA
**Archivo**: `apps/web-app/src/app/auth/login/page.tsx`

No se valida que `returnTo` o `redirectTo` sean URLs internas.

**Fix requerido**:
```typescript
// Validar redirects contra whitelist
const ALLOWED_REDIRECTS = [
  process.env.NEXT_PUBLIC_BASE_URL_PATIENTS,
  process.env.NEXT_PUBLIC_BASE_URL_DOCTORS,
  process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
  process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
  process.env.NEXT_PUBLIC_BASE_URL_WEB_APP,
];

function validateRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECTS.some(base =>
      url.startsWith(base!)
    );
  } catch {
    return false;
  }
}
```

### 4. ⚠️ **INCONSISTENCIA EN ROLE ROUTING**
**Severidad**: MEDIA
**Archivos**:
- `packages/shared/src/role-routing.ts`
- `packages/shared/src/env/getAppUrl.ts`

Existen **2 sistemas paralelos** de routing por rol que pueden causar conflictos.

**Fix requerido**: Unificar en un solo sistema:
```typescript
// packages/shared/src/role-routing.ts
export function getPortalUrlForRole(
  role: UserRole,
  path: string = '/'
): string {
  const baseUrls: Record<UserRole, string | undefined> = {
    patient: process.env.NEXT_PUBLIC_BASE_URL_PATIENTS,
    doctor: process.env.NEXT_PUBLIC_BASE_URL_DOCTORS,
    company: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
    company_admin: process.env.NEXT_PUBLIC_BASE_URL_COMPANIES,
    organization_admin: process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
    platform_admin: process.env.NEXT_PUBLIC_BASE_URL_ADMIN,
  };

  const baseUrl = baseUrls[role];
  if (!baseUrl) {
    throw new Error(`No portal URL configured for role: ${role}`);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
```

### 5. ❌ **MIDDLEWARE SIN VERIFICACIÓN DE ROL**
**Severidad**: CRÍTICA
**Archivo**: `apps/patients/middleware.ts`

No verifica que el usuario tenga rol `patient` antes de permitir acceso.

**Fix requerido**:
```typescript
// Verificar rol correcto
const userRole = session.user?.app_metadata?.role ||
                 session.user?.user_metadata?.role;

if (userRole !== 'patient') {
  // Redirigir al portal correcto
  const correctPortal = getPortalUrlForRole(userRole);
  return NextResponse.redirect(new URL('/', correctPortal));
}
```

## 📊 Matriz de Verificación

| Portal | Middleware | Role Check | Secure Cookies | Redirect Validation |
|--------|------------|------------|----------------|-------------------|
| web-app | ✅ | N/A | ⚠️ | ❌ |
| patients | ✅ | ❌ | ⚠️ | ❌ |
| doctors | ⚠️ (hardcoded) | ✅ | ⚠️ | ❌ |
| companies | ✅ | ❌ | ⚠️ | ❌ |
| admin | ❌ (no existe) | - | - | - |

## 🛠️ Plan de Corrección (Orden de Prioridad)

### Paso 1: Eliminar credenciales hardcodeadas (INMEDIATO)
```bash
# Fix doctors middleware
sed -i "s/const supabaseUrl = .*/const supabaseUrl = ensureEnv('NEXT_PUBLIC_SUPABASE_URL')/" apps/doctors/middleware.ts
sed -i "s/const supabaseAnonKey = .*/const supabaseAnonKey = ensureEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')/" apps/doctors/middleware.ts
```

### Paso 2: Añadir Secure flag a cookies
```bash
# Update cookie configuration
echo "Actualizar packages/auth/src/client/supabase.ts línea 51"
# Añadir: process.env.NODE_ENV === 'production' ? 'Secure' : ''
```

### Paso 3: Implementar validación de redirects
```bash
# Crear utilidad compartida
cat > packages/shared/src/security/redirect-validator.ts << 'EOF'
export function isValidRedirectUrl(
  url: string,
  allowedDomains: string[]
): boolean {
  try {
    const parsed = new URL(url, 'https://default.com');
    return allowedDomains.some(domain =>
      parsed.origin === domain ||
      parsed.href.startsWith(domain)
    );
  } catch {
    return false;
  }
}
EOF
```

### Paso 4: Unificar sistema de role routing
```bash
# Deprecar getAppUrl, usar solo getPortalUrlForRole
```

### Paso 5: Añadir verificación de rol en middleware
```bash
# Template para cada app
cat > middleware-template.ts << 'EOF'
const ALLOWED_ROLES = ['patient']; // Cambiar según app
if (!ALLOWED_ROLES.includes(userRole)) {
  const correctPortal = getPortalUrlForRole(userRole);
  return NextResponse.redirect(correctPortal);
}
EOF
```

## ✅ Configuración Recomendada de Seguridad

### Cookie Configuration
```typescript
{
  domain: '.pages.dev',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true, // Server-side only
  sameSite: 'lax',
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/'
}
```

### Environment Variables Required
```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
NEXT_PUBLIC_BASE_URL_PATIENTS=https://autamedica-patients.pages.dev
NEXT_PUBLIC_BASE_URL_DOCTORS=https://autamedica-doctors.pages.dev
NEXT_PUBLIC_BASE_URL_COMPANIES=https://autamedica-companies.pages.dev
NEXT_PUBLIC_BASE_URL_ADMIN=https://autamedica-admin.pages.dev
NEXT_PUBLIC_BASE_URL_WEB_APP=https://autamedica-web-app.pages.dev
```

## 📈 Métricas de Seguridad

- **Vulnerabilidades Críticas**: 2
- **Vulnerabilidades Altas**: 3
- **Configuraciones Inseguras**: 3
- **Tiempo estimado de corrección**: 2-3 horas

## 🎯 Conclusión

El sistema tiene **vulnerabilidades críticas** que deben corregirse antes de ir a producción:

1. **Credenciales hardcodeadas** (CRÍTICO - fix inmediato)
2. **Cookies sin Secure flag** (ALTO - fix antes de prod)
3. **Redirects no validados** (ALTO - vector de phishing)
4. **Verificación de roles incompleta** (CRÍTICO - acceso no autorizado)

**Recomendación**: No desplegar a producción hasta completar todos los fixes.

---

**Generado**: 2025-09-29
**Por**: Auditoría de Seguridad AutaMedica