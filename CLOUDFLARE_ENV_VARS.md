# 🔐 Cloudflare Pages - Environment Variables Configuration

**Fecha:** 2025-10-04
**Propósito:** Configuración de variables de entorno para deployments

---

## 📋 Variables Obtenidas desde Supabase

```bash
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4
```

**IMPORTANTE:** `SUPABASE_SERVICE_ROLE_KEY` debe obtenerse desde Supabase Dashboard → Settings → API

---

## 🚀 Configuración por App en Cloudflare Pages

### 1. **Auth App** (`autamedica-auth`)

**Settings → Environment Variables → Production**

```bash
# Supabase Server-Side
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4
SUPABASE_SERVICE_ROLE_KEY=<OBTENER_DESDE_SUPABASE_DASHBOARD>

# Supabase Client-Side
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4

# Auth Configuration
AUTH_COOKIE_DOMAIN=.autamedica.com
NEXT_PUBLIC_BASE_URL=https://auth.autamedica.com
```

---

### 2. **Patients App** (`autamedica-patients`)

**Settings → Environment Variables → Production**

```bash
# Supabase Server-Side
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4
SUPABASE_SERVICE_ROLE_KEY=<OBTENER_DESDE_SUPABASE_DASHBOARD>

# Supabase Client-Side
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4

# Auth Configuration
AUTH_COOKIE_DOMAIN=.autamedica.com
NEXT_PUBLIC_BASE_URL=https://patients.autamedica.com
NEXT_PUBLIC_AUTH_CALLBACK_URL=https://patients.autamedica.com/auth/callback

# App URLs
NEXT_PUBLIC_APP_URL=https://autamedica.com
NEXT_PUBLIC_PATIENTS_URL=https://patients.autamedica.com
NEXT_PUBLIC_DOCTORS_URL=https://doctors.autamedica.com
NEXT_PUBLIC_COMPANIES_URL=https://companies.autamedica.com
```

---

### 3. **Doctors App** (`autamedica-doctors`)

**Settings → Environment Variables → Production**

```bash
# Supabase Server-Side
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4
SUPABASE_SERVICE_ROLE_KEY=<OBTENER_DESDE_SUPABASE_DASHBOARD>

# Supabase Client-Side
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4

# Auth Configuration
AUTH_COOKIE_DOMAIN=.autamedica.com
NEXT_PUBLIC_BASE_URL=https://doctors.autamedica.com
```

---

### 4. **Companies App** (`autamedica-companies`)

**Settings → Environment Variables → Production**

```bash
# Supabase Server-Side
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4
SUPABASE_SERVICE_ROLE_KEY=<OBTENER_DESDE_SUPABASE_DASHBOARD>

# Supabase Client-Side
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4

# Auth Configuration
AUTH_COOKIE_DOMAIN=.autamedica.com
NEXT_PUBLIC_BASE_URL=https://companies.autamedica.com
```

---

### 5. **Admin App** (`autamedica-admin`)

**Settings → Environment Variables → Production**

```bash
# Supabase Server-Side
SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4
SUPABASE_SERVICE_ROLE_KEY=<OBTENER_DESDE_SUPABASE_DASHBOARD>

# Supabase Client-Side
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4

# Auth Configuration
AUTH_COOKIE_DOMAIN=.autamedica.com
NEXT_PUBLIC_BASE_URL=https://admin.autamedica.com
```

---

### 6. **Web App** (`autamedica-web-app`)

**Settings → Environment Variables → Production**

```bash
# Supabase Client-Side (solo necesita public keys)
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4

# Auth Configuration
AUTH_COOKIE_DOMAIN=.autamedica.com
NEXT_PUBLIC_BASE_URL=https://www.autamedica.com
```

---

## 🔑 Cómo Obtener SUPABASE_SERVICE_ROLE_KEY

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto `gtyvdircfhmdjiaelqkg`
3. Settings → API
4. Project API Keys → `service_role` (secret)
5. Copiar el valor y **mantenerlo seguro**

---

## 📝 Checklist de Configuración

### Por cada app en Cloudflare Pages:

- [ ] Ir a proyecto en Cloudflare Pages Dashboard
- [ ] Settings → Environment Variables
- [ ] Seleccionar "Production"
- [ ] Agregar variables listadas arriba
- [ ] Click "Save"
- [ ] Trigger nuevo deployment para aplicar cambios

### Orden recomendado:

1. ✅ Auth App (autamedica-auth) - **MÁS CRÍTICO**
2. ✅ Patients App (autamedica-patients)
3. ✅ Doctors App (autamedica-doctors)
4. ✅ Companies App (autamedica-companies)
5. ✅ Admin App (autamedica-admin)
6. ✅ Web App (autamedica-web-app)

---

## ⚠️ Notas Importantes

1. **SUPABASE_SERVICE_ROLE_KEY**
   - Solo usar en server-side
   - Tiene permisos de administrador
   - NUNCA exponer en client-side
   - Requerido para operaciones de escritura en `profiles`

2. **AUTH_COOKIE_DOMAIN**
   - Debe ser `.autamedica.com` (con el punto)
   - Permite cookies compartidas entre subdominios
   - Crítico para SSO (Single Sign-On)

3. **Variables NEXT_PUBLIC_**
   - Expuestas al cliente
   - Solo para URLs públicas y anon key
   - NUNCA incluir service role key

---

## 🧪 Validación Post-Configuración

Después de configurar, verificar:

```bash
# 1. Login funciona
curl https://auth.autamedica.com/auth/login

# 2. Session sync funciona
curl https://patients.autamedica.com/api/session-sync

# 3. Callback OAuth funciona
# (probar login completo en browser)
```

---

## ✅ Estado del RPC en Supabase

**RPC Verificado:** ✅ `set_user_role` existe

```sql
-- Función ya creada en Supabase
CREATE OR REPLACE FUNCTION public.set_user_role(p_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  UPDATE public.profiles
    SET role = p_role,
        updated_at = NOW()
  WHERE user_id = v_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;
END;
$function$
```

**No se requiere crear nada en Supabase** - El RPC ya está deployado.

---

**Generado:** 2025-10-04 07:40:00
**Fuente:** MCP Supabase + Manual Configuration
