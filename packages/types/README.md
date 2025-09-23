# 🏗️ @autamedica/types

> **Contratos TypeScript médicos centralizados** para toda la plataforma AutaMedica.
> Tipos médicos especializados, branded types y discriminated unions para consistencia de datos.

## 🎯 **Características**

- 🏥 **Tipos médicos especializados** (PatientProfile, VitalSigns, MedicalRecord)
- 🔖 **Branded types** para IDs únicos (PatientId, DoctorId, SessionId)
- 📊 **APIResponse discriminated union** para manejo consistente de respuestas
- 📅 **ISODateString** para fechas con timezone médico
- ✅ **Validación Zod** integrada para runtime type checking
- 🔐 **Tipos de autenticación** médica y roles

## 📦 **Instalación**

```bash
pnpm add @autamedica/types
```

## 🚀 **Uso Básico**

### **Tipos Médicos Core**
```typescript
import type {
  PatientProfile,
  DoctorProfile,
  MedicalRecord,
  VitalSigns,
  Prescription
} from '@autamedica/types'

// Perfil completo de paciente
const patient: PatientProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000' as PatientId,
  first_name: 'María',
  last_name: 'González',
  full_name: 'María González',
  age: 32,
  date_of_birth: '1992-03-15',
  gender: 'female',
  blood_type: 'O+',
  allergies: ['penicilina', 'mariscos'],
  chronic_conditions: ['diabetes tipo 2'],
  insurance_provider: 'Seguros Médicos Plus',
  created_at: '2025-01-01T00:00:00.000Z' as ISODateString,
  updated_at: '2025-01-01T00:00:00.000Z' as ISODateString
}
```

### **Branded Types**
```typescript
import type { UUID, PatientId, DoctorId, SessionId } from '@autamedica/types'

// IDs únicos con type safety
const patientId: PatientId = '550e8400-e29b-41d4-a716-446655440000' as PatientId
const doctorId: DoctorId = '660f9500-f30c-52e5-b827-556766550001' as DoctorId
const sessionId: SessionId = '770fa600-041d-63f6-c938-667877660002' as SessionId

// ❌ Error de compilación - tipos incompatibles
// const wrongAssignment: PatientId = doctorId
```

### **APIResponse Pattern**
```typescript
import type { APIResponse } from '@autamedica/types'

// Respuesta consistente para todas las APIs
type PatientAPIResponse = APIResponse<PatientProfile>

const successResponse: PatientAPIResponse = {
  success: true,
  data: patient,
  message: 'Paciente encontrado exitosamente'
}

const errorResponse: PatientAPIResponse = {
  success: false,
  error: {
    code: 'PATIENT_NOT_FOUND',
    message: 'Paciente no encontrado',
    details: 'El ID proporcionado no existe en la base de datos'
  }
}
```

## 🩺 **Tipos Médicos Especializados**

### **Signos Vitales**
```typescript
import type { VitalSigns } from '@autamedica/types'

const vitals: VitalSigns = {
  id: crypto.randomUUID() as UUID,
  patient_id: patientId,
  recorded_at: new Date().toISOString() as ISODateString,
  blood_pressure: {
    systolic: 120,
    diastolic: 80,
    unit: 'mmHg'
  },
  heart_rate: {
    value: 72,
    unit: 'bpm'
  },
  temperature: {
    value: 36.5,
    unit: 'celsius'
  },
  respiratory_rate: {
    value: 16,
    unit: 'breaths_per_minute'
  },
  oxygen_saturation: {
    value: 98,
    unit: 'percentage'
  }
}
```

### **Historial Médico**
```typescript
import type { MedicalRecord } from '@autamedica/types'

const record: MedicalRecord = {
  id: crypto.randomUUID() as UUID,
  patient_id: patientId,
  doctor_id: doctorId,
  session_id: sessionId,
  record_type: 'consultation',
  chief_complaint: 'Dolor de cabeza persistente',
  history_of_present_illness: 'Paciente refiere dolor de cabeza...',
  physical_examination: 'Paciente alerta y orientado...',
  assessment: 'Cefalea tensional probable',
  plan: 'Reposo, hidratación, ibuprofeno 400mg c/8h',
  created_at: new Date().toISOString() as ISODateString,
  updated_at: new Date().toISOString() as ISODateString
}
```

### **Prescripciones**
```typescript
import type { Prescription } from '@autamedica/types'

const prescription: Prescription = {
  id: crypto.randomUUID() as UUID,
  patient_id: patientId,
  doctor_id: doctorId,
  medication_name: 'Ibuprofeno',
  dosage: '400mg',
  frequency: 'cada 8 horas',
  duration: '7 días',
  instructions: 'Tomar con alimentos',
  prescribed_at: new Date().toISOString() as ISODateString,
  status: 'active'
}
```

## 🔐 **Tipos de Autenticación**

### **Roles de Usuario**
```typescript
import type { UserRole, UserProfile } from '@autamedica/types'

// Roles médicos disponibles
const roles: UserRole[] = [
  'patient',           // Paciente
  'doctor',           // Médico general
  'specialist',       // Médico especialista
  'nurse',           // Enfermero/a
  'admin',           // Administrador del sistema
  'company_admin',   // Administrador empresarial
  'platform_admin'   // Administrador de plataforma
]

const userProfile: UserProfile = {
  id: crypto.randomUUID() as UUID,
  email: 'doctor@autamedica.com',
  role: 'doctor',
  first_name: 'Dr. Juan',
  last_name: 'Pérez',
  verified: true,
  created_at: new Date().toISOString() as ISODateString
}
```

## 📅 **Manejo de Fechas Médicas**

### **ISODateString**
```typescript
import type { ISODateString } from '@autamedica/types'

// Fechas con timezone médico
const appointmentDate: ISODateString = '2025-01-15T09:30:00.000Z' as ISODateString
const birthDate: ISODateString = '1985-07-22T00:00:00.000Z' as ISODateString

// Utilidades de fecha médica
function calculateAge(birthDate: ISODateString): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}
```

## 🧪 **Validación con Zod**

```typescript
import { patientProfileSchema, vitalSignsSchema } from '@autamedica/types/schemas'

// Validación en runtime
const validatePatient = (data: unknown): PatientProfile => {
  return patientProfileSchema.parse(data)
}

const validateVitals = (data: unknown): VitalSigns => {
  return vitalSignsSchema.parse(data)
}

// Uso en APIs
try {
  const patient = validatePatient(requestBody)
  // Procesar paciente validado
} catch (error) {
  // Manejar error de validación
  console.error('Datos de paciente inválidos:', error)
}
```

## 🏗️ **Arquitectura de Tipos**

### **Jerarquía de Dependencias**
```
Base Types (UUID, ISODateString)
    ↓
Medical Entities (Patient, Doctor, etc.)
    ↓
Complex Types (MedicalRecord, Prescription)
    ↓
API Types (APIResponse, Pagination)
    ↓
Application Types (por app específica)
```

### **Exports Principales**
```typescript
// Core medical types
export type {
  PatientProfile,
  DoctorProfile,
  VitalSigns,
  MedicalRecord,
  Prescription,
  AIAnalysis
}

// Branded types
export type {
  UUID,
  PatientId,
  DoctorId,
  SessionId,
  ISODateString
}

// API types
export type {
  APIResponse,
  PaginatedResponse,
  ErrorResponse
}

// Auth types
export type {
  UserRole,
  UserProfile,
  AuthSession
}

// Validation schemas
export {
  patientProfileSchema,
  vitalSignsSchema,
  medicalRecordSchema,
  prescriptionSchema
} from './schemas'
```

## 🔧 **Scripts**

```bash
pnpm build        # Compilar TypeScript
pnpm type-check   # Verificar tipos
pnpm lint         # ESLint con reglas médicas
pnpm test         # Tests de validación
```

## 📚 **Documentación Completa**

- **Glosario Maestro**: Ver `docs/GLOSARIO_MAESTRO.md` para documentación completa
- **Contratos API**: Todos los tipos están documentados en el glosario
- **Validaciones**: Esquemas Zod incluidos para runtime validation
- **Ejemplos**: Casos de uso médicos reales en tests

## 📄 **Licencia**

Proprietary - AutaMedica Healthcare Platform © 2025