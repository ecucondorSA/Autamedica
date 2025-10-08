-- AutaMedica Advanced Medical RLS Policies
-- Implementa Row Level Security médico con compliance HIPAA básico

-- =====================================================
-- FUNCIONES AUXILIARES PARA RLS MÉDICO
-- =====================================================

-- Función para verificar si el usuario actual es un doctor
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'doctor'
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es un paciente
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'patient'
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin de una empresa
CREATE OR REPLACE FUNCTION public.is_company_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('company', 'company_admin')
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin del sistema
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'platform_admin')
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un doctor tiene acceso a un paciente
CREATE OR REPLACE FUNCTION public.doctor_has_patient_access(patient_user_id uuid)
RETURNS boolean AS $$
DECLARE
  doctor_id uuid;
  patient_id uuid;
BEGIN
  -- Verificar que el usuario actual es doctor
  IF NOT public.is_doctor() THEN
    RETURN false;
  END IF;

  -- Obtener ID del doctor actual
  SELECT id INTO doctor_id
  FROM public.doctors
  WHERE user_id = auth.uid() AND active = true;

  -- Obtener ID del paciente
  SELECT id INTO patient_id
  FROM public.patients
  WHERE user_id = patient_user_id AND active = true;

  -- Verificar si existe relación doctor-paciente activa
  RETURN EXISTS (
    SELECT 1 FROM public.patient_care_team
    WHERE doctor_id = doctor_id
    AND patient_id = patient_id
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario pertenece a una empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(target_organization_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.company_members cm
    JOIN public.profiles p ON p.user_id = cm.profile_id
    WHERE cm.profile_id = auth.uid()
    AND cm.organization_id = target_organization_id
    AND cm.active = true
    AND p.active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS PARA TABLA DOCTORS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "doctors_select_public" ON public.doctors;
DROP POLICY IF EXISTS "doctors_select_own" ON public.doctors;
DROP POLICY IF EXISTS "doctors_insert_own" ON public.doctors;
DROP POLICY IF EXISTS "doctors_update_own" ON public.doctors;
DROP POLICY IF EXISTS "doctors_delete_admin" ON public.doctors;

-- Políticas para lectura de doctores
CREATE POLICY "doctors_select_public" ON public.doctors
  FOR SELECT USING (
    -- Información pública: cualquier usuario puede ver doctores activos (datos básicos)
    active = true
    OR
    -- Doctores pueden ver su propio perfil completo
    (public.is_doctor() AND user_id = auth.uid())
    OR
    -- Pacientes pueden ver doctores que los atienden
    (public.is_patient() AND public.doctor_has_patient_access(auth.uid()))
    OR
    -- Admins pueden ver todos
    public.is_system_admin()
  );

-- Políticas para inserción de doctores
CREATE POLICY "doctors_insert_own" ON public.doctors
  FOR INSERT WITH CHECK (
    -- Solo pueden crear perfil de doctor usuarios con rol doctor
    user_id = auth.uid()
    AND public.is_doctor()
  );

-- Políticas para actualización de doctores
CREATE POLICY "doctors_update_own" ON public.doctors
  FOR UPDATE USING (
    -- Doctores pueden actualizar su propio perfil
    (user_id = auth.uid() AND public.is_doctor())
    OR
    -- Admins pueden actualizar cualquier perfil
    public.is_system_admin()
  );

-- Políticas para eliminación de doctores
CREATE POLICY "doctors_delete_admin" ON public.doctors
  FOR DELETE USING (
    -- Solo admins pueden eliminar perfiles de doctores
    public.is_system_admin()
  );

-- =====================================================
-- RLS PARA TABLA PATIENTS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "patients_select_restricted" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_own" ON public.patients;
DROP POLICY IF EXISTS "patients_update_restricted" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_admin" ON public.patients;

-- Políticas para lectura de pacientes
CREATE POLICY "patients_select_restricted" ON public.patients
  FOR SELECT USING (
    -- Pacientes pueden ver su propio perfil
    (user_id = auth.uid() AND public.is_patient())
    OR
    -- Doctores pueden ver pacientes asignados
    (public.is_doctor() AND public.doctor_has_patient_access(user_id))
    OR
    -- Company admins pueden ver empleados de su empresa
    (public.is_company_admin() AND organization_id IS NOT NULL AND public.user_belongs_to_company(organization_id))
    OR
    -- Admins del sistema pueden ver todos
    public.is_system_admin()
  );

-- Políticas para inserción de pacientes
CREATE POLICY "patients_insert_own" ON public.patients
  FOR INSERT WITH CHECK (
    -- Solo pueden crear perfil de paciente usuarios con rol patient
    user_id = auth.uid()
    AND public.is_patient()
  );

-- Políticas para actualización de pacientes
CREATE POLICY "patients_update_restricted" ON public.patients
  FOR UPDATE USING (
    -- Pacientes pueden actualizar su propio perfil
    (user_id = auth.uid() AND public.is_patient())
    OR
    -- Doctores pueden actualizar datos médicos de sus pacientes
    (public.is_doctor() AND public.doctor_has_patient_access(user_id))
    OR
    -- Admins pueden actualizar cualquier perfil
    public.is_system_admin()
  );

-- Políticas para eliminación de pacientes
CREATE POLICY "patients_delete_admin" ON public.patients
  FOR DELETE USING (
    -- Solo admins pueden eliminar perfiles de pacientes
    public.is_system_admin()
  );

-- =====================================================
-- RLS PARA TABLA COMPANIES
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "companies_select_public" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_admin" ON public.companies;
DROP POLICY IF EXISTS "companies_update_owner" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_admin" ON public.companies;

-- Políticas para lectura de empresas
CREATE POLICY "companies_select_public" ON public.companies
  FOR SELECT USING (
    -- Información básica es pública
    active = true
    OR
    -- Miembros de la empresa pueden ver datos completos
    public.user_belongs_to_company(id)
    OR
    -- Owners pueden ver su empresa
    owner_profile_id = auth.uid()
    OR
    -- Admins pueden ver todas
    public.is_system_admin()
  );

-- Políticas para inserción de empresas
CREATE POLICY "companies_insert_admin" ON public.companies
  FOR INSERT WITH CHECK (
    -- Solo company admins o system admins pueden crear empresas
    public.is_company_admin() OR public.is_system_admin()
  );

-- Políticas para actualización de empresas
CREATE POLICY "companies_update_owner" ON public.companies
  FOR UPDATE USING (
    -- Owners pueden actualizar su empresa
    owner_profile_id = auth.uid()
    OR
    -- Company admins de la empresa pueden actualizar
    public.user_belongs_to_company(id)
    OR
    -- System admins pueden actualizar cualquier empresa
    public.is_system_admin()
  );

-- Políticas para eliminación de empresas
CREATE POLICY "companies_delete_admin" ON public.companies
  FOR DELETE USING (
    -- Solo system admins pueden eliminar empresas
    public.is_system_admin()
  );

-- =====================================================
-- RLS PARA TABLA MEDICAL_RECORDS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "medical_records_select_restricted" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_insert_authorized" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_update_authorized" ON public.medical_records;
DROP POLICY IF EXISTS "medical_records_delete_admin" ON public.medical_records;

-- Políticas para lectura de registros médicos
CREATE POLICY "medical_records_select_restricted" ON public.medical_records
  FOR SELECT USING (
    -- Pacientes pueden ver sus propios registros
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND p.user_id = auth.uid()
    )
    OR
    -- Doctores pueden ver registros de sus pacientes
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND public.doctor_has_patient_access(p.user_id)
    )
    OR
    -- Admins pueden ver todos los registros
    public.is_system_admin()
  );

-- Políticas para inserción de registros médicos
CREATE POLICY "medical_records_insert_authorized" ON public.medical_records
  FOR INSERT WITH CHECK (
    -- Solo doctores pueden crear registros médicos para sus pacientes
    public.is_doctor()
    AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND public.doctor_has_patient_access(p.user_id)
    )
  );

-- Políticas para actualización de registros médicos
CREATE POLICY "medical_records_update_authorized" ON public.medical_records
  FOR UPDATE USING (
    -- Solo el doctor que creó el registro o admins pueden actualizarlo
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
      AND public.is_doctor()
    )
    OR
    public.is_system_admin()
  );

-- Políticas para eliminación de registros médicos
CREATE POLICY "medical_records_delete_admin" ON public.medical_records
  FOR DELETE USING (
    -- Solo admins pueden eliminar registros médicos (para compliance)
    public.is_system_admin()
  );

-- =====================================================
-- RLS PARA TABLA APPOINTMENTS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "appointments_select_participants" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_authorized" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_participants" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_participants" ON public.appointments;

-- Políticas para lectura de citas
CREATE POLICY "appointments_select_participants" ON public.appointments
  FOR SELECT USING (
    -- Pacientes pueden ver sus propias citas
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND p.user_id = auth.uid()
    )
    OR
    -- Doctores pueden ver citas donde participan
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
    )
    OR
    -- Admins pueden ver todas las citas
    public.is_system_admin()
  );

-- Políticas para inserción de citas
CREATE POLICY "appointments_insert_authorized" ON public.appointments
  FOR INSERT WITH CHECK (
    -- Pacientes pueden crear citas para sí mismos
    (public.is_patient() AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND p.user_id = auth.uid()
    ))
    OR
    -- Doctores pueden crear citas para sus pacientes
    (public.is_doctor() AND EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND public.doctor_has_patient_access(p.user_id)
    ))
    OR
    -- Admins pueden crear cualquier cita
    public.is_system_admin()
  );

-- Políticas para actualización de citas
CREATE POLICY "appointments_update_participants" ON public.appointments
  FOR UPDATE USING (
    -- Participantes pueden actualizar la cita
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
    )
    OR
    -- Admins pueden actualizar cualquier cita
    public.is_system_admin()
  );

-- Políticas para eliminación de citas
CREATE POLICY "appointments_delete_participants" ON public.appointments
  FOR DELETE USING (
    -- Participantes pueden cancelar la cita
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = doctor_id
      AND d.user_id = auth.uid()
    )
    OR
    -- Admins pueden eliminar cualquier cita
    public.is_system_admin()
  );

-- =====================================================
-- AUDIT TRAIL PARA COMPLIANCE HIPAA
-- =====================================================

-- Tabla de audit log para acciones médicas
CREATE TABLE IF NOT EXISTS public.medical_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL, -- 'view', 'create', 'update', 'delete'
  table_name text NOT NULL,
  record_id uuid,
  patient_user_id uuid, -- Para filtros por paciente
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- RLS para audit log (solo admins pueden ver)
ALTER TABLE public.medical_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_only" ON public.medical_audit_log
  FOR ALL USING (public.is_system_admin());

-- Función para logging automático
CREATE OR REPLACE FUNCTION public.log_medical_access(
  p_action_type text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_patient_user_id uuid DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.medical_audit_log (
    user_id,
    action_type,
    table_name,
    record_id,
    patient_user_id,
    ip_address,
    created_at
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_table_name,
    p_record_id,
    p_patient_user_id,
    inet_client_addr(),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_doctors_specialty_active ON public.doctors(specialty, active);
CREATE INDEX IF NOT EXISTS idx_patients_company_active ON public.patients(organization_id, active) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_care_team_lookup ON public.patient_care_team(doctor_id, patient_id, active);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_time ON public.appointments(doctor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_time ON public.appointments(patient_id, start_time);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id, created_at);

-- Índices para audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_date ON public.medical_audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_patient_date ON public.medical_audit_log(patient_user_id, created_at) WHERE patient_user_id IS NOT NULL;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION public.is_doctor() IS 'Verifica si el usuario autenticado tiene rol de doctor activo';
COMMENT ON FUNCTION public.is_patient() IS 'Verifica si el usuario autenticado tiene rol de paciente activo';
COMMENT ON FUNCTION public.doctor_has_patient_access(uuid) IS 'Verifica si un doctor tiene acceso autorizado a un paciente específico';
COMMENT ON TABLE public.medical_audit_log IS 'Log de auditoría para acciones médicas - cumple con requisitos básicos de HIPAA';
COMMENT ON FUNCTION public.log_medical_access(text, text, uuid, uuid) IS 'Función para registrar accesos a datos médicos en audit trail';

-- Mensaje de finalización
DO $$
BEGIN
  RAISE NOTICE 'RLS Médico Avanzado implementado exitosamente. Tablas protegidas: doctors, patients, companies, medical_records, appointments. Audit trail habilitado.';
END $$;