-- AutaMedica Database Schema
-- Generated: 2025-09-19
-- Supabase Project: gtyvdircfhmdjiaelqkg

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- User Profiles Table (auth bridge)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    email VARCHAR NOT NULL,
    role VARCHAR CHECK (role IN (
        'patient',
        'doctor',
        'company',
        'company_admin',
        'organization_admin',
        'admin',
        'platform_admin'
    )) DEFAULT 'patient',
    first_name VARCHAR,
    last_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- ============================================================================
-- Triggers & helpers shared by multiple tables
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON COLUMN public.profiles.role IS 'User role: patient, doctor, company, company_admin, organization_admin, admin, platform_admin';
COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Users can only view their own profile information';
COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS 'Platform and regular admins can view all user profiles';

-- ============================================================================
-- Domain tables
-- ============================================================================

-- --------------------------------------------------------------------------
-- Organizations (create first due to FK dependencies)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    legal_name VARCHAR,
    tax_id VARCHAR,
    type VARCHAR CHECK (type IN ('company', 'clinic', 'provider', 'partner', 'internal')) DEFAULT 'company',
    industry VARCHAR,
    size VARCHAR CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    address JSONB,
    contact JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization owners manage organization" ON public.organizations
FOR ALL USING (owner_profile_id = auth.uid())
WITH CHECK (owner_profile_id = auth.uid());

CREATE POLICY "Admins manage organizations" ON public.organizations
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;

COMMENT ON TABLE public.organizations IS 'Employer/enterprise accounts linked to organization_admin profiles';

-- --------------------------------------------------------------------------
-- Doctors
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view self" ON public.doctors
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors update self" ON public.doctors
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage doctors" ON public.doctors
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.doctors TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;

COMMENT ON TABLE public.doctors IS 'Extended doctor metadata linked to auth profiles';

-- --------------------------------------------------------------------------
-- Patients
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
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

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view self" ON public.patients
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients update self" ON public.patients
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage patients" ON public.patients
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE POLICY "Doctors view assigned patients" ON public.patients
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.patient_care_team pct
        JOIN public.doctors d ON d.id = pct.doctor_id
        WHERE pct.patient_id = public.patients.id
          AND d.user_id = auth.uid()
    )
);

CREATE POLICY "Organization admins view organization patients" ON public.patients
FOR SELECT USING (
    EXISTS (
        SELECT 1
        FROM public.org_members cm
        WHERE cm.organization_id = public.patients.organization_id
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.patients TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;

COMMENT ON TABLE public.patients IS 'Patient demographic + contact information linked to auth profiles';

-- --------------------------------------------------------------------------
-- Organization Membership
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.org_members (
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR CHECK (role IN ('owner', 'admin', 'member', 'billing', 'support')) DEFAULT 'member',
    status VARCHAR CHECK (status IN ('pending', 'active', 'suspended', 'revoked')) DEFAULT 'active',
    invited_by UUID REFERENCES public.profiles(id),
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (organization_id, profile_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view membership" ON public.org_members
FOR SELECT USING (
    profile_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.org_members owner
        WHERE owner.organization_id = public.org_members.organization_id
          AND owner.profile_id = auth.uid()
          AND owner.role IN ('owner', 'admin')
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE POLICY "Organization admins manage members" ON public.org_members
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = public.org_members.organization_id
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = public.org_members.organization_id
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Platform admins manage members" ON public.org_members
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'platform_admin'
    )
);

CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON public.org_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.org_members;

COMMENT ON TABLE public.org_members IS 'Links profiles to employer organizations with portal-specific roles';

-- --------------------------------------------------------------------------
-- User role assignments
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL CHECK (role IN ('patient', 'doctor', 'company', 'company_admin', 'organization_admin', 'admin', 'platform_admin')),
    granted_by UUID REFERENCES public.profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE UNIQUE INDEX user_roles_unique_global_role
    ON public.user_roles (profile_id, role)
    WHERE organization_id IS NULL;

CREATE UNIQUE INDEX user_roles_unique_org_role
    ON public.user_roles (profile_id, organization_id, role)
    WHERE organization_id IS NOT NULL;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own roles" ON public.user_roles
FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Organization admins manage scoped roles" ON public.user_roles
FOR ALL USING (
    organization_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.org_members om
        WHERE om.organization_id = public.user_roles.organization_id
          AND om.profile_id = auth.uid()
          AND om.role IN ('owner', 'admin')
    )
)
WITH CHECK (
    organization_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM public.org_members om
        WHERE om.organization_id = public.user_roles.organization_id
          AND om.profile_id = auth.uid()
          AND om.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Platform admins manage user roles" ON public.user_roles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'platform_admin'
    )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

COMMENT ON TABLE public.user_roles IS 'Normalized role assignments per user with optional organization scope';
COMMENT ON COLUMN public.user_roles.role IS 'Role assigned to the profile (patient, doctor, company, organization_admin, admin, platform_admin)';

CREATE OR REPLACE FUNCTION public.select_primary_role_for_profile(target_profile_id UUID)
RETURNS TEXT AS $$
DECLARE
    selected_role TEXT;
BEGIN
    SELECT ur.role
    INTO selected_role
    FROM public.user_roles ur
    WHERE ur.profile_id = target_profile_id
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    ORDER BY CASE ur.role
        WHEN 'platform_admin' THEN 100
        WHEN 'admin' THEN 90
        WHEN 'organization_admin' THEN 80
        WHEN 'company_admin' THEN 75
        WHEN 'company' THEN 70
        WHEN 'doctor' THEN 60
        WHEN 'patient' THEN 50
        ELSE 0
    END DESC,
    ur.granted_at DESC
    LIMIT 1;

    RETURN COALESCE(selected_role, 'patient');
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.sync_profile_primary_role()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET role = public.select_primary_role_for_profile(OLD.profile_id),
            updated_at = NOW()
        WHERE id = OLD.profile_id;
        RETURN OLD;
    END IF;

    UPDATE public.profiles
    SET role = public.select_primary_role_for_profile(NEW.profile_id),
        updated_at = NOW()
    WHERE id = NEW.profile_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_profile_role_after_user_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_primary_role();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    raw_role TEXT;
    normalized_role TEXT;
BEGIN
    raw_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');
    normalized_role := LOWER(raw_role);

    IF normalized_role = 'company_admin' THEN
        normalized_role := 'organization_admin';
    ELSIF normalized_role NOT IN ('patient', 'doctor', 'company', 'organization_admin', 'admin', 'platform_admin') THEN
        normalized_role := 'patient';
    END IF;

    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, normalized_role);

    INSERT INTO public.user_roles (profile_id, organization_id, role, granted_by)
    VALUES (NEW.id, NULL, normalized_role, NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------------
-- Patient care team (doctor ↔ patient assignments)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_care_team (
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    relationship VARCHAR DEFAULT 'primary',
    added_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (patient_id, doctor_id)
);

ALTER TABLE public.patient_care_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view care team" ON public.patient_care_team
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients pat
        WHERE pat.id = patient_id
          AND pat.user_id = auth.uid()
    )
);

CREATE POLICY "Doctors manage assignments" ON public.patient_care_team
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.doctors d
        WHERE d.id = doctor_id
          AND d.user_id = auth.uid()
    )
);

CREATE POLICY "Admins manage assignments" ON public.patient_care_team
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_patient_care_team_updated_at
    BEFORE UPDATE ON public.patient_care_team
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_care_team TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_care_team;

COMMENT ON TABLE public.patient_care_team IS 'Associates patients with their authorized doctors';

-- --------------------------------------------------------------------------
-- Appointments
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 480),
    type VARCHAR CHECK (type IN ('consultation', 'follow-up', 'emergency')) DEFAULT 'consultation',
    status VARCHAR CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled')) DEFAULT 'scheduled',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient access appointments" ON public.appointments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients pat
        WHERE pat.id = public.appointments.patient_id
          AND pat.user_id = auth.uid()
    )
);

CREATE POLICY "Doctor access appointments" ON public.appointments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        WHERE doc.id = public.appointments.doctor_id
          AND doc.user_id = auth.uid()
    )
);

CREATE POLICY "Organization admin access appointments" ON public.appointments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = public.appointments.organization_id
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

CREATE POLICY "Admins manage appointments" ON public.appointments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE POLICY "Doctors create appointments" ON public.appointments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        WHERE doc.id = public.appointments.doctor_id
          AND doc.user_id = auth.uid()
    )
);

CREATE POLICY "Patients manage own appointments" ON public.appointments
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.patients pat
        WHERE pat.id = public.appointments.patient_id
          AND pat.user_id = auth.uid()
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.patients pat
        WHERE pat.id = public.appointments.patient_id
          AND pat.user_id = auth.uid()
    )
);

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

COMMENT ON TABLE public.appointments IS 'Scheduling metadata for patient ↔ doctor encounters';

-- --------------------------------------------------------------------------
-- Medical records
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    summary TEXT,
    data JSONB,
    visibility VARCHAR CHECK (visibility IN ('patient', 'care_team', 'private')) DEFAULT 'care_team',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients read own records" ON public.medical_records
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients pat
        WHERE pat.id = public.medical_records.patient_id
          AND pat.user_id = auth.uid()
    )
    AND public.medical_records.visibility IN ('patient', 'care_team')
);

CREATE POLICY "Doctors read assigned records" ON public.medical_records
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        WHERE doc.user_id = auth.uid()
          AND (
            doc.id = public.medical_records.doctor_id
            OR EXISTS (
                SELECT 1 FROM public.patient_care_team pct
                WHERE pct.patient_id = public.medical_records.patient_id
                  AND pct.doctor_id = doc.id
            )
          )
    )
);

CREATE POLICY "Doctors manage authored records" ON public.medical_records
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        WHERE doc.user_id = auth.uid()
          AND doc.id = public.medical_records.doctor_id
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        WHERE doc.user_id = auth.uid()
          AND doc.id = public.medical_records.doctor_id
    )
);

CREATE POLICY "Admins manage medical records" ON public.medical_records
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON public.medical_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medical_records;

COMMENT ON TABLE public.medical_records IS 'Clinical documents and structured notes tied to appointments';

-- ============================================================================
-- Security Hardening comments
-- ============================================================================
COMMENT ON POLICY "Doctors view assigned patients" ON public.patients IS 'Care-team constrained visibility';
COMMENT ON POLICY "Organization owners manage organization" ON public.organizations IS 'Organization owner control';
COMMENT ON POLICY "Members view membership" ON public.org_members IS 'Members and admins can review organization affiliation records';
COMMENT ON POLICY "Doctors create appointments" ON public.appointments IS 'Only treating doctors can schedule or modify encounters they own';
COMMENT ON POLICY "Patients read own records" ON public.medical_records IS 'Patients access their clinical documentation when permitted';

-- ============================================================================
-- TRANSACTIONAL TABLES EXTENSION (Added 2025-09-20)
-- Business Operations: Billing, Payments, Subscriptions, Audit
-- ============================================================================

-- --------------------------------------------------------------------------
-- Billing accounts - Links organizations and patients to billing
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.billing_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR CHECK (entity_type IN ('patient', 'organization')) NOT NULL,
    entity_id UUID NOT NULL, -- References either patient or organization
    billing_name VARCHAR NOT NULL,
    billing_email VARCHAR NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method JSONB, -- Encrypted payment method details
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.billing_accounts ENABLE ROW LEVEL SECURITY;

-- Patients can view own billing account
CREATE POLICY "Patients view own billing" ON public.billing_accounts
FOR SELECT USING (
    entity_type = 'patient' AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = entity_id AND p.user_id = auth.uid()
    )
);

-- Organization admins can view organization billing
CREATE POLICY "Organizations view own billing" ON public.billing_accounts
FOR SELECT USING (
    entity_type = 'organization' AND EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = entity_id 
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Platform admins can view all billing
CREATE POLICY "Admins manage billing accounts" ON public.billing_accounts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_billing_accounts_updated_at
    BEFORE UPDATE ON public.billing_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.billing_accounts TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.billing_accounts;

COMMENT ON TABLE public.billing_accounts IS 'Billing information for patients and organizations';

-- --------------------------------------------------------------------------
-- Invoices - Medical service billing
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR UNIQUE NOT NULL,
    billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    
    -- Invoice details
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status tracking
    status VARCHAR CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')) DEFAULT 'draft',
    payment_terms VARCHAR DEFAULT '30 days',
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Patients can view their invoices
CREATE POLICY "Patients view own invoices" ON public.invoices
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = patient_id AND p.user_id = auth.uid()
    )
);

-- Doctors can view invoices for their services
CREATE POLICY "Doctors view service invoices" ON public.invoices
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.doctors d
        WHERE d.id = doctor_id AND d.user_id = auth.uid()
    )
);

-- Organization admins can view invoices for their organization
CREATE POLICY "Companies view invoices" ON public.invoices
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.billing_accounts ba
        JOIN public.org_members cm ON cm.organization_id = ba.entity_id
        WHERE ba.id = billing_account_id
          AND ba.entity_type = 'organization'
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Admins can manage all invoices
CREATE POLICY "Admins manage invoices" ON public.invoices
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

COMMENT ON TABLE public.invoices IS 'Medical service invoices and billing records';

-- --------------------------------------------------------------------------
-- Invoice line items - Detailed billing items
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    service_code VARCHAR, -- CPT or internal service code
    description VARCHAR NOT NULL,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice items inherit access from parent invoice
CREATE POLICY "Invoice items inherit access" ON public.invoice_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices inv
        WHERE inv.id = invoice_id
    )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_items;

COMMENT ON TABLE public.invoice_items IS 'Detailed line items for medical service invoices';

-- --------------------------------------------------------------------------
-- Payments - Payment transaction records
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
    
    -- Payment details
    payment_method VARCHAR CHECK (payment_method IN ('credit_card', 'bank_transfer', 'check', 'cash', 'insurance', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_id VARCHAR, -- External payment processor ID
    
    -- Status and metadata
    status VARCHAR CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments inherit access from invoices
CREATE POLICY "Payments inherit invoice access" ON public.payments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.invoices inv
        WHERE inv.id = invoice_id
    )
);

-- Admins can manage payments
CREATE POLICY "Admins manage payments" ON public.payments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

COMMENT ON TABLE public.payments IS 'Payment transaction records for medical services';

-- --------------------------------------------------------------------------
-- Service plans - Subscription tiers and pricing
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    plan_type VARCHAR CHECK (plan_type IN ('individual', 'family', 'corporate', 'enterprise')) NOT NULL,
    
    -- Pricing
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Features and limits
    features JSONB, -- Feature flags and limits
    max_users INTEGER,
    max_appointments_per_month INTEGER,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE, -- Whether shown in public pricing
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view public plans
CREATE POLICY "Anyone can view public plans" ON public.service_plans
FOR SELECT USING (is_public = TRUE);

-- Admins can manage all plans
CREATE POLICY "Admins manage service plans" ON public.service_plans
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_service_plans_updated_at
    BEFORE UPDATE ON public.service_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT ON public.service_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_plans TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_plans;

COMMENT ON TABLE public.service_plans IS 'Subscription plans and pricing tiers';

-- --------------------------------------------------------------------------
-- Subscriptions - Active service subscriptions
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_type VARCHAR CHECK (subscriber_type IN ('patient', 'organization')) NOT NULL,
    subscriber_id UUID NOT NULL, -- References either patient or organization
    service_plan_id UUID NOT NULL REFERENCES public.service_plans(id) ON DELETE RESTRICT,
    billing_account_id UUID NOT NULL REFERENCES public.billing_accounts(id) ON DELETE CASCADE,
    
    -- Subscription details
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    billing_cycle VARCHAR CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    status VARCHAR CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
    
    -- Next billing
    next_billing_date DATE,
    
    -- Trial period
    trial_start_date DATE,
    trial_end_date DATE,
    is_trial BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Patients can view own subscriptions
CREATE POLICY "Patients view own subscriptions" ON public.subscriptions
FOR SELECT USING (
    subscriber_type = 'patient' AND EXISTS (
        SELECT 1 FROM public.patients p
        WHERE p.id = subscriber_id AND p.user_id = auth.uid()
    )
);

-- Organization admins can view organization subscriptions
CREATE POLICY "Companies view own subscriptions" ON public.subscriptions
FOR SELECT USING (
    subscriber_type = 'organization' AND EXISTS (
        SELECT 1 FROM public.org_members cm
        WHERE cm.organization_id = subscriber_id 
          AND cm.profile_id = auth.uid()
          AND cm.role IN ('owner', 'admin')
    )
);

-- Admins can manage all subscriptions
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;

COMMENT ON TABLE public.subscriptions IS 'Active subscription records for patients and organizations';

-- --------------------------------------------------------------------------
-- Audit log - System activity tracking
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
    resource_type VARCHAR NOT NULL, -- 'patient', 'appointment', 'medical_record', etc.
    resource_id UUID, -- ID of the affected resource
    
    -- Change tracking
    old_values JSONB, -- Previous state (for updates/deletes)
    new_values JSONB, -- New state (for creates/updates)
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs" ON public.audit_log
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- System can insert audit logs (via service role)
GRANT INSERT ON public.audit_log TO service_role;
GRANT SELECT ON public.audit_log TO authenticated;

COMMENT ON TABLE public.audit_log IS 'System audit trail for compliance and security';

-- --------------------------------------------------------------------------
-- Error log - Application error tracking
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.error_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Error details
    error_type VARCHAR NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    
    -- Context
    url VARCHAR,
    method VARCHAR,
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    severity VARCHAR CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view error logs
CREATE POLICY "Admins view error logs" ON public.error_log
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'platform_admin')
    )
);

-- System can insert error logs (via service role)
GRANT INSERT ON public.error_log TO service_role;
GRANT SELECT, UPDATE ON public.error_log TO authenticated;

COMMENT ON TABLE public.error_log IS 'Application error tracking for debugging and monitoring';

-- ============================================================================
-- PERFORMANCE INDEXES FOR TRANSACTIONAL TABLES
-- ============================================================================

-- Billing and payment indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_billing_accounts_entity ON public.billing_accounts(entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_billing_account ON public.invoices(billing_account_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date) WHERE status IN ('sent', 'overdue');
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Subscription indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_subscriber ON public.subscriptions(subscriber_type, subscriber_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_billing_date ON public.subscriptions(next_billing_date) WHERE status = 'active';

-- Audit and logging indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_log_severity ON public.error_log(severity, is_resolved);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_log_created_at ON public.error_log(created_at);

-- ============================================================================
-- HELPER FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    next_number INTEGER;
    invoice_number VARCHAR;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number ~ '^INV-[0-9]+$';
    
    -- Format as INV-000001
    invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.invoices
    SET 
        subtotal = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM public.invoice_items
            WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
        ),
        total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update invoice totals when items change
DROP TRIGGER IF EXISTS update_invoice_totals_trigger ON public.invoice_items;
CREATE TRIGGER update_invoice_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

-- ============================================================================
-- INITIAL SERVICE PLANS DATA
-- ============================================================================

-- Insert default service plans
INSERT INTO public.service_plans (name, description, plan_type, price_monthly, price_yearly, features, max_users, max_appointments_per_month) VALUES
('Basic Individual', 'Essential healthcare access for individuals', 'individual', 29.99, 299.99, 
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "max_doctors": 3}', 1, 10),
('Premium Individual', 'Comprehensive healthcare with priority support', 'individual', 49.99, 499.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "priority_support": true, "specialist_access": true, "max_doctors": 10}', 1, 25),
('Family Plan', 'Healthcare coverage for the whole family', 'family', 99.99, 999.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "family_sharing": true, "max_doctors": 15}', 6, 50),
('Corporate Basic', 'Essential employee healthcare benefits', 'corporate', 15.99, 159.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "admin_dashboard": true}', 100, 200),
('Enterprise', 'Full-featured healthcare platform for large organizations', 'enterprise', 49.99, 499.99,
 '{"telemedicine": true, "medical_records": true, "appointment_scheduling": true, "admin_dashboard": true, "custom_integrations": true, "dedicated_support": true}', 1000, 2000)
ON CONFLICT DO NOTHING;
