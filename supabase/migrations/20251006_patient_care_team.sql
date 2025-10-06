-- Migration: Create patient_care_team table
-- Date: 2025-10-06
-- Purpose: Tabla para gestionar relaciones doctor-paciente en el equipo de atención médica
-- Used by: RLS function doctor_has_patient_access() in 20250930000001_medical_advanced_rls.sql

-- =====================================================
-- 1. CREATE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.patient_care_team (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'primary_doctor' CHECK (role IN ('primary_doctor', 'specialist', 'nurse', 'therapist', 'consultant')),
  active boolean DEFAULT true NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(doctor_id, patient_id, role)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Composite index for doctor_has_patient_access() function
CREATE INDEX IF NOT EXISTS idx_patient_care_team_lookup
ON public.patient_care_team(doctor_id, patient_id, active)
WHERE active = true;

-- Index for patient queries
CREATE INDEX IF NOT EXISTS idx_patient_care_team_patient
ON public.patient_care_team(patient_id, active)
WHERE active = true;

-- Index for doctor queries
CREATE INDEX IF NOT EXISTS idx_patient_care_team_doctor
ON public.patient_care_team(doctor_id, active)
WHERE active = true;

-- Index for temporal queries
CREATE INDEX IF NOT EXISTS idx_patient_care_team_dates
ON public.patient_care_team(assigned_at, updated_at);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.patient_care_team ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - Participantes y admins pueden ver
CREATE POLICY "patient_care_team_select" ON public.patient_care_team
FOR SELECT USING (
  -- Doctores pueden ver sus asignaciones
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
  OR
  -- Pacientes pueden ver su equipo de atención
  EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid())
  OR
  -- Admins del sistema pueden ver todo
  public.is_system_admin()
);

-- Policy: INSERT - Solo doctores y admins pueden asignar
CREATE POLICY "patient_care_team_insert" ON public.patient_care_team
FOR INSERT WITH CHECK (
  -- Doctores pueden agregarse a equipos de atención
  public.is_doctor()
  OR
  -- Admins pueden asignar cualquier doctor
  public.is_system_admin()
);

-- Policy: UPDATE - Solo doctores propios y admins
CREATE POLICY "patient_care_team_update" ON public.patient_care_team
FOR UPDATE USING (
  -- Doctor puede actualizar sus propias asignaciones
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
  OR
  -- Admins pueden actualizar cualquier asignación
  public.is_system_admin()
);

-- Policy: DELETE - Solo admins (soft delete via active=false)
CREATE POLICY "patient_care_team_delete" ON public.patient_care_team
FOR DELETE USING (
  -- Solo admins pueden eliminar permanentemente
  public.is_system_admin()
);

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_patient_care_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_care_team_updated_at
BEFORE UPDATE ON public.patient_care_team
FOR EACH ROW
EXECUTE FUNCTION public.set_patient_care_team_updated_at();

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Función para agregar un doctor al equipo de atención de un paciente
CREATE OR REPLACE FUNCTION public.add_to_care_team(
  p_doctor_id uuid,
  p_patient_id uuid,
  p_role text DEFAULT 'primary_doctor',
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_assignment_id uuid;
  v_current_user uuid;
BEGIN
  v_current_user := auth.uid();

  -- Verificar que el usuario actual tiene permisos
  IF NOT (public.is_doctor() OR public.is_system_admin()) THEN
    RAISE EXCEPTION 'unauthorized: only doctors and admins can assign care team members';
  END IF;

  -- Insertar o actualizar asignación
  INSERT INTO public.patient_care_team (
    doctor_id,
    patient_id,
    role,
    notes,
    assigned_by,
    active
  ) VALUES (
    p_doctor_id,
    p_patient_id,
    p_role,
    p_notes,
    v_current_user,
    true
  )
  ON CONFLICT (doctor_id, patient_id, role)
  DO UPDATE SET
    active = true,
    notes = COALESCE(EXCLUDED.notes, patient_care_team.notes),
    assigned_by = v_current_user,
    updated_at = NOW()
  RETURNING id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para remover un doctor del equipo (soft delete)
CREATE OR REPLACE FUNCTION public.remove_from_care_team(
  p_doctor_id uuid,
  p_patient_id uuid,
  p_role text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_updated_count integer;
BEGIN
  -- Verificar permisos
  IF NOT (public.is_doctor() OR public.is_system_admin()) THEN
    RAISE EXCEPTION 'unauthorized: only doctors and admins can remove care team members';
  END IF;

  -- Soft delete (marcar como inactive)
  IF p_role IS NULL THEN
    -- Remover todas las asignaciones de este doctor con este paciente
    UPDATE public.patient_care_team
    SET active = false, updated_at = NOW()
    WHERE doctor_id = p_doctor_id AND patient_id = p_patient_id;
  ELSE
    -- Remover solo la asignación específica por rol
    UPDATE public.patient_care_team
    SET active = false, updated_at = NOW()
    WHERE doctor_id = p_doctor_id AND patient_id = p_patient_id AND role = p_role;
  END IF;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. GRANTS
-- =====================================================
GRANT EXECUTE ON FUNCTION public.add_to_care_team(uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_from_care_team(uuid, uuid, text) TO authenticated;

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE public.patient_care_team IS 'Gestiona las relaciones doctor-paciente en equipos de atención médica. Utilizada por RLS policies para control de acceso.';
COMMENT ON COLUMN public.patient_care_team.role IS 'Rol del doctor en el equipo: primary_doctor, specialist, nurse, therapist, consultant';
COMMENT ON COLUMN public.patient_care_team.active IS 'Indica si la asignación está activa. Usar soft delete (active=false) en lugar de DELETE.';
COMMENT ON COLUMN public.patient_care_team.assigned_by IS 'Usuario que creó/modificó la asignación (para audit trail)';
COMMENT ON FUNCTION public.add_to_care_team IS 'Agrega un doctor al equipo de atención de un paciente. Actualiza si ya existe.';
COMMENT ON FUNCTION public.remove_from_care_team IS 'Remueve un doctor del equipo de atención (soft delete). Si role es NULL, remueve todas las asignaciones.';

-- =====================================================
-- 8. VALIDATION
-- =====================================================
DO $$
BEGIN
  -- Verificar que la tabla existe
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'patient_care_team') THEN
    RAISE EXCEPTION 'patient_care_team table was not created';
  END IF;

  -- Verificar que RLS está habilitado
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'patient_care_team'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on patient_care_team';
  END IF;

  RAISE NOTICE '✅ patient_care_team migration completed successfully';
  RAISE NOTICE '   - Table created with 4 indexes';
  RAISE NOTICE '   - RLS enabled with 4 policies';
  RAISE NOTICE '   - 2 helper functions created';
  RAISE NOTICE '   - Audit trail via assigned_by column';
END $$;
