# 🔧 Configuración de URLs de Redirección de Supabase

## 📋 **Problema Identificado**

El error `ERR_CONNECTION_REFUSED` en `localhost:3000/?code=...` aparece cuando Supabase no reconoce los dominios reales (productivos o previews) como URLs autorizadas.

## 🛠️ **Solución Implementada**

### 1. **📱 Variables de Entorno Actualizadas**

Todas las apps incluyen variables específicas para callbacks de autenticación:

```env
NEXT_PUBLIC_SITE_URL=https://<dominio-app>
NEXT_PUBLIC_APP_URL=https://<dominio-app>
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://<dominio-app>/auth/callback
```

**URLs por app:**
- **Web-App**: `https://autamedica.com/auth/callback`
- **Doctors**: `https://doctors.autamedica.com/auth/callback`
- **Patients**: `https://patients.autamedica.com/auth/callback`
- **Companies**: `https://companies.autamedica.com/auth/callback`

### 2. **🔧 Función OAuth Mejorada**

`signInWithOAuth()` en `@autamedica/auth` usa las URLs correctas automáticamente:

```typescript
import { signInWithOAuth } from '@autamedica/auth';
await signInWithOAuth('google', 'patients');
```

### 3. **🌐 Configuración Cloudflare Completa**

Los scripts `scripts/setup-supabase-urls.sh` y `scripts/update-supabase-with-patients.sh` permiten sincronizar Supabase con los dominios de Cloudflare Pages.

## 🚨 **PASOS CRÍTICOS PENDIENTES**

### **1️⃣ Configurar Supabase Authentication**

Supabase → **Authentication** → **URL Configuration**:

#### **Site URL**
```
https://autamedica.com
```

#### **Additional Redirect URLs**
```
https://autamedica.com/auth/callback
https://doctors.autamedica.com/auth/callback
https://patients.autamedica.com/auth/callback
https://companies.autamedica.com/auth/callback
https://autamedica-web-app.pages.dev/auth/callback
https://autamedica-doctors.pages.dev/auth/callback
```

### **2️⃣ Configurar OAuth Providers**

Agregar a cada provider (Google, GitHub, etc.):
```
https://gtyvdircfhmdjiaelqkg.supabase.co/auth/v1/callback
```

### **3️⃣ Verificar Domain Wildcards**

Para soportar previews de Cloudflare Pages:
```
https://*.pages.dev
```

## 🔍 **Verificación**

**Antes:** `localhost:3000/?code=...` → `ERR_CONNECTION_REFUSED`

**Después:** `https://autamedica.com/auth/callback?code=...` → ✅ Login exitoso

## 🧪 **Testing**

1. Cerrar sesión y limpiar cookies
2. Abrir cualquiera de las apps (`patients.autamedica.com`)
3. Ejecutar login OAuth
4. Confirmar redirección al dominio correcto

## 📚 **Archivos Relevantes**

- `packages/auth/src/client.ts` – función `signInWithOAuth`
- `scripts/setup-supabase-urls.sh`
- `scripts/update-supabase-with-patients.sh`
- `scripts/generate-supabase-urls.sh`

## 🎯 **Estado Actual**

- ✅ Código actualizado (usa dominios de producción)
- ✅ Scripts listos para sincronizar Supabase
- 🔄 Pendiente: confirmar cambios en Supabase Dashboard

## 🚀 **Próximos Pasos**

1. Ejecutar los scripts o configurar manualmente en Supabase
2. Lanzar nuevos deploys en Cloudflare Pages (`pnpm deploy:cloudflare`)
3. Probar autenticación end-to-end en cada portal

---
Una vez completada la configuración, Supabase reconocerá los dominios de Cloudflare Pages y los flujos OAuth funcionarán sin bucles de redirección.
