-- Migración directa para aplicar inmediatamente
-- Este script debe copiarse y pegarse en Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new

-- Paso 1: Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Paso 2: Crear enum para estados de llamada
DO $$ BEGIN
  CREATE TYPE call_status AS ENUM (
    'requested',   -- creado por doctor
    'ringing',     -- notificado al paciente
    'accepted',    -- paciente aceptó
    'declined',    -- paciente rechazó
    'canceled',    -- doctor canceló/expiró
    'connecting',  -- intercambio SDP/ICE
    'connected',   -- WebRTC OK
    'ended'        -- colgaron o timeout
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Paso 3: Crear tabla de llamadas
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  status call_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  reason TEXT,

  CONSTRAINT calls_room_id_check CHECK (room_id ~ '^[a-zA-Z0-9_-]+$'),
  CONSTRAINT calls_valid_dates CHECK (
    accepted_at IS NULL OR accepted_at >= created_at
  ),
  CONSTRAINT calls_end_dates CHECK (
    ended_at IS NULL OR ended_at >= created_at
  )
);

-- Paso 4: Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_calls_patient_status ON public.calls (patient_id, status);
CREATE INDEX IF NOT EXISTS idx_calls_doctor_status ON public.calls (doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_calls_room_id ON public.calls (room_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls (created_at DESC);

-- Paso 5: Crear tabla de eventos
CREATE TABLE IF NOT EXISTS public.call_events (
  id BIGSERIAL PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  payload JSONB,

  CONSTRAINT call_events_type_check CHECK (type ~ '^[a-z_]+$')
);

-- Paso 6: Índices para eventos
CREATE INDEX IF NOT EXISTS idx_call_events_call_id ON public.call_events (call_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_call_events_type ON public.call_events (type, at DESC);

-- Paso 7: Habilitar RLS (Row Level Security)
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;

-- Paso 8: Políticas RLS permisivas para testing
DROP POLICY IF EXISTS "allow_all_calls" ON public.calls;
CREATE POLICY "allow_all_calls" ON public.calls FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all_call_events" ON public.call_events;
CREATE POLICY "allow_all_call_events" ON public.call_events FOR ALL USING (true);

-- Paso 9: Función create_call
CREATE OR REPLACE FUNCTION create_call(
  p_doctor_id UUID,
  p_patient_id UUID
) RETURNS TABLE(
  id UUID,
  room_id TEXT,
  doctor_id UUID,
  patient_id UUID,
  status call_status,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_room_id TEXT;
  v_call_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Generar room ID único
  v_room_id := 'room_' || encode(gen_random_bytes(6), 'hex');
  v_created_at := NOW();

  -- Insertar llamada
  INSERT INTO public.calls (doctor_id, patient_id, room_id, created_at)
  VALUES (p_doctor_id, p_patient_id, v_room_id, v_created_at)
  RETURNING calls.id INTO v_call_id;

  -- Log del evento de creación
  INSERT INTO public.call_events (call_id, type, payload)
  VALUES (v_call_id, 'call_created', jsonb_build_object(
    'doctor_id', p_doctor_id,
    'patient_id', p_patient_id,
    'room_id', v_room_id
  ));

  -- Retornar datos de la llamada
  RETURN QUERY
  SELECT v_call_id, v_room_id, p_doctor_id, p_patient_id, 'requested'::call_status, v_created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 10: Función update_call_status
CREATE OR REPLACE FUNCTION update_call_status(
  p_call_id UUID,
  p_status call_status,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  -- Actualizar la llamada
  UPDATE public.calls
  SET
    status = p_status,
    reason = p_reason,
    accepted_at = CASE WHEN p_status = 'accepted' THEN NOW() ELSE accepted_at END,
    ended_at = CASE WHEN p_status = 'ended' THEN NOW() ELSE ended_at END
  WHERE id = p_call_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT > 0;

  -- Log del cambio de estado
  IF v_updated THEN
    INSERT INTO public.call_events (call_id, type, payload)
    VALUES (p_call_id, 'status_changed', jsonb_build_object(
      'new_status', p_status,
      'reason', p_reason
    ));
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 11: Verificaciones finales
SELECT 'Migración completada exitosamente!' as mensaje;

-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('calls', 'call_events');

-- Verificar funciones creadas
SELECT routine_name FROM information_schema.routines
WHERE routine_schema='public' AND routine_name IN ('create_call','update_call_status');

-- Test de la función create_call
SELECT 'Testing create_call function...' as test;
SELECT * FROM create_call(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid
);