-- ============================================================================
-- LiveKit Consultation Rooms & Recordings Schema
-- Created: 2025-10-05
-- Purpose: Track LiveKit rooms and HIPAA-compliant recordings
-- ============================================================================

-- ============================================================================
-- TABLE: consultation_rooms
-- Tracks LiveKit consultation rooms metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS consultation_rooms (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Consultation identifiers
  consultation_id TEXT NOT NULL,
  room_name TEXT NOT NULL UNIQUE,
  room_sid TEXT UNIQUE,

  -- Participants
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Room status
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'ended', 'expired')),

  -- LiveKit metadata
  max_participants INTEGER DEFAULT 4,
  empty_timeout_seconds INTEGER DEFAULT 1800, -- 30 minutes

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_consultation ON consultation_rooms(consultation_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_patient ON consultation_rooms(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_doctor ON consultation_rooms(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_status ON consultation_rooms(status);
CREATE INDEX IF NOT EXISTS idx_consultation_rooms_created ON consultation_rooms(created_at DESC);

-- Trigger to update updated_at
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
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Consultation reference
  consultation_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  room_sid TEXT,

  -- LiveKit Egress identifiers
  egress_id TEXT UNIQUE NOT NULL,
  egress_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    egress_status IN ('pending', 'starting', 'active', 'ending', 'complete', 'failed')
  ),

  -- File information
  file_path TEXT, -- Path in R2/S3: consultations/{consultation_id}-{timestamp}.mp4
  file_url TEXT, -- Pre-signed URL for download
  file_size_bytes BIGINT,
  file_format TEXT DEFAULT 'mp4',

  -- Recording metadata
  duration_seconds INTEGER,
  codec_video TEXT DEFAULT 'h264',
  codec_audio TEXT DEFAULT 'aac',
  resolution TEXT, -- e.g., "1920x1080"
  bitrate_kbps INTEGER,

  -- Audit fields (HIPAA compliance)
  recorded_by UUID REFERENCES auth.users(id), -- Doctor who initiated recording
  access_count INTEGER DEFAULT 0, -- Track how many times accessed
  last_accessed_at TIMESTAMPTZ,
  last_accessed_by UUID REFERENCES auth.users(id),

  -- Retention policy
  retention_days INTEGER DEFAULT 90, -- Auto-delete after 90 days
  deletion_scheduled_at TIMESTAMPTZ GENERATED ALWAYS AS (ended_at + (retention_days * interval '1 day')) STORED,
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_recordings_consultation ON consultation_recordings(consultation_id);
CREATE INDEX IF NOT EXISTS idx_recordings_egress ON consultation_recordings(egress_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON consultation_recordings(egress_status);
CREATE INDEX IF NOT EXISTS idx_recordings_retention ON consultation_recordings(deletion_scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recordings_doctor ON consultation_recordings(recorded_by);

-- Trigger to update updated_at
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

  -- Recording reference
  recording_id UUID NOT NULL REFERENCES consultation_recordings(id) ON DELETE CASCADE,
  consultation_id TEXT NOT NULL,

  -- Access metadata
  accessed_by UUID NOT NULL REFERENCES auth.users(id),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'share', 'delete')),

  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,

  -- Timestamps
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_access_logs_recording ON recording_access_logs(recording_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_user ON recording_access_logs(accessed_by);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON recording_access_logs(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_consultation ON recording_access_logs(consultation_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - HIPAA Compliance
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE consultation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: consultation_rooms
-- ============================================================================

-- Patients can view their own consultation rooms
CREATE POLICY "Patients can view their own consultation rooms"
  ON consultation_rooms
  FOR SELECT
  USING (patient_id = auth.uid());

-- Doctors can view their own consultation rooms
CREATE POLICY "Doctors can view their own consultation rooms"
  ON consultation_rooms
  FOR SELECT
  USING (doctor_id = auth.uid());

-- Service role can insert/update consultation rooms
CREATE POLICY "Service role can manage consultation rooms"
  ON consultation_rooms
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- RLS POLICIES: consultation_recordings
-- ============================================================================

-- Only doctors who recorded can view their recordings
CREATE POLICY "Doctors can view their recordings"
  ON consultation_recordings
  FOR SELECT
  USING (recorded_by = auth.uid());

-- Service role can manage recordings (for signaling-server)
CREATE POLICY "Service role can manage recordings"
  ON consultation_recordings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- RLS POLICIES: recording_access_logs
-- ============================================================================

-- Users can view their own access logs
CREATE POLICY "Users can view their own access logs"
  ON recording_access_logs
  FOR SELECT
  USING (accessed_by = auth.uid());

-- Doctors can view access logs for their recordings
CREATE POLICY "Doctors can view access logs for their recordings"
  ON recording_access_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultation_recordings
      WHERE consultation_recordings.id = recording_access_logs.recording_id
      AND consultation_recordings.recorded_by = auth.uid()
    )
  );

-- Service role can insert access logs
CREATE POLICY "Service role can insert access logs"
  ON recording_access_logs
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- FUNCTION: log_recording_access
-- Automatically log recording access
-- ============================================================================
CREATE OR REPLACE FUNCTION log_recording_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Update access count and timestamp
  UPDATE consultation_recordings
  SET
    access_count = access_count + 1,
    last_accessed_at = now(),
    last_accessed_by = auth.uid()
  WHERE id = NEW.recording_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER recording_access_log_trigger
  AFTER INSERT ON recording_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION log_recording_access();

-- ============================================================================
-- FUNCTION: auto_delete_expired_recordings
-- Automatically delete recordings past retention period
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_delete_expired_recordings()
RETURNS void AS $$
BEGIN
  UPDATE consultation_recordings
  SET
    deleted_at = now(),
    deletion_reason = 'Retention period expired'
  WHERE
    deletion_scheduled_at < now()
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE consultation_rooms IS 'LiveKit consultation rooms metadata for tracking active video consultations';
COMMENT ON TABLE consultation_recordings IS 'HIPAA-compliant video recording metadata stored in Cloudflare R2';
COMMENT ON TABLE recording_access_logs IS 'Audit log for recording access (HIPAA compliance)';

COMMENT ON COLUMN consultation_recordings.retention_days IS 'Number of days to retain recording before auto-deletion (default: 90 days)';
COMMENT ON COLUMN consultation_recordings.deletion_scheduled_at IS 'Computed timestamp when recording will be auto-deleted';
COMMENT ON COLUMN recording_access_logs.access_type IS 'Type of access: view, download, share, or delete';
