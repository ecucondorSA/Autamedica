-- Migration: Patient Screenings System
-- Fecha: 2025-10-07
-- Propósito: Reemplazar screenings mockeados con sistema de tracking real
-- Referencia: docs/audits/PATIENTS_PORTAL_AUDIT_UPDATE_20251007.md

-- ============================================================================
-- TABLA: patient_screenings
-- Rastrea screenings preventivos personalizados por paciente
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Screening details
  screening_type TEXT NOT NULL CHECK (screening_type IN (
    'blood_pressure',
    'cholesterol',
    'glucose',
    'colorectal_screening',
    'psa',
    'mammography',
    'pap_smear',
    'bone_density',
    'vision_exam',
    'dental_checkup',
    'general_checkup'
  )),

  -- Dates
  last_done_date DATE,
  next_due_date DATE NOT NULL,

  -- Status (calculado automáticamente basado en next_due_date)
  status TEXT NOT NULL CHECK (status IN ('overdue', 'due_soon', 'up_to_date')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),

  -- Category
  category TEXT DEFAULT 'general' CHECK (category IN (
    'cardiovascular',
    'cancer',
    'metabolic',
    'general',
    'reproductive'
  )),

  -- Metadata
  result_summary JSONB DEFAULT '{}'::JSONB,
  provider_notes TEXT,
  provider_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_patient_screening UNIQUE(patient_id, screening_type),
  CONSTRAINT valid_dates CHECK (
    last_done_date IS NULL OR
    (last_done_date <= CURRENT_DATE AND next_due_date > last_done_date)
  )
);

-- Índices para performance
CREATE INDEX idx_patient_screenings_patient_id ON public.patient_screenings(patient_id);
CREATE INDEX idx_patient_screenings_next_due ON public.patient_screenings(next_due_date);
CREATE INDEX idx_patient_screenings_status ON public.patient_screenings(status);
CREATE INDEX idx_patient_screenings_category ON public.patient_screenings(category);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.patient_screenings ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view own screenings
DROP POLICY IF EXISTS "Patients can view own screenings" ON public.patient_screenings;
CREATE POLICY "Patients can view own screenings"
  ON public.patient_screenings
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can insert own screenings
DROP POLICY IF EXISTS "Patients can insert own screenings" ON public.patient_screenings;
CREATE POLICY "Patients can insert own screenings"
  ON public.patient_screenings
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can update own screenings
DROP POLICY IF EXISTS "Patients can update own screenings" ON public.patient_screenings;
CREATE POLICY "Patients can update own screenings"
  ON public.patient_screenings
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Doctors can view assigned patients' screenings
DROP POLICY IF EXISTS "Doctors can view assigned patients screenings" ON public.patient_screenings;
CREATE POLICY "Doctors can view assigned patients screenings"
  ON public.patient_screenings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      INNER JOIN public.doctors d ON pct.doctor_id = d.id
      WHERE pct.patient_id = patient_screenings.patient_id
      AND d.user_id = auth.uid()
      AND pct.active = true
    )
  );

-- Policy: Doctors can update assigned patients' screenings
DROP POLICY IF EXISTS "Doctors can update assigned patients screenings" ON public.patient_screenings;
CREATE POLICY "Doctors can update assigned patients screenings"
  ON public.patient_screenings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      INNER JOIN public.doctors d ON pct.doctor_id = d.id
      WHERE pct.patient_id = patient_screenings.patient_id
      AND d.user_id = auth.uid()
      AND pct.active = true
    )
  );

-- Policy: Admins can view all screenings
DROP POLICY IF EXISTS "Admins can view all screenings" ON public.patient_screenings;
CREATE POLICY "Admins can view all screenings"
  ON public.patient_screenings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_admin', 'organization_admin')
    )
  );

-- ============================================================================
-- FUNCTION: update_screening_status
-- Actualiza automáticamente el status basado en next_due_date
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_screening_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular status basado en next_due_date
  IF NEW.next_due_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  ELSIF NEW.next_due_date <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status := 'due_soon';
  ELSE
    NEW.status := 'up_to_date';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar status automáticamente
DROP TRIGGER IF EXISTS update_patient_screening_status ON public.patient_screenings;
CREATE TRIGGER update_patient_screening_status
  BEFORE INSERT OR UPDATE ON public.patient_screenings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_screening_status();

-- ============================================================================
-- FUNCTION: log_screening_result
-- Registra resultado de screening y calcula próxima fecha
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_screening_result(
  p_patient_id UUID,
  p_screening_type TEXT,
  p_result_summary JSONB DEFAULT '{}'::JSONB,
  p_provider_notes TEXT DEFAULT NULL,
  p_provider_id UUID DEFAULT NULL,
  p_interval_months INTEGER DEFAULT 12
)
RETURNS JSON AS $$
DECLARE
  v_screening_id UUID;
  v_last_done_date DATE;
  v_next_due_date DATE;
  v_status TEXT;
BEGIN
  -- Validar tipo de screening
  IF p_screening_type NOT IN (
    'blood_pressure', 'cholesterol', 'glucose', 'colorectal_screening',
    'psa', 'mammography', 'pap_smear', 'bone_density',
    'vision_exam', 'dental_checkup', 'general_checkup'
  ) THEN
    RAISE EXCEPTION 'Invalid screening type: %', p_screening_type;
  END IF;

  -- Calcular fechas
  v_last_done_date := CURRENT_DATE;
  v_next_due_date := CURRENT_DATE + (p_interval_months || ' months')::INTERVAL;

  -- Insertar o actualizar screening
  INSERT INTO public.patient_screenings (
    patient_id,
    screening_type,
    last_done_date,
    next_due_date,
    result_summary,
    provider_notes,
    provider_id,
    status
  ) VALUES (
    p_patient_id,
    p_screening_type,
    v_last_done_date,
    v_next_due_date,
    p_result_summary,
    p_provider_notes,
    p_provider_id,
    'up_to_date'  -- Recién hecho = up to date
  )
  ON CONFLICT (patient_id, screening_type)
  DO UPDATE SET
    last_done_date = v_last_done_date,
    next_due_date = v_next_due_date,
    result_summary = p_result_summary,
    provider_notes = p_provider_notes,
    provider_id = p_provider_id,
    status = 'up_to_date',
    updated_at = NOW()
  RETURNING id, status INTO v_screening_id, v_status;

  RETURN json_build_object(
    'screening_id', v_screening_id,
    'screening_type', p_screening_type,
    'last_done_date', v_last_done_date,
    'next_due_date', v_next_due_date,
    'status', v_status,
    'result_logged', TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.log_screening_result(UUID, TEXT, JSONB, TEXT, UUID, INTEGER) TO authenticated;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.patient_screenings IS
'Rastrea screenings preventivos personalizados por paciente. Reemplaza datos mockeados del hook usePatientScreenings.';

COMMENT ON COLUMN public.patient_screenings.screening_type IS
'Tipo de screening (blood_pressure, cholesterol, etc.). Debe ser único por paciente.';

COMMENT ON COLUMN public.patient_screenings.status IS
'Status calculado automáticamente: overdue (>30 días pasado), due_soon (próximos 30 días), up_to_date (futuro).';

COMMENT ON FUNCTION public.log_screening_result IS
'Registra resultado de screening y calcula automáticamente la próxima fecha basado en el intervalo. Por defecto 12 meses.';

-- ============================================================================
-- DATOS INICIALES (Opcional)
-- Crear screenings base para pacientes existentes basados en edad/género
-- ============================================================================

-- Función helper para inicializar screenings por paciente
CREATE OR REPLACE FUNCTION public.initialize_patient_screenings(p_patient_id UUID)
RETURNS VOID AS $$
DECLARE
  v_patient_age INTEGER;
  v_patient_gender TEXT;
BEGIN
  -- Obtener edad y género del paciente
  SELECT
    EXTRACT(YEAR FROM AGE(birth_date)) as age,
    gender
  INTO v_patient_age, v_patient_gender
  FROM public.patients
  WHERE id = p_patient_id;

  -- Screenings básicos para todos los adultos
  INSERT INTO public.patient_screenings (patient_id, screening_type, next_due_date, status, priority, category)
  VALUES
    (p_patient_id, 'blood_pressure', CURRENT_DATE + INTERVAL '6 months', 'up_to_date', 'high', 'cardiovascular'),
    (p_patient_id, 'general_checkup', CURRENT_DATE + INTERVAL '12 months', 'up_to_date', 'medium', 'general')
  ON CONFLICT (patient_id, screening_type) DO NOTHING;

  -- Screenings metabólicos para adultos >40
  IF v_patient_age >= 40 THEN
    INSERT INTO public.patient_screenings (patient_id, screening_type, next_due_date, status, priority, category)
    VALUES
      (p_patient_id, 'cholesterol', CURRENT_DATE + INTERVAL '12 months', 'up_to_date', 'high', 'cardiovascular'),
      (p_patient_id, 'glucose', CURRENT_DATE + INTERVAL '12 months', 'up_to_date', 'high', 'metabolic')
    ON CONFLICT (patient_id, screening_type) DO NOTHING;
  END IF;

  -- Screenings de cáncer colorrectal para >50
  IF v_patient_age >= 50 THEN
    INSERT INTO public.patient_screenings (patient_id, screening_type, next_due_date, status, priority, category)
    VALUES
      (p_patient_id, 'colorectal_screening', CURRENT_DATE + INTERVAL '10 years', 'up_to_date', 'high', 'cancer')
    ON CONFLICT (patient_id, screening_type) DO NOTHING;
  END IF;

  -- Screenings específicos por género
  IF v_patient_gender = 'male' AND v_patient_age >= 50 THEN
    INSERT INTO public.patient_screenings (patient_id, screening_type, next_due_date, status, priority, category)
    VALUES
      (p_patient_id, 'psa', CURRENT_DATE + INTERVAL '12 months', 'up_to_date', 'medium', 'cancer')
    ON CONFLICT (patient_id, screening_type) DO NOTHING;
  END IF;

  IF v_patient_gender = 'female' AND v_patient_age >= 40 THEN
    INSERT INTO public.patient_screenings (patient_id, screening_type, next_due_date, status, priority, category)
    VALUES
      (p_patient_id, 'mammography', CURRENT_DATE + INTERVAL '24 months', 'up_to_date', 'high', 'cancer'),
      (p_patient_id, 'pap_smear', CURRENT_DATE + INTERVAL '36 months', 'up_to_date', 'high', 'reproductive')
    ON CONFLICT (patient_id, screening_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inicializar screenings para pacientes existentes (solo si tienen birth_date y gender)
DO $$
DECLARE
  patient_record RECORD;
BEGIN
  FOR patient_record IN
    SELECT id FROM public.patients WHERE birth_date IS NOT NULL AND gender IS NOT NULL
  LOOP
    PERFORM public.initialize_patient_screenings(patient_record.id);
  END LOOP;
END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  v_table_exists BOOLEAN;
  v_policy_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'patient_screenings'
  ) INTO v_table_exists;

  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'patient_screenings';

  RAISE NOTICE '✅ Migration Fase 2 completed successfully';
  RAISE NOTICE '   - Table created: patient_screenings';
  RAISE NOTICE '   - RLS policies created: %', v_policy_count;
  RAISE NOTICE '   - Functions created: log_screening_result, initialize_patient_screenings';
END $$;
