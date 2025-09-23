# 🔐 Guía de Implementación de Autenticación SSO - AutaMedica

## 📋 Resumen de la Solución

He implementado una solución de **SSO (Single Sign-On) con mínima fricción** usando:

- **Supabase CLI** para gestión de autenticación y usuarios
- **Cloudflare KV** para compartir sesiones entre subdominios `.pages.dev`
- **Cloudflare Pages Functions** para middleware de autenticación edge

## 🏗️ Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────┐
│                   Supabase Auth                          │
│         (Gestión de usuarios y credenciales)             │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Pages Functions                   │
│        (Middleware de autenticación en el edge)          │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare KV Store                     │
│      (Sesiones compartidas entre subdominios)            │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Patients   │ │   Doctors    │ │  Companies   │
│  .pages.dev  │ │  .pages.dev  │ │  .pages.dev  │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Flujo de Autenticación

1. **Login**: Usuario se autentica en `autamedica-web-app.pages.dev`
2. **Validación**: Supabase valida credenciales
3. **Sesión KV**: Se crea sesión en Cloudflare KV (accesible globalmente)
4. **Cookie**: Se establece cookie con dominio `.pages.dev`
5. **Redirección**: Usuario es redirigido a su app según rol
6. **Validación Edge**: Cada request valida sesión via Cloudflare Functions

## 📦 Componentes Creados

### 1. **Package @autamedica/auth**
```
packages/auth/
├── src/
│   ├── client/supabase.ts         # Cliente browser
│   ├── middleware/
│   │   ├── auth.ts                # Middleware Next.js
│   │   └── cloudflare-auth.ts     # Middleware Cloudflare
│   ├── utils/
│   │   ├── config.ts              # Configuración por entorno
│   │   ├── redirect.ts            # Lógica de redirección
│   │   └── cloudflare-sso.ts     # SSO con KV
│   └── hooks/useAuth.tsx          # React hooks
```

### 2. **Configuración Supabase** (`supabase/config.toml`)
- Redirect URLs para todos los subdominios `.pages.dev`
- Configuración de cookies para SSO
- CORS para todas las apps

### 3. **Configuración Cloudflare** (`wrangler.toml`)
- KV namespaces para sesiones (`AUTH_SESSIONS`, `USER_PROFILES`)
- Variables de entorno compartidas
- Bindings para todas las apps

### 4. **Script de Setup** (`scripts/setup-auth.sh`)
Script automatizado que:
- Configura Supabase auth
- Crea KV namespaces
- Genera Pages Functions
- Build del package auth

## 🛠️ Comandos CLI

### Desarrollo Local

```bash
# Iniciar Supabase local
supabase start

# Ver estado de Supabase
supabase status

# Desarrollar con hot reload
pnpm dev

# Build del package auth
pnpm auth:build
```

### Gestión de Sesiones (KV)

```bash
# Listar sesiones activas
wrangler kv:key list --namespace-id=auth_sessions_kv

# Ver una sesión específica
wrangler kv:key get "session:SESSION_ID" --namespace-id=auth_sessions_kv

# Limpiar todas las sesiones
wrangler kv:bulk delete --namespace-id=auth_sessions_kv

# Crear sesión manual (testing)
wrangler kv:key put "session:test123" '{"userId":"...","role":"patient"}' \
  --namespace-id=auth_sessions_kv --expiration-ttl=86400
```

### Deployment

```bash
# Deploy una app específica
cd apps/patients
wrangler pages deploy .next --project-name autamedica-patients

# Deploy todas las apps
./deploy-apps.sh

# Ver logs de producción
wrangler pages tail autamedica-patients

# Ver configuración del proyecto
wrangler pages project list
```

### Debugging Auth

```bash
# Test auth endpoint
curl -X POST https://autamedica-web-app.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Validar sesión
curl https://autamedica-patients.pages.dev/api/auth/session \
  -H "Cookie: autamedica_session=SESSION_ID"

# Ver headers de respuesta
curl -I https://autamedica-doctors.pages.dev/dashboard
```

## 🔧 Configuración Manual Requerida

### 1. **Cloudflare Dashboard**

1. Ir a Workers & Pages > KV
2. Crear namespaces:
   - `auth_sessions_kv`
   - `user_profiles_kv`
3. Copiar los IDs en `wrangler.toml`

### 2. **Variables de Entorno en Pages**

Para cada proyecto Pages, agregar:
```
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. **Supabase Dashboard**

1. Authentication > URL Configuration
2. Agregar Redirect URLs:
   ```
   https://autamedica-web-app.pages.dev/**
   https://autamedica-patients.pages.dev/**
   https://autamedica-doctors.pages.dev/**
   https://autamedica-companies.pages.dev/**
   https://autamedica-admin.pages.dev/**
   ```

## 🔐 Seguridad

### Características Implementadas

- ✅ Cookies HTTPOnly con SameSite=Lax
- ✅ Validación de sesión en el edge (sin tocar el servidor)
- ✅ TTL automático de sesiones (24h default)
- ✅ Refresh de sesión en actividad
- ✅ Validación de rol por aplicación
- ✅ Sanitización de returnUrl contra open redirects

### Limitaciones Actuales

- ⚠️ SSO limitado a subdominios `.pages.dev`
- ⚠️ No hay rate limiting en login (agregar con Cloudflare Rate Limiting)
- ⚠️ No hay MFA implementado (disponible en Supabase)

## 📝 Uso en las Apps

### 1. Crear middleware en cada app

```javascript
// apps/patients/functions/_middleware.js
import { onRequest } from '@autamedica/auth/middleware/cloudflare-auth';
export { onRequest };
```

### 2. Usar hooks en componentes

```tsx
// components/Header.tsx
import { useAuth } from '@autamedica/auth';

export function Header() {
  const { user, profile, signOut } = useAuth();

  return (
    <div>
      <span>Hola, {profile?.first_name}</span>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### 3. Proteger rutas

```tsx
// app/dashboard/page.tsx
import { useRequireAuth } from '@autamedica/auth';

export default function Dashboard() {
  const { user, profile } = useRequireAuth();

  if (!user) return null; // Redirige automáticamente

  return <div>Dashboard for {profile.role}</div>;
}
```

## 🚨 Troubleshooting

### Problema: "No se comparten cookies entre apps"

**Solución**: Verificar que todas las apps usan el mismo dominio base en producción.

```bash
# Verificar cookie domain
curl -I https://autamedica-web-app.pages.dev/auth/login | grep Set-Cookie
```

### Problema: "Session not found in KV"

**Solución**: Verificar que KV namespace está correctamente configurado.

```bash
# Test KV directamente
wrangler kv:key list --namespace-id=auth_sessions_kv
```

### Problema: "Redirect loop"

**Solución**: Verificar roles en Supabase user_metadata.

```sql
-- En Supabase SQL Editor
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users;
```

## ✅ Checklist de Implementación

- [x] Package @autamedica/auth creado
- [x] Supabase config.toml configurado
- [x] Cloudflare wrangler.toml configurado
- [x] KV namespaces para SSO
- [x] Pages Functions para middleware
- [x] Script de setup automatizado
- [ ] KV namespaces creados en Cloudflare Dashboard
- [ ] Variables de entorno en cada proyecto Pages
- [ ] Redirect URLs actualizados en Supabase
- [ ] Deploy de todas las apps
- [ ] Testing E2E del flujo completo

## 📚 Referencias

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)
- [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Nota**: Esta implementación prioriza la menor fricción de desarrollo usando las herramientas CLI nativas de Supabase y Cloudflare, evitando configuraciones manuales complejas.