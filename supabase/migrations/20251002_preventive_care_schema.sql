-- =====================================================
-- MIGRACIÓN: Sistema de Atención Médica Preventiva
-- Fecha: 2025-10-02
-- Descripción: Screenings médicos, casos preventivos
-- y recordatorios automáticos por edad y riesgo
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLA: Screenings Preventivos (Catálogo)
-- =====================================================

CREATE TABLE IF NOT EXISTS preventive_screenings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'cancer_screening',
    'cardiovascular',
    'metabolic',
    'immunization',
    'vision_hearing',
    'bone_health',
    'mental_health',
    'reproductive_health',
    'dental'
  )),
  description TEXT NOT NULL,
  target_gender TEXT NOT NULL CHECK (target_gender IN ('male', 'female', 'all')),

  -- Rango de edad
  min_age INTEGER CHECK (min_age >= 0 AND min_age <= 120),
  max_age INTEGER CHECK (max_age >= 0 AND max_age <= 120),

  -- Frecuencia recomendada
  recommended_frequency TEXT NOT NULL CHECK (recommended_frequency IN (
    'one_time',
    'monthly',
    'every_3_months',
    'every_6_months',
    'annually',
    'every_2_years',
    'every_3_years',
    'every_5_years',
    'every_10_years'
  )),

  -- Información adicional
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  estimated_cost_ars NUMERIC(10,2),
  covered_by_public_health BOOLEAN NOT NULL DEFAULT true,
  requires_specialist BOOLEAN NOT NULL DEFAULT false,
  preparation_instructions TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_age_range CHECK (
    (min_age IS NULL OR max_age IS NULL) OR (min_age <= max_age)
  ),
  CONSTRAINT unique_screening_name UNIQUE (name)
);

-- Índices
CREATE INDEX idx_preventive_screenings_category ON preventive_screenings(category);
CREATE INDEX idx_preventive_screenings_gender ON preventive_screenings(target_gender);
CREATE INDEX idx_preventive_screenings_mandatory ON preventive_screenings(is_mandatory) WHERE is_mandatory = true;
CREATE INDEX idx_preventive_screenings_age_range ON preventive_screenings(min_age, max_age);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_preventive_care_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER preventive_screenings_updated_at
BEFORE UPDATE ON preventive_screenings
FOR EACH ROW EXECUTE FUNCTION update_preventive_care_updated_at();

-- =====================================================
-- 2. TABLA: Screenings del Paciente
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_screenings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  screening_id UUID NOT NULL REFERENCES preventive_screenings(id) ON DELETE RESTRICT,

  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',
    'scheduled',
    'completed',
    'overdue',
    'not_applicable'
  )),

  -- Fechas
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  next_due_date TIMESTAMPTZ,

  -- Resultados y notas
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  notes TEXT,
  result_summary TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (
    (completed_date IS NULL OR scheduled_date IS NULL) OR (completed_date >= scheduled_date)
  ),
  CONSTRAINT unique_patient_screening UNIQUE (patient_id, screening_id)
);

-- Índices
CREATE INDEX idx_patient_screenings_patient ON patient_screenings(patient_id);
CREATE INDEX idx_patient_screenings_screening ON patient_screenings(screening_id);
CREATE INDEX idx_patient_screenings_status ON patient_screenings(status);
CREATE INDEX idx_patient_screenings_doctor ON patient_screenings(assigned_doctor_id);
CREATE INDEX idx_patient_screenings_next_due ON patient_screenings(next_due_date)
  WHERE status IN ('not_started', 'scheduled');
CREATE INDEX idx_patient_screenings_overdue ON patient_screenings(next_due_date)
  WHERE status = 'overdue' AND next_due_date < NOW();

-- Trigger para updated_at
CREATE TRIGGER patient_screenings_updated_at
BEFORE UPDATE ON patient_screenings
FOR EACH ROW EXECUTE FUNCTION update_preventive_care_updated_at();

-- =====================================================
-- 3. TABLA: Factores de Riesgo (Catálogo)
-- =====================================================

CREATE TABLE IF NOT EXISTS risk_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'cancer_screening',
    'cardiovascular',
    'metabolic',
    'immunization',
    'vision_hearing',
    'bone_health',
    'mental_health',
    'reproductive_health',
    'dental'
  )),

  -- IDs de screenings que se afectan
  increases_risk_for TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Ajustes de recomendación
  recommended_age_adjustment INTEGER NOT NULL DEFAULT 0, -- Ejemplo: -10 (comenzar 10 años antes)
  frequency_adjustment TEXT CHECK (frequency_adjustment IN (
    'one_time',
    'monthly',
    'every_3_months',
    'every_6_months',
    'annually',
    'every_2_years',
    'every_3_years',
    'every_5_years',
    'every_10_years'
  )),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_risk_factor_name UNIQUE (name)
);

-- Índices
CREATE INDEX idx_risk_factors_category ON risk_factors(category);

-- =====================================================
-- 4. TABLA: Factores de Riesgo del Paciente
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_risk_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  risk_factor_id UUID NOT NULL REFERENCES risk_factors(id) ON DELETE RESTRICT,

  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'very_high')),
  diagnosed_date TIMESTAMPTZ NOT NULL,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_patient_risk_factor UNIQUE (patient_id, risk_factor_id)
);

-- Índices
CREATE INDEX idx_patient_risk_factors_patient ON patient_risk_factors(patient_id);
CREATE INDEX idx_patient_risk_factors_risk ON patient_risk_factors(risk_factor_id);
CREATE INDEX idx_patient_risk_factors_severity ON patient_risk_factors(severity);

-- =====================================================
-- 5. TABLA: Recordatorios de Screenings
-- =====================================================

CREATE TABLE IF NOT EXISTS screening_reminder_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_screening_id UUID NOT NULL REFERENCES patient_screenings(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  reminder_date TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  message TEXT NOT NULL,

  notification_channel TEXT NOT NULL CHECK (notification_channel IN (
    'email',
    'sms',
    'push',
    'in_app'
  )),

  is_read BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reminders_patient_screening ON screening_reminder_notifications(patient_screening_id);
CREATE INDEX idx_reminders_patient ON screening_reminder_notifications(patient_id);
CREATE INDEX idx_reminders_pending ON screening_reminder_notifications(reminder_date)
  WHERE sent_at IS NULL AND reminder_date <= NOW();
CREATE INDEX idx_reminders_unread ON screening_reminder_notifications(patient_id, is_read)
  WHERE is_read = false;

-- =====================================================
-- 6. TABLA: Casos Médicos Educativos
-- =====================================================

CREATE TABLE IF NOT EXISTS medical_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'cancer_screening',
    'cardiovascular',
    'metabolic',
    'immunization',
    'vision_hearing',
    'bone_health',
    'mental_health',
    'reproductive_health',
    'dental'
  )),
  description TEXT NOT NULL,

  -- Target audience
  target_gender TEXT NOT NULL CHECK (target_gender IN ('male', 'female', 'all')),
  target_age_min INTEGER CHECK (target_age_min >= 0 AND target_age_min <= 120),
  target_age_max INTEGER CHECK (target_age_max >= 0 AND target_age_max <= 120),

  -- Contenido (JSON array de secciones)
  content_sections JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Referencias
  related_screenings UUID[] DEFAULT ARRAY[]::UUID[],
  related_specialists TEXT[] DEFAULT ARRAY[]::TEXT[],

  is_published BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_case_age_range CHECK (
    (target_age_min IS NULL OR target_age_max IS NULL) OR (target_age_min <= target_age_max)
  )
);

-- Índices
CREATE INDEX idx_medical_cases_category ON medical_cases(category);
CREATE INDEX idx_medical_cases_published ON medical_cases(is_published) WHERE is_published = true;
CREATE INDEX idx_medical_cases_gender ON medical_cases(target_gender);
CREATE INDEX idx_medical_cases_age_range ON medical_cases(target_age_min, target_age_max);

-- Trigger para updated_at
CREATE TRIGGER medical_cases_updated_at
BEFORE UPDATE ON medical_cases
FOR EACH ROW EXECUTE FUNCTION update_preventive_care_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE preventive_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_reminder_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_cases ENABLE ROW LEVEL SECURITY;

-- Políticas para Screenings (catálogo público)
CREATE POLICY "Screenings are viewable by everyone"
ON preventive_screenings FOR SELECT
TO authenticated
USING (true);

-- Políticas para Patient Screenings
CREATE POLICY "Patients can view their own screenings"
ON patient_screenings FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own screenings"
ON patient_screenings FOR UPDATE
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Políticas para Factores de Riesgo (catálogo público)
CREATE POLICY "Risk factors are viewable by everyone"
ON risk_factors FOR SELECT
TO authenticated
USING (true);

-- Políticas para Patient Risk Factors
CREATE POLICY "Patients can view their own risk factors"
ON patient_risk_factors FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Patients can insert their own risk factors"
ON patient_risk_factors FOR INSERT
TO authenticated
WITH CHECK (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Políticas para Recordatorios
CREATE POLICY "Patients can view their own reminders"
ON screening_reminder_notifications FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own reminders"
ON screening_reminder_notifications FOR UPDATE
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Políticas para Casos Médicos (publicados son públicos)
CREATE POLICY "Published medical cases are viewable by everyone"
ON medical_cases FOR SELECT
TO authenticated
USING (is_published = true);

-- =====================================================
-- 8. FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener screenings recomendados para un paciente
CREATE OR REPLACE FUNCTION get_recommended_screenings(
  patient_id_param UUID,
  include_overdue BOOLEAN DEFAULT true
)
RETURNS TABLE (
  screening_id UUID,
  screening_name TEXT,
  category TEXT,
  status TEXT,
  next_due_date TIMESTAMPTZ,
  urgency TEXT,
  reason TEXT
) AS $$
DECLARE
  patient_age INTEGER;
  patient_gender TEXT;
BEGIN
  -- Obtener edad y género del paciente
  SELECT
    DATE_PART('year', AGE(birth_date)),
    gender
  INTO patient_age, patient_gender
  FROM patients
  WHERE id = patient_id_param;

  -- Si no se encuentra el paciente, retornar vacío
  IF patient_age IS NULL THEN
    RETURN;
  END IF;

  -- Retornar screenings aplicables
  RETURN QUERY
  SELECT
    ps.screening_id,
    s.name AS screening_name,
    s.category,
    COALESCE(pscr.status, 'not_started') AS status,
    pscr.next_due_date,
    CASE
      WHEN pscr.status = 'overdue' THEN 'high'::TEXT
      WHEN pscr.next_due_date IS NOT NULL
        AND pscr.next_due_date <= NOW() + INTERVAL '30 days' THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END AS urgency,
    CASE
      WHEN pscr.status = 'overdue' THEN 'Screening vencido - requiere atención'
      WHEN s.is_mandatory THEN 'Screening obligatorio según normativa argentina'
      ELSE 'Recomendado para su edad y perfil'
    END AS reason
  FROM preventive_screenings s
  LEFT JOIN patient_screenings pscr
    ON pscr.screening_id = s.id AND pscr.patient_id = patient_id_param
  WHERE
    -- Verificar género aplicable
    (s.target_gender = 'all' OR s.target_gender = patient_gender)
    -- Verificar edad aplicable
    AND (s.min_age IS NULL OR patient_age >= s.min_age)
    AND (s.max_age IS NULL OR patient_age <= s.max_age)
    -- Incluir vencidos si se solicita
    AND (include_overdue = true OR COALESCE(pscr.status, 'not_started') != 'overdue')
  ORDER BY
    CASE
      WHEN pscr.status = 'overdue' THEN 1
      WHEN s.is_mandatory THEN 2
      ELSE 3
    END,
    pscr.next_due_date NULLS LAST,
    s.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para marcar screenings como vencidos automáticamente
CREATE OR REPLACE FUNCTION mark_overdue_screenings()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE patient_screenings
  SET
    status = 'overdue',
    updated_at = NOW()
  WHERE
    status IN ('not_started', 'scheduled')
    AND next_due_date IS NOT NULL
    AND next_due_date < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. DATOS INICIALES (Catálogo de Screenings)
-- =====================================================

-- CÁNCER - Mama (Mamografía)
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist, preparation_instructions
) VALUES (
  'Mamografía',
  'cancer_screening',
  'Screening de cáncer de mama mediante rayos X de las mamas. Recomendado para detección temprana.',
  'female',
  40,
  69,
  'annually',
  false,
  15000,
  true,
  true,
  'No usar desodorante, perfume o talco el día del examen. Informar si tiene implantes mamarios.'
);

-- CÁNCER - Cérvix (Papanicolaou + HPV)
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist, preparation_instructions
) VALUES (
  'Papanicolaou (PAP)',
  'cancer_screening',
  'Prueba de detección de cáncer cervical. Recomendado para todas las mujeres sexualmente activas.',
  'female',
  25,
  64,
  'every_3_years',
  false,
  5000,
  true,
  true,
  'No tener relaciones sexuales 48 horas antes. No estar menstruando.'
);

INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Test de VPH (Virus Papiloma Humano)',
  'cancer_screening',
  'Detección de virus VPH de alto riesgo que pueden causar cáncer cervical.',
  'female',
  30,
  64,
  'every_5_years',
  false,
  8000,
  true,
  true
);

-- CÁNCER - Colorrectal (Colonoscopía)
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist, preparation_instructions
) VALUES (
  'Colonoscopía',
  'cancer_screening',
  'Examen del colon y recto para detectar pólipos y cáncer colorrectal. Crítico después de los 50 años.',
  'all',
  50,
  75,
  'every_10_years',
  false,
  35000,
  true,
  true,
  'Dieta líquida 24hs antes. Preparación intestinal con laxantes según indicación médica.'
);

-- CÁNCER - Próstata (PSA)
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'PSA (Antígeno Prostático Específico)',
  'cancer_screening',
  'Análisis de sangre para detectar cáncer de próstata. Recomendado para hombres mayores de 50 años.',
  'male',
  50,
  70,
  'annually',
  false,
  4000,
  true,
  false
);

-- CARDIOVASCULAR - Presión Arterial
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Control de Presión Arterial',
  'cardiovascular',
  'Medición de presión arterial para detectar hipertensión. Fundamental para prevención cardiovascular.',
  'all',
  18,
  NULL,
  'annually',
  true,
  0,
  true,
  false
);

-- CARDIOVASCULAR - Colesterol
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist, preparation_instructions
) VALUES (
  'Perfil Lipídico (Colesterol y Triglicéridos)',
  'cardiovascular',
  'Análisis de sangre para medir niveles de colesterol LDL, HDL y triglicéridos.',
  'all',
  40,
  NULL,
  'every_5_years',
  false,
  3500,
  true,
  false,
  'Ayuno de 12 horas antes del examen.'
);

-- METABÓLICO - Diabetes
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist, preparation_instructions
) VALUES (
  'Glucemia en Ayunas',
  'metabolic',
  'Medición de niveles de azúcar en sangre para detectar diabetes o prediabetes.',
  'all',
  35,
  NULL,
  'every_3_years',
  false,
  1500,
  true,
  false,
  'Ayuno de 8-12 horas antes del examen.'
);

-- INMUNIZACIONES - Gripe
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Vacuna Antigripal',
  'immunization',
  'Vacuna anual contra la influenza. Crítica para mayores de 65 años y grupos de riesgo.',
  'all',
  65,
  NULL,
  'annually',
  true,
  0,
  true,
  false
);

-- INMUNIZACIONES - Neumonía
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Vacuna Antineumocócica',
  'immunization',
  'Vacuna contra neumonía y enfermedades neumocócicas. Recomendada para mayores de 65 años.',
  'all',
  65,
  NULL,
  'one_time',
  false,
  0,
  true,
  false
);

-- HUESOS - Densitometría Ósea
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Densitometría Ósea',
  'bone_health',
  'Medición de densidad ósea para detectar osteoporosis. Crítico para mujeres postmenopáusicas.',
  'female',
  65,
  NULL,
  'every_2_years',
  false,
  12000,
  true,
  true
);

INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Densitometría Ósea (Hombres)',
  'bone_health',
  'Medición de densidad ósea para detectar osteoporosis en hombres de edad avanzada.',
  'male',
  70,
  NULL,
  'every_2_years',
  false,
  12000,
  true,
  true
);

-- VISIÓN - Control Oftalmológico
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Control Oftalmológico Completo',
  'vision_hearing',
  'Examen de la vista incluyendo agudeza visual, presión ocular y fondo de ojo. Crítico para detectar glaucoma.',
  'all',
  40,
  NULL,
  'every_2_years',
  false,
  8000,
  true,
  true
);

-- AUDICIÓN - Audiometría
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Audiometría',
  'vision_hearing',
  'Test de audición para detectar pérdida auditiva relacionada con la edad.',
  'all',
  50,
  NULL,
  'every_3_years',
  false,
  6000,
  true,
  true
);

-- DENTAL - Control Odontológico
INSERT INTO preventive_screenings (
  name, category, description, target_gender,
  min_age, max_age, recommended_frequency,
  is_mandatory, estimated_cost_ars, covered_by_public_health,
  requires_specialist
) VALUES (
  'Control Odontológico',
  'dental',
  'Examen dental completo incluyendo limpieza y detección de caries. Recomendado para todas las edades.',
  'all',
  0,
  NULL,
  'every_6_months',
  false,
  5000,
  false,
  true
);

-- =====================================================
-- 10. COMENTARIOS Y VERIFICACIÓN
-- =====================================================

COMMENT ON TABLE preventive_screenings IS 'Catálogo de screenings preventivos según normativas argentinas';
COMMENT ON TABLE patient_screenings IS 'Screenings asignados a pacientes con seguimiento de estado';
COMMENT ON TABLE risk_factors IS 'Factores de riesgo que modifican recomendaciones de screenings';
COMMENT ON TABLE patient_risk_factors IS 'Factores de riesgo del paciente individual';
COMMENT ON TABLE screening_reminder_notifications IS 'Recordatorios automáticos para screenings pendientes';
COMMENT ON TABLE medical_cases IS 'Casos educativos sobre prevención y salud';

-- Verificación de datos insertados
SELECT
  name,
  category,
  target_gender,
  min_age,
  max_age,
  recommended_frequency,
  is_mandatory,
  covered_by_public_health
FROM preventive_screenings
ORDER BY category, min_age NULLS FIRST, name;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
