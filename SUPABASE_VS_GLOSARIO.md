# 🔍 COMPARACIÓN: SUPABASE SCHEMA vs GLOSARIO_MAESTRO.md

**Fecha:** 2025-10-08
**Análisis:** Alineamiento entre base de datos y contratos TypeScript

---

## 🎯 RESUMEN EJECUTIVO

### Estado de Alineamiento
- **Tablas en Producción:** 7 tablas
- **Entidades en Glosario:** 190+ tipos TypeScript (3,526 líneas)
- **Alineamiento:** ~15% (BAJO)
- **Conclusión:** ⚠️ Desincronización significativa

### Prioridades de Migración
1. **Patients** - Tipo Patient definido, tabla en backup
2. **Doctors** - Tipo Doctor definido, tabla en backup
3. **Appointments** - Tipo Appointment definido, tabla en backup
4. **Medical Records** - Tipos médicos definidos, tablas en backup

---

## 📊 ANÁLISIS POR ENTIDAD

### ✅ **ALINEADOS** (Implementados en Producción)

#### 1. Profiles (Auth + Roles)
**Supabase:**
- Tabla: `public.profiles`
- Campos: id, email, role, portal, full_name, phone, avatar_url, metadata

**Glosario:**
```typescript
// Roles definidos
export type UserRole = 'patient' | 'doctor' | 'company' | 'admin';

// Portales definidos  
export type Portal = 'patients' | 'doctors' | 'companies' | 'admin';
```

**Alineamiento:** ✅ 95%
- Roles match perfectamente
- Portales match perfectamente
- Falta: `organization_id` en glosario

---

#### 2. Vital Signs
**Supabase:**
- Tabla: `public.patient_vital_signs`
- Campos: systolic_bp, diastolic_bp, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight_kg, height_cm

**Glosario:**
```typescript
export interface VitalSigns {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface BodyMeasurements {
  height?: number;
  weight?: number;
  bmi?: number;
}
```

**Alineamiento:** ✅ 90%
- Campos médicos match
- Nomenclatura diferente: `heart_rate` vs `pulse`
- Mediciones separadas en glosario vs unified en DB

---

#### 3. Community Feature
**Supabase:**
- Tablas: `community_groups`, `community_posts`, `post_reactions`, `group_memberships`

**Glosario:**
```typescript
// NO EXISTE en glosario actual
```

**Alineamiento:** ❌ 0%
- Feature implementado en DB pero NO documentado en glosario
- **ACCIÓN REQUERIDA:** Agregar tipos Community al glosario

---

### ⚠️ **PARCIALMENTE ALINEADOS** (Tablas en Backup)

#### 4. Patients
**Supabase (Backup):**
- Tabla: `public.patients`
- Campos: id, user_id, dni, birth_date, gender, blood_type, height_cm, weight_kg
- JSONB: emergency_contact, medical_history, allergies, medications, insurance_info

**Glosario:**
```typescript
export interface Patient {
  id: PatientId;
  firstName: string;
  lastName: string;
  dateOfBirth: ISODateString;
  gender: Gender;
  bloodType?: BloodType;
  
  contactInfo: ContactInfo;
  emergencyContact?: EmergencyContact;
  
  medicalHistory: MedicalHistory;
  allergies: Allergy[];
  medications: Medication[];
  
  insurance?: InsuranceInfo;
}

export interface MedicalHistory {
  conditions: Condition[];
  surgeries: Surgery[];
  familyHistory: FamilyHistoryEntry[];
}
```

**Alineamiento:** ⚠️ 70%
- Campos básicos alineados
- Glosario más detallado (types vs JSONB)
- Falta: `company_id` en glosario
- **ACCIÓN:** Migrar tabla patients a producción

---

#### 5. Doctors
**Supabase (Backup):**
- Tabla: `public.doctors`
- Campos: id, user_id, license_number, specialty, subspecialty, years_experience, consultation_fee
- JSONB: education, certifications, schedule, accepted_insurance

**Glosario:**
```typescript
export interface Doctor {
  id: DoctorId;
  firstName: string;
  lastName: string;
  
  medicalLicense: MedicalLicense;
  specialty: MedicalSpecialty;
  subspecialties: MedicalSubspecialty[];
  
  education: Education[];
  certifications: Certification[];
  
  schedule: Schedule;
  consultationFee?: Money;
  acceptedInsurance: InsuranceProvider[];
}

export interface MedicalLicense {
  licenseNumber: string;
  province: string;
  country: string;
  status: LicenseStatus;
  issuedDate: ISODateString;
  expiryDate?: ISODateString;
}

export type MedicalSpecialty = 
  | 'Cardiología'
  | 'Pediatría'
  | 'Oncología'
  // ... 50+ especialidades
```

**Alineamiento:** ⚠️ 75%
- Campos core alineados
- Glosario tiene tipos explícitos vs JSONB genérico
- Catálogos de especialidades en glosario (~50 tipos)
- **ACCIÓN:** Migrar tabla doctors a producción

---

#### 6. Appointments
**Supabase (Backup):**
- Tabla: `public.appointments`
- Status: scheduled, confirmed, completed, cancelled
- Types: consultation, follow_up, emergency

**Glosario:**
```typescript
export interface Appointment {
  id: AppointmentId;
  patientId: PatientId;
  doctorId: DoctorId;
  
  scheduledDate: ISODateString;
  scheduledTime: TimeHHmm;
  duration: number;
  
  type: AppointmentType;
  status: AppointmentStatus;
  
  reason?: string;
  notes?: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentType =
  | 'first_consultation'
  | 'follow_up'
  | 'emergency'
  | 'telemedicine'
  | 'home_visit';
```

**Alineamiento:** ⚠️ 85%
- Estados core match
- Tipos core match
- Glosario más exhaustivo (no_show, telemedicine)
- **ACCIÓN:** Migrar tabla appointments a producción

---

### ❌ **NO IMPLEMENTADOS** (Solo en Glosario)

#### 7. Medical Records
**Supabase:** Tabla en backup con HIPAA compliance

**Glosario (Extracto):**
```typescript
export interface MedicalRecord {
  id: MedicalRecordId;
  patientId: PatientId;
  doctorId: DoctorId;
  
  recordType: MedicalRecordType;
  recordDate: ISODateString;
  
  diagnosis: Diagnosis[];
  treatmentPlan?: TreatmentPlan;
  prescriptions: Prescription[];
  labResults?: LabResult[];
  
  securityLevel: SecurityLevel;
  accessLog: AccessLog[];
}

export interface Diagnosis {
  code: ICD10Code;
  description: string;
  severity: Severity;
  diagnosedDate: ISODateString;
}

export interface Prescription {
  medication: Medication;
  dosage: string;
  frequency: string;
  duration: number;
  instructions?: string;
}
```

**Alineamiento:** ❌ 0%
- Tipos complejos definidos en glosario
- Tabla básica en backup
- **ACCIÓN:** Implementar medical_records en producción con tipos del glosario

---

#### 8. Telemedicine
**Supabase:** 5 tablas en backup (calls, sessions, recordings)

**Glosario:**
```typescript
export interface TelemedicineSession {
  id: SessionId;
  patientId: PatientId;
  doctorId: DoctorId;
  
  roomId: string;
  status: SessionStatus;
  
  startTime?: ISODateString;
  endTime?: ISODateString;
  
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
  
  recording?: Recording;
}

export type SessionStatus =
  | 'waiting'
  | 'connecting'
  | 'active'
  | 'completed'
  | 'failed';
```

**Alineamiento:** ⚠️ 40%
- Concepto definido en glosario
- Implementación básica en backup
- Falta LiveKit/Cloudflare integration types
- **ACCIÓN:** Sincronizar tipos con implementación real

---

## 🔧 GAPS IDENTIFICADOS

### 1. **Community Feature NO en Glosario** (CRÍTICO)
**Problema:** 4 tablas implementadas sin tipos TypeScript
**Impacto:** Código frontend sin type safety
**Solución:**
```typescript
// Agregar al GLOSARIO_MAESTRO.md
export interface CommunityGroup {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  memberCount: number;
  postCount: number;
  visibility: 'public' | 'private';
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
}
```

---

### 2. **Tablas Core en Backup** (ALTO)
**Problema:** Patients, Doctors, Appointments en backup
**Impacto:** No se pueden insertar vital signs (FK rotos)
**Solución:** Aplicar migraciones desde backup

---

### 3. **JSONB vs Typed Structures** (MEDIO)
**Problema:** Glosario usa tipos explícitos, DB usa JSONB genérico

**Ejemplo:**
```typescript
// Glosario
export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  country: string;
}

// Supabase
education JSONB  -- Sin validación
```

**Recomendación:** Crear JSON schemas de validación en Supabase

---

### 4. **Catálogos vs Enums** (BAJO)
**Problema:** Glosario tiene 50+ especialidades médicas como union types
**Supabase:** Texto libre

**Solución:** Crear tabla catálogo de especialidades

---

## 📋 PLAN DE ALINEAMIENTO

### Fase 1: Documentar lo Existente (INMEDIATO)
```bash
# 1. Agregar tipos Community al glosario
# 2. Validar contratos con pnpm docs:validate
# 3. Generar types desde database schema
```

### Fase 2: Migrar Tablas Core (ESTA SEMANA)
```bash
# 1. Aplicar patients, doctors, appointments desde backup
# 2. Verificar FKs de patient_vital_signs
# 3. Test de inserción de datos
```

### Fase 3: Implementar Medical Records (2 SEMANAS)
```bash
# 1. Migrar tabla medical_records
# 2. Agregar HIPAA compliance (encriptación, auditoría)
# 3. Implementar access control granular
```

### Fase 4: Sincronizar Tipos Avanzados (1 MES)
```bash
# 1. JSON schemas para JSONB fields
# 2. Tablas catálogo (especialidades, medicamentos)
# 3. Validación automática con Zod
```

---

## 🎯 MÉTRICAS DE ALINEAMIENTO

### Por Categoría
| Categoría | Glosario | Supabase | Alineamiento |
|-----------|----------|----------|--------------|
| Auth & Profiles | ✅ | ✅ | 95% |
| Vital Signs | ✅ | ✅ | 90% |
| Community | ❌ | ✅ | 0% |
| Patients | ✅ | ⚠️ | 70% |
| Doctors | ✅ | ⚠️ | 75% |
| Appointments | ✅ | ⚠️ | 85% |
| Medical Records | ✅ | ❌ | 0% |
| Telemedicine | ✅ | ⚠️ | 40% |

### Resumen
- **Totalmente Alineado:** 2/8 categorías (25%)
- **Parcialmente Alineado:** 4/8 categorías (50%)
- **No Alineado:** 2/8 categorías (25%)

---

## ✅ RECOMENDACIONES FINALES

### Prioridad 1 (Esta Semana)
1. Agregar tipos Community al GLOSARIO_MAESTRO.md
2. Migrar tablas patients, doctors, appointments desde backup
3. Validar FKs y RLS policies

### Prioridad 2 (Próximas 2 Semanas)
4. Implementar medical_records con HIPAA
5. Crear JSON schemas para JSONB fields
6. Sincronizar tipos de telemedicine

### Prioridad 3 (Próximo Mes)
7. Crear tablas catálogo (especialidades, medicamentos)
8. Implementar validación automática con Zod
9. Agregar tests de integración DB ↔ Types

---

**Documento generado por:** Claude Code  
**Fecha:** 2025-10-08  
**Próxima revisión:** Después de migrar tablas core
