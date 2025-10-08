# ✅ Migración TypeScript-Aligned Completada

**Fecha:** 2025-10-08
**Proyecto:** AutaMedica
**Migración:** `typescript_aligned_fixed`
**Estado:** ✅ Exitosa

---

## 🎯 Objetivo

Alinear el schema de la base de datos PostgreSQL/Supabase con las interfaces TypeScript definidas en `packages/types/src/entities/`, asegurando consistencia entre el backend y el frontend.

---

## 📝 Cambios Aplicados

### 1. Tabla `profiles` ⚙️

**Nuevas columnas agregadas:**
```sql
- first_name (text)
- last_name (text)
- locale (text) DEFAULT 'es-AR'
- timezone (text) DEFAULT 'America/Argentina/Buenos_Aires'
- email_verified (boolean) DEFAULT false
- last_login_at (timestamptz)
```

**Roles actualizados:**
```sql
CHECK (role IN (
  'patient',
  'doctor',
  'company',
  'company_admin',
  'organization_admin',
  'admin',
  'platform_admin'
))
```

**Portales actualizados:**
```sql
CHECK (portal IN ('pacientes', 'medico', 'empresa', 'admin'))
```

**Migración de datos:**
- ✅ `full_name` → `first_name` + `last_name` (automático)

---

### 2. Tabla `patients` 👤

**Nuevas columnas agregadas:**
```sql
- first_name (text)
- last_name (text)
- email (text)
- phone (text)
- date_of_birth (timestamptz)
- address (jsonb) -- PatientAddress interface
```

**Índices creados:**
- `idx_patients_email` - Para búsquedas rápidas por email

**Comentarios:**
- `address`: PatientAddress: {street, city, state, zipCode, country}

**Migración de datos:**
- ✅ Email copiado desde `profiles.email` cuando NULL

---

### 3. Tabla `doctors` 👨‍⚕️

**Nuevas columnas agregadas:**
```sql
- first_name (text)
- last_name (text)
- email (text)
- phone (text)
- specialties (jsonb) DEFAULT '[]'  -- Array de specialty IDs
- is_active (boolean) DEFAULT true
- experience (jsonb)  -- Array de DoctorExperience
```

**Índices creados:**
- `idx_doctors_specialties` - GIN index para búsquedas en JSONB array

**Migración de datos:**
- ✅ `specialty` (singular) → `specialties` (array)

**Comentarios:**
- `specialties`: Array of specialty IDs
- `experience`: Array of DoctorExperience: {institution, position, startDate, endDate?, description?}

---

### 4. Tabla `patient_care_team` 🏥

**Nuevas columnas agregadas:**
```sql
- assigned_at (timestamptz) DEFAULT NOW()
- assigned_by (uuid) REFERENCES doctors(id)
```

**Constraints actualizados:**
```sql
CHECK (role IN ('primary', 'specialist', 'consultant', 'emergency'))
```

**Foreign keys agregados:**
- `assigned_by` → `doctors(id)`

---

### 5. Tabla `appointments` 📅

**Nuevas columnas agregadas:**
```sql
- deleted_at (timestamptz)  -- Soft delete support
```

**Índices creados:**
- `idx_appointments_deleted` - Partial index WHERE deleted_at IS NULL

**Constraints actualizados:**
```sql
-- Tipo de cita
CHECK (type IN ('consultation', 'follow_up', 'emergency', 'telemedicine', 'lab_test', 'checkup'))

-- Status de cita
CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no_show'))
```

**Políticas agregadas:**
- `appointments_update_auth` - Permitir updates a pacientes y doctores

**Grants:**
- ✅ DELETE permission agregado para authenticated users

---

## 🔐 Seguridad (RLS)

### Políticas Actualizadas

#### Patients
```sql
✅ patients_select_own - Usuarios ven solo su propio perfil
✅ patients_select_care_team - Doctores ven pacientes asignados
```

#### Appointments
```sql
✅ appointments_update_auth - Pacientes y doctores pueden actualizar citas propias
```

---

## 📊 Resumen de Tablas Actualizadas

| Tabla | Columnas Nuevas | Índices | Constraints | Políticas |
|-------|-----------------|---------|-------------|-----------|
| **profiles** | 6 | 0 | 2 | 0 |
| **patients** | 6 | 1 | 0 | 0 |
| **doctors** | 7 | 1 | 0 | 0 |
| **patient_care_team** | 2 | 0 | 1 | 0 |
| **appointments** | 1 | 1 | 2 | 1 |
| **TOTAL** | **22** | **3** | **5** | **1** |

---

## 🎨 Alineación TypeScript

### Interfaces Alineadas

#### `Patient` (packages/types/src/entities/patient.ts)
```typescript
interface Patient {
  id: string;
  userId: string;
  firstName: string;     // ✅ patient.first_name
  lastName: string;      // ✅ patient.last_name
  email: string;         // ✅ patient.email
  phone?: string;        // ✅ patient.phone
  dateOfBirth?: Date;    // ✅ patient.date_of_birth
  gender?: Gender;       // ✅ patient.gender
  address?: PatientAddress;  // ✅ patient.address (jsonb)
  emergencyContact?: EmergencyContact;  // ✅ patient.emergency_contact (jsonb)
  createdAt: Date;       // ✅ patient.created_at
  updatedAt: Date;       // ✅ patient.updated_at
}
```

#### `Doctor` (packages/types/src/entities/doctor.ts)
```typescript
interface Doctor {
  id: string;
  userId: string;
  firstName: string;     // ✅ doctor.first_name
  lastName: string;      // ✅ doctor.last_name
  email: string;         // ✅ doctor.email
  phone?: string;        // ✅ doctor.phone
  licenseNumber: string; // ✅ doctor.license_number
  specialties: string[]; // ✅ doctor.specialties (jsonb array)
  bio?: string;          // ✅ doctor.bio
  education?: DoctorEducation[];  // ✅ doctor.education (jsonb)
  experience?: DoctorExperience[];  // ✅ doctor.experience (jsonb)
  isActive: boolean;     // ✅ doctor.is_active
  createdAt: Date;       // ✅ doctor.created_at
  updatedAt: Date;       // ✅ doctor.updated_at
}
```

#### `Appointment` (packages/types/src/entities/appointment.ts)
```typescript
interface Appointment {
  id: string;
  patientId: string;     // ✅ appointments.patient_id
  doctorId: string;      // ✅ appointments.doctor_id
  startTime: Date;       // ✅ appointments.start_time
  endTime?: Date;        // ✅ appointments.end_time
  durationMinutes?: number;  // ✅ appointments.duration_minutes
  type: AppointmentType; // ✅ appointments.type
  status: AppointmentStatus;  // ✅ appointments.status
  notes?: string;        // ✅ appointments.notes
  location?: string;     // ✅ appointments.location
  meetingUrl?: string;   // ✅ appointments.meeting_url
  createdBy?: string;    // ✅ appointments.created_by
  createdAt: Date;       // ✅ appointments.created_at
  updatedAt: Date;       // ✅ appointments.updated_at
  deletedAt?: Date;      // ✅ appointments.deleted_at (NUEVO)
}
```

---

## ✅ Beneficios de la Alineación

### 1. Type Safety End-to-End 🛡️
- Frontend y backend usan exactamente las mismas estructuras
- Errores de tipo detectados en tiempo de compilación
- Autocompletado perfecto en todo el código

### 2. Consistencia de Nombres 📝
- Nomenclatura coherente: `camelCase` en TS → `snake_case` en SQL
- Sin ambigüedades entre frontend y backend
- Facilita el onboarding de nuevos desarrolladores

### 3. Migraciones Seguras 🔒
- Soft deletes implementados (`deleted_at`)
- Datos existentes migrados automáticamente
- Políticas RLS actualizadas y consistentes

### 4. Mejor DX (Developer Experience) 💻
- Generación automática de TypeScript types desde DB
- Validación de schemas en CI/CD
- Menos bugs relacionados con tipos

---

## 🚀 Próximos Pasos

### 1. Generar TypeScript Types ⚡ (PRIORITARIO)

**Comando:**
```bash
# Via Supabase CLI
supabase gen types typescript --project-id ewpsepaieakqbywxnidu \
  > packages/types/src/supabase/database.types.ts

# O via MCP
mcp supabase generate_typescript_types --project-id ewpsepaieakqbywxnidu
```

**Resultado esperado:**
```typescript
// packages/types/src/supabase/database.types.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; first_name: string; ... }
        Insert: { ... }
        Update: { ... }
      }
      patients: { ... }
      doctors: { ... }
      // ... todas las tablas con tipos exactos
    }
  }
}
```

---

### 2. Actualizar Mappers 🔄

**Ubicación:** `packages/types/src/entities/`

Actualizar los mappers para usar los nuevos campos:

```typescript
// patient.mapper.ts
export function mapDbPatientToPatient(dbPatient: DbPatient): Patient {
  return {
    id: dbPatient.id,
    userId: dbPatient.user_id,
    firstName: dbPatient.first_name,  // ✅ Usar nuevo campo
    lastName: dbPatient.last_name,    // ✅ Usar nuevo campo
    email: dbPatient.email,           // ✅ Usar nuevo campo
    phone: dbPatient.phone,           // ✅ Usar nuevo campo
    dateOfBirth: dbPatient.date_of_birth ? new Date(dbPatient.date_of_birth) : undefined,
    gender: dbPatient.gender,
    address: dbPatient.address,       // ✅ Ya es JSONB
    emergencyContact: dbPatient.emergency_contact,
    createdAt: new Date(dbPatient.created_at),
    updatedAt: new Date(dbPatient.updated_at),
  };
}
```

---

### 3. Actualizar Queries en Hooks 📊

**Ejemplo:** `packages/hooks/src/usePatients.ts`

```typescript
// Antes (campos antiguos)
const { data } = await supabase
  .from('patients')
  .select('id, user_id, dni, birth_date')

// Después (campos nuevos + mapeo)
const { data } = await supabase
  .from('patients')
  .select('id, user_id, first_name, last_name, email, phone, date_of_birth, address')

const patients = data.map(mapDbPatientToPatient);
```

---

### 4. Validar con Zod 🔍

**Ubicación:** `packages/types/src/validators/`

Crear validadores Zod alineados:

```typescript
import { z } from 'zod';

export const PatientSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: PatientAddressSchema.optional(),
  emergencyContact: EmergencyContactSchema.optional(),
});
```

---

### 5. Testing de Migración 🧪

**Tests a ejecutar:**

```bash
# 1. Verificar que todas las columnas existen
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'patients';

# 2. Verificar constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

# 3. Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'doctors';

# 4. Test de inserción con nuevos campos
INSERT INTO patients (user_id, first_name, last_name, email)
VALUES ('uuid-here', 'Juan', 'Pérez', 'juan@example.com');
```

---

## 📌 Comandos Útiles

### Verificar Schema Actual

```bash
# Via psql
PGPASSWORD='password' psql -h host -p 6543 -U postgres.project -d postgres \
  -c "\d+ patients"

# Via Supabase CLI
supabase db diff
```

### Rollback (si necesario)

```bash
# Crear migración de rollback
supabase migration new rollback_typescript_alignment

# SQL de rollback:
ALTER TABLE profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_name;
-- ... etc
```

---

## 📚 Referencias

### Archivos Modificados

```
✅ supabase/migrations/20251008_core_medical_tables_v2.sql (referencia original)
✅ Migración aplicada: typescript_aligned_fixed
```

### Documentación TypeScript

- `packages/types/src/entities/patient.ts`
- `packages/types/src/entities/doctor.ts`
- `packages/types/src/entities/appointment.ts`
- `packages/types/src/entities/profiles.ts`

### Documentación Supabase

- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- TypeScript Types: https://supabase.com/docs/guides/api/generating-types
- JSONB in PostgreSQL: https://www.postgresql.org/docs/current/datatype-json.html

---

## ✅ Checklist de Completitud

- [x] Migración aplicada exitosamente
- [x] Nuevas columnas agregadas a todas las tablas
- [x] Constraints actualizados
- [x] Índices creados para performance
- [x] Políticas RLS actualizadas
- [x] Comentarios SQL agregados
- [x] Datos existentes migrados
- [ ] TypeScript types generados (SIGUIENTE PASO)
- [ ] Mappers actualizados
- [ ] Hooks actualizados
- [ ] Tests de migración ejecutados

---

**Migración completada por:** Claude Code via Supabase MCP
**Siguiente acción recomendada:** Generar TypeScript types
**Comando:** `supabase gen types typescript --project-id ewpsepaieakqbywxnidu`
