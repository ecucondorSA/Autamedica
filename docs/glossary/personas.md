# Glosario Personas - Entidades de Usuarios

## 🎯 Propósito

Tipos y contratos para todas las entidades de personas en Autamedica: pacientes, médicos, usuarios base.

---

## Usuario Base

```typescript
export interface User {
  id: UUID;
  email: string;
  role: "admin" | "staff" | "doctor" | "patient";
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

---

## Paciente

```typescript
export interface Patient {
  id: PatientId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: ISODateString;
  medicalRecordNumber: string;
  emergencyContact?: EmergencyContact;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}
```

### Utilidades de Pacientes

```typescript
// Cálculos de salud y riesgo
export const calculateBMI: (heightCm: number, weightKg: number) => number;
export const calculateAge: (birthDate: ISODateString) => number;

// Evaluación de riesgo médico
export const calculateRiskLevel: (patient: Patient) => RiskLevel;
export const hasActiveAllergies: (patient: Patient) => boolean;
export const isHighRiskPatient: (patient: Patient) => boolean;
export const requiresSpecializedCare: (patient: Patient) => boolean;

// Elegibilidad de servicios
export const canReceiveTelemedicine: (patient: Patient) => boolean;

// Utilidades de perfiles de pacientes
export const generatePatientDisplayName: (patient: Patient) => string;
export const createPatientPublicProfile: (patient: Patient) => PatientPublicProfile;
export const createMedicalView: (patient: Patient) => PatientMedicalView;
export const extractPatientPrivateData: (patient: Patient) => PatientPrivateData;

// Validaciones de cobertura
export const isPublicHealthcareEligible: (patient: Patient) => boolean;
export const isPAMIEligible: (patient: Patient) => boolean;
export const hasInsuranceCoverage: (patient: Patient, treatment: string) => boolean;
```

---

## Doctor

```typescript
export interface Doctor {
  id: DoctorId;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

### Sistema de Especialidades Médicas

```typescript
// Catálogos de especialidades y certificaciones
export const MEDICAL_SPECIALTIES: readonly MedicalSpecialty[];
export const SUBSPECIALTIES: readonly MedicalSubspecialty[];
export const CERTIFICATION_TYPES: readonly CertificationType[];

// Estados de licencias médicas
export const LICENSE_STATUS: readonly LicenseStatus[];

// Validators de especialidades
export const isValidSpecialtyCode: (code: string) => boolean;
export const isValidSubspecialtyCode: (code: string) => boolean;

// Validators de licencias médicas
export const isValidMedicalLicense: (license: string) => boolean;
export const isActiveLicense: (license: MedicalLicense) => boolean;
export const isValidCertification: (cert: Certification) => boolean;

// Utilidades de especialidades
export const getSpecialtiesRequiring: (requirement: string) => MedicalSpecialty[];
export const getAvailableSubspecialties: (specialtyCode: string) => MedicalSubspecialty[];
export const getSpecialtiesByCategory: (category: string) => MedicalSpecialty[];
export const createBasicSpecialty: (code: string, name: string) => MedicalSpecialty;

// Utilidades de licencias médicas
export const formatMedicalLicense: (license: string) => string;
export const extractProvinceFromLicense: (license: string) => string;
export const createMedicalLicense: (province: string, number: string) => MedicalLicense;

// Validaciones de práctica médica
export const canPracticeSpecialty: (doctor: Doctor, specialty: string) => boolean;
export const canPracticeInArgentina: (license: MedicalLicense) => boolean;
export const isDoctorLicenseActive: (doctor: Doctor) => boolean;
export const isDoctorProfileComplete: (doctor: Doctor) => boolean;

// Cálculos médicos
export const calculateTotalTrainingYears: (doctor: Doctor) => number;
export const calculateYearsOfExperience: (doctor: Doctor) => number;

// Utilidades de perfiles
export const generateDisplayName: (firstName: string, lastName: string) => string;
```

### Validaciones Médicas y Profesionales

```typescript
// Validaciones de práctica médica
export const acceptsInsurancePlan: (doctor: Doctor, planId: string) => boolean;
export const isAvailableOnDay: (doctor: Doctor, date: ISODateString) => boolean;

// Validaciones de datos médicos
export const isValidTimeHHmm: (time: string) => boolean;
export const isValidDNI: (dni: string) => boolean;
export const isValidDoctorEmail: (email: string) => boolean;
export const isValidDoctorURL: (url: string) => boolean;
export const isValidBloodType: (bloodType: string) => boolean;

// Utilidades de perfiles médicos
export const createPublicProfile: (doctor: Doctor) => DoctorPublicProfile;
export const extractPrivateData: (doctor: Doctor) => DoctorPrivateData;
```

---

## Sistema de Reviews y Ratings

```typescript
// Constantes de configuración de reviews
export const REVIEW_WINDOW_DAYS: number;

// Validaciones de ratings
export const isValidRatingScore: (score: number) => boolean;
export const canSubmitReview: (patient: Patient, doctor: Doctor) => boolean;

// Cálculos de métricas de reviews
export const calculatePatientReviewsScore: (reviews: Review[]) => number;
export const calculateReviewsBreakdown: (reviews: Review[]) => ReviewBreakdown;
export const calculateVolumeScore: (doctor: Doctor) => number;
export const calculateRecognitionScore: (doctor: Doctor) => number;
export const calculateOverallRating: (doctor: Doctor) => number;
export const calculateMonthsActive: (doctor: Doctor) => number;
export const calculateVolumePercentile: (doctor: Doctor) => number;

// Utilidades de reconocimiento
export const isEligibleForRecognition: (doctor: Doctor) => boolean;
export const createRatingDisplay: (rating: number) => RatingDisplay;
export const getRecognitionBadgeText: (level: RecognitionLevel) => string;
```

---

## Sistema de Seguros Argentinos

```typescript
// Catálogo de obras sociales y seguros
export const ARGENTINA_INSURANCE_PROVIDERS: readonly InsuranceProvider[];
```

---

## Cita Médica (Appointment)

```typescript
export interface Appointment {
  id: AppointmentId;
  patientId: PatientId;
  doctorId: DoctorId;
  startTime: ISODateString;
  duration: number; // minutos
  type: "consultation" | "follow-up" | "emergency";
  status:
    | "scheduled"
    | "in-progress"
    | "completed"
    | "cancelled"
    | "no-show"
    | "rescheduled";
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

---

**Última actualización**: 2025-10-04
**Mantenido por**: Sistema de validación automática
