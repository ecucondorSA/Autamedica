-- Add appointment link to telemedicine_sessions
ALTER TABLE public.telemedicine_sessions
  ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES public.appointments(id);

CREATE INDEX IF NOT EXISTS idx_telemedicine_sessions_appointment ON public.telemedicine_sessions(appointment_id);
