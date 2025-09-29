-- Migration: Create telemedicine calls system
-- Created: 2025-09-28

-- Enum for call status
CREATE TYPE call_status AS ENUM (
  'requested',   -- created by doctor
  'ringing',     -- notified to patient
  'accepted',    -- patient accepted
  'declined',    -- patient declined
  'canceled',    -- doctor canceled/expired
  'connecting',  -- SDP/ICE exchange
  'connected',   -- WebRTC OK
  'ended'        -- hung up or timeout
);

-- Main calls table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,                  -- used in signaling
  doctor_id UUID NOT NULL,               -- FK to doctors table
  patient_id UUID NOT NULL,              -- FK to patients table
  status call_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  reason TEXT,

  -- Add constraints and indexes
  CONSTRAINT calls_room_id_check CHECK (room_id ~ '^[a-zA-Z0-9_-]+$'),
  CONSTRAINT calls_valid_dates CHECK (
    accepted_at IS NULL OR accepted_at >= created_at
  ),
  CONSTRAINT calls_end_dates CHECK (
    ended_at IS NULL OR ended_at >= created_at
  )
);

-- Indexes for efficient queries
CREATE INDEX ON public.calls (patient_id, status);
CREATE INDEX ON public.calls (doctor_id, status);
CREATE INDEX ON public.calls (room_id);
CREATE INDEX ON public.calls (created_at DESC);

-- Events/telemetry table (optional but useful for debugging)
CREATE TABLE IF NOT EXISTS public.call_events (
  id BIGSERIAL PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,         -- invite_sent, ringing, accept, decline, sdp_offer, sdp_answer, ice_connected, hangup, timeout
  payload JSONB,

  CONSTRAINT call_events_type_check CHECK (type ~ '^[a-z_]+$')
);

CREATE INDEX ON public.call_events (call_id, at DESC);
CREATE INDEX ON public.call_events (type, at DESC);

-- Add RLS policies (adjust based on your auth setup)
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can see calls where they are the doctor
CREATE POLICY "doctors_own_calls" ON public.calls
  FOR ALL USING (
    doctor_id = auth.uid()::UUID OR
    doctor_id IN (
      SELECT id FROM public.doctors WHERE user_id = auth.uid()
    )
  );

-- Policy: Patients can see calls where they are the patient
CREATE POLICY "patients_own_calls" ON public.calls
  FOR ALL USING (
    patient_id = auth.uid()::UUID OR
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can see events for their calls
CREATE POLICY "call_events_for_participants" ON public.call_events
  FOR ALL USING (
    call_id IN (
      SELECT id FROM public.calls
      WHERE doctor_id = auth.uid()::UUID
         OR patient_id = auth.uid()::UUID
         OR doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
         OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
    )
  );

-- Helper function to create a call with auto room_id
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
BEGIN
  -- Generate unique room ID
  v_room_id := 'room_' || encode(gen_random_bytes(6), 'hex');

  -- Insert call
  INSERT INTO public.calls (doctor_id, patient_id, room_id)
  VALUES (p_doctor_id, p_patient_id, v_room_id)
  RETURNING calls.id, calls.room_id, calls.doctor_id, calls.patient_id, calls.status, calls.created_at
  INTO v_call_id, v_room_id, p_doctor_id, p_patient_id;

  -- Log the creation event
  INSERT INTO public.call_events (call_id, type, payload)
  VALUES (v_call_id, 'call_created', jsonb_build_object(
    'doctor_id', p_doctor_id,
    'patient_id', p_patient_id,
    'room_id', v_room_id
  ));

  -- Return the call data
  RETURN QUERY
  SELECT v_call_id, v_room_id, p_doctor_id, p_patient_id, 'requested'::call_status, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to update call status with automatic event logging
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

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  v_updated := v_updated > 0;

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