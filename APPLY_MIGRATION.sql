-- ============================================================================
-- EJECUTAR ESTE SQL EN SUPABASE DASHBOARD
-- Dashboard → SQL Editor → New Query → Pega este contenido → Run
-- ============================================================================

-- ============================================================================
-- TABLE: consultation_rooms
-- Tracks LiveKit consultation rooms metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS consultation_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id TEXT NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  room_sid TEXT UNIQUE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'ended', 'expired')),
  max_participants INTEGER DEFAULT 4,
  empty_timeout_seconds INTEGER DEFAULT 1800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_rooms_consultation ON consultation_rooms(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_patient ON consultation_rooms(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_doctor ON consultation_rooms(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_status ON consultation_rooms(status);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_created ON consultation_rooms(created_at DESC);

CREATE OR REPLACE FUNCTION update_consultation_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_rooms_updated_at
  BEFORE UPDATE ON consultation_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_rooms_updated_at();

-- ============================================================================
-- TABLE: consultation_recordings
-- Tracks HIPAA-compliant video recordings
-- ============================================================================
CREATE TABLE IF NOT EXISTS consultation_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  room_sid TEXT,
  egress_id TEXT UNIQUE NOT NULL,
  egress_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    egress_status IN ('pending', 'starting', 'active', 'ending', 'complete', 'failed')
  ),
  file_path TEXT,
  file_url TEXT,
  file_size_bytes BIGINT,
  file_format TEXT DEFAULT 'mp4',
  duration_seconds INTEGER,
  codec_video TEXT DEFAULT 'h264',
  codec_audio TEXT DEFAULT 'aac',
  resolution TEXT,
  bitrate_kbps INTEGER,
  recorded_by UUID REFERENCES auth.users(id),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  last_accessed_by UUID REFERENCES auth.users(id),
  retention_days INTEGER DEFAULT 90,
  deletion_scheduled_at TIMESTAMPTZ GENERATED ALWAYS AS (ended_at + (retention_days * interval '1 day')) STORED,
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recordings_consultation ON consultation_recordings(consultation_id);
CREATE INDEX IF NOT EXISTS idx_recordings_egress ON consultation_recordings(egress_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON consultation_recordings(egress_status);
CREATE INDEX IF NOT EXISTS idx_recordings_retention ON consultation_recordings(deletion_scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recordings_doctor ON consultation_recordings(recorded_by);

CREATE OR REPLACE FUNCTION update_consultation_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_recordings_updated_at
  BEFORE UPDATE ON consultation_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_recordings_updated_at();

-- ============================================================================
-- TABLE: recording_access_logs
-- Audit log for HIPAA compliance
-- ============================================================================
CREATE TABLE IF NOT EXISTS recording_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES consultation_recordings(id) ON DELETE CASCADE,
  consultation_id TEXT NOT NULL,
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'share', 'delete')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_recording ON recording_access_logs(recording_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON recording_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON recording_access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_consultation ON recording_access_logs(consultation_id);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================
ALTER TABLE consultation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- consultation_rooms policies
DROP POLICY IF EXISTS "Patients can view their own consultation rooms" ON consultation_rooms;
CREATE POLICY "Patients can view their own consultation rooms"
  ON consultation_rooms FOR SELECT
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can view their own consultation rooms" ON consultation_rooms;
CREATE POLICY "Doctors can view their own consultation rooms"
  ON consultation_rooms FOR SELECT
  USING (doctor_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage consultation rooms" ON consultation_rooms;
CREATE POLICY "Service role can manage consultation rooms"
  ON consultation_rooms FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- consultation_recordings policies
DROP POLICY IF EXISTS "Doctors can view their recordings" ON consultation_recordings;
CREATE POLICY "Doctors can view their recordings"
  ON consultation_recordings FOR SELECT
  USING (recorded_by = auth.uid());

DROP POLICY IF EXISTS "Service role can manage recordings" ON consultation_recordings;
CREATE POLICY "Service role can manage recordings"
  ON consultation_recordings FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- recording_access_logs policies
DROP POLICY IF EXISTS "Users can view their own access logs" ON recording_access_logs;
CREATE POLICY "Users can view their own access logs"
  ON recording_access_logs FOR SELECT
  USING (accessed_by = auth.uid());

DROP POLICY IF EXISTS "Doctors can view access logs for their recordings" ON recording_access_logs;
CREATE POLICY "Doctors can view access logs for their recordings"
  ON recording_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultation_recordings
      WHERE consultation_recordings.id = recording_access_logs.recording_id
      AND consultation_recordings.recorded_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Service role can insert access logs" ON recording_access_logs;
CREATE POLICY "Service role can insert access logs"
  ON recording_access_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION log_recording_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE consultation_recordings
  SET
    access_count = access_count + 1,
    last_accessed_at = now(),
    last_accessed_by = auth.uid()
  WHERE id = NEW.recording_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS recording_access_log_trigger ON recording_access_logs;
CREATE TRIGGER recording_access_log_trigger
  AFTER INSERT ON recording_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION log_recording_access();

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_delete_expired_recordings()
RETURNS void AS $$
BEGIN
  UPDATE consultation_recordings
  SET deleted_at = now(), deletion_reason = 'Retention period expired'
  WHERE deletion_scheduled_at < now() AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT
  'Migration completed successfully! Tables created:' as status,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('consultation_rooms', 'consultation_recordings', 'recording_access_logs');
