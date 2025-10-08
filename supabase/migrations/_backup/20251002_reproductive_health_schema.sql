-- =====================================================
-- MIGRACIÓN: Sistema de Salud Reproductiva (IVE/ILE)
-- Fecha: 2025-10-02
-- Descripción: Tablas para gestión completa de IVE/ILE
-- según Ley 27.610 de Argentina
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para geolocalización

-- =====================================================
-- 1. TABLA: Especialistas en Salud Reproductiva
-- =====================================================

CREATE TABLE IF NOT EXISTS reproductive_health_specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL CHECK (specialty IN (
    'gynecology',
    'general_medicine',
    'psychology',
    'social_work',
    'nursing'
  )),
  is_certified_ive_ile BOOLEAN NOT NULL DEFAULT false,
  availability_status TEXT NOT NULL DEFAULT 'offline' CHECK (availability_status IN (
    'available',
    'busy',
    'offline'
  )),
  accepts_emergency_consultations BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  total_consultations INTEGER NOT NULL DEFAULT 0 CHECK (total_consultations >= 0),
  years_of_experience INTEGER NOT NULL CHECK (years_of_experience >= 0),
  languages TEXT[] NOT NULL DEFAULT ARRAY['es'],
  bio TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_doctor_specialist UNIQUE (doctor_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_rh_specialists_availability ON reproductive_health_specialists(availability_status) WHERE availability_status = 'available';
CREATE INDEX idx_rh_specialists_certified ON reproductive_health_specialists(is_certified_ive_ile) WHERE is_certified_ive_ile = true;
CREATE INDEX idx_rh_specialists_specialty ON reproductive_health_specialists(specialty);
CREATE INDEX idx_rh_specialists_rating ON reproductive_health_specialists(rating DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_rh_specialists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rh_specialists_updated_at
BEFORE UPDATE ON reproductive_health_specialists
FOR EACH ROW EXECUTE FUNCTION update_rh_specialists_updated_at();

-- =====================================================
-- 2. TABLA: Citas de Salud Reproductiva
-- =====================================================

CREATE TABLE IF NOT EXISTS reproductive_health_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES reproductive_health_specialists(id) ON DELETE RESTRICT,
  consultation_type TEXT NOT NULL CHECK (consultation_type IN (
    'information',
    'pre_procedure',
    'procedure_scheduling',
    'post_procedure',
    'psychological',
    'emergency'
  )),
  modality TEXT NOT NULL CHECK (modality IN (
    'video_call',
    'phone_call',
    'in_person',
    'chat'
  )),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled_by_patient',
    'cancelled_by_doctor',
    'no_show'
  )),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0 AND duration_minutes <= 180),
  meeting_url TEXT,
  notes_for_doctor TEXT,
  is_first_consultation BOOLEAN NOT NULL DEFAULT true,
  requires_interpreter BOOLEAN NOT NULL DEFAULT false,
  preferred_language TEXT NOT NULL DEFAULT 'es',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_scheduled_time CHECK (scheduled_at > created_at),
  CONSTRAINT valid_meeting_url CHECK (
    modality != 'video_call' OR meeting_url IS NOT NULL
  )
);

-- Índices
CREATE INDEX idx_rh_appointments_patient ON reproductive_health_appointments(patient_id);
CREATE INDEX idx_rh_appointments_specialist ON reproductive_health_appointments(specialist_id);
CREATE INDEX idx_rh_appointments_scheduled ON reproductive_health_appointments(scheduled_at);
CREATE INDEX idx_rh_appointments_status ON reproductive_health_appointments(status);
CREATE INDEX idx_rh_appointments_upcoming ON reproductive_health_appointments(scheduled_at)
  WHERE status IN ('scheduled', 'confirmed');

-- Trigger para updated_at
CREATE TRIGGER rh_appointments_updated_at
BEFORE UPDATE ON reproductive_health_appointments
FOR EACH ROW EXECUTE FUNCTION update_rh_specialists_updated_at();

-- =====================================================
-- 3. TABLA: Centros de Salud con Servicios IVE/ILE
-- =====================================================

CREATE TABLE IF NOT EXISTS health_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'public_hospital',
    'health_center',
    'caps',
    'clinic',
    'ngo'
  )),

  -- Dirección (JSON para flexibilidad)
  address JSONB NOT NULL,

  -- Coordenadas geográficas (PostGIS)
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,

  -- Contacto
  phone TEXT NOT NULL,
  email TEXT,
  website_url TEXT,

  -- Servicios ofrecidos
  offers_ive_ile BOOLEAN NOT NULL DEFAULT true,
  offers_medication_method BOOLEAN NOT NULL DEFAULT true,
  offers_surgical_method BOOLEAN NOT NULL DEFAULT true,
  offers_psychological_support BOOLEAN NOT NULL DEFAULT true,

  -- Operación
  requires_appointment BOOLEAN NOT NULL DEFAULT true,
  accepts_walk_ins BOOLEAN NOT NULL DEFAULT false,
  has_24h_service BOOLEAN NOT NULL DEFAULT false,
  operating_hours JSONB, -- { monday: { open: "09:00", close: "17:00" }, ... }
  average_wait_time_days INTEGER NOT NULL DEFAULT 7 CHECK (average_wait_time_days >= 0),

  -- Accesibilidad
  accessibility_features TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice geoespacial para búsqueda por proximidad
CREATE INDEX idx_health_centers_coordinates ON health_centers USING GIST(coordinates);
CREATE INDEX idx_health_centers_type ON health_centers(type);
CREATE INDEX idx_health_centers_ive_ile ON health_centers(offers_ive_ile) WHERE offers_ive_ile = true;
CREATE INDEX idx_health_centers_walk_ins ON health_centers(accepts_walk_ins) WHERE accepts_walk_ins = true;

-- Trigger para updated_at
CREATE TRIGGER health_centers_updated_at
BEFORE UPDATE ON health_centers
FOR EACH ROW EXECUTE FUNCTION update_rh_specialists_updated_at();

-- =====================================================
-- 4. TABLA: Chats Médicos Asíncronos
-- =====================================================

CREATE TABLE IF NOT EXISTS medical_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES reproductive_health_specialists(id) ON DELETE RESTRICT,
  appointment_id UUID REFERENCES reproductive_health_appointments(id) ON DELETE SET NULL,

  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'waiting_response',
    'resolved',
    'closed'
  )),

  subject TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_medical_chats_patient ON medical_chats(patient_id);
CREATE INDEX idx_medical_chats_specialist ON medical_chats(specialist_id);
CREATE INDEX idx_medical_chats_status ON medical_chats(status);
CREATE INDEX idx_medical_chats_urgent ON medical_chats(is_urgent) WHERE is_urgent = true;
CREATE INDEX idx_medical_chats_last_message ON medical_chats(last_message_at DESC);

-- Trigger para updated_at
CREATE TRIGGER medical_chats_updated_at
BEFORE UPDATE ON medical_chats
FOR EACH ROW EXECUTE FUNCTION update_rh_specialists_updated_at();

-- =====================================================
-- 5. TABLA: Mensajes de Chat Médico
-- =====================================================

CREATE TABLE IF NOT EXISTS medical_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES medical_chats(id) ON DELETE CASCADE,

  author_type TEXT NOT NULL CHECK (author_type IN (
    'patient',
    'doctor',
    'system'
  )),
  author_id UUID NOT NULL, -- PatientId o DoctorId

  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN (
    'text',
    'image',
    'document',
    'audio',
    'system_notification'
  )),

  content TEXT NOT NULL,
  attachment_url TEXT,

  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_medical_messages_chat ON medical_messages(chat_id, created_at);
CREATE INDEX idx_medical_messages_unread ON medical_messages(chat_id, is_read) WHERE is_read = false;
CREATE INDEX idx_medical_messages_author ON medical_messages(author_id);

-- Trigger para actualizar last_message_at en medical_chats
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE medical_chats
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medical_messages_update_chat
AFTER INSERT ON medical_messages
FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE reproductive_health_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_health_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para Especialistas (solo lectura pública para pacientes)
CREATE POLICY "Specialists are viewable by everyone"
ON reproductive_health_specialists FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Specialists can update their own profile"
ON reproductive_health_specialists FOR UPDATE
TO authenticated
USING (auth.uid() = doctor_id);

-- Políticas para Citas
CREATE POLICY "Patients can view their own appointments"
ON reproductive_health_appointments FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Patients can create appointments"
ON reproductive_health_appointments FOR INSERT
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own appointments"
ON reproductive_health_appointments FOR UPDATE
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Políticas para Centros de Salud (lectura pública)
CREATE POLICY "Health centers are viewable by everyone"
ON health_centers FOR SELECT
TO authenticated
USING (true);

-- Políticas para Chats
CREATE POLICY "Users can view their own chats"
ON medical_chats FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
  OR
  specialist_id IN (
    SELECT id FROM reproductive_health_specialists
    WHERE doctor_id IN (
      SELECT id FROM doctors WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Patients can create chats"
ON medical_chats FOR INSERT
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Políticas para Mensajes
CREATE POLICY "Users can view messages from their chats"
ON medical_messages FOR SELECT
TO authenticated
USING (
  chat_id IN (
    SELECT id FROM medical_chats
    WHERE patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
    OR specialist_id IN (
      SELECT id FROM reproductive_health_specialists
      WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Users can insert messages in their chats"
ON medical_messages FOR INSERT
TO authenticated
WITH CHECK (
  chat_id IN (
    SELECT id FROM medical_chats
    WHERE patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
    OR specialist_id IN (
      SELECT id FROM reproductive_health_specialists
      WHERE doctor_id IN (
        SELECT id FROM doctors WHERE user_id = auth.uid()
      )
    )
  )
);

-- =====================================================
-- 7. FUNCIONES ÚTILES
-- =====================================================

-- Función para buscar centros cercanos
CREATE OR REPLACE FUNCTION find_nearby_health_centers(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  address JSONB,
  phone TEXT,
  distance_km DOUBLE PRECISION,
  offers_medication_method BOOLEAN,
  offers_surgical_method BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    hc.id,
    hc.name,
    hc.type,
    hc.address,
    hc.phone,
    ROUND(
      ST_Distance(
        hc.coordinates::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) / 1000.0, -- Convertir metros a kilómetros
      2
    ) AS distance_km,
    hc.offers_medication_method,
    hc.offers_surgical_method
  FROM health_centers hc
  WHERE
    hc.offers_ive_ile = true
    AND ST_DWithin(
      hc.coordinates::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000 -- Convertir km a metros
    )
  ORDER BY distance_km ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 8. DATOS DE EJEMPLO (OPCIONAL - Solo para desarrollo)
-- =====================================================

-- Nota: En producción, eliminar esta sección o comentarla

COMMENT ON TABLE reproductive_health_specialists IS 'Especialistas certificados en IVE/ILE según Ley 27.610';
COMMENT ON TABLE reproductive_health_appointments IS 'Sistema de citas para consultas de salud reproductiva';
COMMENT ON TABLE health_centers IS 'Centros de salud que ofrecen servicios IVE/ILE en Argentina';
COMMENT ON TABLE medical_chats IS 'Chats asíncronos entre pacientes y especialistas';
COMMENT ON TABLE medical_messages IS 'Mensajes de chats médicos con soporte para multimedia';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
