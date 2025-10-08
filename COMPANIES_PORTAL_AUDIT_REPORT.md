# 🏢 COMPANIES PORTAL - AUDIT REPORT
## Auditoría de Integración Base de Datos vs Mock Data

**Fecha**: 8 de octubre de 2025
**Auditor**: Claude Code
**Alcance**: Portal Empresarial (`apps/companies/`)

---

## 📋 RESUMEN EJECUTIVO

### ⚠️ Estado General
El portal de companies presenta una **implementación COMPLETAMENTE MOCK**:
- **10% Production-Ready**: Solo 1 hook usa base de datos real
- **90% Mock Data**: Todos los componentes principales usan datos hardcodeados
- **Tablas Existentes**: 2 tablas creadas pero vacías (0 registros)
- **Tablas Faltantes**: 5+ tablas críticas para marketplace y crisis management

### 🎯 Hallazgos Principales

| Componente | Estado | Base de Datos | Mock Data |
|-----------|--------|---------------|-----------|
| **Crisis Management** | ⚠️ Demo | No | Sí (100%) |
| **Marketplace** | ⚠️ Demo | No | Sí (100%) |
| **useCompanyMemberRole** | ✅ Producción | Sí | No |
| **Stats & Metrics** | ⚠️ Hardcoded | No | Sí |
| **Job Listings** | ⚠️ Mock Array | No | Sí |

---

## 🔍 AUDITORÍA DETALLADA POR COMPONENTE

### 1. 📊 DASHBOARD PRINCIPAL (`page.tsx`)

**Ubicación**: `apps/companies/src/app/page.tsx`
**Líneas**: 334
**Estado**: ⚠️ **100% MOCK DATA**

#### Secciones Principales:
```typescript
const [activeSection, setActiveSection] = useState<'crisis' | 'marketplace'>('crisis');

// CRISIS MANAGEMENT
const crisisMetrics = [...]; // ⚠️ Hardcoded
const recentIncidents = [...]; // ⚠️ Hardcoded
const facilitiesStatus = [...]; // ⚠️ Hardcoded

// MARKETPLACE
<MarketplaceDashboard /> // ⚠️ Mock data component
```

#### Hallazgos Críticos:

**Crisis Management Section (Líneas 32-326):**
```typescript
// ⚠️ TODO: Datos hardcodeados sin conexión DB
const crisisMetrics = [
  {
    title: 'Incidentes Activos',
    value: activeIncidents, // useState con valor fijo
    icon: AlertTriangle,
    color: 'text-red-400',
    status: 'critical'
  },
  {
    title: 'Personal Disponible',
    value: '156/175', // ⚠️ HARDCODED
    percentage: 89,   // ⚠️ HARDCODED
    icon: Users,
    status: 'good'
  },
  // ... más métricas hardcodeadas
];

const recentIncidents = [
  {
    id: 1,
    type: 'Brote de gripe', // ⚠️ MOCK
    location: 'Edificio Norte - Piso 3',
    time: '14:30',
    status: 'active',
    severity: 'high',
    affected: 12
  },
  // ... 2 incidentes más mockeados
];

const facilitiesStatus = [
  { name: 'Edificio Norte', status: 'operational', capacity: 95 }, // ⚠️ MOCK
  { name: 'Edificio Sur', status: 'operational', capacity: 87 },
  { name: 'Almacén Principal', status: 'limited', capacity: 45 },
  { name: 'Centro Médico', status: 'operational', capacity: 100 },
];
```

**Veredicto**: DEMO - 0% integración con DB ⚠️

---

### 2. 💼 MARKETPLACE DASHBOARD (`MarketplaceDashboard.tsx`)

**Ubicación**: `apps/companies/src/components/marketplace/MarketplaceDashboard.tsx`
**Líneas**: 362
**Estado**: ⚠️ **100% MOCK DATA**

#### Datos Mockeados:

```typescript
// ⚠️ Mock marketplace stats
const stats: MarketplaceStats = {
  totalJobs: 47,          // ⚠️ HARDCODED
  activeJobs: 28,
  totalApplications: 234,
  totalViews: 1850,
  averageTimeToFill: 18,
  successfulHires: 15,
};

// ⚠️ Mock job listings array
const jobListings: JobListing[] = [
  {
    id: '1',
    title: 'Cardiólogo Intervencionista',
    department: 'Cardiología',
    hospital: 'Hospital Central',
    location: 'Buenos Aires, Argentina',
    specialty: 'Cardiología',
    type: 'full-time',
    salary: { min: 8000, max: 12000, currency: 'USD' },
    postedDate: '2025-01-15',
    applications: 12,
    views: 145,
    status: 'active',
    urgent: true,
    description: 'Buscamos cardiólogo especializado...',
    requirements: ['Especialidad en Cardiología', 'Experiencia 5+ años', ...],
    benefits: ['Seguro médico familiar', 'Capacitación continua', ...],
  },
  // ... 2 ofertas más mockeadas
];
```

#### Funcionalidades Implementadas (sin DB):

**✅ Features UI (funcionales pero mock):**
- Búsqueda por título, especialidad, hospital
- Filtros por categoría (all, active, filled, urgent)
- Cards de estadísticas con métricas
- Listado de ofertas con detalles
- Badges de status (Activo, Urgente, Cubierto)
- Cálculo de tasa de conversión (applications/views)

**❌ NO implementado (requiere DB):**
- Crear nueva oferta (botón presente pero no funcional)
- Guardar jobs en base de datos
- Tracking de aplicaciones reales
- Analytics de visualizaciones
- Persistencia de datos

**Veredicto**: DEMO UI completa pero 0% backend ⚠️

---

### 3. ✅ HOOK PRODUCTION-READY (`useCompanyMemberRole.ts`)

**Ubicación**: `apps/companies/src/hooks/useCompanyMemberRole.ts`
**Líneas**: 60
**Estado**: ✅ **PRODUCCIÓN**

```typescript
const { data, error: queryError } = await supabase
  .from('company_members')
  .select('role')
  .eq('company_id', companyId)
  .eq('user_id', user.id)
  .single();

const role = data?.role ?? null;
setMemberRole(role === null ? null : (role as MemberRole));
```

**Características**:
- ✅ Query Supabase real a `company_members`
- ✅ Auth check con `supabase.auth.getUser()`
- ✅ Error handling completo
- ✅ Loading states
- ✅ TypeScript types con `MemberRole` de `@autamedica/shared`

**Problema Actual**:
- ⚠️ Hook funciona pero **NO se usa** en page.tsx
- ⚠️ Tabla `company_members` tiene 0 registros

**Veredicto**: PRODUCCIÓN pero NO UTILIZADO ✅⚠️

---

### 4. 🎨 COMPONENTES DE LAYOUT

#### 4.1 CompanyLayoutProvider.tsx
**Estado**: ✅ Producción (Context Provider)

```typescript
// Provides company context to all children
// NO usa mock data, solo provider pattern
```

#### 4.2 Header.tsx
**Estado**: ✅ Producción (UI puro)

```typescript
// Pure UI component, no data fetching
```

#### 4.3 Navigation.tsx
**Estado**: ✅ Producción (UI puro)

```typescript
// Navigation links, no DB dependency
```

#### 4.4 ErrorBoundary.tsx
**Estado**: ✅ Producción (Error handling)

```typescript
// React error boundary, production-ready
```

**Veredicto**: Layout components son production-ready ✅

---

## 💾 ESTADO DE LA BASE DE DATOS

### ✅ Tablas Existentes (pero vacías)

| Tabla | Registros | Estructura |
|-------|-----------|------------|
| `companies` | 0 | ✅ 14 columnas |
| `company_members` | 0 | ✅ 12 columnas |

### 📊 Estructura de `companies` Table

```sql
-- Campos principales
id              uuid PRIMARY KEY
name            text NOT NULL
legal_name      text
cuit            text (ID fiscal Argentina)
industry        text
size            text

-- Contacto
phone           text
email           text
website         text

-- JSONB
address         jsonb

-- Ownership
owner_id        uuid (FK to auth.users)

-- Control
active          boolean DEFAULT true
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

**Análisis**:
- ✅ Estructura completa para empresa argentina
- ✅ CUIT para identificación fiscal
- ✅ Campos estándar (name, industry, size)
- ⚠️ NO tiene campos para crisis management
- ⚠️ NO tiene relación con facilities/incidents

---

### 📊 Estructura de `company_members` Table

```sql
-- Campos principales
id              uuid PRIMARY KEY
company_id      uuid NOT NULL (FK to companies)
profile_id      uuid NOT NULL (FK to profiles)

-- Role system
role            text DEFAULT 'member'
position        text
department      text
employee_id     text

-- Employment dates
start_date      date
end_date        date

-- Control
active          boolean DEFAULT true
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

**Análisis**:
- ✅ Relación company ↔ profiles
- ✅ Sistema de roles (member, admin, etc.)
- ✅ Tracking de fechas de empleo
- ✅ Soft delete con `active`
- ⚠️ **BUG POTENCIAL**: Usa `profile_id` pero hook usa `user_id`

---

### ❌ Tablas Faltantes (Críticas)

| Tabla | Uso | Criticidad | Datos Mock Actuales |
|-------|-----|------------|---------------------|
| `job_listings` | Marketplace ofertas | 🔴 ALTA | 3 jobs hardcodeados |
| `job_applications` | Aplicaciones a ofertas | 🔴 ALTA | Counters mockeados |
| `facilities` | Instalaciones empresariales | 🔴 ALTA | 4 facilities hardcodeadas |
| `incidents` | Crisis management | 🔴 ALTA | 3 incidentes mockeados |
| `marketplace_stats` | Analytics marketplace | 🟡 MEDIA | Stats hardcodeados |

---

## 🚨 PROBLEMAS CRÍTICOS DETECTADOS

### 1. ❌ Crisis Management: 100% Mock Data

**Líneas 32-326 de page.tsx**

```typescript
// PROBLEMA: Todos los datos son constantes hardcodeadas
const [crisisLevel, _setCrisisLevel] = useState('HIGH'); // ⚠️ No se actualiza
const [activeIncidents, _setActiveIncidents] = useState(3); // ⚠️ Siempre 3

// Métricas falsas
{
  title: 'Personal Disponible',
  value: '156/175', // ⚠️ HARDCODED - nunca cambia
  percentage: 89,
}

// Incidentes ficticios
{
  type: 'Brote de gripe',
  location: 'Edificio Norte - Piso 3', // ⚠️ MOCK
  time: '14:30', // ⚠️ MOCK
  affected: 12
}
```

**Impacto**:
- ❌ No refleja situación real de la empresa
- ❌ No puede usarse en producción
- ❌ Demo visual sin funcionalidad backend

---

### 2. ❌ Marketplace: Array Mock en Componente

**Líneas 56-119 de MarketplaceDashboard.tsx**

```typescript
// PROBLEMA: JobListings definido como constante en componente
const jobListings: JobListing[] = [
  {
    id: '1',
    title: 'Cardiólogo Intervencionista',
    // ... datos mockeados
  },
  // Solo 3 jobs hardcodeados
];

// Stats calculados de datos mock
const stats: MarketplaceStats = {
  totalJobs: 47, // ⚠️ No coincide con array (solo 3 jobs)
  activeJobs: 28,
  totalApplications: 234,
  totalViews: 1850,
  // ...
};
```

**Inconsistencias**:
- ⚠️ `totalJobs: 47` pero array tiene solo 3 jobs
- ⚠️ Stats no calculados de datos reales
- ⚠️ Búsqueda y filtros funcionan pero sobre mock data
- ⚠️ Botón "Nueva Oferta" no funcional

**Impacto**:
- ❌ No se pueden publicar ofertas reales
- ❌ No hay tracking de aplicaciones
- ❌ Analytics son ficticios

---

### 3. ⚠️ Bug en `useCompanyMemberRole`

**Línea 36 de useCompanyMemberRole.ts**

```typescript
// BUG POTENCIAL: Schema usa profile_id, hook usa user_id
const { data, error: queryError } = await supabase
  .from('company_members')
  .select('role')
  .eq('company_id', companyId)
  .eq('user_id', user.id) // ⚠️ Columna 'user_id' NO EXISTE en schema
  .single();
```

**Schema Real**:
```sql
-- company_members table
profile_id uuid NOT NULL  -- ✅ Correcto
-- NO TIENE user_id
```

**Fix Requerido**:
```typescript
// Primero obtener profile_id del user
const { data: profile } = await supabase
  .from('profiles')
  .select('id')
  .eq('user_id', user.id)
  .single();

// Luego buscar en company_members
const { data } = await supabase
  .from('company_members')
  .select('role')
  .eq('company_id', companyId)
  .eq('profile_id', profile.id)  // ✅ Usar profile_id
  .single();
```

**Impacto**:
- 🔴 Hook actual probablemente falla en producción
- 🔴 Query nunca encuentra registros

---

### 4. ❌ Hook No Utilizado

**useCompanyMemberRole.ts está DEFINIDO pero NO USADO**

```typescript
// apps/companies/src/app/page.tsx - NO importa useCompanyMemberRole
// ⚠️ Hook existe pero nadie lo llama
```

**Debería usarse para**:
- Control de acceso basado en rol
- Mostrar/ocultar features según role (admin, member)
- Permisos para crisis management
- Permisos para publicar jobs en marketplace

---

## 📊 RESUMEN POR CATEGORÍAS

### 🔴 MOCK DATA (90%)

1. ❌ Crisis Management Dashboard
   - Métricas: `'156/175'`, `89%`, `'HIGH'`
   - Incidentes: 3 hardcodeados
   - Facilities: 4 hardcodeadas
   - **0% integración DB**

2. ❌ Marketplace Dashboard
   - Jobs: 3 hardcodeados
   - Stats: Todos mockeados
   - Applications: Counters ficticios
   - **0% integración DB**

### 🟢 PRODUCTION-READY (10%)

3. ✅ useCompanyMemberRole
   - Query Supabase real
   - Error handling
   - **Pero NO se usa y tiene bug**

4. ✅ Layout Components
   - Pure UI, no data dependency
   - Production-ready

---

## 📝 MIGRACIONES SQL NECESARIAS

### Migration 1: Crear `job_listings` table

```sql
-- apps/companies - Migration: job_listings table
-- Fecha: 2025-10-08

CREATE TABLE IF NOT EXISTS public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Job details
  title text NOT NULL,
  department text NOT NULL,
  specialty text NOT NULL,
  type text NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'locum')),

  -- Location
  hospital text,
  location text NOT NULL,

  -- Compensation
  salary_min numeric NOT NULL,
  salary_max numeric NOT NULL,
  salary_currency text DEFAULT 'USD',

  -- Content
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',

  -- Status
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'filled')),
  urgent boolean DEFAULT false,

  -- Dates
  posted_date timestamptz DEFAULT now(),
  filled_date timestamptz,

  -- Metadata
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_job_listings_company ON public.job_listings(company_id) WHERE active = true;
CREATE INDEX idx_job_listings_status ON public.job_listings(status) WHERE active = true;
CREATE INDEX idx_job_listings_specialty ON public.job_listings(specialty);
CREATE INDEX idx_job_listings_type ON public.job_listings(type);
CREATE INDEX idx_job_listings_urgent ON public.job_listings(urgent) WHERE urgent = true;

-- RLS Policies
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Company members can view jobs from their company
CREATE POLICY "Company members can view their jobs"
  ON public.job_listings FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.company_members
    WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ));

-- Company admins can create jobs
CREATE POLICY "Company admins can create jobs"
  ON public.job_listings FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM public.company_members
    WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    AND role = 'admin'
  ));

-- Trigger
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON public.job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration 2: Crear `job_applications` table

```sql
-- apps/companies - Migration: job_applications table
-- Fecha: 2025-10-08

CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_listing_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL, -- Could be doctor_id or external

  -- Application details
  cover_letter text,
  resume_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interview', 'accepted', 'rejected')),

  -- Tracking
  applied_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  interview_scheduled_at timestamptz,
  decision_at timestamptz,

  -- Notes
  reviewer_notes text,
  rejection_reason text,

  -- Metadata
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_applications_job ON public.job_applications(job_listing_id);
CREATE INDEX idx_applications_applicant ON public.job_applications(applicant_id);
CREATE INDEX idx_applications_status ON public.job_applications(status);

-- RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Trigger
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Migration 3: Crear `facilities` table

```sql
-- apps/companies - Migration: facilities table
-- Fecha: 2025-10-08

CREATE TABLE IF NOT EXISTS public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,

  -- Facility details
  name text NOT NULL,
  facility_type text,

  -- Location
  address jsonb,
  building_number text,
  floor text,

  -- Status
  operational_status text DEFAULT 'operational'
    CHECK (operational_status IN ('operational', 'limited', 'offline', 'maintenance')),
  capacity_percentage integer CHECK (capacity_percentage BETWEEN 0 AND 100),
  max_capacity integer,
  current_occupancy integer,

  -- Contact
  manager_name text,
  contact_phone text,
  contact_email text,

  -- Metadata
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_facilities_company ON public.facilities(company_id) WHERE active = true;
CREATE INDEX idx_facilities_status ON public.facilities(operational_status);

-- RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view facilities"
  ON public.facilities FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.company_members
    WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ));
```

---

### Migration 4: Crear `incidents` table

```sql
-- apps/companies - Migration: incidents table (Crisis Management)
-- Fecha: 2025-10-08

CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES public.facilities(id) ON DELETE SET NULL,

  -- Incident details
  incident_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'contained', 'resolved', 'investigating')),

  -- Location
  location_description text,
  building text,
  floor text,
  room text,

  -- Impact
  affected_count integer DEFAULT 0,
  estimated_duration_hours numeric,

  -- Tracking
  reported_at timestamptz DEFAULT now(),
  reported_by_id uuid REFERENCES public.profiles(id),
  contained_at timestamptz,
  resolved_at timestamptz,

  -- Details
  description text,
  actions_taken text,
  notes text,

  -- Metadata
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_incidents_company ON public.incidents(company_id);
CREATE INDEX idx_incidents_facility ON public.incidents(facility_id);
CREATE INDEX idx_incidents_severity ON public.incidents(severity);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_reported ON public.incidents(reported_at DESC);

-- RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view incidents"
  ON public.incidents FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.company_members
    WHERE profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  ));
```

---

### Migration 5: Fix `company_members` - Agregar user_id

```sql
-- Opción A: Agregar columna user_id además de profile_id
ALTER TABLE public.company_members ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX idx_company_members_user ON public.company_members(user_id);

-- Opción B: Actualizar hook para usar profile_id (RECOMENDADO)
-- Ver sección "Fix Requerido" arriba
```

---

## ✅ RECOMENDACIONES

### 🔴 Prioridad Alta (Bloqueantes)

1. **Crear tablas marketplace**
   - `job_listings` - Base para marketplace
   - `job_applications` - Tracking de aplicaciones
   - **Refactor `MarketplaceDashboard.tsx`** - Reemplazar mock array con hooks

2. **Crear tablas crisis management**
   - `facilities` - Instalaciones empresariales
   - `incidents` - Gestión de crisis
   - **Refactor `page.tsx`** - Reemplazar mock data con hooks

3. **Fix `useCompanyMemberRole`**
   - Corregir query para usar `profile_id`
   - O agregar `user_id` a schema
   - **Implementar en page.tsx** - Control de acceso por rol

### 🟡 Prioridad Media (Features)

4. **Implementar hooks de datos**
   - `useJobListings()` - Fetch y crear ofertas
   - `useJobApplications()` - Tracking aplicaciones
   - `useFacilities()` - Estado de instalaciones
   - `useIncidents()` - Crisis management

5. **Analytics y Stats**
   - Crear vistas materializadas para stats
   - `marketplace_stats` - KPIs del marketplace
   - `crisis_metrics` - Métricas en tiempo real

6. **Funcionalidad de botones**
   - Implementar "Nueva Oferta" modal
   - CRUD completo para jobs
   - Workflow de aplicaciones

### 🟢 Prioridad Baja (Mejoras)

7. **Real-time updates**
   - Supabase Realtime para incidents
   - Live updates de crisis metrics
   - Notificaciones push

8. **Dashboard personalizado**
   - Widgets configurables
   - Favoritos y shortcuts
   - Temas personalizados

9. **Reports y exports**
   - Exportar jobs a CSV
   - Reportes de crisis
   - Analytics históricos

---

## 📊 COMPARACIÓN CON OTROS PORTALES

| Aspecto | Patients | Doctors | Companies |
|---------|----------|---------|-----------|
| **Hooks Producción** | 3/3 (100%) | 5/8 (62%) | 1/1 (100%) |
| **Uso de Hooks** | ✅ 100% | ⚠️ 62% | ❌ 0% |
| **Mock Data** | 0% | 30% | **90%** |
| **Tablas Existentes** | 4/4 (100%) | 4/7 (57%) | 2/7 (28%) |
| **Features Implementadas** | ✅ Alta | ⚠️ Media | ❌ Baja |
| **Estado General** | ✅ Listo | ⚠️ Mixto | 🔴 Demo |

**Conclusión**: El portal de companies es el **MENOS MADURO** de los 3 portales. Requiere implementación completa de backend.

---

## 🎯 PLAN DE ACCIÓN SUGERIDO

### Semana 1: Bases de Datos (Crisis Management)
- [ ] Ejecutar Migration 3: `facilities`
- [ ] Ejecutar Migration 4: `incidents`
- [ ] Crear hooks: `useFacilities()`, `useIncidents()`
- [ ] Refactor page.tsx: Crisis section con datos reales
- [ ] Seeders con datos iniciales de empresa

### Semana 2: Marketplace Backend
- [ ] Ejecutar Migration 1: `job_listings`
- [ ] Ejecutar Migration 2: `job_applications`
- [ ] Crear hooks: `useJobListings()`, `useJobApplications()`
- [ ] Refactor MarketplaceDashboard con datos reales
- [ ] Implementar "Nueva Oferta" modal + form

### Semana 3: Fix Bug + Features
- [ ] Ejecutar Migration 5: Fix `company_members`
- [ ] Refactor `useCompanyMemberRole` con profile_id
- [ ] Implementar control de acceso por rol
- [ ] Analytics y stats reales
- [ ] Real-time updates (Supabase Realtime)

### Semana 4: Testing & Polish
- [ ] Tests unitarios para hooks
- [ ] Tests de integración E2E
- [ ] Validar RLS policies
- [ ] Performance optimization
- [ ] Documentación

---

## 📚 ARCHIVOS CLAVE AUDITADOS

### Componentes Principales
- `apps/companies/src/app/page.tsx` (334 líneas) ⚠️ Mock
- `apps/companies/src/components/marketplace/MarketplaceDashboard.tsx` (362 líneas) ⚠️ Mock

### Hooks
- `apps/companies/src/hooks/useCompanyMemberRole.ts` (60 líneas) ✅ Producción (con bug)

### Layout Components
- `apps/companies/src/components/layout/CompanyLayoutProvider.tsx` ✅
- `apps/companies/src/components/layout/Header.tsx` ✅
- `apps/companies/src/components/layout/Navigation.tsx` ✅
- `apps/companies/src/components/layout/ErrorBoundary.tsx` ✅

---

## 🔧 CÓDIGO DE EJEMPLO - Refactor Sugerido

### Ejemplo: useJobListings Hook

```typescript
// apps/companies/src/hooks/useJobListings.ts
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { logger } from '@autamedica/shared';

interface JobListing {
  id: string;
  companyId: string;
  title: string;
  department: string;
  specialty: string;
  type: 'full-time' | 'part-time' | 'contract' | 'locum';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: 'active' | 'paused' | 'filled';
  urgent: boolean;
  postedDate: string;
  // ... más campos
}

export function useJobListings(companyId: string | null) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    if (!companyId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('job_listings')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('posted_date', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform snake_case to camelCase
      const transformedJobs = data.map(job => ({
        id: job.id,
        companyId: job.company_id,
        title: job.title,
        department: job.department,
        specialty: job.specialty,
        type: job.type,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryCurrency: job.salary_currency,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        status: job.status,
        urgent: job.urgent,
        postedDate: job.posted_date,
      }));

      setJobs(transformedJobs);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error fetching jobs';
      logger.error('useJobListings: Error', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [companyId, supabase]);

  const createJob = useCallback(async (jobData: Omit<JobListing, 'id' | 'postedDate'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('job_listings')
        .insert({
          company_id: jobData.companyId,
          title: jobData.title,
          department: jobData.department,
          specialty: jobData.specialty,
          type: jobData.type,
          salary_min: jobData.salaryMin,
          salary_max: jobData.salaryMax,
          salary_currency: jobData.salaryCurrency,
          description: jobData.description,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          status: jobData.status,
          urgent: jobData.urgent,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Refresh list
      await fetchJobs();

      return data;
    } catch (err) {
      logger.error('useJobListings: Error creating job', err);
      throw err;
    }
  }, [supabase, fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    createJob,
    refetch: fetchJobs,
  };
}
```

### Ejemplo: Refactor MarketplaceDashboard

```typescript
// apps/companies/src/components/marketplace/MarketplaceDashboard.tsx
'use client';

import React, { useState } from 'react';
import { useJobListings } from '@/hooks/useJobListings';
import { useCompanyContext } from '@/contexts/CompanyContext'; // Nuevo
// ... imports

const MarketplaceDashboard: React.FC = () => {
  const { currentCompanyId } = useCompanyContext();
  const { jobs, loading, error, createJob } = useJobListings(currentCompanyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'active' | 'filled' | 'urgent'>('all');

  // ✅ Stats calculados de datos reales
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalApplications: jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0),
    totalViews: jobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0),
    // ... más stats reales
  };

  // ✅ Jobs filtrados de datos reales
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'active' && job.status === 'active') ||
      (selectedCategory === 'filled' && job.status === 'filled') ||
      (selectedCategory === 'urgent' && job.urgent);

    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      {/* Stats con datos reales */}
      {/* Job listings con datos reales */}
    </div>
  );
};
```

---

## 🏁 CONCLUSIÓN

El **Portal de Companies** presenta el **mayor gap de implementación** de los 3 portales:

1. ⚠️ **90% Mock Data** - Todos los componentes principales usan datos hardcodeados
2. 🔴 **5 tablas críticas faltantes** - job_listings, applications, facilities, incidents, stats
3. ✅ **1 hook production-ready** - Pero con bug y NO se usa
4. 🎨 **UI completa** - Todo el diseño está listo, solo falta backend

**Prioridad**: 🔴 **ALTA - Requiere implementación completa de backend**

**Tiempo estimado**: **4 semanas** para alcanzar nivel de madurez de portal patients.

**Ventaja**: La UI ya está implementada y es profesional. Solo necesita conectarse a DB real.

---

**Generado por**: Claude Code
**Fecha**: 8 de octubre de 2025
**Versión**: 1.0
