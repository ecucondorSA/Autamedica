# 🚀 ACCIONES INMEDIATAS - SUPABASE MIGRATION

**Fecha:** 2025-10-08
**Objetivo:** Aplicar tablas core médicas en producción
**Riesgo:** BAJO (solo crea tablas nuevas, no modifica existentes)

---

## ✅ CHECKLIST PRE-MIGRACIÓN

- [x] Auditoría de schema actual completada
- [x] Migración SQL creada y validada
- [x] Backup de migraciones existentes identificado
- [ ] Backup manual de base de datos (opcional pero recomendado)
- [ ] Aplicar migración en Supabase
- [ ] Verificar tablas creadas
- [ ] Validar foreign keys
- [ ] Test de inserción

---

## 📋 PASO 1: BACKUP MANUAL (OPCIONAL)

```bash
# Conectar a Supabase y hacer backup si lo deseas
# Este paso es opcional porque Supabase hace backups automáticos
# pero si quieres estar 100% seguro:

# En Supabase Dashboard:
# Settings > Database > Database Backups > Create Backup
```

**Nota:** Supabase hace backups automáticos daily, pero un backup manual antes de cambios grandes es buena práctica.

---

## 📋 PASO 2: APLICAR MIGRACIÓN

### Opción A: Via Supabase CLI (RECOMENDADO)

```bash
cd /home/edu/Autamedica

# Verificar conexión
supabase status

# Aplicar migración
supabase db push

# O aplicar migración específica
supabase db push supabase/migrations/20251008_core_medical_tables.sql
```

### Opción B: Via Supabase Dashboard (MANUAL)

1. Ir a https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg
2. SQL Editor
3. Copiar contenido de `supabase/migrations/20251008_core_medical_tables.sql`
4. Ejecutar
5. Verificar "Success"

### Opción C: Via SQL Directo (SI TIENES ACCESO)

```bash
# Si tienes psql configurado
psql "postgresql://postgres:[PASSWORD]@db.gtyvdircfhmdjiaelqkg.supabase.co:5432/postgres" \
  -f supabase/migrations/20251008_core_medical_tables.sql
```

---

## 📋 PASO 3: VERIFICAR TABLAS CREADAS

```sql
-- Ejecutar en Supabase SQL Editor

-- 1. Listar todas las tablas públicas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deberías ver:
-- - companies
-- - doctors
-- - patients
-- - company_members
-- - patient_care_team
-- - appointments
-- - medical_records
-- (además de las existentes: profiles, auth_audit, patient_vital_signs, community_*)

-- 2. Verificar estructura de tabla patients
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('patients', 'doctors', 'appointments', 'medical_records')
ORDER BY tc.table_name;
```

**✅ Resultado esperado:**
- `patient_vital_signs.patient_id` → `patients.id` (FK ya no está roto)
- `doctors.user_id` → `profiles.id`
- `patients.user_id` → `profiles.id`
- `appointments.patient_id` → `patients.id`
- `medical_records.patient_id` → `patients.id`

---

## 📋 PASO 4: VERIFICAR RLS POLÍTICAS

```sql
-- Listar todas las políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('patients', 'doctors', 'appointments', 'medical_records')
ORDER BY tablename, policyname;
```

**✅ Resultado esperado:** Cada tabla debe tener al menos 2-3 políticas (SELECT, INSERT, UPDATE)

---

## 📋 PASO 5: TEST DE INSERCIÓN (CRÍTICO)

```sql
-- TEST 1: Crear un paciente de prueba
-- IMPORTANTE: Reemplaza 'auth.uid()' con un UUID real de un usuario existente
-- o usa un UUID de prueba

-- Primero, obtener un usuario real
SELECT id, email FROM auth.users LIMIT 1;

-- Luego insertar paciente (reemplazar <USER_ID> con el ID real)
INSERT INTO public.patients (
    user_id,
    dni,
    birth_date,
    gender,
    blood_type
) VALUES (
    '<USER_ID>',  -- UUID del usuario
    '12345678',
    '1990-01-01',
    'male',
    'O+'
) RETURNING *;

-- TEST 2: Insertar signos vitales para ese paciente
-- (esto estaba roto antes porque patients no existía)
INSERT INTO public.patient_vital_signs (
    patient_id,
    systolic_bp,
    diastolic_bp,
    heart_rate,
    temperature,
    measurement_method
) VALUES (
    (SELECT id FROM public.patients WHERE dni = '12345678'),
    120,
    80,
    72,
    36.5,
    'self_reported'
) RETURNING *;

-- TEST 3: Verificar que los signos vitales se insertaron
SELECT
    pvs.*,
    p.dni,
    p.blood_type
FROM public.patient_vital_signs pvs
JOIN public.patients p ON p.id = pvs.patient_id
WHERE p.dni = '12345678';
```

**✅ Resultado esperado:** Los 3 queries deben ejecutarse sin errores

---

## 📋 PASO 6: LIMPIAR DATOS DE PRUEBA

```sql
-- IMPORTANTE: Limpiar los datos de prueba después de validar

-- Eliminar signos vitales de prueba
DELETE FROM public.patient_vital_signs
WHERE patient_id IN (
    SELECT id FROM public.patients WHERE dni = '12345678'
);

-- Eliminar paciente de prueba
DELETE FROM public.patients WHERE dni = '12345678';

-- Verificar limpieza
SELECT COUNT(*) FROM public.patients WHERE dni = '12345678';  -- Debe ser 0
```

---

## 📋 PASO 7: PRÓXIMOS PASOS (POST-MIGRACIÓN)

Una vez completada la migración exitosamente:

### 1. Agregar Tipos Community al Glosario
```bash
cd /home/edu/Autamedica

# Editar docs/GLOSARIO_MAESTRO.md
# Agregar sección de Community Types
```

**Tipos a agregar:**
```typescript
// Community Feature Types
export interface CommunityGroup {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  memberCount: number;
  postCount: number;
  isFeatureD: boolean;
  visibility: 'public' | 'private';
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CommunityPost {
  id: UUID;
  groupId: UUID;
  authorId: UUID;
  authorDisplayName?: string;
  isAnonymous: boolean;
  title?: string;
  content: string;
  tags: string[];
  moderationStatus: 'pending' | 'approved' | 'rejected';
  reactionCount: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PostReaction {
  id: UUID;
  postId: UUID;
  userId: UUID;
  reactionType: 'like' | 'heart' | 'helpful' | 'support';
  createdAt: ISODateString;
}

export interface GroupMembership {
  id: UUID;
  groupId: UUID;
  patientId: UUID;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'inactive' | 'banned';
  joinedAt: ISODateString;
  leftAt?: ISODateString;
}
```

### 2. Generar Types desde Database

```bash
# Opción 1: Usar Supabase CLI
supabase gen types typescript --local > packages/types/src/supabase/database.types.ts

# Opción 2: Usar supabase-js codegen
npx supabase gen types typescript --project-id gtyvdircfhmdjiaelqkg > packages/types/src/supabase/database.types.ts
```

### 3. Validar Contratos

```bash
# Ejecutar validación de contratos
pnpm docs:validate

# Si hay errores, actualizar GLOSARIO_MAESTRO.md
```

### 4. Crear Hooks de React

```bash
# En packages/hooks/src/medical.ts agregar:

export function usePatientProfile() {
  const { data, error } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .single();
      return data;
    }
  });
  return { patient: data, error };
}

export function useDoctorProfile() {
  // Similar para doctors
}

export function useAppointments(userId: string) {
  // Hook para appointments
}
```

---

## 🔍 VALIDACIÓN FINAL

Ejecuta este checklist para confirmar que todo funciona:

- [ ] Todas las tablas creadas (7 nuevas)
- [ ] RLS habilitado en todas las tablas
- [ ] Foreign keys funcionando correctamente
- [ ] `patient_vital_signs` puede insertar datos (FK a `patients.id` funciona)
- [ ] Test de inserción exitoso
- [ ] Datos de prueba eliminados
- [ ] Políticas RLS verificadas
- [ ] Sin errores en Supabase logs

---

## 🚨 ROLLBACK (EN CASO DE ERROR)

Si algo sale mal, puedes hacer rollback:

```sql
-- SOLO SI NECESITAS REVERTIR LA MIGRACIÓN

-- Drop tables en orden inverso (respetando foreign keys)
DROP TABLE IF EXISTS public.medical_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patient_care_team CASCADE;
DROP TABLE IF EXISTS public.company_members CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- O restaurar desde backup en Supabase Dashboard
```

**IMPORTANTE:** Solo ejecuta rollback si algo está realmente roto. Las migraciones están diseñadas para ser seguras.

---

## 📊 MÉTRICAS DE ÉXITO

Después de la migración, deberías ver:

| Métrica | Antes | Después |
|---------|-------|---------|
| Tablas en producción | 7 | 14 |
| Alineamiento con Glosario | 15% | 65% |
| FK rotos | 1 (patient_vital_signs) | 0 |
| HIPAA compliance | 30% | 60% |

---

## 📝 LOGGING

Documenta el resultado de la migración:

```bash
# Crear log de migración
cat > /home/edu/Autamedica/MIGRATION_LOG_20251008.md << 'EOF'
# Migration Log - 2025-10-08

## Migration: 20251008_core_medical_tables.sql

**Started:** [TIMESTAMP]
**Completed:** [TIMESTAMP]
**Status:** [SUCCESS/FAILED]

### Tables Created:
- [ ] companies
- [ ] doctors
- [ ] patients
- [ ] company_members
- [ ] patient_care_team
- [ ] appointments
- [ ] medical_records

### Issues Found:
- None / [Describe issues]

### Rollback Required:
- No / Yes - [Reason]

### Next Steps:
1. Add Community types to GLOSARIO_MAESTRO.md
2. Generate TypeScript types from database
3. Create React hooks for new tables
EOF
```

---

**Autor:** Claude Code
**Fecha:** 2025-10-08
**Siguiente revisión:** Después de aplicar migración
