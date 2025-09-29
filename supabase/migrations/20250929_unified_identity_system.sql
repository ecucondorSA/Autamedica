-- Perfiles base con external_id para IDs cortos
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('patient','doctor','company','company_admin','organization_admin')),
  external_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Entidades específicas
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  company_id uuid,
  medical_record_number text UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  license_number text UNIQUE NOT NULL,
  speciality text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  tax_id text UNIQUE NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Relación doctor-paciente
CREATE TABLE IF NOT EXISTS public.doctor_patient (
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (doctor_id, patient_id)
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role='patient' AND p.user_id = public.patients.user_id
  ));

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors can view own data" ON public.doctors
  FOR SELECT USING (EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role='doctor' AND p.user_id = public.doctors.user_id
  ));

-- Función para generar external_id único
CREATE OR REPLACE FUNCTION generate_external_id(role_prefix text)
RETURNS text AS $$
BEGIN
  RETURN role_prefix || '_' || substr(encode(gen_random_bytes(6), 'base64'), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar external_id
CREATE OR REPLACE FUNCTION auto_generate_external_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.external_id IS NULL THEN
    NEW.external_id := generate_external_id(
      CASE NEW.role
        WHEN 'patient' THEN 'PAT'
        WHEN 'doctor' THEN 'DOC'
        WHEN 'company' THEN 'COM'
        WHEN 'company_admin' THEN 'ADM'
        WHEN 'organization_admin' THEN 'ORG'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_external_id_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION auto_generate_external_id();