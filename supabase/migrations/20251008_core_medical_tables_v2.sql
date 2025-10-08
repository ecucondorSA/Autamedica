-- ============================================================================
-- CORE MEDICAL TABLES V2 - AutaMedica (TypeScript-aligned)
-- ============================================================================
-- Created: 2025-10-08
-- Purpose: Medical tables aligned with TypeScript interfaces
-- Source: packages/types/src/entities/
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ACTUALIZAR TABLA PROFILES - Agregar roles faltantes
-- ============================================================================

-- Eliminar constraint viejo y agregar nuevo con todos los roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'patient',
    'doctor',
    'company',
    'company_admin',
    'organization_admin',
    'admin',
    'platform_admin'
  ));

-- Actualizar portales
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_portal_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_portal_check
  CHECK (portal IN ('pacientes', 'medico', 'empresa', 'admin'));

-- Agregar campos faltantes a profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locale text DEFAULT 'es-AR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Argentina/Buenos_Aires';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Migrar full_name a first_name/last_name si existe
UPDATE public.profiles
SET first_name = split_part(full_name, ' ', 1),
    last_name = substring(full_name from position(' ' in full_name) + 1)
WHERE full_name IS NOT NULL AND first_name IS NULL;

COMMENT ON TABLE public.profiles IS 'User profiles with authentication and role info';
COMMENT ON COLUMN public.profiles.role IS 'User role: patient, doctor, company, company_admin, organization_admin, admin, platform_admin';

-- ============================================================================
-- TABLE: patients
-- Purpose: Patient-specific data (aligned with Patient interface)
-- TypeScript: packages/types/src/entities/patient.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    date_of_birth timestamptz,
    gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

    -- Address as JSONB (PatientAddress interface)
    address jsonb,

    -- Emergency contact as JSONB (EmergencyContact interface)
    emergency_contact jsonb,

    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

COMMENT ON TABLE public.patients IS 'Patient profiles - aligned with TypeScript Patient interface';
COMMENT ON COLUMN public.patients.address IS 'PatientAddress: {street, city, state, zipCode, country}';
COMMENT ON COLUMN public.patients.emergency_contact IS 'EmergencyContact: {name, relationship, phone, email?}';

-- ============================================================================
-- TABLE: doctors
-- Purpose: Doctor-specific data (aligned with Doctor interface)
-- TypeScript: packages/types/src/entities/doctor.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    license_number text UNIQUE NOT NULL,

    -- Specialties as array of specialty IDs
    specialties jsonb DEFAULT '[]',

    bio text,

    -- Education as array of DoctorEducation
    education jsonb,

    -- Experience as array of DoctorExperience
    experience jsonb,

    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_license ON public.doctors(license_number);
CREATE INDEX IF NOT EXISTS idx_doctors_specialties ON public.doctors USING gin(specialties);

COMMENT ON TABLE public.doctors IS 'Doctor profiles - aligned with TypeScript Doctor interface';
COMMENT ON COLUMN public.doctors.license_number IS 'Unique medical license number (e.g., MN 12345)';
COMMENT ON COLUMN public.doctors.specialties IS 'Array of specialty IDs';
COMMENT ON COLUMN public.doctors.education IS 'Array of DoctorEducation: {institution, degree, year, specialization?}';
COMMENT ON COLUMN public.doctors.experience IS 'Array of DoctorExperience: {institution, position, startDate, endDate?, description?}';

-- ============================================================================
-- TABLE: patient_care_team
-- Purpose: Assign doctors to patients (aligned with PatientCareTeam interface)
-- TypeScript: packages/types/src/entities/patient.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patient_care_team (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES public.patients(id) NOT NULL,
    doctor_id uuid REFERENCES public.doctors(id) NOT NULL,
    role text CHECK (role IN ('primary', 'specialist', 'consultant', 'emergency')) DEFAULT 'primary',
    is_active boolean DEFAULT true,
    assigned_at timestamptz DEFAULT NOW() NOT NULL,
    assigned_by uuid REFERENCES public.doctors(id) NOT NULL,
    UNIQUE(patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_care_team_patient ON public.patient_care_team(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_team_doctor ON public.patient_care_team(doctor_id);
CREATE INDEX IF NOT EXISTS idx_care_team_active ON public.patient_care_team(is_active);

COMMENT ON TABLE public.patient_care_team IS 'Patient care team assignments - aligned with TypeScript PatientCareTeam interface';
COMMENT ON COLUMN public.patient_care_team.role IS 'Care team role: primary, specialist, consultant, emergency';

-- ============================================================================
-- TABLE: appointments
-- Purpose: Medical appointments (aligned with Appointment interface)
-- TypeScript: packages/types/src/entities/appointment.ts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES public.patients(id),
    doctor_id uuid REFERENCES public.doctors(id),
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    duration_minutes integer,
    type text CHECK (type IN ('consultation', 'follow_up', 'emergency', 'telemedicine', 'lab_test', 'checkup')),
    status text CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    notes text,
    location text,
    meeting_url text,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT NOW() NOT NULL,
    updated_at timestamptz DEFAULT NOW() NOT NULL,
    deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_deleted ON public.appointments(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.appointments IS 'Medical appointments - aligned with TypeScript Appointment interface';
COMMENT ON COLUMN public.appointments.type IS 'Appointment type: consultation, follow_up, emergency, telemedicine, lab_test, checkup';
COMMENT ON COLUMN public.appointments.status IS 'Appointment status: scheduled, confirmed, in-progress, completed, cancelled, no_show';
COMMENT ON COLUMN public.appointments.meeting_url IS 'URL for telemedicine appointments';
COMMENT ON COLUMN public.appointments.deleted_at IS 'Soft delete timestamp';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_care_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: patients
-- ============================================================================

DROP POLICY IF EXISTS "patients_select_own" ON public.patients;
CREATE POLICY "patients_select_own" ON public.patients
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "patients_select_care_team" ON public.patients;
CREATE POLICY "patients_select_care_team" ON public.patients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patient_care_team pct
            JOIN public.doctors d ON d.id = pct.doctor_id
            WHERE pct.patient_id = patients.id
            AND d.user_id = auth.uid()
            AND pct.is_active = true
        )
    );

DROP POLICY IF EXISTS "patients_insert_own" ON public.patients;
CREATE POLICY "patients_insert_own" ON public.patients
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "patients_update_own" ON public.patients;
CREATE POLICY "patients_update_own" ON public.patients
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================================
-- POLICIES: doctors
-- ============================================================================

DROP POLICY IF EXISTS "doctors_select_own" ON public.doctors;
CREATE POLICY "doctors_select_own" ON public.doctors
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')
        )
    );

DROP POLICY IF EXISTS "doctors_insert_own" ON public.doctors;
CREATE POLICY "doctors_insert_own" ON public.doctors
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "doctors_update_own" ON public.doctors;
CREATE POLICY "doctors_update_own" ON public.doctors
    FOR UPDATE
    USING (user_id = auth.uid());

-- ============================================================================
-- POLICIES: appointments
-- ============================================================================

DROP POLICY IF EXISTS "appointments_select_patient" ON public.appointments;
CREATE POLICY "appointments_select_patient" ON public.appointments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "appointments_select_doctor" ON public.appointments;
CREATE POLICY "appointments_select_doctor" ON public.appointments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "appointments_insert_auth" ON public.appointments;
CREATE POLICY "appointments_insert_auth" ON public.appointments
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "appointments_update_auth" ON public.appointments;
CREATE POLICY "appointments_update_auth" ON public.appointments
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        )
    );

-- ============================================================================
-- POLICIES: patient_care_team
-- ============================================================================

DROP POLICY IF EXISTS "care_team_select_patient" ON public.patient_care_team;
CREATE POLICY "care_team_select_patient" ON public.patient_care_team
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "care_team_select_doctor" ON public.patient_care_team;
CREATE POLICY "care_team_select_doctor" ON public.patient_care_team
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

-- Reutilizar función update_updated_at() de migración anterior
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- GRANTS: Ensure authenticated users can access tables
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_care_team TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;

-- ============================================================================
-- Migration complete!
-- ============================================================================

COMMENT ON SCHEMA public IS 'AutaMedica medical schema v2 - TypeScript-aligned (2025-10-08)';
