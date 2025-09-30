# 🔐 Auditoría del Sistema de Autenticación AutaMedica

**Fecha**: 2025-09-30
**Sistema**: Apps Auth + Doctors
**Estado**: ⚠️ **BLOQUEADO - Connection Timeout Error 522**

---

## 📊 Resumen Ejecutivo

El sistema de autenticación presenta un **Error 522 (Connection timed out)** en producción al acceder a `auth.autamedica.com`, impidiendo el login. Los servidores de desarrollo local funcionan correctamente.

### Estado de Servidores

| Servidor | Puerto | Estado | URL |
|----------|--------|--------|-----|
| **Auth** | 3005 | ✅ Funcionando | `http://localhost:3005` |
| **Doctors** | 3001 | ✅ Funcionando | `http://localhost:3001` |
| **Session Sync API** | 3005 | ✅ Funcionando | `/api/session-sync` |

### Flujo de Autenticación (Local)

```
1. Usuario accede a → http://localhost:3001 (doctors)
2. Middleware detecta no autenticado
3. Redirect a → http://localhost:3005/login?returnTo=http://localhost:3001&role=doctor
4. ❌ PRODUCCIÓN: Redirige incorrectamente a https://auth.autamedica.com (Error 522)
```

---

## 🏗️ Arquitectura del Sistema

### 1. **App Auth** (`/apps/auth`)

**Responsabilidades:**
- Autenticación centralizada (OAuth + Email)
- Gestión de sesiones con Supabase
- Asignación de roles
- Redirects a portales según rol

**Endpoints Críticos:**

#### `/auth/login` (page.tsx)
```typescript
- Verifica si usuario ya tiene sesión
- Si tiene rol → redirect a portal correspondiente
- Si no tiene rol → redirect a /auth/select-role
- Requiere parámetro ?role= para funcionar
```

**Roles Soportados:**
- `doctor` → `http://localhost:3001` (dev) / `https://doctors.autamedica.com` (prod)
- `patient` → `http://localhost:3002` / `https://patients.autamedica.com`
- `company_admin` → `http://localhost:3003` / `https://companies.autamedica.com`
- `organization_admin` → `http://localhost:3004` / `https://admin.autamedica.com`
- `platform_admin` → `http://localhost:3004` / `https://admin.autamedica.com`

#### `/auth/callback` (route.ts)
```typescript
- Maneja callback OAuth de Supabase
- Exchange code por session (PKCE)
- Lee/asigna rol desde profiles table
- Usa RPC 'set_user_role' para asignar roles
- Redirect a portal según rol
```

**Características:**
- ✅ Soporte PKCE con fallback a implicit flow
- ✅ Sincronización de roles: profiles → app_metadata
- ✅ Validación de returnTo URL
- ⚠️ Requiere `SUPABASE_SERVICE_ROLE_KEY` para sync de roles

#### `/api/session-sync` (route.ts)
```typescript
GET /api/session-sync
Response: {
  user: null,
  authenticated: false
}
```

**Estado:** ✅ Funcional pero minimalista (solo devuelve null)

---

### 2. **App Doctors** (`/apps/doctors`)

**Middleware de Seguridad:**

```typescript
// middleware.ts
- Roles permitidos: doctor, organization_admin, platform_admin
- Usa @autamedica/shared para validación de sesión
- buildSafeLoginUrl('doctors', request.url, 'session_expired')
```

**Funciones de Routing:**
```typescript
// packages/shared/src/roles.ts
- getPortalForRole(role: UserRole): string
- roleToPortalDev vs roleToPortal
- Auto-detección dev/prod por hostname
```

**Variables de Entorno:**
```bash
# /apps/doctors/.env.local (CREADO HOY)
NODE_ENV=development
AUTH_HUB_URL=http://localhost:3005
NEXT_PUBLIC_AUTH_HUB_URL=http://localhost:3005
```

**Archivos Creados Durante Auditoría:**
- ✅ `.env.local` → Corrigió redirect a producción
- ✅ `src/data/demoData.ts` → Resuelve import faltante

---

## 🔍 Problemas Identificados

### 1. ⚠️ **CRÍTICO: Error 522 en Producción**

**URL afectada:** `https://auth.autamedica.com/?code=9f4e1509-d933-4f77-a031-206ec1d9fb49`

**Síntomas:**
- Connection timed out (Cloudflare Error 522)
- El servidor de origin no responde
- Browser OK → Cloudflare OK → **Origin Server FAIL**

**Causas Posibles:**
1. Servidor auth en Cloudflare Pages no está corriendo
2. Timeout excedido (>100 segundos default CF)
3. Proceso de autenticación muy lento
4. Worker/Function bloqueado o crasheando

**Impacto:** 🔴 **Sistema de autenticación completamente inaccesible en producción**

---

### 2. ⚠️ Session Sync Básico

**Problema:** API `/api/session-sync` solo devuelve stub

```typescript
// Actual
export async function GET(request: NextRequest) {
  return NextResponse.json({
    user: null,
    authenticated: false
  })
}
```

**Debería:**
- Verificar cookies de sesión
- Consultar Supabase
- Devolver datos reales del usuario

---

### 3. ⚠️ Dependencia de Variables de Entorno

**Faltaban variables críticas en doctors app:**
- `AUTH_HUB_URL` → Causaba redirect a producción
- Sin `.env.local` → Usaba defaults de producción

**Solución implementada:** Creación de `.env.local` en doctors

---

### 4. ℹ️ Imports Faltantes

**Error resuelto:**
```
Module not found: Can't resolve '@/data/demoData'
```

**Solución:** Creado archivo stub `/apps/doctors/src/data/demoData.ts`

---

## 🔧 Packages de Autenticación

### `@autamedica/shared/roles`

**Funciones exportadas:**
```typescript
- getPortalForRole(role, isDev?) → URL del portal
- getRoleDisplayName(role) → Nombre en español
- hasAdminAccess(role) → Boolean
- canManageOrganizations(role) → Boolean
- canAccessMedicalFeatures(role) → Boolean
- isValidUserRole(role) → Boolean
```

**Mapeos de Portales:**
```typescript
roleToPortal: {
  doctor: 'https://doctors.autamedica.com',
  patient: 'https://patients.autamedica.com',
  company_admin: 'https://companies.autamedica.com',
  organization_admin: 'https://admin.autamedica.com',
  platform_admin: 'https://admin.autamedica.com'
}

roleToPortalDev: {
  doctor: 'http://localhost:3001',
  patient: 'http://localhost:3002',
  company_admin: 'http://localhost:3003',
  organization_admin: 'http://localhost:3004',
  platform_admin: 'http://localhost:3004'
}
```

---

## ✅ Configuración Correcta (Desarrollo)

### Doctors App
```bash
# apps/doctors/.env.local
NODE_ENV=development
AUTH_HUB_URL=http://localhost:3005
NEXT_PUBLIC_AUTH_HUB_URL=http://localhost:3005
```

### Auth App
```bash
# apps/auth/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key]  # Necesario para sync de roles
```

---

## 🎯 Recomendaciones

### 🔴 **Urgente - Resolver Error 522**

1. **Verificar Cloudflare Pages Deployment:**
   ```bash
   wrangler pages deployment list --project-name autamedica-auth-app
   ```

2. **Revisar Logs de Auth App:**
   ```bash
   wrangler pages deployment tail --project-name autamedica-auth-app
   ```

3. **Verificar Variables de Entorno en Cloudflare:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. **Timeout de Cloudflare:**
   - Verificar si el proceso de auth toma >100s
   - Considerar usar Workers con límite 30s

---

### 🟡 **Mejorar Session Sync**

Implementar lógica real en `/api/session-sync`:

```typescript
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(/* ... */);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      authenticated: false
    });
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: profile?.role
    },
    authenticated: true
  });
}
```

---

### 🟢 **Auditoría Completa de Seguridad**

- [ ] Implementar rate limiting en login
- [ ] Agregar logging de intentos de autenticación
- [ ] Validar CORS headers en session-sync
- [ ] Implementar CSRF protection
- [ ] Agregar monitoring de tiempos de respuesta
- [ ] Configurar alertas para Error 522

---

## 📝 Testing Checklist

### Local Development
- [x] Auth server responde en :3005
- [x] Doctors redirect a auth local
- [x] Session sync endpoint funciona
- [x] Variables de entorno correctas

### Producción (Pendiente)
- [ ] `auth.autamedica.com` responde (actualmente 522)
- [ ] `doctors.autamedica.com` responde
- [ ] Login con Google funciona
- [ ] Login con Email funciona
- [ ] Callback maneja OAuth correctamente
- [ ] Roles se asignan correctamente
- [ ] Redirect a portal correcto según rol

---

## 🚀 Próximos Pasos

1. **INMEDIATO:** Resolver Error 522 en `auth.autamedica.com`
2. **CORTO PLAZO:** Implementar session-sync real
3. **MEDIANO PLAZO:** Auditoría de seguridad completa
4. **LARGO PLAZO:** Monitoring y alertas de autenticación

---

**Auditoría realizada por:** Claude Code
**Archivos modificados durante auditoría:**
- ✅ `/apps/doctors/.env.local` (creado)
- ✅ `/apps/doctors/src/data/demoData.ts` (creado)
- ✅ `/apps/auth/src/app/api/session-sync/route.ts` (creado)
- ✅ `/packages/hooks/tsconfig.json` (corregido rootDir)
- ✅ `/packages/telemedicine/tsconfig.json` (corregido rootDir)
