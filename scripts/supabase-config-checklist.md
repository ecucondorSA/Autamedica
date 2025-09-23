# 🔧 Checklist de Configuración Supabase para Deployment en Cloudflare Pages

## 📍 **Problema Actual**
El login puede quedar en loop cuando Supabase no reconoce los nuevos dominios (productivos o previews) como URLs autorizadas.

## 🎯 **Solución: Configurar Redirect URLs en Supabase**

### **Paso 1: Acceder a Supabase Dashboard**
1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto: `gtyvdircfhmdjiaelqkg` (AutaMedica)
3. Ir a **Authentication** → **URL Configuration**

### **Paso 2: Agregar Nuevas URLs**

**Site URL (URL principal):**
```
https://autamedica.com
```

**Redirect URLs (callbacks OAuth):**
```
https://autamedica.com/auth/callback
https://doctors.autamedica.com/auth/callback
https://patients.autamedica.com/auth/callback
https://companies.autamedica.com/auth/callback
https://autamedica-web-app.pages.dev/auth/callback   # Preview Cloudflare
https://autamedica-doctors.pages.dev/auth/callback   # Preview Cloudflare
```

**Additional Redirect URLs (comodines recomendados):**
```
https://autamedica.com/**
https://doctors.autamedica.com/**
https://patients.autamedica.com/**
https://companies.autamedica.com/**
https://autamedica-web-app.pages.dev/**
https://autamedica-doctors.pages.dev/**
```

### **Paso 3: Verificar Configuración**

**URLs que DEBEN estar configuradas:**
- ✅ `https://autamedica.com/auth/callback`
- ✅ `https://doctors.autamedica.com/auth/callback`
- ✅ `https://patients.autamedica.com/auth/callback`
- ✅ `https://companies.autamedica.com/auth/callback`
- ✅ `http://localhost:3000/auth/callback`
- ✅ `http://localhost:3001/auth/callback`

### **Paso 4: Configurar CORS Origins**

En **Settings** → **API** → **CORS Origins**, agregar:
```
https://autamedica.com
https://doctors.autamedica.com
https://patients.autamedica.com
https://companies.autamedica.com
https://autamedica-web-app.pages.dev
http://localhost:3000
http://localhost:3001
```

## 🔍 **Cómo identificar el proyecto en Cloudflare Pages**

Cada app está desplegada como un proyecto individual:
```
autamedica-web-app
autamedica-doctors
autamedica-patients
autamedica-companies
```

Las URLs de preview siguen el patrón: `https://<proyecto>.pages.dev`.

## ⚠️ **Importante**

1. **Orden de configuración:**
   - Primero: Actualizar variables de entorno en Cloudflare Pages
   - Segundo: Ejecutar el build/deploy desde Cloudflare o vía `wrangler`
   - Tercero: Agregar/actualizar URLs en Supabase
   - Cuarto: Probar el login

2. **Cache de Supabase:** Los cambios pueden tardar 1-2 minutos en propagarse.

3. **Testing:** Después de todo configurado, probar:
   - Login desde `https://autamedica.com`
   - Login desde `https://autamedica-doctors.pages.dev`
   - Confirmar que redirecciona al dashboard sin loops

## 🚀 **Comandos de Ayuda**

Para redeploy manual vía CLI:
```bash
cd apps/doctors
pnpm deploy:cloudflare
```

Para revisar variables de entorno en Cloudflare Pages (requiere wrangler):
```bash
wrangler pages project list
wrangler pages project settings autamedica-doctors
```
