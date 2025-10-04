#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseKey = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA'

logger.info('Connecting to Supabase:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

// Migration SQL broken into manageable chunks
const migrationChunks = [
  // Create enum
  `CREATE TYPE IF NOT EXISTS call_status AS ENUM (
    'requested',   -- created by doctor
    'ringing',     -- notified to patient
    'accepted',    -- patient accepted
    'declined',    -- patient declined
    'canceled',    -- doctor canceled/expired
    'connecting',  -- SDP/ICE exchange
    'connected',   -- WebRTC OK
    'ended'        -- hung up or timeout
  );`,

  // Create calls table
  `CREATE TABLE IF NOT EXISTS public.calls (
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
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_calls_patient_status ON public.calls (patient_id, status);
   CREATE INDEX IF NOT EXISTS idx_calls_doctor_status ON public.calls (doctor_id, status);
   CREATE INDEX IF NOT EXISTS idx_calls_room_id ON public.calls (room_id);
   CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls (created_at DESC);`,

  // Create call_events table
  `CREATE TABLE IF NOT EXISTS public.call_events (
    id BIGSERIAL PRIMARY KEY,
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL,
    payload JSONB,

    CONSTRAINT call_events_type_check CHECK (type ~ '^[a-z_]+$')
  );`,

  // Create event indexes
  `CREATE INDEX IF NOT EXISTS idx_call_events_call_id ON public.call_events (call_id, at DESC);
   CREATE INDEX IF NOT EXISTS idx_call_events_type ON public.call_events (type, at DESC);`,

  // Enable RLS
  `ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;`,

  // Create policies
  `CREATE POLICY IF NOT EXISTS "doctors_own_calls" ON public.calls
    FOR ALL USING (
      doctor_id = auth.uid()::UUID OR
      doctor_id IN (
        SELECT id FROM public.doctors WHERE user_id = auth.uid()
      )
    );`,

  `CREATE POLICY IF NOT EXISTS "patients_own_calls" ON public.calls
    FOR ALL USING (
      patient_id = auth.uid()::UUID OR
      patient_id IN (
        SELECT id FROM public.patients WHERE user_id = auth.uid()
      )
    );`,

  `CREATE POLICY IF NOT EXISTS "call_events_for_participants" ON public.call_events
    FOR ALL USING (
      call_id IN (
        SELECT id FROM public.calls
        WHERE doctor_id = auth.uid()::UUID
           OR patient_id = auth.uid()::UUID
           OR doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
           OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
      )
    );`
]

// Create helper functions
const createCallFunction = `
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
`

const updateCallStatusFunction = `
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
`

async function executeSqlChunk(sql, description) {
  try {
    logger.info(`Executing: ${description}...`)
    const { data, error } = await supabase.rpc('exec', { sql })

    if (error) {
      logger.error(`Error in ${description}:`, error.message)
      return false
    } else {
      logger.info(`✅ ${description} completed successfully`)
      return true
    }
  } catch (err) {
    logger.error(`Exception in ${description}:`, err.message)
    return false
  }
}

async function main() {
  logger.info('Starting migration application...')

  // Try to execute each chunk
  for (let i = 0; i < migrationChunks.length; i++) {
    const success = await executeSqlChunk(migrationChunks[i], `Migration chunk ${i + 1}`)
    if (!success) {
      logger.info(`⚠️  Chunk ${i + 1} failed, but continuing...`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between chunks
  }

  // Create functions
  await executeSqlChunk(createCallFunction, 'create_call function')
  await new Promise(resolve => setTimeout(resolve, 1000))
  await executeSqlChunk(updateCallStatusFunction, 'update_call_status function')

  // Test the installation
  logger.info('\nTesting installation...')
  try {
    const { data, error } = await supabase
      .from('calls')
      .select('count', { count: 'exact', head: true })

    if (error) {
      logger.info('❌ Calls table test failed:', error.message)
    } else {
      logger.info('✅ Calls table is accessible')
    }
  } catch (err) {
    logger.info('❌ Connection test failed:', err.message)
  }

  logger.info('\nMigration application completed!')
}

main().catch(console.error)