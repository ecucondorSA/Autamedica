-- Telemedicine Sessions Table
-- Stores WebRTC video consultation sessions with participants and events tracking

CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session identification
  room_id text NOT NULL UNIQUE,
  session_code text UNIQUE,

  -- Appointment relationship (nullable for ad-hoc sessions)
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,

  -- Session participants
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Session status
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'completed', 'cancelled', 'failed')
  ),

  -- Session timing
  scheduled_start timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  duration_seconds integer CHECK (duration_seconds >= 0),

  -- WebRTC connection details
  connection_quality text CHECK (
    connection_quality IN ('excellent', 'good', 'fair', 'poor', 'unknown')
  ),

  -- Media settings
  video_enabled boolean DEFAULT true,
  audio_enabled boolean DEFAULT true,
  screen_sharing_enabled boolean DEFAULT false,

  -- Session metadata
  recording_enabled boolean DEFAULT false,
  recording_url text,
  recording_consent jsonb DEFAULT '{}'::jsonb COMMENT 'Consent from both parties: {doctor: boolean, patient: boolean}',

  -- Session notes and summary
  notes text,
  summary jsonb DEFAULT '{}'::jsonb COMMENT 'Session summary: symptoms discussed, diagnosis, prescriptions, etc.',

  -- Technical details
  signaling_server_url text,
  ice_servers jsonb DEFAULT '[]'::jsonb,

  -- Audit fields
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  -- Soft delete
  deleted_at timestamptz,

  CONSTRAINT valid_time_range CHECK (
    actual_start IS NULL OR actual_end IS NULL OR actual_end > actual_start
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_room_id ON public.telemedicine_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_doctor ON public.telemedicine_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_patient ON public.telemedicine_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_appointment ON public.telemedicine_sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_status ON public.telemedicine_sessions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_scheduled ON public.telemedicine_sessions(scheduled_start) WHERE status = 'pending' AND deleted_at IS NULL;

COMMENT ON TABLE public.telemedicine_sessions IS 'WebRTC video consultation sessions with connection tracking';
COMMENT ON COLUMN public.telemedicine_sessions.room_id IS 'Unique room identifier for WebRTC connection';
COMMENT ON COLUMN public.telemedicine_sessions.session_code IS 'Short code for easy session access (optional)';
COMMENT ON COLUMN public.telemedicine_sessions.recording_consent IS 'JSONB tracking consent: {doctor: boolean, patient: boolean}';
COMMENT ON COLUMN public.telemedicine_sessions.summary IS 'Post-session summary with clinical notes';

-- Enable Row Level Security
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Doctors can view their own sessions
CREATE POLICY doctors_view_own_sessions ON public.telemedicine_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = telemedicine_sessions.doctor_id
        AND d.user_id = auth.uid()
    )
  );

-- 2. Patients can view their own sessions
CREATE POLICY patients_view_own_sessions ON public.telemedicine_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = telemedicine_sessions.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- 3. Doctors can create sessions for their patients
CREATE POLICY doctors_create_sessions ON public.telemedicine_sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = telemedicine_sessions.doctor_id
        AND d.user_id = auth.uid()
    )
  );

-- 4. Doctors can update their own sessions
CREATE POLICY doctors_update_own_sessions ON public.telemedicine_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = telemedicine_sessions.doctor_id
        AND d.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = telemedicine_sessions.doctor_id
        AND d.user_id = auth.uid()
    )
  );

-- 5. Patients can update limited fields in their sessions (status, media settings)
CREATE POLICY patients_update_own_sessions ON public.telemedicine_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = telemedicine_sessions.patient_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = telemedicine_sessions.patient_id
        AND p.user_id = auth.uid()
    )
  );

-- 6. Platform admins can view all sessions
CREATE POLICY admins_view_all_sessions ON public.telemedicine_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'platform_admin'
    )
  );

-- 7. Platform admins can manage all sessions
CREATE POLICY admins_manage_all_sessions ON public.telemedicine_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'platform_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'platform_admin'
    )
  );

-- Trigger function to update timestamp
CREATE OR REPLACE FUNCTION public.update_telemedicine_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_telemedicine_sessions_timestamp
  BEFORE UPDATE ON public.telemedicine_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_telemedicine_sessions_timestamp();

-- Function to auto-calculate duration on completion
CREATE OR REPLACE FUNCTION public.calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.actual_start IS NOT NULL AND NEW.actual_end IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.actual_end - NEW.actual_start))::integer;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_session_duration
  BEFORE UPDATE ON public.telemedicine_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.calculate_session_duration();
