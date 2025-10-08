# 🏥 AutaMedica - UI Pacientes v1.0

## 📋 Overview

Primera versión de la interfaz de usuario para pacientes de AutaMedica, construida con Next.js 15 App Router y TailwindCSS con el sistema de diseño marfil/stone.

## 🎯 Pantallas Implementadas

### 1. Dashboard Principal (`/`)
- Resumen de salud del paciente
- Próxima cita destacada
- Alertas de controles preventivos atrasados
- Stats rápidas (citas, registros, controles)
- Registros médicos recientes

### 2. Mis Citas (`/appointments`)
- Lista completa de citas médicas
- Filtrado por estado (programadas, confirmadas, completadas)
- Vista detallada con información de ubicación y videollamada
- Acciones: unirse a videollamada, reprogramar, cancelar
- Stats: próximas, confirmadas, completadas

### 3. Historial Médico (`/medical-history`)
- Todos los registros médicos del paciente
- Tipos: diagnósticos, recetas, resultados de lab, notas
- Vista detallada de cada registro
- Exportación de historial completo
- Stats por tipo de registro

### 4. Salud Preventiva (`/preventive-health`)
- Controles preventivos recomendados
- Estados: atrasado, próximo, al día
- Prioridad (alta, media, baja)
- Alertas para controles atrasados
- Agendamiento directo de controles

### 5. Perfil (`/profile`)
- Información personal completa
- Datos de contacto
- Información médica (alergias, resumen clínico)
- Contacto de emergencia
- Edición de perfil

## 📁 Estructura de Archivos

```
apps/patients/src/
├── app/
│   ├── (dashboard)/              # Layout group con sidebar
│   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   ├── page.tsx             # Dashboard principal
│   │   ├── appointments/
│   │   │   └── page.tsx
│   │   ├── medical-history/
│   │   │   └── page.tsx
│   │   ├── preventive-health/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx  # Sidebar navigation layout
│   ├── appointments/
│   │   └── AppointmentsTable.tsx
│   └── preventive/
│       └── PreventiveScreenings.tsx
│
└── mocks/
    ├── appointments.ts          # Mock appointments data
    ├── medical-records.ts       # Mock medical records data
    ├── preventive-screenings.ts # Mock preventive screenings data
    └── index.ts                 # Barrel export
```

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Base**: Marfil (#FDFCF9)
- **Primario**: Stone-700/800/900
- **Acentos semánticos**:
  - Success: Emerald-600
  - Warning: Amber-600
  - Danger: Rose-600/Red-600
  - Info: Blue-600

### Componentes UI
- **Botones**: `.btn-primary-ivory`, `.btn-secondary-ivory`
- **Cards**: `.card-ivory`, `.card-ivory-elevated`
- **Texto**: `.heading-1/2/3`, `.text-body`, `.text-secondary`, `.text-label`

## 🔌 Integraciones

### Packages Utilizados
- `@autamedica/types` → Tipos TypeScript (Appointment, Patient, Profile)
- `@autamedica/auth` → Autenticación (próximo paso)
- `@autamedica/hooks` → Hooks médicos (próximo paso)
- `@autamedica/ui` → Componentes compartidos

### Datos Mockeados
Todos los componentes usan datos mockeados de `/mocks`:
- ✅ `mockAppointments` - 4 citas de ejemplo
- ✅ `mockMedicalRecords` - 3 registros médicos
- ✅ `mockPreventiveScreenings` - 4 controles preventivos

## 🚀 Próximos Pasos (Integración Real)

### 1. Conectar con Supabase
```typescript
// apps/patients/src/hooks/useAppointments.ts
import { createClient } from '@autamedica/auth';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAppointments() {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .order('start_time', { ascending: true });

      if (!error) setAppointments(data);
    }

    fetchAppointments();
  }, [userId]);

  return { appointments, loading, error };
}
```

### 2. Autenticación
Reemplazar usuario mockeado en `DashboardLayout.tsx` con:
```typescript
import { useAuth } from '@autamedica/auth';

const { user, profile } = useAuth();
```

### 3. Hooks Personalizados
- `usePatientProfile()` → Datos del paciente desde `patients` table
- `useMedicalRecords()` → Registros desde `medical_records` table
- `usePreventiveScreenings()` → Custom hook para controles preventivos

## 🧪 Testing

### Desarrollo Local
```bash
cd apps/patients
pnpm dev
```

Navegar a `http://localhost:3002`

### Pantallas con Datos Mock
- `/` → Dashboard con próxima cita
- `/appointments` → 4 citas (1 completada, 3 próximas)
- `/medical-history` → 3 registros médicos
- `/preventive-health` → 4 controles (1 atrasado)
- `/profile` → Perfil de María González

## 📊 Tipos TypeScript

### Appointment (desde @autamedica/types)
```typescript
interface Appointment {
  id: UUID;
  patient_id: UUID;
  doctor_id: UUID;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine' | 'lab_test' | 'checkup';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no_show';
  start_time: ISODateString;
  end_time: ISODateString;
  duration_minutes: number;
  location?: string;
  meeting_url?: string;
  reason: string;
  notes?: string;
}
```

### MedicalRecord (mock - migrar a types)
```typescript
interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  record_type: 'diagnosis' | 'prescription' | 'lab_result' | 'note';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  created_at: ISODateString;
}
```

### PreventiveScreening (mock - migrar a types)
```typescript
interface PreventiveScreening {
  id: string;
  patient_id: string;
  screening_type: 'cholesterol' | 'blood_pressure' | 'mammography' | 'pap_smear' | 'colonoscopy' | 'glucose';
  title: string;
  description: string;
  recommended_frequency: string;
  last_done_date?: ISODateString;
  next_due_date: ISODateString;
  status: 'overdue' | 'due_soon' | 'up_to_date';
  priority: 'high' | 'medium' | 'low';
}
```

## ✅ Checklist de Completitud

- [x] Estructura de rutas Next.js App Router
- [x] DashboardLayout con sidebar navigation
- [x] Página Dashboard principal
- [x] Página Mis Citas
- [x] Página Historial Médico
- [x] Página Salud Preventiva
- [x] Página Perfil
- [x] Componente AppointmentsTable
- [x] Componente PreventiveScreenings
- [x] Mocks de datos (appointments, records, screenings)
- [x] Integración con @autamedica/types
- [x] Sistema de diseño marfil/stone aplicado
- [ ] Integración con Supabase (próximo paso)
- [ ] Hooks personalizados para datos reales
- [ ] Autenticación con @autamedica/auth

## 🎯 Estado Actual

**✅ UI v1.0 COMPLETADA**

Todas las pantallas base están funcionando con datos mockeados.
La aplicación está lista para integración con Supabase en el próximo paso.

---

**Fecha**: Octubre 2, 2025
**Versión**: 1.0.0
**Status**: ✅ Production-ready UI (mocks)
