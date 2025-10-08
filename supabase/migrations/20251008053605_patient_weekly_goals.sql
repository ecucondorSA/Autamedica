-- Migration: Patient Weekly Goals System
-- Fecha: 2025-10-07
-- Propósito: Sistema de tracking de objetivos semanales basado en actividad real
-- Referencia: docs/audits/PATIENTS_PORTAL_AUDIT_UPDATE_20251007.md

-- ============================================================================
-- TABLA: patient_weekly_goals
-- Rastrea objetivos semanales personalizados por paciente
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Goal details
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'medication_adherence',
    'blood_pressure_monitoring',
    'exercise',
    'sleep',
    'hydration',
    'nutrition',
    'screening_scheduled',
    'weight_tracking'
  )),

  -- Progress
  target_count INTEGER NOT NULL CHECK (target_count > 0),
  current_count INTEGER DEFAULT 0 CHECK (current_count >= 0 AND current_count <= target_count),

  -- Time frame
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Metadata
  goal_metadata JSONB DEFAULT '{}'::JSONB,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_week_dates CHECK (week_end_date > week_start_date),
  CONSTRAINT unique_patient_goal_week UNIQUE(patient_id, goal_type, week_start_date)
);

-- Índices para performance
CREATE INDEX idx_patient_weekly_goals_patient_id ON public.patient_weekly_goals(patient_id);
CREATE INDEX idx_patient_weekly_goals_week_start ON public.patient_weekly_goals(week_start_date);
CREATE INDEX idx_patient_weekly_goals_status ON public.patient_weekly_goals(status);
CREATE INDEX idx_patient_weekly_goals_goal_type ON public.patient_weekly_goals(goal_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.patient_weekly_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can view own goals
DROP POLICY IF EXISTS "Patients can view own goals" ON public.patient_weekly_goals;
CREATE POLICY "Patients can view own goals"
  ON public.patient_weekly_goals
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can insert own goals
DROP POLICY IF EXISTS "Patients can insert own goals" ON public.patient_weekly_goals;
CREATE POLICY "Patients can insert own goals"
  ON public.patient_weekly_goals
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can update own goals
DROP POLICY IF EXISTS "Patients can update own goals" ON public.patient_weekly_goals;
CREATE POLICY "Patients can update own goals"
  ON public.patient_weekly_goals
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

-- Policy: Doctors can view assigned patients' goals
DROP POLICY IF EXISTS "Doctors can view assigned patients goals" ON public.patient_weekly_goals;
CREATE POLICY "Doctors can view assigned patients goals"
  ON public.patient_weekly_goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_care_team pct
      INNER JOIN public.doctors d ON pct.doctor_id = d.id
      WHERE pct.patient_id = patient_weekly_goals.patient_id
      AND d.user_id = auth.uid()
      AND pct.active = true
    )
  );

-- Policy: Admins can view all goals
DROP POLICY IF EXISTS "Admins can view all goals" ON public.patient_weekly_goals;
CREATE POLICY "Admins can view all goals"
  ON public.patient_weekly_goals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'platform_admin', 'organization_admin')
    )
  );

-- ============================================================================
-- FUNCTION: update_goal_timestamp
-- Actualiza automáticamente updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_goal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patient_weekly_goal_timestamp ON public.patient_weekly_goals;
CREATE TRIGGER update_patient_weekly_goal_timestamp
  BEFORE UPDATE ON public.patient_weekly_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_goal_timestamp();

-- ============================================================================
-- FUNCTION: increment_weekly_goal
-- Incrementa el progreso de una meta semanal
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_weekly_goal(
  p_patient_id UUID,
  p_goal_type TEXT,
  p_week_start DATE
)
RETURNS JSON AS $$
DECLARE
  v_current_count INTEGER;
  v_target_count INTEGER;
  v_completed BOOLEAN;
  v_goal_id UUID;
BEGIN
  -- Validar tipo de meta
  IF p_goal_type NOT IN (
    'medication_adherence', 'blood_pressure_monitoring', 'exercise',
    'sleep', 'hydration', 'nutrition', 'screening_scheduled', 'weight_tracking'
  ) THEN
    RAISE EXCEPTION 'Invalid goal type: %', p_goal_type;
  END IF;

  -- Verificar que la meta existe
  SELECT id INTO v_goal_id
  FROM public.patient_weekly_goals
  WHERE patient_id = p_patient_id
    AND goal_type = p_goal_type
    AND week_start_date = p_week_start
    AND status = 'active';

  IF v_goal_id IS NULL THEN
    RAISE EXCEPTION 'Goal not found or already completed';
  END IF;

  -- Incrementar contador
  UPDATE public.patient_weekly_goals
  SET
    current_count = LEAST(current_count + 1, target_count),
    status = CASE
      WHEN current_count + 1 >= target_count THEN 'completed'
      ELSE 'active'
    END,
    updated_at = NOW()
  WHERE id = v_goal_id
  RETURNING current_count, target_count, (current_count >= target_count)
  INTO v_current_count, v_target_count, v_completed;

  RETURN json_build_object(
    'goal_id', v_goal_id,
    'goal_type', p_goal_type,
    'current_count', v_current_count,
    'target_count', v_target_count,
    'completed', v_completed,
    'progress_percentage', ROUND((v_current_count::NUMERIC / v_target_count) * 100, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.increment_weekly_goal(UUID, TEXT, DATE) TO authenticated;

-- ============================================================================
-- FUNCTION: create_weekly_goal
-- Crea una nueva meta semanal para el paciente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_weekly_goal(
  p_patient_id UUID,
  p_goal_type TEXT,
  p_target_count INTEGER,
  p_week_start DATE DEFAULT NULL,
  p_goal_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSON AS $$
DECLARE
  v_week_start DATE;
  v_week_end DATE;
  v_goal_id UUID;
BEGIN
  -- Si no se proporciona week_start, usar el inicio de la semana actual
  IF p_week_start IS NULL THEN
    v_week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  ELSE
    v_week_start := p_week_start;
  END IF;

  v_week_end := v_week_start + INTERVAL '6 days';

  -- Crear meta
  INSERT INTO public.patient_weekly_goals (
    patient_id,
    goal_type,
    target_count,
    current_count,
    week_start_date,
    week_end_date,
    status,
    goal_metadata
  ) VALUES (
    p_patient_id,
    p_goal_type,
    p_target_count,
    0,
    v_week_start,
    v_week_end,
    'active',
    p_goal_metadata
  )
  ON CONFLICT (patient_id, goal_type, week_start_date)
  DO UPDATE SET
    target_count = p_target_count,
    goal_metadata = p_goal_metadata,
    updated_at = NOW()
  RETURNING id INTO v_goal_id;

  RETURN json_build_object(
    'goal_id', v_goal_id,
    'goal_type', p_goal_type,
    'target_count', p_target_count,
    'week_start_date', v_week_start,
    'week_end_date', v_week_end,
    'status', 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.create_weekly_goal(UUID, TEXT, INTEGER, DATE, JSONB) TO authenticated;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE public.patient_weekly_goals IS
'Rastrea objetivos semanales personalizados por paciente. Reemplaza metas mockeadas del hook usePatientScreenings.';

COMMENT ON COLUMN public.patient_weekly_goals.goal_type IS
'Tipo de meta (medication_adherence, exercise, etc.). Debe ser único por paciente y semana.';

COMMENT ON COLUMN public.patient_weekly_goals.status IS
'Status de la meta: active (en progreso), completed (100% completada), abandoned (abandonada).';

COMMENT ON FUNCTION public.increment_weekly_goal IS
'Incrementa el progreso de una meta semanal activa. Cambia status a completed cuando se alcanza el target.';

COMMENT ON FUNCTION public.create_weekly_goal IS
'Crea una nueva meta semanal para el paciente. Si ya existe, actualiza target_count y metadata.';

-- ============================================================================
-- DATOS INICIALES (Opcional)
-- Crear metas básicas para pacientes activos
-- ============================================================================

-- Función helper para inicializar metas semanales
CREATE OR REPLACE FUNCTION public.initialize_patient_weekly_goals(p_patient_id UUID)
RETURNS VOID AS $$
DECLARE
  v_week_start DATE;
  v_week_end DATE;
BEGIN
  v_week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_week_end := v_week_start + INTERVAL '6 days';

  -- Metas básicas para todos los pacientes
  INSERT INTO public.patient_weekly_goals (patient_id, goal_type, target_count, week_start_date, week_end_date)
  VALUES
    (p_patient_id, 'medication_adherence', 7, v_week_start, v_week_end),
    (p_patient_id, 'blood_pressure_monitoring', 3, v_week_start, v_week_end),
    (p_patient_id, 'exercise', 5, v_week_start, v_week_end)
  ON CONFLICT (patient_id, goal_type, week_start_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inicializar metas para pacientes existentes (solo semana actual)
DO $$
DECLARE
  patient_record RECORD;
BEGIN
  FOR patient_record IN
    SELECT id FROM public.patients
  LOOP
    PERFORM public.initialize_patient_weekly_goals(patient_record.id);
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
    WHERE table_schema = 'public' AND table_name = 'patient_weekly_goals'
  ) INTO v_table_exists;

  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies
  WHERE tablename = 'patient_weekly_goals';

  RAISE NOTICE '✅ Migration Fase 3 completed successfully';
  RAISE NOTICE '   - Table created: patient_weekly_goals';
  RAISE NOTICE '   - RLS policies created: %', v_policy_count;
  RAISE NOTICE '   - Functions created: increment_weekly_goal, create_weekly_goal, initialize_patient_weekly_goals';
END $$;
