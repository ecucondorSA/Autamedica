# 🚀 EJECUTAR MIGRACIÓN AHORA - PASO A PASO

**Estado:** ✅ Proyecto vinculado a Supabase remoto
**Base de datos:** gtyvdircfhmdjiaelqkg.supabase.co
**Método:** Supabase Dashboard (Manual)

---

## ⚡ OPCIÓN RÁPIDA: Via Dashboard (5 minutos)

### Paso 1: Abrir SQL Editor

1. Ir a: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new
2. Login si es necesario

### Paso 2: Copiar SQL

**El archivo ya está listo:**
```bash
cat /home/edu/Autamedica/supabase/migrations/20251008_core_medical_tables.sql
```

O usa este comando para copiarlo al clipboard:
```bash
xclip -selection clipboard < /home/edu/Autamedica/supabase/migrations/20251008_core_medical_tables.sql
```

### Paso 3: Pegar y Ejecutar

1. Pegar el contenido completo en el SQL Editor
2. Click en "Run" o presionar `Ctrl+Enter`
3. Esperar confirmación "Success"

### Paso 4: Verificar

Ejecutar en el mismo SQL Editor:
```sql
-- Quick verification
SELECT COUNT(*) as new_tables_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'companies', 'doctors', 'patients',
    'company_members', 'patient_care_team',
    'appointments', 'medical_records'
);
-- Should return: 7
```

---

## 🔧 OPCIÓN ALTERNATIVA: Via CLI (Si tienes credenciales)

Si tienes el `SUPABASE_SERVICE_ROLE_KEY`:

```bash
export SUPABASE_DB_PASSWORD="your-db-password"

psql "postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.gtyvdircfhmdjiaelqkg.supabase.co:5432/postgres" \
  -f /home/edu/Autamedica/supabase/migrations/20251008_core_medical_tables.sql
```

**Nota:** La contraseña de DB está en Supabase Dashboard > Settings > Database

---

## 📋 CHECKLIST POST-MIGRACIÓN

Una vez ejecutada la migración, verificar:

### 1. Tablas Creadas
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'companies', 'doctors', 'patients',
    'company_members', 'patient_care_team',
    'appointments', 'medical_records'
)
ORDER BY table_name;
```
**Esperado:** 7 resultados

### 2. Foreign Keys Funcionando
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'patient_vital_signs'
AND kcu.column_name = 'patient_id';
```
**Esperado:** 1 resultado mostrando FK a `patients.id`

### 3. RLS Habilitado
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'doctors', 'appointments')
AND rowsecurity = true;
```
**Esperado:** 3 resultados (todos con RLS habilitado)

---

## ✅ SIGUIENTE PASO (Automático)

Después de confirmar la migración exitosa, ejecutar:

```bash
# Validar migración completa
cd /home/edu/Autamedica

# Copiar script de validación y ejecutarlo en Supabase SQL Editor
cat scripts/validate-migration.sql
```

---

## 🎯 RESUMEN RÁPIDO

**Acción inmediata:**
1. Abrir: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new
2. Copiar contenido de: `supabase/migrations/20251008_core_medical_tables.sql`
3. Pegar → Run
4. Verificar "Success"

**Tiempo estimado:** 5 minutos
**Riesgo:** BAJO (solo crea tablas, no modifica)

---

**Generado:** 2025-10-08
**Siguiente acción:** Abrir Supabase Dashboard
