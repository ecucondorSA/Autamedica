-- ====================================================================================
-- AUTA IA – Persistencia segura y personalizada por paciente
-- ====================================================================================
-- Created: 2025-10-08
-- Purpose: Chat AI persistente con privacidad HIPAA y retención configurable
-- Dependencies: patients, patient_care_team, profiles, doctors
-- ====================================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE EXTENSION IF NOT EXISTS vector; -- opcional para memoria semántica futura

-- ====================================================================================
-- FUNCIONES DE SEGURIDAD REUTILIZABLES
-- ====================================================================================

-- ¿El usuario autenticado es el paciente mismo?
CREATE OR REPLACE FUNCTION public.is_patient_self(p_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.patients pa
    WHERE pa.id = p_patient_id
      AND pa.user_id = auth.uid()
  );
$$;

COMMENT ON FUNCTION public.is_patient_self IS 'Verifica si el usuario autenticado es el paciente especificado';

-- ¿El usuario autenticado es miembro del equipo de cuidado del paciente?
CREATE OR REPLACE FUNCTION public.is_care_team_member(p_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.patient_care_team pct
    INNER JOIN public.doctors d ON d.id = pct.doctor_id
    WHERE pct.patient_id = p_patient_id
      AND d.user_id = auth.uid()
      AND pct.active = true
  );
$$;

COMMENT ON FUNCTION public.is_care_team_member IS 'Verifica si el usuario autenticado es miembro activo del care team del paciente';

-- ¿Puede leer datos de IA del paciente? (paciente o care team)
CREATE OR REPLACE FUNCTION public.can_read_patient_ai(p_patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.is_patient_self(p_patient_id) OR public.is_care_team_member(p_patient_id);
$$;

COMMENT ON FUNCTION public.can_read_patient_ai IS 'Verifica si el usuario puede acceder a datos de IA del paciente (paciente o care team)';

-- ====================================================================================
-- TABLA: auta_ai_settings
-- Purpose: Configuración personalizada de Auta IA por paciente
-- ====================================================================================

CREATE TABLE IF NOT EXISTS public.auta_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Preferencias de privacidad y retención
  personalize boolean NOT NULL DEFAULT true,
  retain_days int NOT NULL DEFAULT 365 CHECK (retain_days > 0 AND retain_days <= 3650),
  allow_clinical_summaries boolean NOT NULL DEFAULT true,
  allow_training boolean NOT NULL DEFAULT false, -- NUNCA activar sin consentimiento explícito

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),

  UNIQUE (patient_id)
);

CREATE INDEX IF NOT EXISTS idx_auta_ai_settings_patient ON public.auta_ai_settings(patient_id);

COMMENT ON TABLE public.auta_ai_settings IS 'Configuración personalizada de Auta IA por paciente (privacidad, retención, preferencias)';
COMMENT ON COLUMN public.auta_ai_settings.personalize IS 'Si true, Auta personaliza respuestas con datos históricos del paciente';
COMMENT ON COLUMN public.auta_ai_settings.retain_days IS 'Días que se retienen las conversaciones (1-3650)';
COMMENT ON COLUMN public.auta_ai_settings.allow_clinical_summaries IS 'Permite generar resúmenes clínicos de conversaciones';
COMMENT ON COLUMN public.auta_ai_settings.allow_training IS 'REQUIERE consentimiento explícito - permite usar datos para entrenar modelos';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auta_ai_settings_updated_at
  BEFORE UPDATE ON public.auta_ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

-- RLS
ALTER TABLE public.auta_ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient or care team can manage settings"
  ON public.auta_ai_settings
  USING (public.can_read_patient_ai(patient_id))
  WITH CHECK (public.can_read_patient_ai(patient_id));

-- ====================================================================================
-- TABLA: auta_conversations
-- Purpose: Conversaciones de chat con Auta IA
-- ====================================================================================

CREATE TABLE IF NOT EXISTS public.auta_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  started_at timestamptz NOT NULL DEFAULT NOW(),
  last_message_at timestamptz NOT NULL DEFAULT NOW(),

  status text NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',

  -- Snapshot del contexto del paciente al iniciar (para auditoría)
  context_snapshot jsonb DEFAULT '{}'::jsonb,

  message_count int NOT NULL DEFAULT 0 CHECK (message_count >= 0),

  -- Soft delete
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE INDEX IF NOT EXISTS idx_auta_conversations_patient ON public.auta_conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_auta_conversations_lastmsg ON public.auta_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_auta_conversations_status ON public.auta_conversations(status) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.auta_conversations IS 'Conversaciones de chat con Auta IA - agrupación de mensajes';
COMMENT ON COLUMN public.auta_conversations.context_snapshot IS 'Snapshot del estado del paciente al iniciar conversación (para auditoría médica)';
COMMENT ON COLUMN public.auta_conversations.status IS 'Estado de la conversación: active (activa), archived (archivada por retención)';

-- RLS
ALTER TABLE public.auta_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own or care-team conversations"
  ON public.auta_conversations
  FOR SELECT
  USING (public.can_read_patient_ai(patient_id) AND deleted_at IS NULL);

CREATE POLICY "Insert conversations (patient or care team)"
  ON public.auta_conversations
  FOR INSERT
  WITH CHECK (public.can_read_patient_ai(patient_id));

CREATE POLICY "Update conversations (patient or care team)"
  ON public.auta_conversations
  FOR UPDATE
  USING (public.can_read_patient_ai(patient_id))
  WITH CHECK (public.can_read_patient_ai(patient_id));

CREATE POLICY "Soft delete conversations (patient or care team)"
  ON public.auta_conversations
  FOR DELETE
  USING (public.can_read_patient_ai(patient_id));

-- ====================================================================================
-- TABLA: auta_messages
-- Purpose: Mensajes individuales dentro de conversaciones
-- ====================================================================================

CREATE TABLE IF NOT EXISTS public.auta_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.auta_conversations(id) ON DELETE CASCADE,

  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,

  -- Clasificación de intención (de intent-classifier.ts)
  intent text, -- 'medications', 'vitals', 'appointments', 'screenings', etc
  confidence numeric(3,2) CHECK (confidence >= 0 AND confidence <= 1),

  -- Métricas de performance
  processing_time_ms int CHECK (processing_time_ms >= 0),
  tokens_prompt int CHECK (tokens_prompt >= 0),
  tokens_completion int CHECK (tokens_completion >= 0),

  created_at timestamptz NOT NULL DEFAULT NOW(),

  -- Soft delete
  deleted_at timestamptz,
  deleted_by uuid
);

CREATE INDEX IF NOT EXISTS idx_auta_messages_conv_time ON public.auta_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auta_messages_intent ON public.auta_messages USING gin (intent gin_trgm_ops) WHERE intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_auta_messages_role ON public.auta_messages(role) WHERE deleted_at IS NULL;

COMMENT ON TABLE public.auta_messages IS 'Mensajes individuales de chat con Auta IA (user, assistant, system)';
COMMENT ON COLUMN public.auta_messages.intent IS 'Intención clasificada: medications, vitals, appointments, screenings, symptoms, reproductive, allergies, progress, community, platform';
COMMENT ON COLUMN public.auta_messages.confidence IS 'Confianza de la clasificación (0-1)';

-- RLS
ALTER TABLE public.auta_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read messages of allowed conversations"
  ON public.auta_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.auta_conversations c
      WHERE c.id = conversation_id
        AND public.can_read_patient_ai(c.patient_id)
        AND c.deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

CREATE POLICY "Insert messages to allowed conversations"
  ON public.auta_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auta_conversations c
      WHERE c.id = conversation_id
        AND public.can_read_patient_ai(c.patient_id)
    )
  );

CREATE POLICY "Update messages (soft delete/metadata) if allowed"
  ON public.auta_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.auta_conversations c
      WHERE c.id = conversation_id
        AND public.can_read_patient_ai(c.patient_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.auta_conversations c
      WHERE c.id = conversation_id
        AND public.can_read_patient_ai(c.patient_id)
    )
  );

-- ====================================================================================
-- TRIGGERS - Actualizar contadores y timestamps
-- ====================================================================================

-- Trigger para actualizar message_count y last_message_at
CREATE OR REPLACE FUNCTION public.auta_messages_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.auta_conversations
  SET message_count = message_count + 1,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auta_messages_after_insert ON public.auta_messages;
CREATE TRIGGER trg_auta_messages_after_insert
  AFTER INSERT ON public.auta_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.auta_messages_after_insert();

COMMENT ON FUNCTION public.auta_messages_after_insert IS 'Actualiza contadores de mensajes y timestamp de última actividad';

-- ====================================================================================
-- TABLA: auta_ai_usage (auditoría de uso y costos)
-- ====================================================================================

CREATE TABLE IF NOT EXISTS public.auta_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  message_id uuid REFERENCES public.auta_messages(id) ON DELETE SET NULL,

  model text NOT NULL, -- 'gpt-4o-mini', 'gpt-4o', etc
  provider text NOT NULL DEFAULT 'openai',

  tokens_input int NOT NULL DEFAULT 0 CHECK (tokens_input >= 0),
  tokens_output int NOT NULL DEFAULT 0 CHECK (tokens_output >= 0),
  latency_ms int CHECK (latency_ms >= 0),
  cost_usd numeric(10,4) CHECK (cost_usd >= 0),

  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auta_ai_usage_patient_time ON public.auta_ai_usage(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auta_ai_usage_model ON public.auta_ai_usage(model, created_at DESC);

COMMENT ON TABLE public.auta_ai_usage IS 'Auditoría de uso de IA (tokens, latencia, costos) por paciente';
COMMENT ON COLUMN public.auta_ai_usage.model IS 'Modelo de IA utilizado (ej: gpt-4o-mini)';
COMMENT ON COLUMN public.auta_ai_usage.tokens_input IS 'Tokens enviados al modelo (prompt + contexto)';
COMMENT ON COLUMN public.auta_ai_usage.tokens_output IS 'Tokens generados por el modelo';
COMMENT ON COLUMN public.auta_ai_usage.cost_usd IS 'Costo estimado en USD de esta llamada';

-- RLS
ALTER TABLE public.auta_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read/Insert usage (patient or care team)"
  ON public.auta_ai_usage
  USING (public.can_read_patient_ai(patient_id))
  WITH CHECK (public.can_read_patient_ai(patient_id));

-- ====================================================================================
-- FUNCIONES DE RETENCIÓN Y ARCHIVO
-- ====================================================================================

-- Archivar conversaciones antiguas según retain_days
CREATE OR REPLACE FUNCTION public.auta_archive_old_conversations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.auta_conversations c
  SET status = 'archived'
  FROM public.auta_ai_settings s
  WHERE c.patient_id = s.patient_id
    AND c.status = 'active'
    AND c.deleted_at IS NULL
    AND c.last_message_at < NOW() - (s.retain_days || ' days')::interval;
END;
$$;

COMMENT ON FUNCTION public.auta_archive_old_conversations IS 'Archiva conversaciones más antiguas que retain_days (ejecutar diariamente)';

-- Soft delete de conversaciones MUY antiguas (2x retain_days)
CREATE OR REPLACE FUNCTION public.auta_soft_delete_very_old()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Soft delete mensajes muy antiguos
  UPDATE public.auta_messages m
  SET deleted_at = NOW(),
      deleted_by = auth.uid()
  WHERE m.deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.auta_conversations c
      INNER JOIN public.auta_ai_settings s ON s.patient_id = c.patient_id
      WHERE c.id = m.conversation_id
        AND m.created_at < NOW() - ((s.retain_days * 2) || ' days')::interval
    );

  -- Soft delete conversaciones muy antiguas
  UPDATE public.auta_conversations c
  SET deleted_at = NOW(),
      deleted_by = auth.uid()
  WHERE c.deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.auta_ai_settings s
      WHERE s.patient_id = c.patient_id
        AND c.last_message_at < NOW() - ((s.retain_days * 2) || ' days')::interval
    );
END;
$$;

COMMENT ON FUNCTION public.auta_soft_delete_very_old IS 'Soft delete de conversaciones/mensajes más antiguos que 2x retain_days (ejecutar semanalmente)';

-- ====================================================================================
-- CONFIGURACIÓN INICIAL POR DEFECTO
-- ====================================================================================

-- Trigger para crear settings por defecto al crear paciente
CREATE OR REPLACE FUNCTION public.create_default_auta_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.auta_ai_settings (patient_id)
  VALUES (NEW.id)
  ON CONFLICT (patient_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_default_auta_settings ON public.patients;
CREATE TRIGGER trg_create_default_auta_settings
  AFTER INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_auta_settings();

COMMENT ON FUNCTION public.create_default_auta_settings IS 'Crea configuración de Auta IA por defecto al crear un nuevo paciente';

-- ====================================================================================
-- NOTAS PARA pg_cron (opcional - para Supabase Platform)
-- ====================================================================================
-- Si usás pg_cron en Supabase Platform, podés programar:
-- SELECT cron.schedule('auta_archive_daily', '15 3 * * *', $$ SELECT public.auta_archive_old_conversations(); $$);
-- SELECT cron.schedule('auta_softdelete_weekly', '45 3 * * 0', $$ SELECT public.auta_soft_delete_very_old(); $$);

-- ====================================================================================
-- FIN DE MIGRACIÓN
-- ====================================================================================
