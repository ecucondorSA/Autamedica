-- ============================================================================
-- CORE MEDICAL TABLES - AutaMedica
-- ============================================================================
-- Created: 2025-10-08
-- Purpose: Add essential medical tables (patients, doctors, companies, appointments)
-- Compatible with existing profiles schema (id-based, not user_id-based)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: companies
-- Purpose: Healthcare companies and organizations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    cuit TEXT UNIQUE,
    industry TEXT,
    size TEXT CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    address JSONB,
    phone TEXT,
    email TEXT,
    website TEXT,
    owner_id UUID REFERENCES public.profiles(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_cuit ON public.companies(cuit);

COMMENT ON TABLE public.companies IS 'Healthcare companies and organizations';

-- ============================================================================
-- TABLE: doctors
-- Purpose: Medical professionals with licenses and specialties
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    specialty TEXT NOT NULL,
    subspecialty TEXT,
    years_experience INTEGER DEFAULT 0,
    education JSONB,
    certifications JSONB,
    schedule JSONB,
    consultation_fee DECIMAL(10,2),
    accepted_insurance JSONB,
    bio TEXT,
    languages JSONB DEFAULT '["Spanish"]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_license ON public.doctors(license_number);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty);

COMMENT ON TABLE public.doctors IS 'Medical professionals with licenses and specialties';
COMMENT ON COLUMN public.doctors.license_number IS 'Unique medical license number (e.g., MN 12345)';
COMMENT ON COLUMN public.doctors.specialty IS 'Primary medical specialty';

-- ============================================================================
-- TABLE: patients
-- Purpose: Patient profiles with medical history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
    dni TEXT UNIQUE,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    emergency_contact JSONB,
    medical_history JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    medications JSONB DEFAULT '[]',
    insurance_info JSONB,
    company_id UUID REFERENCES public.companies(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_dni ON public.patients(dni);
CREATE INDEX IF NOT EXISTS idx_patients_company ON public.patients(company_id);

COMMENT ON TABLE public.patients IS 'Patient profiles with medical history and insurance info';
COMMENT ON COLUMN public.patients.dni IS 'Documento Nacional de Identidad (Argentina)';
COMMENT ON COLUMN public.patients.emergency_contact IS 'Emergency contact: {name, phone, relationship}';

-- ============================================================================
-- TABLE: company_members
-- Purpose: Track employees/members of healthcare companies
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    position TEXT,
    department TEXT,
    employee_id TEXT,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_profile ON public.company_members(profile_id);

COMMENT ON TABLE public.company_members IS 'Employees/members of healthcare companies';

-- ============================================================================
-- TABLE: patient_care_team
-- Purpose: Assign doctors to patients (care team relationships)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patient_care_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'specialist', 'consultant')),
    assigned_date DATE DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(patient_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_care_team_patient ON public.patient_care_team(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_team_doctor ON public.patient_care_team(doctor_id);
CREATE INDEX IF NOT EXISTS idx_care_team_active ON public.patient_care_team(active);

COMMENT ON TABLE public.patient_care_team IS 'Assigns doctors to patients (care team relationships)';

-- ============================================================================
-- TABLE: appointments
-- Purpose: Medical appointments and consultations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 30,
    type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow_up', 'emergency', 'telemedicine', 'lab_test')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    location TEXT,
    meeting_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

COMMENT ON TABLE public.appointments IS 'Medical appointments and consultations';
COMMENT ON COLUMN public.appointments.meeting_url IS 'URL for telemedicine appointments';

-- ============================================================================
-- TABLE: medical_records
-- Purpose: Medical records with HIPAA-compliant access control
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id),
    type TEXT NOT NULL CHECK (type IN ('consultation_notes', 'lab_results', 'imaging', 'prescription', 'diagnosis', 'treatment_plan')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    attachments JSONB DEFAULT '[]',
    visibility TEXT DEFAULT 'care_team' CHECK (visibility IN ('patient', 'care_team', 'doctor_only', 'company_admin')),
    date_recorded TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON public.medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON public.medical_records(type);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON public.medical_records(date_recorded DESC);

COMMENT ON TABLE public.medical_records IS 'Medical records with HIPAA-compliant access control';
COMMENT ON COLUMN public.medical_records.visibility IS 'Access level: patient, care_team, doctor_only, company_admin';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_care_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: companies
-- ============================================================================

DROP POLICY IF EXISTS "companies_select_owner" ON public.companies;
CREATE POLICY "companies_select_owner" ON public.companies
    FOR SELECT
    USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "companies_insert_auth" ON public.companies;
CREATE POLICY "companies_insert_auth" ON public.companies
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "companies_update_owner" ON public.companies;
CREATE POLICY "companies_update_owner" ON public.companies
    FOR UPDATE
    USING (owner_id = auth.uid());

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
            WHERE id = auth.uid() AND role = 'admin'
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
            AND pct.active = true
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

-- ============================================================================
-- POLICIES: medical_records
-- ============================================================================

DROP POLICY IF EXISTS "medical_records_select_patient" ON public.medical_records;
CREATE POLICY "medical_records_select_patient" ON public.medical_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        ) AND visibility IN ('patient', 'care_team')
    );

DROP POLICY IF EXISTS "medical_records_select_doctor" ON public.medical_records;
CREATE POLICY "medical_records_select_doctor" ON public.medical_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.patient_care_team pct
            JOIN public.doctors d ON d.id = pct.doctor_id
            WHERE pct.patient_id = medical_records.patient_id
            AND d.user_id = auth.uid()
            AND pct.active = true
        )
    );

DROP POLICY IF EXISTS "medical_records_insert_doctor" ON public.medical_records;
CREATE POLICY "medical_records_insert_doctor" ON public.medical_records
    FOR INSERT
    WITH CHECK (
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

-- Function already exists from previous migration (handle_updated_at)
-- Just add triggers for new tables

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_doctors_updated_at ON public.doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- GRANTS: Ensure authenticated users can access tables
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.company_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_care_team TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT SELECT, INSERT ON public.medical_records TO authenticated;

-- ============================================================================
-- Migration complete!
-- ============================================================================

-- Now patient_vital_signs foreign keys should work correctly
