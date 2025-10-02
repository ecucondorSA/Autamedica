# 🩺 Glosario: Salud Preventiva (Screenings Médicos)

Tipos TypeScript para el sistema de screenings preventivos y casos médicos.

---

## PreventiveScreeningId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para screenings preventivos

```typescript
export type PreventiveScreeningId = UUID & {
  readonly __brand: 'PreventiveScreeningId'
};
```

---

## MedicalCaseId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para casos médicos educativos

---

## ScreeningReminderNotificationId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para notificaciones de recordatorio

---

## GenderType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Género objetivo para un screening

**Valores posibles:**
- `'male'` - Hombres
- `'female'` - Mujeres
- `'all'` - Todos los géneros

---

## ScreeningCategoryType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Categoría médica del screening

**Valores posibles:**
- `'cancer_screening'` - Screening de cáncer
- `'cardiovascular'` - Salud cardiovascular
- `'metabolic'` - Salud metabólica
- `'immunization'` - Vacunas e inmunizaciones
- `'vision_hearing'` - Visión y audición
- `'bone_health'` - Salud ósea
- `'mental_health'` - Salud mental
- `'reproductive_health'` - Salud reproductiva
- `'dental'` - Salud dental

---

## ScreeningFrequencyType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Frecuencia recomendada del screening

**Valores posibles:**
- `'one_time'` - Una sola vez
- `'monthly'` - Mensual
- `'every_3_months'` - Trimestral
- `'every_6_months'` - Semestral
- `'annually'` - Anual
- `'every_2_years'` - Cada 2 años
- `'every_3_years'` - Cada 3 años
- `'every_5_years'` - Cada 5 años
- `'every_10_years'` - Cada 10 años

---

## RiskLevelType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Nivel de riesgo del paciente

**Valores posibles:**
- `'low'` - Riesgo bajo
- `'medium'` - Riesgo medio
- `'high'` - Riesgo alto
- `'very_high'` - Riesgo muy alto

---

## ScreeningStatusType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Estado del screening del paciente

**Valores posibles:**
- `'not_started'` - No iniciado
- `'scheduled'` - Agendado
- `'completed'` - Completado
- `'overdue'` - Vencido
- `'not_applicable'` - No aplica

---

## PreventiveScreening

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Definición de un screening preventivo en el catálogo

**Campos principales:**
- `id` - Identificador único
- `name` - Nombre del screening (ej: "Mamografía")
- `category` - Categoría médica
- `description` - Descripción detallada
- `target_gender` - Género objetivo
- `min_age` - Edad mínima (null = sin mínimo)
- `max_age` - Edad máxima (null = sin máximo)
- `recommended_frequency` - Frecuencia recomendada
- `is_mandatory` - Si es obligatorio por normativa
- `estimated_cost_ars` - Costo estimado en pesos argentinos
- `covered_by_public_health` - Si está cubierto por salud pública
- `requires_specialist` - Si requiere especialista
- `preparation_instructions` - Instrucciones de preparación

**Ejemplo:**
```typescript
const mammography: PreventiveScreening = {
  id: '...',
  name: 'Mamografía',
  category: 'cancer_screening',
  description: 'Screening de cáncer de mama mediante rayos X',
  target_gender: 'female',
  min_age: 40,
  max_age: 69,
  recommended_frequency: 'annually',
  is_mandatory: false,
  estimated_cost_ars: 15000,
  covered_by_public_health: true,
  requires_specialist: true,
  preparation_instructions: 'No usar desodorante el día del examen'
};
```

---

## PatientScreening

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Screening asignado a un paciente específico con tracking de estado

**Campos principales:**
- `id` - Identificador único
- `patient_id` - ID del paciente
- `screening_id` - ID del screening en catálogo
- `status` - Estado actual
- `scheduled_date` - Fecha agendada
- `completed_date` - Fecha de realización
- `next_due_date` - Próxima fecha recomendada
- `assigned_doctor_id` - Médico asignado
- `notes` - Notas del paciente
- `result_summary` - Resumen de resultados

---

## RiskFactor

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Factor de riesgo que modifica recomendaciones de screenings

**Campos principales:**
- `id` - Identificador único
- `name` - Nombre del factor de riesgo
- `description` - Descripción detallada
- `category` - Categoría médica afectada
- `increases_risk_for` - IDs de screenings afectados
- `recommended_age_adjustment` - Ajuste de edad (ej: -10 años)
- `frequency_adjustment` - Ajuste de frecuencia

**Ejemplo:**
```typescript
const familyHistoryColonCancer: RiskFactor = {
  id: '...',
  name: 'Historia familiar de cáncer de colon',
  description: 'Padre o hermano con cáncer colorrectal',
  category: 'cancer_screening',
  increases_risk_for: ['colonoscopy'],
  recommended_age_adjustment: -10, // Comenzar 10 años antes
  frequency_adjustment: 'every_5_years' // Más frecuente que lo normal
};
```

---

## PatientRiskFactor

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Factor de riesgo diagnosticado en un paciente

**Campos principales:**
- `id` - Identificador único
- `patient_id` - ID del paciente
- `risk_factor_id` - ID del factor de riesgo
- `severity` - Nivel de severidad
- `diagnosed_date` - Fecha de diagnóstico
- `notes` - Notas adicionales

---

## ScreeningReminderNotification

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Recordatorio automático para un screening pendiente

**Campos principales:**
- `id` - Identificador único
- `patient_screening_id` - ID del screening del paciente
- `patient_id` - ID del paciente
- `reminder_date` - Fecha del recordatorio
- `sent_at` - Timestamp de envío (null = no enviado)
- `message` - Mensaje del recordatorio
- `notification_channel` - Canal de notificación
- `is_read` - Si fue leído

---

## MedicalCase

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Caso médico educativo sobre prevención

**Campos principales:**
- `id` - Identificador único
- `title` - Título del caso
- `category` - Categoría médica
- `description` - Descripción breve
- `target_gender` - Género objetivo
- `target_age_min` - Edad mínima objetivo
- `target_age_max` - Edad máxima objetivo
- `content_sections` - Secciones de contenido
- `related_screenings` - IDs de screenings relacionados
- `related_specialists` - Especialidades relacionadas
- `is_published` - Si está publicado

**Ejemplo:**
```typescript
const breastCancerPrevention: MedicalCase = {
  id: '...',
  title: 'Prevención de Cáncer de Mama después de los 40',
  category: 'cancer_screening',
  description: 'Guía completa sobre screening de cáncer de mama',
  target_gender: 'female',
  target_age_min: 40,
  target_age_max: null,
  content_sections: [
    {
      heading: 'Factores de Riesgo',
      content: '...',
      order: 1
    },
    {
      heading: 'Screenings Recomendados',
      content: '...',
      order: 2
    }
  ],
  related_screenings: ['mammography_id', 'ultrasound_id'],
  related_specialists: ['gynecology', 'radiology'],
  is_published: true
};
```

---

## MedicalCaseSection

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Sección de contenido dentro de un caso médico

**Campos:**
- `heading` - Título de la sección
- `content` - Contenido de la sección
- `order` - Orden de visualización
- `media_url` - URL de imagen o video (opcional)

---

## PatientScreeningWithDetails

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Screening del paciente con información completa del screening y médico

Extiende `PatientScreening` y agrega:
- `screening` - Información completa del screening
- `assigned_doctor` - Información del médico asignado

---

## PreventiveScreeningWithStats

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Screening con estadísticas de uso

Extiende `PreventiveScreening` y agrega:
- `total_patients_assigned` - Total de pacientes asignados
- `completion_rate` - Tasa de completitud (0-100)
- `average_completion_days` - Días promedio para completar

---

## AgeRange

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Rango de edad para recomendaciones

**Campos:**
- `min` - Edad mínima (null = sin límite)
- `max` - Edad máxima (null = sin límite)

---

## ScreeningRecommendation

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Recomendación de screening para un paciente

**Campos:**
- `screening` - Información del screening
- `is_due` - Si está pendiente
- `urgency` - Nivel de urgencia (low/medium/high)
- `reason` - Razón de la recomendación
- `next_due_date` - Próxima fecha recomendada

**Ejemplo:**
```typescript
const recommendation: ScreeningRecommendation = {
  screening: mammography,
  is_due: true,
  urgency: 'high',
  reason: 'Screening vencido - requiere atención',
  next_due_date: '2025-11-01'
};
```

---

## ScreeningCatalogKey

**Package:** `@autamedica/types`
**Tipo:** `type`
**Descripción:** Keys del catálogo de screenings (type-safe)

---

## SCREENING_CATALOG

**Package:** `@autamedica/types`
**Tipo:** `const`
**Descripción:** Catálogo de IDs de screenings conocidos

```typescript
export const SCREENING_CATALOG = {
  // Cáncer
  MAMMOGRAPHY: 'mammography',
  PAP_SMEAR: 'pap_smear',
  HPV_TEST: 'hpv_test',
  COLONOSCOPY: 'colonoscopy',
  PROSTATE_PSA: 'prostate_psa',
  LUNG_CT: 'lung_ct_scan',
  SKIN_EXAM: 'skin_cancer_screening',

  // Cardiovascular
  BLOOD_PRESSURE: 'blood_pressure',
  CHOLESTEROL: 'cholesterol',
  EKG: 'electrocardiogram',

  // Metabólico
  DIABETES: 'diabetes_screening',
  THYROID: 'thyroid_function',

  // Inmunizaciones
  FLU_VACCINE: 'flu_vaccine',
  PNEUMONIA_VACCINE: 'pneumonia_vaccine',
  SHINGLES_VACCINE: 'shingles_vaccine',
  COVID_VACCINE: 'covid_vaccine',

  // Otros
  BONE_DENSITY: 'bone_density',
  VISION_TEST: 'vision_screening',
  HEARING_TEST: 'hearing_screening',
  DENTAL_CHECKUP: 'dental_checkup'
} as const;
```

---

## isScreeningApplicable

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Determina si un screening aplica para un paciente según edad y género

```typescript
function isScreeningApplicable(
  screening: PreventiveScreening,
  patientAge: number,
  patientGender: 'male' | 'female'
): boolean
```

**Ejemplo:**
```typescript
const mammography = { /* ... */, target_gender: 'female', min_age: 40, max_age: 69 };

isScreeningApplicable(mammography, 45, 'female')  // true
isScreeningApplicable(mammography, 35, 'female')  // false (muy joven)
isScreeningApplicable(mammography, 45, 'male')    // false (género no aplica)
```

---

## calculateNextDueDate

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Calcula próxima fecha de screening basada en frecuencia

```typescript
function calculateNextDueDate(
  lastCompletedDate: Date,
  frequency: ScreeningFrequencyType
): Date
```

**Ejemplo:**
```typescript
const lastMammography = new Date('2024-10-01');
const nextDate = calculateNextDueDate(lastMammography, 'annually');
// nextDate = 2025-10-01

const lastColonoscopy = new Date('2020-05-15');
const nextColonoscopy = calculateNextDueDate(lastColonoscopy, 'every_10_years');
// nextColonoscopy = 2030-05-15
```

---

## calculateAge

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Calcula edad actual del paciente desde fecha de nacimiento

```typescript
function calculateAge(birthDate: Date): number
```

**Ejemplo:**
```typescript
const birthDate = new Date('1980-05-15');
const age = calculateAge(birthDate);  // 45 (en 2025)
```

---

## calculateUrgency

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Determina nivel de urgencia basado en días de retraso

```typescript
function calculateUrgency(daysOverdue: number): 'low' | 'medium' | 'high'
```

**Ejemplo:**
```typescript
calculateUrgency(0)    // 'low' - no vencido
calculateUrgency(15)   // 'low' - vencido hace 15 días
calculateUrgency(45)   // 'medium' - vencido hace 45 días
calculateUrgency(120)  // 'high' - vencido hace 120 días
```

**Reglas:**
- `0 días`: low
- `1-30 días`: low
- `31-90 días`: medium
- `90+ días`: high
