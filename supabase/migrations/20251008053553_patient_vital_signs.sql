-- Migration: Patient Vital Signs Tracking (Generated via supabase migration new)
-- Applies patient vital signs table, policies, and trigger.

CREATE TABLE IF NOT EXISTS public.patient_vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  systolic_bp integer,
  diastolic_bp integer,
  heart_rate integer,
  temperature decimal(4,1),
  respiratory_rate integer,
  oxygen_saturation integer,
  weight_kg decimal(5,2),
  height_cm integer,
  measured_at timestamptz DEFAULT now(),
  measured_by uuid REFERENCES auth.users(id),
  measurement_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.patient_vital_signs IS 'Stores vital signs measurements for patients over time';
COMMENT ON COLUMN public.patient_vital_signs.systolic_bp IS 'Systolic blood pressure in mmHg';
COMMENT ON COLUMN public.patient_vital_signs.diastolic_bp IS 'Diastolic blood pressure in mmHg';
COMMENT ON COLUMN public.patient_vital_signs.heart_rate IS 'Heart rate in beats per minute';
COMMENT ON COLUMN public.patient_vital_signs.temperature IS 'Body temperature in Celsius';
COMMENT ON COLUMN public.patient_vital_signs.measurement_method IS 'How the measurement was taken: manual, automatic, self_reported';

CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_date ON public.patient_vital_signs(patient_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_vital_signs_measured_at ON public.patient_vital_signs(measured_at DESC);

ALTER TABLE public.patient_vital_signs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vital_signs_select_patient ON public.patient_vital_signs;
CREATE POLICY vital_signs_select_patient ON public.patient_vital_signs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_vital_signs.patient_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS vital_signs_select_doctor ON public.patient_vital_signs;
CREATE POLICY vital_signs_select_doctor ON public.patient_vital_signs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      JOIN public.doctors d ON d.id = pct.doctor_id
      WHERE pct.patient_id = patient_vital_signs.patient_id
        AND d.user_id = auth.uid()
        AND pct.active = true
    )
  );

DROP POLICY IF EXISTS vital_signs_insert_doctor ON public.patient_vital_signs;
CREATE POLICY vital_signs_insert_doctor ON public.patient_vital_signs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      JOIN public.doctors d ON d.id = pct.doctor_id
      WHERE pct.patient_id = patient_vital_signs.patient_id
        AND d.user_id = auth.uid()
        AND pct.active = true
    )
  );

DROP POLICY IF EXISTS vital_signs_insert_patient ON public.patient_vital_signs;
CREATE POLICY vital_signs_insert_patient ON public.patient_vital_signs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_vital_signs.patient_id
        AND p.user_id = auth.uid()
    )
    AND measurement_method = 'self_reported'
  );

DROP POLICY IF EXISTS vital_signs_select_admin ON public.patient_vital_signs;
CREATE POLICY vital_signs_select_admin ON public.patient_vital_signs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('platform_admin', 'company_admin', 'organization_admin')
    )
  );

DROP TRIGGER IF EXISTS update_vital_signs_updated_at ON public.patient_vital_signs;
CREATE TRIGGER update_vital_signs_updated_at
  BEFORE UPDATE ON public.patient_vital_signs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

GRANT SELECT ON public.patient_vital_signs TO authenticated;
GRANT INSERT ON public.patient_vital_signs TO authenticated;
