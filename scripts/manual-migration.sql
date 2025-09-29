-- Manual migration script - Apply this in Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new

-- Step 1: Create enum for call status
CREATE TYPE IF NOT EXISTS call_status AS ENUM (
  'requested',   -- created by doctor
  'ringing',     -- notified to patient
  'accepted',    -- patient accepted
  'declined',    -- patient declined
  'canceled',    -- doctor canceled/expired
  'connecting',  -- SDP/ICE exchange
  'connected',   -- WebRTC OK
  'ended'        -- hung up or timeout
);

-- Step 2: Create calls table
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

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_calls_patient_status ON public.calls (patient_id, status);
CREATE INDEX IF NOT EXISTS idx_calls_doctor_status ON public.calls (doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_calls_room_id ON public.calls (room_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls (created_at DESC);

-- Step 4: Create call_events table
CREATE TABLE IF NOT EXISTS public.call_events (
  id BIGSERIAL PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  payload JSONB,

  CONSTRAINT call_events_type_check CHECK (type ~ '^[a-z_]+$')
);

-- Step 5: Create event indexes
CREATE INDEX IF NOT EXISTS idx_call_events_call_id ON public.call_events (call_id, at DESC);
CREATE INDEX IF NOT EXISTS idx_call_events_type ON public.call_events (type, at DESC);

-- Step 6: Enable RLS
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies
CREATE POLICY IF NOT EXISTS "doctors_own_calls" ON public.calls
  FOR ALL USING (
    doctor_id = auth.uid()::UUID OR
    doctor_id IN (
      SELECT id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "patients_own_calls" ON public.calls
  FOR ALL USING (
    patient_id = auth.uid()::UUID OR
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "call_events_for_participants" ON public.call_events
  FOR ALL USING (
    call_id IN (
      SELECT id FROM public.calls
      WHERE doctor_id = auth.uid()::UUID
         OR patient_id = auth.uid()::UUID
         OR doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
         OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

-- Step 8: Create helper function to create calls
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
  -- Generate unique room ID
  v_room_id := 'room_' || encode(gen_random_bytes(6), 'hex');
  v_created_at := NOW();

  -- Insert call
  INSERT INTO public.calls (doctor_id, patient_id, room_id, created_at)
  VALUES (p_doctor_id, p_patient_id, v_room_id, v_created_at)
  RETURNING calls.id INTO v_call_id;

  -- Log the creation event
  INSERT INTO public.call_events (call_id, type, payload)
  VALUES (v_call_id, 'call_created', jsonb_build_object(
    'doctor_id', p_doctor_id,
    'patient_id', p_patient_id,
    'room_id', v_room_id
  ));

  -- Return the call data
  RETURN QUERY
  SELECT v_call_id, v_room_id, p_doctor_id, p_patient_id, 'requested'::call_status, v_created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create helper function to update call status
CREATE OR REPLACE FUNCTION update_call_status(
  p_call_id UUID,
  p_status call_status,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := FALSE;
BEGIN
  -- Update the call
  UPDATE public.calls
  SET
    status = p_status,
    reason = p_reason,
    accepted_at = CASE WHEN p_status = 'accepted' THEN NOW() ELSE accepted_at END,
    ended_at = CASE WHEN p_status = 'ended' THEN NOW() ELSE ended_at END
  WHERE id = p_call_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT > 0;

  -- Log the status change
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

-- Step 10: Test the installation
-- SELECT 'Migration completed successfully!' as result;