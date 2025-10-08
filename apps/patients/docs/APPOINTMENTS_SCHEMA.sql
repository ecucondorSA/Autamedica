-- =====================================================
-- SCHEMA PARA SISTEMA DE CITAS MÉDICAS
-- AutaMedica Patient Portal
-- =====================================================

-- Tabla: appointments
-- Descripción: Almacena todas las citas médicas del sistema
CREATE TABLE IF NOT EXISTS appointments (
  -- Identificador único
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referencias
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,

  -- Información de la cita
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',     -- Agendada
    'confirmed',     -- Confirmada
    'in_progress',   -- En progreso
    'completed',     -- Completada
    'cancelled',     -- Cancelada
    'no_show'        -- Paciente no se presentó
  )),
  type TEXT NOT NULL DEFAULT 'telemedicine' CHECK (type IN (
    'telemedicine',  -- Telemedicina
    'in_person',     -- Presencial
    'emergency',     -- Emergencia
    'follow_up'      -- Seguimiento
  )),

  -- Detalles clínicos
  reason TEXT,                -- Motivo de la consulta
  notes TEXT,                 -- Notas adicionales del paciente
  diagnosis TEXT,             -- Diagnóstico (llenado por el médico)
  treatment_plan TEXT,        -- Plan de tratamiento (llenado por el médico)

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para búsquedas por paciente
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);

-- Índice para búsquedas por doctor
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);

-- Índice para búsquedas por fecha
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);

-- Índice para búsquedas por estado
CREATE INDEX idx_appointments_status ON appointments(status);

-- Índice compuesto para citas próximas de un paciente
CREATE INDEX idx_appointments_patient_upcoming ON appointments(patient_id, scheduled_at)
WHERE status IN ('scheduled', 'confirmed');

-- =====================================================
-- TRIGGER PARA AUTO-ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Política: Los pacientes solo pueden ver sus propias citas
CREATE POLICY "Patients can view their own appointments"
  ON appointments
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Política: Los pacientes pueden crear sus propias citas
CREATE POLICY "Patients can create their own appointments"
  ON appointments
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Política: Los pacientes pueden actualizar sus propias citas
CREATE POLICY "Patients can update their own appointments"
  ON appointments
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Política: Los pacientes pueden cancelar (soft delete) sus propias citas
CREATE POLICY "Patients can cancel their own appointments"
  ON appointments
  FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Política: Los doctores pueden ver citas asignadas a ellos
CREATE POLICY "Doctors can view their assigned appointments"
  ON appointments
  FOR SELECT
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- Política: Los doctores pueden actualizar citas asignadas a ellos
CREATE POLICY "Doctors can update their assigned appointments"
  ON appointments
  FOR UPDATE
  USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función: Obtener próxima cita de un paciente
CREATE OR REPLACE FUNCTION get_next_appointment(p_patient_id UUID)
RETURNS TABLE (
  appointment_id UUID,
  scheduled_at TIMESTAMPTZ,
  doctor_name TEXT,
  type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.scheduled_at,
    COALESCE(d.first_name || ' ' || d.last_name, 'Sin asignar') as doctor_name,
    a.type
  FROM appointments a
  LEFT JOIN doctors d ON a.doctor_id = d.id
  WHERE a.patient_id = p_patient_id
    AND a.status IN ('scheduled', 'confirmed')
    AND a.scheduled_at > NOW()
  ORDER BY a.scheduled_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función: Contar citas por estado para un paciente
CREATE OR REPLACE FUNCTION count_appointments_by_status(p_patient_id UUID)
RETURNS TABLE (
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.status,
    COUNT(*)
  FROM appointments a
  WHERE a.patient_id = p_patient_id
  GROUP BY a.status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - SOLO PARA DESARROLLO)
-- =====================================================

-- NOTA: Comentado por defecto. Descomentar solo en desarrollo.
/*
-- Insertar cita de ejemplo
INSERT INTO appointments (
  patient_id,
  doctor_id,
  scheduled_at,
  duration_minutes,
  status,
  type,
  reason,
  notes
) VALUES (
  (SELECT id FROM patients LIMIT 1),  -- Reemplazar con patient_id real
  (SELECT id FROM doctors LIMIT 1),   -- Reemplazar con doctor_id real
  NOW() + INTERVAL '1 day',
  30,
  'scheduled',
  'telemedicine',
  'Consulta general',
  'Primera consulta'
);
*/

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

-- 1. Ejecutar este script en el Editor SQL de Supabase
-- 2. Verificar que las tablas 'patients' y 'doctors' ya existan
-- 3. Las políticas RLS protegen automáticamente los datos
-- 4. Los índices optimizan las consultas más comunes

-- CONSULTAS ÚTILES:
-- Ver todas las citas de un paciente:
-- SELECT * FROM appointments WHERE patient_id = 'PATIENT_UUID';

-- Ver próxima cita de un paciente:
-- SELECT * FROM get_next_appointment('PATIENT_UUID');

-- Contar citas por estado:
-- SELECT * FROM count_appointments_by_status('PATIENT_UUID');
