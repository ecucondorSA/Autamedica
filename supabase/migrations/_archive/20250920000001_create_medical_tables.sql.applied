-- AutaMedica Medical Schema - Complete Table Creation
-- Este archivo crea todas las tablas necesarias desde cero

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (base users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'company_admin', 'admin', 'platform_admin')),
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
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
    owner_profile_id UUID REFERENCES public.profiles(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) UNIQUE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) UNIQUE,
    dni TEXT UNIQUE,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_type TEXT,
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    emergency_contact JSONB,
    medical_history JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    medications JSONB DEFAULT '[]',
    insurance_info JSONB,
    company_id UUID REFERENCES public.companies(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_members table
CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id),
    profile_id UUID REFERENCES public.profiles(id),
    role TEXT DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
    position TEXT,
    department TEXT,
    employee_id TEXT,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, profile_id)
);

-- Create patient_care_team table
CREATE TABLE IF NOT EXISTS public.patient_care_team (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    doctor_id UUID REFERENCES public.doctors(id),
    role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'specialist', 'consultant')),
    assigned_date DATE DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, doctor_id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    doctor_id UUID REFERENCES public.doctors(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 30,
    type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow_up', 'emergency', 'telemedicine', 'lab_test')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    location TEXT,
    meeting_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    doctor_id UUID REFERENCES public.doctors(id),
    appointment_id UUID REFERENCES public.appointments(id),
    type TEXT NOT NULL CHECK (type IN ('consultation_notes', 'lab_results', 'imaging', 'prescription', 'diagnosis', 'treatment_plan')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    attachments JSONB DEFAULT '[]',
    visibility TEXT DEFAULT 'care_team' CHECK (visibility IN ('patient', 'care_team', 'doctor_only', 'company_admin')),
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS Policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Platform admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

-- Companies policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view own companies" ON public.companies
    FOR SELECT USING (
        owner_profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

-- Doctors policies
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own profile" ON public.doctors
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Platform admins can view all doctors" ON public.doctors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'platform_admin'
        )
    );

-- Patients policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own profile" ON public.patients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Doctors can view assigned patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patient_care_team pct
            JOIN public.doctors d ON d.id = pct.doctor_id
            WHERE pct.patient_id = public.patients.id 
            AND d.user_id = auth.uid()
        )
    );

-- Appointments policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        )
    );

-- Medical records policies
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their visible records" ON public.medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = patient_id AND p.user_id = auth.uid()
        ) AND visibility IN ('patient', 'care_team')
    );

CREATE POLICY "Doctors can view care team records" ON public.medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors d
            WHERE d.id = doctor_id AND d.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.patient_care_team pct
            JOIN public.doctors d ON d.id = pct.doctor_id
            WHERE pct.patient_id = public.medical_records.patient_id 
            AND d.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();