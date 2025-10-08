# 🔐 Supabase MCP - Reporte de Configuración

**Proyecto**: AutaMedica
**Fecha**: 2025-10-08
**Estado**: ✅ Claves actualizadas, migraciones pendientes

---

## ✅ Claves API Actualizadas (2025)

### 🔑 Credenciales Verificadas

| Tipo | Valor | Estado | Expira |
|------|-------|--------|--------|
| **Project Ref** | `gtyvdircfhmdjiaelqkg` | ✅ Activo | - |
| **Project URL** | `https://gtyvdircfhmdjiaelqkg.supabase.co` | ✅ Funcionando | - |
| **Anon Key** | `eyJhbGciOi...3wJD4` | ✅ Válida | 2071-08-68 |
| **Service Role Key** | `eyJhbGciOi...2IOk` | ✅ Válida | 2071-08-68 |

### 📄 JWT Payload - Anon Key
```json
{
  "iss": "supabase",
  "ref": "gtyvdircfhmdjiaelqkg",
  "role": "anon",
  "iat": 1756292790,
  "exp": 2071868790
}
```

### 📄 JWT Payload - Service Role Key
```json
{
  "iss": "supabase",
  "ref": "gtyvdircfhmdjiaelqkg",
  "role": "service_role",
  "iat": 1756292790,
  "exp": 2071868790
}
```

---

## 📊 Verificación de Conectividad

| Endpoint | Status | Respuesta |
|----------|--------|-----------|
| **Auth Health** | `200 OK` | ✅ GoTrue v2.179.0 |
| **Database API** | `200 OK` | ✅ PostgREST 13.0.4 |
| **MCP Endpoint** | `401 Unauthorized` | ⚠️ Requiere configuración |

### 🔍 Notas MCP
El endpoint MCP (`https://mcp.supabase.com/mcp?project_ref=gtyvdircfhmdjiaelqkg`) responde con `401` - esto es **esperado** ya que requiere configuración adicional en el proyecto de Supabase o autenticación específica.

---

## 📁 Archivos `.env` Actualizados

Se actualizaron las claves en los siguientes archivos:

- ✅ `.env.cloudflare` (para Cloudflare Pages)
- ✅ `apps/auth/.env.local`
- ✅ `apps/doctors/.env.local`
- ✅ `apps/patients/.env.local`
- ✅ `apps/companies/.env.local`
- ✅ `apps/web-app/.env.local`

### 🔐 Variables Agregadas

Todos los archivos ahora incluyen:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ Estado de Base de Datos

### 📊 Migraciones Locales
```
supabase/migrations/
├── 20251007_basic_auth_schema.sql          (8.2 KB)
├── 20251007_patient_vital_signs.sql        (6.5 KB)
├── 20251008_community_feature.sql          (15 KB)
└── 20251008_core_medical_tables.sql        (19 KB)
```

### ⚠️ Conflicto de Migraciones

```
Local    | Remote         | Time (UTC)
---------|----------------|---------------------
20251007 |                | 2025-10-07
20251007 |                | 2025-10-07
20251008 |                | 2025-10-08
20251008 |                | 2025-10-08
         | 20251008022939 | 2025-10-08 02:29:39
```

**Problema**: Existe una migración remota `20251008022939` que no está en local.

---

## 🚀 Próximos Pasos

### 1. Sincronizar Migraciones

**Opción A: Via Dashboard de Supabase** (Recomendado)

1. Ir a: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new
2. Ejecutar cada migración en orden:
   ```sql
   -- 1. Ejecutar: 20251007_basic_auth_schema.sql
   -- 2. Ejecutar: 20251007_patient_vital_signs.sql
   -- 3. Ejecutar: 20251008_community_feature.sql
   -- 4. Ejecutar: 20251008_core_medical_tables.sql
   ```

**Opción B: Via Supabase CLI**

```bash
# Reparar historial de migraciones
supabase migration repair --status reverted 20251008022939

# Ejecutar migraciones locales
supabase db push
```

### 2. Configurar Esquema API Personalizado

Según la documentación de Supabase sobre seguridad:

**Crear esquema `api` personalizado:**
```sql
-- Crear esquema api
CREATE SCHEMA IF NOT EXISTS api;

-- Dar permisos a roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;

-- Para cada tabla:
GRANT SELECT ON TABLE api.<tabla> TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE api.<tabla> TO authenticated;
```

**Eliminar esquema `public` de los expuestos:**
1. Ir a: Settings → API → Exposed schemas
2. Eliminar `public` de la lista
3. Agregar `api` a la lista

### 3. Configurar RLS (Row Level Security)

```sql
-- Ejemplo para tabla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);
```

### 4. Verificar Integración en Apps

```bash
# Reiniciar servidores de desarrollo
pnpm dev

# Verificar conectividad en cada app
# - web-app (http://localhost:3000)
# - doctors (http://localhost:3001)
# - patients (http://localhost:3002)
# - companies (http://localhost:3003)
```

---

## 🔗 Enlaces Útiles

- **Dashboard Supabase**: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg
- **SQL Editor**: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql
- **API Settings**: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/settings/api
- **Database Tables**: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/editor

---

## 📝 Notas de Seguridad

### ✅ Mejores Prácticas Implementadas

1. **Claves Separadas**: Anon key para frontend, Service Role para backend
2. **Variables de Entorno**: Todas las claves están en archivos `.env` (no en código)
3. **Expiración Larga**: Las claves expiran en 2071 (45+ años)

### ⚠️ Pendientes

1. **RLS Habilitado**: Habilitar Row Level Security en todas las tablas
2. **Esquema API**: Migrar de `public` a `api` para mayor seguridad
3. **Políticas de Acceso**: Definir políticas granulares por rol (patient, doctor, company, admin)
4. **Auditoría**: Configurar `auth_audit` para logging de eventos de autenticación

---

## 🎯 Resumen

| Componente | Estado | Acción Requerida |
|------------|--------|------------------|
| **Claves API** | ✅ Actualizadas | Ninguna |
| **Archivos .env** | ✅ Sincronizados | Ninguna |
| **Base de Datos** | ⚠️ Vacía | Ejecutar migraciones |
| **Esquema API** | ❌ No configurado | Crear y exponer |
| **RLS** | ❌ No habilitado | Configurar políticas |
| **MCP** | ⚠️ Requiere config | Verificar documentación |

---

**Generado**: 2025-10-08
**Por**: Claude Code
**Proyecto**: AutaMedica - Plataforma de Telemedicina
