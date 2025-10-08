-- Telemedicine Sessions Table
-- Almacena información de las sesiones de videoconsulta

CREATE TABLE IF NOT EXISTS public.telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session info
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Room info
  room_id TEXT UNIQUE,
  
  -- Metadata
  notes TEXT,
  recording_url TEXT,
  duration_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_telemedicine_sessions_patient ON public.telemedicine_sessions(patient_id);
CREATE INDEX idx_telemedicine_sessions_doctor ON public.telemedicine_sessions(doctor_id);
CREATE INDEX idx_telemedicine_sessions_room ON public.telemedicine_sessions(room_id);
CREATE INDEX idx_telemedicine_sessions_status ON public.telemedicine_sessions(status);
CREATE INDEX idx_telemedicine_sessions_scheduled ON public.telemedicine_sessions(scheduled_at);

-- Room Participants Tracking
-- Rastrea quién está/estuvo en cada sala (para analytics y logs)

CREATE TABLE IF NOT EXISTS public.telemedicine_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Room
  room_id TEXT NOT NULL,
  
  -- Participant
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  
  -- Timing
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  
  -- Connection quality metrics
  avg_bitrate INTEGER,
  avg_latency INTEGER,
  avg_packet_loss NUMERIC(5,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_room_participants_room ON public.telemedicine_room_participants(room_id);
CREATE INDEX idx_room_participants_user ON public.telemedicine_room_participants(user_id);

-- Session Events Log
-- Registro de eventos importantes durante la sesión

CREATE TABLE IF NOT EXISTS public.telemedicine_session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session
  session_id UUID NOT NULL REFERENCES public.telemedicine_sessions(id) ON DELETE CASCADE,
  
  -- Event info
  event_type TEXT NOT NULL,
  event_data JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_session_events_session ON public.telemedicine_session_events(session_id);
CREATE INDEX idx_session_events_type ON public.telemedicine_session_events(event_type);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_telemedicine_sessions_updated_at BEFORE UPDATE ON public.telemedicine_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemedicine_session_events ENABLE ROW LEVEL SECURITY;

-- Policies para telemedicine_sessions

-- Patients can view their own sessions
CREATE POLICY "Patients can view own sessions" ON public.telemedicine_sessions
  FOR SELECT
  USING (auth.uid() = patient_id);

-- Doctors can view their own sessions
CREATE POLICY "Doctors can view own sessions" ON public.telemedicine_sessions
  FOR SELECT
  USING (auth.uid() = doctor_id);

-- Patients can create sessions
CREATE POLICY "Patients can create sessions" ON public.telemedicine_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Doctors and patients can update their sessions (for status changes)
CREATE POLICY "Participants can update sessions" ON public.telemedicine_sessions
  FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- Policies para room_participants

-- Users can view their own participation records
CREATE POLICY "Users can view own participation" ON public.telemedicine_room_participants
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own participation records
CREATE POLICY "Users can insert own participation" ON public.telemedicine_room_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation records
CREATE POLICY "Users can update own participation" ON public.telemedicine_room_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies para session_events

-- Users can view events from their sessions
CREATE POLICY "Users can view session events" ON public.telemedicine_session_events
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.telemedicine_sessions 
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

-- Users can insert events for their sessions
CREATE POLICY "Users can insert session events" ON public.telemedicine_session_events
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.telemedicine_sessions 
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );

COMMENT ON TABLE public.telemedicine_sessions IS 'Sesiones de videoconsulta médica';
COMMENT ON TABLE public.telemedicine_room_participants IS 'Tracking de participantes en salas';
COMMENT ON TABLE public.telemedicine_session_events IS 'Registro de eventos de sesiones';
