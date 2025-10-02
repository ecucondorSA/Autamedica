# 🏥 Glosario: Salud Reproductiva (IVE/ILE)

Tipos TypeScript para el sistema de salud reproductiva según Ley 27.610 de Argentina.

---

## ReproductiveHealthSpecialistId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para especialistas en salud reproductiva

```typescript
export type ReproductiveHealthSpecialistId = UUID & {
  readonly __brand: 'ReproductiveHealthSpecialistId'
};
```

---

## SpecialistAvailabilityStatus

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Estado de disponibilidad del especialista para consultas

**Valores posibles:**
- `'available'` - Disponible para consultas inmediatas
- `'busy'` - Ocupado en consulta
- `'offline'` - Fuera de línea

---

## ReproductiveHealthSpecialtyType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Especialidades médicas certificadas para IVE/ILE

**Valores posibles:**
- `'gynecology'` - Ginecología
- `'general_medicine'` - Medicina general
- `'psychology'` - Psicología
- `'social_work'` - Trabajo social
- `'nursing'` - Enfermería

---

## ReproductiveHealthSpecialist

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Especialista médico certificado para realizar procedimientos IVE/ILE

**Campos principales:**
- `id` - Identificador único
- `doctor_id` - Referencia al médico en tabla doctors
- `specialty` - Especialidad médica
- `is_certified_ive_ile` - Si está certificado para IVE/ILE
- `availability_status` - Estado actual de disponibilidad
- `rating` - Calificación de 0.00 a 5.00
- `total_consultations` - Total de consultas realizadas
- `years_of_experience` - Años de experiencia
- `languages` - Idiomas hablados
- `bio` - Biografía profesional

---

## ReproductiveHealthSpecialistWithProfile

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Especialista con información completa del perfil del médico (join)

Extiende `ReproductiveHealthSpecialist` y agrega:
- `first_name` - Nombre del médico
- `last_name` - Apellido del médico
- `email` - Email de contacto
- `phone` - Teléfono de contacto

---

## ReproductiveHealthSpecialistInsert

**Package:** `@autamedica/types`
**Tipo:** `type` (Omit)
**Descripción:** Datos necesarios para crear un nuevo especialista

Omite campos auto-generados: `id`, `created_at`, `updated_at`

---

## ReproductiveHealthAppointmentId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para citas de salud reproductiva

---

## AppointmentConsultationType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Tipo de consulta en salud reproductiva

**Valores posibles:**
- `'information'` - Consulta informativa
- `'pre_procedure'` - Consulta previa al procedimiento
- `'procedure_scheduling'` - Agendamiento de procedimiento
- `'post_procedure'` - Seguimiento post-procedimiento
- `'psychological'` - Apoyo psicológico
- `'emergency'` - Emergencia

---

## AppointmentModalityType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Modalidad de la consulta

**Valores posibles:**
- `'video_call'` - Videollamada
- `'phone_call'` - Llamada telefónica
- `'in_person'` - Presencial
- `'chat'` - Chat asíncrono

---

## AppointmentStatusType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Estado de la cita médica

**Valores posibles:**
- `'scheduled'` - Agendada
- `'confirmed'` - Confirmada
- `'in_progress'` - En curso
- `'completed'` - Completada
- `'cancelled_by_patient'` - Cancelada por paciente
- `'cancelled_by_doctor'` - Cancelada por médico
- `'no_show'` - No se presentó

---

## ReproductiveHealthAppointment

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Cita para consulta de salud reproductiva

**Campos principales:**
- `id` - Identificador único
- `patient_id` - ID del paciente
- `specialist_id` - ID del especialista
- `consultation_type` - Tipo de consulta
- `modality` - Modalidad (video/presencial/chat)
- `status` - Estado actual
- `scheduled_at` - Fecha/hora programada
- `duration_minutes` - Duración en minutos
- `meeting_url` - URL de videollamada (si aplica)
- `notes_for_doctor` - Notas del paciente
- `is_first_consultation` - Si es primera consulta
- `requires_interpreter` - Si requiere intérprete
- `preferred_language` - Idioma preferido

---

## HealthCenterId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para centros de salud

---

## HealthCenterType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Tipo de centro de salud

**Valores posibles:**
- `'public_hospital'` - Hospital público
- `'health_center'` - Centro de salud
- `'caps'` - Centro de Atención Primaria de Salud
- `'clinic'` - Clínica privada
- `'ngo'` - ONG

---

## HealthCenter

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Centro de salud que ofrece servicios IVE/ILE

**Campos principales:**
- `id` - Identificador único
- `name` - Nombre del centro
- `type` - Tipo de centro
- `address` - Dirección (JSONB)
- `coordinates` - Coordenadas geográficas (PostGIS)
- `phone` - Teléfono de contacto
- `email` - Email de contacto
- `website_url` - Sitio web
- `offers_ive_ile` - Si ofrece servicios IVE/ILE
- `offers_medication_method` - Si ofrece método medicamentoso
- `offers_surgical_method` - Si ofrece método quirúrgico
- `offers_psychological_support` - Si ofrece apoyo psicológico
- `requires_appointment` - Si requiere cita previa
- `accepts_walk_ins` - Si acepta sin cita
- `has_24h_service` - Si tiene servicio 24hs
- `operating_hours` - Horarios de operación (JSONB)
- `average_wait_time_days` - Tiempo de espera promedio en días
- `accessibility_features` - Características de accesibilidad

---

## Coordinates

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Coordenadas geográficas en formato decimal

**Campos:**
- `latitude` - Latitud (-90 a 90)
- `longitude` - Longitud (-180 a 180)

---

## HealthCenterWithDistance

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Centro de salud con distancia calculada desde ubicación del usuario

Extiende `HealthCenter` y agrega:
- `distance_km` - Distancia en kilómetros
- `estimated_travel_time_minutes` - Tiempo estimado de viaje

---

## MedicalChatId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para chats médicos

---

## MedicalMessageId

**Package:** `@autamedica/types`
**Tipo:** `type` (Branded UUID)
**Descripción:** Identificador único y tipado para mensajes médicos

---

## MessageAuthorType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Tipo de autor del mensaje

**Valores posibles:**
- `'patient'` - Paciente
- `'doctor'` - Médico
- `'system'` - Sistema (notificaciones automáticas)

---

## MessageContentType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Tipo de contenido del mensaje

**Valores posibles:**
- `'text'` - Texto plano
- `'image'` - Imagen
- `'document'` - Documento adjunto
- `'audio'` - Audio
- `'system_notification'` - Notificación del sistema

---

## ChatStatusType

**Package:** `@autamedica/types`
**Tipo:** `type` (Literal Union)
**Descripción:** Estado del chat médico

**Valores posibles:**
- `'active'` - Activo
- `'waiting_response'` - Esperando respuesta
- `'resolved'` - Resuelto
- `'closed'` - Cerrado

---

## MedicalChat

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Conversación asíncrona entre paciente y especialista

**Campos principales:**
- `id` - Identificador único
- `patient_id` - ID del paciente
- `specialist_id` - ID del especialista
- `appointment_id` - ID de cita relacionada (opcional)
- `status` - Estado del chat
- `subject` - Asunto/título del chat
- `is_urgent` - Si es urgente
- `last_message_at` - Timestamp del último mensaje

---

## MedicalMessage

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Mensaje individual dentro de un chat médico

**Campos principales:**
- `id` - Identificador único
- `chat_id` - ID del chat al que pertenece
- `author_type` - Tipo de autor (patient/doctor/system)
- `author_id` - ID del autor
- `content_type` - Tipo de contenido
- `content` - Contenido del mensaje
- `attachment_url` - URL de archivo adjunto (opcional)
- `is_read` - Si fue leído
- `read_at` - Timestamp de lectura

---

## MedicalChatWithLastMessage

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Chat con información del último mensaje y contador de no leídos

Extiende `MedicalChat` y agrega:
- `last_message_content` - Contenido del último mensaje
- `last_message_author` - Autor del último mensaje
- `unread_count` - Cantidad de mensajes no leídos
- `specialist_name` - Nombre completo del especialista

---

## GeolocationQuery

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Parámetros para búsqueda geolocalizada

**Campos:**
- `latitude` - Latitud de origen
- `longitude` - Longitud de origen
- `radius_km` - Radio de búsqueda en kilómetros
- `max_results` - Máximo de resultados a retornar

---

## HealthCenterSearchFilters

**Package:** `@autamedica/types`
**Tipo:** `interface`
**Descripción:** Filtros avanzados para búsqueda de centros de salud

**Campos opcionales:**
- `type` - Tipo(s) de centro
- `offers_medication_method` - Si ofrece método medicamentoso
- `offers_surgical_method` - Si ofrece método quirúrgico
- `accepts_walk_ins` - Si acepta sin cita
- `has_24h_service` - Si tiene servicio 24hs
- `max_distance_km` - Distancia máxima

---

## isReproductiveHealthSpecialty

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Type guard para validar si un string es una especialidad válida

```typescript
function isReproductiveHealthSpecialty(value: string): value is ReproductiveHealthSpecialtyType
```

---

## isAppointmentConsultationType

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Type guard para validar tipo de consulta

```typescript
function isAppointmentConsultationType(value: string): value is AppointmentConsultationType
```

---

## isHealthCenterType

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Type guard para validar tipo de centro de salud

```typescript
function isHealthCenterType(value: string): value is HealthCenterType
```

---

## isSpecialistAvailable

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Determina si un especialista está disponible para consultas

```typescript
function isSpecialistAvailable(specialist: ReproductiveHealthSpecialist): boolean
```

---

## canAcceptEmergency

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Determina si un especialista acepta consultas de emergencia

```typescript
function canAcceptEmergency(specialist: ReproductiveHealthSpecialist): boolean
```

---

## isChatActive

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Determina si un chat está en estado activo

```typescript
function isChatActive(chat: MedicalChat): boolean
```

---

## requiresUrgentAttention

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Determina si un chat requiere atención urgente

```typescript
function requiresUrgentAttention(chat: MedicalChat): boolean
```

---

## calculateDistance

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Calcula distancia en km entre dos coordenadas usando fórmula Haversine

```typescript
function calculateDistance(point1: Coordinates, point2: Coordinates): number
```

**Ejemplo:**
```typescript
const distance = calculateDistance(
  { latitude: -34.6037, longitude: -58.3816 }, // CABA
  { latitude: -34.9215, longitude: -57.9545 }  // La Plata
);
// distance ≈ 56 km
```

---

## sortByDistance

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Ordena centros de salud por distancia desde una ubicación

```typescript
function sortByDistance(
  centers: HealthCenter[],
  userLocation: Coordinates
): HealthCenterWithDistance[]
```

---

## formatDistance

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Formatea distancia en km a string legible

```typescript
function formatDistance(distanceKm: number): string
```

**Ejemplo:**
```typescript
formatDistance(0.5)   // "500 m"
formatDistance(1.2)   // "1.2 km"
formatDistance(56.7)  // "56.7 km"
```

---

## estimateTravelTime

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Estima tiempo de viaje en minutos según distancia y modo de transporte

```typescript
function estimateTravelTime(
  distanceKm: number,
  mode: 'walking' | 'driving' | 'transit'
): number
```

**Ejemplo:**
```typescript
estimateTravelTime(5, 'walking')  // ~60 min
estimateTravelTime(5, 'driving')  // ~15 min
estimateTravelTime(5, 'transit')  // ~20 min
```

---

## getSpecialtyDisplayName

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Retorna nombre en español de la especialidad

```typescript
function getSpecialtyDisplayName(specialty: ReproductiveHealthSpecialtyType): string
```

---

## getConsultationTypeDisplayName

**Package:** `@autamedica/types`
**Tipo:** `function`
**Descripción:** Retorna nombre en español del tipo de consulta

```typescript
function getConsultationTypeDisplayName(type: AppointmentConsultationType): string
```
