-- Migration: Patient Vital Signs Tracking
-- Date: 2025-10-07
-- Purpose: Create table for tracking patient vital signs (blood pressure, heart rate, temperature, etc.)

-- ============================================================================
-- 1. Create patient_vital_signs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patient_vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,

  -- Vital signs measurements
  systolic_bp integer,  -- mmHg
  diastolic_bp integer, -- mmHg
  heart_rate integer,   -- beats per minute
  temperature decimal(4,1), -- Celsius
  respiratory_rate integer, -- breaths per minute
  oxygen_saturation integer, -- percentage (SpO2)
  weight_kg decimal(5,2),
  height_cm integer,

  -- Metadata
  measured_at timestamptz DEFAULT now(),
  measured_by uuid REFERENCES auth.users(id), -- doctor or nurse who recorded it
  measurement_method text, -- 'manual', 'automatic', 'self_reported'
  notes text,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.patient_vital_signs IS 'Stores vital signs measurements for patients over time';
COMMENT ON COLUMN public.patient_vital_signs.systolic_bp IS 'Systolic blood pressure in mmHg';
COMMENT ON COLUMN public.patient_vital_signs.diastolic_bp IS 'Diastolic blood pressure in mmHg';
COMMENT ON COLUMN public.patient_vital_signs.heart_rate IS 'Heart rate in beats per minute';
COMMENT ON COLUMN public.patient_vital_signs.temperature IS 'Body temperature in Celsius';
COMMENT ON COLUMN public.patient_vital_signs.measurement_method IS 'How the measurement was taken: manual, automatic, self_reported';

-- ============================================================================
-- 2. Create indices for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_date
  ON public.patient_vital_signs(patient_id, measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_vital_signs_measured_at
  ON public.patient_vital_signs(measured_at DESC);

-- ============================================================================
-- 3. Enable RLS
-- ============================================================================
ALTER TABLE public.patient_vital_signs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. Create RLS policies
-- ============================================================================

-- Policy: Patients can view their own vital signs
DROP POLICY IF EXISTS vital_signs_select_patient ON public.patient_vital_signs;
CREATE POLICY vital_signs_select_patient ON public.patient_vital_signs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_vital_signs.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- Policy: Doctors can view vital signs of their patients
DROP POLICY IF EXISTS vital_signs_select_doctor ON public.patient_vital_signs;
CREATE POLICY vital_signs_select_doctor ON public.patient_vital_signs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      JOIN public.doctors d ON d.id = pct.doctor_id
      WHERE pct.patient_id = patient_vital_signs.patient_id
        AND d.user_id = auth.uid()
        AND pct.active = true
    )
  );

-- Policy: Doctors can insert vital signs for their patients
DROP POLICY IF EXISTS vital_signs_insert_doctor ON public.patient_vital_signs;
CREATE POLICY vital_signs_insert_doctor ON public.patient_vital_signs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      JOIN public.doctors d ON d.id = pct.doctor_id
      WHERE pct.patient_id = patient_vital_signs.patient_id
        AND d.user_id = auth.uid()
        AND pct.active = true
    )
  );

-- Policy: Patients can self-report vital signs
DROP POLICY IF EXISTS vital_signs_insert_patient ON public.patient_vital_signs;
CREATE POLICY vital_signs_insert_patient ON public.patient_vital_signs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_vital_signs.patient_id
        AND p.user_id = auth.uid()
    )
    AND measurement_method = 'self_reported'
  );

-- Policy: Admins can view all vital signs
DROP POLICY IF EXISTS vital_signs_select_admin ON public.patient_vital_signs;
CREATE POLICY vital_signs_select_admin ON public.patient_vital_signs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('platform_admin', 'company_admin', 'organization_admin')
    )
  );

-- ============================================================================
-- 5. Create trigger for updated_at
-- ============================================================================
CREATE TRIGGER update_vital_signs_updated_at
  BEFORE UPDATE ON public.patient_vital_signs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. Grant permissions
-- ============================================================================
GRANT SELECT ON public.patient_vital_signs TO authenticated;
GRANT INSERT ON public.patient_vital_signs TO authenticated;

-- ============================================================================
-- 7. Helper function to get latest vital signs for a patient (OPTIONAL)
-- ============================================================================
-- Note: This function is optional and not used by the React hooks.
-- Uncomment if needed for server-side queries.

-- CREATE OR REPLACE FUNCTION public.get_latest_vital_signs(p_patient_id uuid)
-- RETURNS TABLE (
--   systolic_bp integer,
--   diastolic_bp integer,
--   heart_rate integer,
--   temperature decimal,
--   measured_at timestamptz
-- )
-- LANGUAGE sql
-- STABLE
-- SECURITY INVOKER
-- AS $$
--   SELECT
--     systolic_bp,
--     diastolic_bp,
--     heart_rate,
--     temperature,
--     measured_at
--   FROM public.patient_vital_signs
--   WHERE patient_id = p_patient_id
--   ORDER BY measured_at DESC
--   LIMIT 1;
-- $$;

-- COMMENT ON FUNCTION public.get_latest_vital_signs IS 'Returns the most recent vital signs for a patient';
