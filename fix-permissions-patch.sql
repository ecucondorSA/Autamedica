-- PATCH: Cambiar funciones a SECURITY INVOKER para testing
-- Este patch permite que el anon key ejecute las funciones de llamadas

-- 1. Recrear create_call con SECURITY INVOKER
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
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 2. Recrear update_call_status con SECURITY INVOKER
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
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 3. Verificar que las políticas RLS estén permisivas para testing
-- (Deberían estarlo desde la migración original, pero verificamos)

-- Política permisiva para calls
DROP POLICY IF EXISTS "allow_all_calls" ON public.calls;
CREATE POLICY "allow_all_calls" ON public.calls FOR ALL USING (true);

-- Política permisiva para call_events
DROP POLICY IF EXISTS "allow_all_call_events" ON public.call_events;
CREATE POLICY "allow_all_call_events" ON public.call_events FOR ALL USING (true);

-- 4. Otorgar permisos explícitos al anon (usuario público)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON public.calls TO anon;
GRANT SELECT, INSERT, UPDATE ON public.call_events TO anon;
GRANT EXECUTE ON FUNCTION create_call(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION update_call_status(UUID, call_status, TEXT) TO anon;

-- 5. Verificación final
SELECT 'PATCH APLICADO: SECURITY INVOKER habilitado para testing' as mensaje;

-- Verificar permisos
SELECT
  routine_name,
  security_type,
  routine_schema
FROM information_schema.routines
WHERE routine_name IN ('create_call', 'update_call_status')
  AND routine_schema = 'public';

-- Test rápido con IDs de ejemplo
SELECT 'Testing create_call con SECURITY INVOKER...' as test;
SELECT * FROM create_call(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid
);