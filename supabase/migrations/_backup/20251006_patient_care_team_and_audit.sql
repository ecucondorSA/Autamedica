-- Migration: patient_care_team table + RLS + indices + audit trigger on medical_records
-- Date: 2025-10-06
-- Purpose: HIPAA-compliant care team management + comprehensive audit logging

-- ============================================================================
-- 1. Create patient_care_team table (idempotent)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='patient_care_team' AND relnamespace = 'public'::regnamespace) THEN
    CREATE TABLE public.patient_care_team (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
      patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
      role text DEFAULT 'primary_doctor' CHECK (role IN ('primary_doctor','specialist','nurse','therapist','other')),
      active boolean DEFAULT true,
      assigned_at timestamptz DEFAULT now(),
      assigned_by uuid REFERENCES auth.users(id),
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE (doctor_id, patient_id, role)
    );

    COMMENT ON TABLE public.patient_care_team IS 'Manages doctor-patient care relationships with role-based access';
    COMMENT ON COLUMN public.patient_care_team.role IS 'Care team role: primary_doctor, specialist, nurse, therapist, other';
    COMMENT ON COLUMN public.patient_care_team.active IS 'Whether this care relationship is currently active';
  END IF;
END $$;

-- ============================================================================
-- 2. Enable RLS on patient_care_team
-- ============================================================================
ALTER TABLE public.patient_care_team ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Create indices for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_patient_care_team_lookup
  ON public.patient_care_team(doctor_id, patient_id, active);

CREATE INDEX IF NOT EXISTS idx_patient_care_team_patient
  ON public.patient_care_team(patient_id, active)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_patient_care_team_doctor
  ON public.patient_care_team(doctor_id, active)
  WHERE active = true;

-- ============================================================================
-- 4. Create RLS policies for patient_care_team
-- ============================================================================

-- Policy: Doctors can view their own care team assignments
DROP POLICY IF EXISTS patient_care_team_select_doctor ON public.patient_care_team;
CREATE POLICY patient_care_team_select_doctor ON public.patient_care_team
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = patient_care_team.doctor_id
        AND d.user_id = auth.uid()
    )
  );

-- Policy: Patients can view their own care team
DROP POLICY IF EXISTS patient_care_team_select_patient ON public.patient_care_team;
CREATE POLICY patient_care_team_select_patient ON public.patient_care_team
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_care_team.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- Policy: System admins can view all care team relationships
DROP POLICY IF EXISTS patient_care_team_select_admin ON public.patient_care_team;
CREATE POLICY patient_care_team_select_admin ON public.patient_care_team
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Policy: Doctors can insert care team assignments for themselves
DROP POLICY IF EXISTS patient_care_team_insert_doctor ON public.patient_care_team;
CREATE POLICY patient_care_team_insert_doctor ON public.patient_care_team
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = patient_care_team.doctor_id
        AND d.user_id = auth.uid()
    )
  );

-- Policy: Admins can manage all care team assignments
DROP POLICY IF EXISTS patient_care_team_all_admin ON public.patient_care_team;
CREATE POLICY patient_care_team_all_admin ON public.patient_care_team
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. Create helper function to check care team membership
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_in_care_team(
  p_doctor_id uuid,
  p_patient_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_care_team pct
    WHERE pct.doctor_id = p_doctor_id
      AND pct.patient_id = p_patient_id
      AND pct.active = true
  );
$$;

COMMENT ON FUNCTION public.is_in_care_team IS 'Check if a doctor is in a patient''s active care team';

-- ============================================================================
-- 6. Create audit logging function for medical_records
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_medical_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_patient_user_id uuid;
  v_operation text;
BEGIN
  -- Determine operation type
  v_operation := TG_OP;

  -- Get patient's user_id
  SELECT p.user_id INTO v_patient_user_id
  FROM public.patients p
  WHERE p.id = COALESCE(NEW.patient_id, OLD.patient_id);

  -- Log the access (requires audit_logs table to exist)
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='audit_logs' AND relnamespace = 'public'::regnamespace) THEN
    INSERT INTO public.audit_logs (
      operation,
      table_name,
      record_id,
      patient_user_id,
      accessed_by,
      accessed_at,
      metadata
    ) VALUES (
      v_operation,
      'medical_records',
      COALESCE(NEW.id, OLD.id),
      v_patient_user_id,
      auth.uid(),
      now(),
      jsonb_build_object(
        'doctor_id', COALESCE(NEW.doctor_id, OLD.doctor_id),
        'diagnosis', COALESCE(NEW.diagnosis, OLD.diagnosis, 'N/A'),
        'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for'
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION public.log_medical_change IS 'Audit trigger function for medical_records changes (HIPAA compliance)';

-- ============================================================================
-- 7. Create trigger on medical_records table
-- ============================================================================
DROP TRIGGER IF EXISTS tr_medical_records_audit ON public.medical_records;

CREATE TRIGGER tr_medical_records_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.log_medical_change();

COMMENT ON TRIGGER tr_medical_records_audit ON public.medical_records IS 'Audit all changes to medical records for HIPAA compliance';

-- ============================================================================
-- 8. Grant permissions
-- ============================================================================
GRANT SELECT ON public.patient_care_team TO authenticated;
GRANT INSERT ON public.patient_care_team TO authenticated;
GRANT UPDATE ON public.patient_care_team TO authenticated;

-- ============================================================================
-- 9. Verification queries (commented out - for manual verification only)
-- ============================================================================
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname='public' AND tablename IN ('patient_care_team','medical_records');

-- SELECT schemaname, tablename, indexname FROM pg_indexes
-- WHERE tablename = 'patient_care_team';

-- SELECT tgname, tgenabled FROM pg_trigger
-- WHERE tgrelid = 'public.medical_records'::regclass;
