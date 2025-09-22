-- AutaMedica Essential Medical Schema
-- Simplified version for initial deployment

-- Create basic medical tables first

-- Profiles table (should already exist, but ensure it has all columns)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name VARCHAR;
    END IF;
END
$$;

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    tax_id VARCHAR NOT NULL,
    industry VARCHAR,
    size VARCHAR CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    address JSONB,
    contact JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
DROP POLICY IF EXISTS "Company owners manage company" ON public.companies;
CREATE POLICY "Company owners manage company" ON public.companies
FOR ALL USING (owner_profile_id = auth.uid())
WITH CHECK (owner_profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage companies" ON public.companies;
CREATE POLICY "Admins manage companies" ON public.companies
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- Doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    license_number VARCHAR NOT NULL,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    bio TEXT,
    education JSONB,
    experience JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Doctors policies
DROP POLICY IF EXISTS "Doctors view self" ON public.doctors;
CREATE POLICY "Doctors view self" ON public.doctors
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors update self" ON public.doctors;
CREATE POLICY "Doctors update self" ON public.doctors
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage doctors" ON public.doctors;
CREATE POLICY "Admins manage doctors" ON public.doctors
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- Patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    date_of_birth DATE,
    gender VARCHAR CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    medical_record_number VARCHAR UNIQUE,
    address JSONB,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Patients policies
DROP POLICY IF EXISTS "Patients view self" ON public.patients;
CREATE POLICY "Patients view self" ON public.patients
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients update self" ON public.patients;
CREATE POLICY "Patients update self" ON public.patients
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage patients" ON public.patients;
CREATE POLICY "Admins manage patients" ON public.patients
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;

-- Comments
COMMENT ON TABLE public.companies IS 'Employer/enterprise accounts linked to company_admin profiles';
COMMENT ON TABLE public.doctors IS 'Extended doctor metadata linked to auth profiles';
COMMENT ON TABLE public.patients IS 'Patient demographic + contact information linked to auth profiles';