-- Migration: Patient Activity Tracking and Streak System
-- Fecha: 2025-10-06
-- Propósito: Reemplazar racha hardcodeada de 15 días con sistema de tracking real
-- Referencia: docs/audits/PATIENTS_PORTAL_MOCK_DATA_CLEANUP.md

-- ============================================================================
-- TABLA: patient_activity_streak
-- Rastrea la racha de actividad diaria del paciente
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_activity_streak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Streak tracking
  current_streak_days INTEGER DEFAULT 0 CHECK (current_streak_days >= 0),
  longest_streak_days INTEGER DEFAULT 0 CHECK (longest_streak_days >= 0),
  last_activity_date DATE,
  streak_start_date DATE,

  -- Metadata
  total_activities INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_patient_streak UNIQUE(patient_id),
  CONSTRAINT streak_logic_check CHECK (longest_streak_days >= current_streak_days)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_patient_activity_streak_patient_id ON public.patient_activity_streak(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_activity_streak_last_activity ON public.patient_activity_streak(last_activity_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.patient_activity_streak ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can only view their own streak
DROP POLICY IF EXISTS "Patients can view own streak" ON public.patient_activity_streak;
CREATE POLICY "Patients can view own streak"
  ON public.patient_activity_streak
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can insert their own streak (if not exists)
DROP POLICY IF EXISTS "Patients can create own streak" ON public.patient_activity_streak;
CREATE POLICY "Patients can create own streak"
  ON public.patient_activity_streak
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can update their own streak
DROP POLICY IF EXISTS "Patients can update own streak" ON public.patient_activity_streak;
CREATE POLICY "Patients can update own streak"
  ON public.patient_activity_streak
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

-- Policy: Doctors can view streak of their assigned patients
DROP POLICY IF EXISTS "Doctors can view assigned patients streak" ON public.patient_activity_streak;
CREATE POLICY "Doctors can view assigned patients streak"
  ON public.patient_activity_streak
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      INNER JOIN public.doctors d ON pct.doctor_id = d.id
      WHERE pct.patient_id = patient_activity_streak.patient_id
      AND d.user_id = auth.uid()
      AND pct.active = true
    )
  );

-- Policy: Admins can view all streaks
DROP POLICY IF EXISTS "Admins can view all streaks" ON public.patient_activity_streak;
CREATE POLICY "Admins can view all streaks"
  ON public.patient_activity_streak
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'platform_admin', 'organization_admin')
    )
  );

-- ============================================================================
-- FUNCTION: update_patient_streak
-- Actualiza la racha cuando el paciente registra actividad
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_patient_streak(p_patient_id UUID)
RETURNS JSON AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_streak_start DATE;
  v_longest_streak INTEGER;
  v_total_activities INTEGER;
  v_streak_broken BOOLEAN := FALSE;
  v_result JSON;
BEGIN
  -- Intentar obtener el registro existente
  SELECT
    last_activity_date,
    current_streak_days,
    streak_start_date,
    longest_streak_days,
    total_activities
  INTO
    v_last_activity,
    v_current_streak,
    v_streak_start,
    v_longest_streak,
    v_total_activities
  FROM public.patient_activity_streak
  WHERE patient_id = p_patient_id;

  -- Si no existe el registro, crearlo
  IF NOT FOUND THEN
    INSERT INTO public.patient_activity_streak (
      patient_id,
      current_streak_days,
      longest_streak_days,
      last_activity_date,
      streak_start_date,
      total_activities
    ) VALUES (
      p_patient_id,
      1,
      1,
      CURRENT_DATE,
      CURRENT_DATE,
      1
    )
    RETURNING
      current_streak_days,
      longest_streak_days,
      last_activity_date,
      streak_start_date,
      total_activities
    INTO
      v_current_streak,
      v_longest_streak,
      v_last_activity,
      v_streak_start,
      v_total_activities;

    v_result := json_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'last_activity_date', v_last_activity,
      'streak_broken', FALSE,
      'is_first_activity', TRUE
    );

    RETURN v_result;
  END IF;

  -- Si ya hubo actividad hoy, no hacer nada
  IF v_last_activity = CURRENT_DATE THEN
    v_result := json_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'last_activity_date', v_last_activity,
      'streak_broken', FALSE,
      'already_logged_today', TRUE
    );

    RETURN v_result;
  END IF;

  -- Lógica de racha
  IF v_last_activity IS NULL THEN
    -- Primera actividad
    v_current_streak := 1;
    v_streak_start := CURRENT_DATE;
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Actividad consecutiva (ayer)
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Racha interrumpida
    v_current_streak := 1;
    v_streak_start := CURRENT_DATE;
    v_streak_broken := TRUE;
  END IF;

  -- Actualizar longest streak si es necesario
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Incrementar contador de actividades
  v_total_activities := v_total_activities + 1;

  -- Actualizar el registro
  UPDATE public.patient_activity_streak
  SET
    current_streak_days = v_current_streak,
    longest_streak_days = v_longest_streak,
    last_activity_date = CURRENT_DATE,
    streak_start_date = v_streak_start,
    total_activities = v_total_activities,
    updated_at = NOW()
  WHERE patient_id = p_patient_id;

  -- Construir resultado
  v_result := json_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'last_activity_date', CURRENT_DATE,
    'streak_broken', v_streak_broken,
    'total_activities', v_total_activities
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.update_patient_streak(UUID) TO authenticated;

-- ============================================================================
-- TRIGGER: auto_update_timestamp
-- Actualiza automáticamente updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_streak_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS update_patient_activity_streak_timestamp ON public.patient_activity_streak;

CREATE TRIGGER update_patient_activity_streak_timestamp
  BEFORE UPDATE ON public.patient_activity_streak
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_timestamp();

-- ============================================================================
-- TABLA: patient_daily_activities
-- Log detallado de actividades diarias que contribuyen a la racha
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'medication_taken',
    'vital_sign_logged',
    'symptom_logged',
    'lab_result_uploaded',
    'appointment_attended',
    'screening_completed',
    'community_post',
    'health_goal_completed'
  )),
  activity_date DATE DEFAULT CURRENT_DATE,
  activity_metadata JSONB DEFAULT '{}'::JSONB,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_patient_activity_date_type UNIQUE(patient_id, activity_date, activity_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_daily_activities_patient_id ON public.patient_daily_activities(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_daily_activities_date ON public.patient_daily_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_daily_activities_type ON public.patient_daily_activities(activity_type);

-- RLS
ALTER TABLE public.patient_daily_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own activities" ON public.patient_daily_activities;
CREATE POLICY "Patients can view own activities"
  ON public.patient_daily_activities
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Patients can insert own activities" ON public.patient_daily_activities;
CREATE POLICY "Patients can insert own activities"
  ON public.patient_daily_activities
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTION: log_patient_activity
-- Registra una actividad y actualiza la racha automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_patient_activity(
  p_patient_id UUID,
  p_activity_type TEXT,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSON AS $$
DECLARE
  v_activity_id UUID;
  v_streak_result JSON;
BEGIN
  -- Validar tipo de actividad
  IF p_activity_type NOT IN (
    'medication_taken',
    'vital_sign_logged',
    'symptom_logged',
    'lab_result_uploaded',
    'appointment_attended',
    'screening_completed',
    'community_post',
    'health_goal_completed'
  ) THEN
    RAISE EXCEPTION 'Invalid activity type: %', p_activity_type;
  END IF;

  -- Insertar actividad (ON CONFLICT DO NOTHING para evitar duplicados)
  INSERT INTO public.patient_daily_activities (
    patient_id,
    activity_type,
    activity_date,
    activity_metadata
  ) VALUES (
    p_patient_id,
    p_activity_type,
    CURRENT_DATE,
    p_metadata
  )
  ON CONFLICT (patient_id, activity_date, activity_type) DO NOTHING
  RETURNING id INTO v_activity_id;

  -- Si la actividad ya existía, retornar sin actualizar streak
  IF v_activity_id IS NULL THEN
    RETURN json_build_object(
      'activity_logged', FALSE,
      'reason', 'Activity already logged today'
    );
  END IF;

  -- Actualizar racha
  v_streak_result := public.update_patient_streak(p_patient_id);

  -- Retornar resultado combinado
  RETURN json_build_object(
    'activity_logged', TRUE,
    'activity_id', v_activity_id,
    'streak', v_streak_result
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.log_patient_activity(UUID, TEXT, JSONB) TO authenticated;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.patient_activity_streak IS
'Rastrea la racha de actividad diaria de cada paciente. Reemplaza el valor hardcodeado de 15 días.';

COMMENT ON COLUMN public.patient_activity_streak.current_streak_days IS
'Racha actual en días consecutivos con al menos una actividad registrada.';

COMMENT ON COLUMN public.patient_activity_streak.longest_streak_days IS
'Racha más larga alcanzada por el paciente (récord histórico).';

COMMENT ON FUNCTION public.update_patient_streak IS
'Actualiza la racha del paciente cuando registra actividad. Retorna JSON con estado actual.';

COMMENT ON FUNCTION public.log_patient_activity IS
'Registra una actividad del paciente y actualiza su racha automáticamente. Previene duplicados por día.';

COMMENT ON TABLE public.patient_daily_activities IS
'Log detallado de todas las actividades diarias que contribuyen a la racha del paciente.';

-- ============================================================================
-- DATOS INICIALES (Opcional)
-- Crear streaks con racha 0 para pacientes existentes
-- ============================================================================

-- Insertar registros iniciales para pacientes que no tienen streak
INSERT INTO public.patient_activity_streak (patient_id, current_streak_days, longest_streak_days)
SELECT
  p.id,
  0,
  0
FROM public.patients p
LEFT JOIN public.patient_activity_streak pas ON p.id = pas.patient_id
WHERE pas.id IS NULL
ON CONFLICT (patient_id) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que la tabla se creó correctamente
DO $$
DECLARE
  v_table_count INTEGER;
  v_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('patient_activity_streak', 'patient_daily_activities');

  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename IN ('patient_activity_streak', 'patient_daily_activities');

  RAISE NOTICE '✅ Migration completed successfully';
  RAISE NOTICE '   - Tables created: %', v_table_count;
  RAISE NOTICE '   - RLS policies created: %', v_policy_count;
  RAISE NOTICE '   - Functions created: update_patient_streak, log_patient_activity';
END $$;
