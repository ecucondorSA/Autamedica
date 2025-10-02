-- ==========================================
-- SUPABASE SCHEMA - PATIENT PORTAL
-- ==========================================
-- Esquema completo para funcionalidades del portal de pacientes
-- Incluye: Anamnesis, Telemedicina, Comunidad, Screenings
-- HIPAA Compliant & Cumple regulaciones argentinas

-- ==========================================
-- ENABLE EXTENSIONS
-- ==========================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- ANAMNESIS (Historia Cl\u00ednica Digital)
-- ==========================================

-- Main anamnesis table
CREATE TABLE IF NOT EXISTS anamnesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'under_review', 'approved')
  ),
  completion_percentage INT NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  last_updated_section TEXT,
  sections_status JSONB NOT NULL DEFAULT '{}',
  approved_by_doctor_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  locked BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  data_export_requested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Anamnesis section data (JSONB for flexibility)
CREATE TABLE IF NOT EXISTS anamnesis_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anamnesis_id UUID NOT NULL REFERENCES anamnesis(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (
    section IN (
      'personal_data', 'emergency_contacts', 'medical_history', 'family_history',
      'allergies', 'current_medications', 'chronic_conditions', 'surgical_history',
      'hospitalizations', 'gynecological_history', 'lifestyle', 'mental_health', 'consent'
    )
  ),
  data JSONB NOT NULL DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT false,
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  validation_errors JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(anamnesis_id, section)
);

-- Indexes for anamnesis
CREATE INDEX idx_anamnesis_patient_id ON anamnesis(patient_id);
CREATE INDEX idx_anamnesis_status ON anamnesis(status);
CREATE INDEX idx_anamnesis_sections_anamnesis_id ON anamnesis_sections(anamnesis_id);
CREATE INDEX idx_anamnesis_sections_section ON anamnesis_sections(section);

-- RLS Policies for anamnesis
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own anamnesis" ON anamnesis
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own anamnesis" ON anamnesis
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own anamnesis" ON anamnesis
  FOR UPDATE USING (auth.uid() = patient_id AND NOT locked);

CREATE POLICY "Doctors can view patient anamnesis" ON anamnesis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patient_care_team
      WHERE patient_id = anamnesis.patient_id
      AND doctor_id = auth.uid()
      AND role IN ('primary_doctor', 'specialist')
    )
  );

CREATE POLICY "Users can view own anamnesis sections" ON anamnesis_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM anamnesis WHERE id = anamnesis_id AND patient_id = auth.uid())
  );

CREATE POLICY "Users can update own anamnesis sections" ON anamnesis_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM anamnesis
      WHERE id = anamnesis_id
      AND patient_id = auth.uid()
      AND NOT locked
    )
  );

-- ==========================================
-- TELEMEDICINE (Video Consultations)
-- ==========================================

-- Telemedicine sessions
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  doctor_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'waiting_room', 'connecting', 'active', 'paused', 'ended', 'cancelled', 'failed')
  ),
  signaling_room_id TEXT NOT NULL UNIQUE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  duration_seconds INT,
  connection_quality TEXT DEFAULT 'good' CHECK (
    connection_quality IN ('excellent', 'good', 'fair', 'poor', 'disconnected')
  ),
  recording_enabled BOOLEAN NOT NULL DEFAULT false,
  recording_url TEXT,
  recording_consent_patient BOOLEAN NOT NULL DEFAULT false,
  recording_consent_doctor BOOLEAN NOT NULL DEFAULT false,
  technical_issues_reported TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Session participants
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  peer_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'observer')),
  display_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_online BOOLEAN NOT NULL DEFAULT true,
  media_state JSONB NOT NULL DEFAULT '{"video_enabled": false, "audio_enabled": false}',
  connection_state TEXT DEFAULT 'new' CHECK (
    connection_state IN ('new', 'connecting', 'connected', 'disconnected', 'failed', 'closed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session events (audit log)
CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_peer_id TEXT,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quick actions during session
CREATE TABLE IF NOT EXISTS telemedicine_quick_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for telemedicine
CREATE INDEX idx_telemedicine_sessions_patient_id ON telemedicine_sessions(patient_id);
CREATE INDEX idx_telemedicine_sessions_doctor_id ON telemedicine_sessions(doctor_id);
CREATE INDEX idx_telemedicine_sessions_appointment_id ON telemedicine_sessions(appointment_id);
CREATE INDEX idx_telemedicine_sessions_status ON telemedicine_sessions(status);
CREATE INDEX idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_session_events_session_id ON session_events(session_id);

-- RLS Policies for telemedicine
ALTER TABLE telemedicine_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view sessions" ON telemedicine_sessions
  FOR SELECT USING (auth.uid() IN (patient_id, doctor_id));

CREATE POLICY "Participants can update sessions" ON telemedicine_sessions
  FOR UPDATE USING (auth.uid() IN (patient_id, doctor_id));

CREATE POLICY "Participants can view session participants" ON session_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id
      AND auth.uid() IN (patient_id, doctor_id)
    )
  );

CREATE POLICY "Participants can view session events" ON session_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM telemedicine_sessions
      WHERE id = session_id
      AND auth.uid() IN (patient_id, doctor_id)
    )
  );

-- ==========================================
-- COMMUNITY (Patient Support Groups)
-- ==========================================

-- Community groups
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL CHECK (
    category IN (
      'chronic_disease', 'mental_health', 'reproductive_health',
      'preventive_care', 'general_wellness', 'support_groups', 'caregivers'
    )
  ),
  member_count INT NOT NULL DEFAULT 0,
  post_count INT NOT NULL DEFAULT 0,
  is_private BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  moderator_ids UUID[],
  tags TEXT[],
  rules JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'active', 'suspended', 'banned')
  ),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  post_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  helpful_reactions_received INT NOT NULL DEFAULT 0,
  reputation_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, patient_id)
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'text_with_media')),
  media_urls TEXT[],
  tags TEXT[],
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  moderation_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
    moderation_status IN ('pending_review', 'approved', 'flagged', 'removed', 'requires_edit')
  ),
  moderation_notes TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  reaction_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  share_count INT NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (
    moderation_status IN ('pending_review', 'approved', 'flagged', 'removed', 'requires_edit')
  ),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  reaction_count INT NOT NULL DEFAULT 0,
  reply_count INT NOT NULL DEFAULT 0,
  is_marked_helpful BOOLEAN NOT NULL DEFAULT false,
  marked_helpful_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Post reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (
    reaction_type IN ('like', 'heart', 'hug', 'pray', 'celebrate', 'helpful', 'sad', 'angry')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id) WHERE comment_id IS NULL,
  UNIQUE(comment_id, user_id) WHERE post_id IS NULL,
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- Content reports
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_content_type TEXT NOT NULL CHECK (reported_content_type IN ('post', 'comment')),
  reported_content_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  report_reason TEXT NOT NULL CHECK (
    report_reason IN (
      'spam', 'harassment', 'medical_misinformation', 'personal_information_shared',
      'inappropriate_content', 'promoting_unproven_treatments', 'selling_products',
      'off_topic', 'duplicate', 'other'
    )
  ),
  report_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'under_review', 'resolved', 'dismissed')
  ),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  action_taken TEXT CHECK (
    action_taken IN ('no_action', 'warning_issued', 'content_removed', 'content_edited', 'user_suspended', 'user_banned')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community notifications
CREATE TABLE IF NOT EXISTS community_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (
    notification_type IN (
      'new_reply', 'new_reaction', 'post_pinned', 'comment_marked_helpful',
      'mentioned', 'moderator_message', 'report_resolved'
    )
  ),
  related_post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for community
CREATE INDEX idx_community_groups_category ON community_groups(category);
CREATE INDEX idx_community_groups_slug ON community_groups(slug);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_patient_id ON group_memberships(patient_id);
CREATE INDEX idx_community_posts_group_id ON community_posts(group_id);
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_moderation_status ON community_posts(moderation_status);
CREATE INDEX idx_community_posts_last_activity ON community_posts(last_activity_at DESC);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_parent_comment_id ON post_comments(parent_comment_id);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_comment_id ON post_reactions(comment_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_community_notifications_user_id ON community_notifications(user_id) WHERE read = false;

-- Full text search for posts
CREATE INDEX idx_community_posts_search ON community_posts USING GIN(to_tsvector('spanish', title || ' ' || content));

-- RLS Policies for community
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public groups" ON community_groups
  FOR SELECT USING (NOT is_private OR EXISTS (
    SELECT 1 FROM group_memberships
    WHERE group_id = community_groups.id
    AND patient_id = auth.uid()
    AND status = 'active'
  ));

CREATE POLICY "Members can view group memberships" ON group_memberships
  FOR SELECT USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM group_memberships gm
    WHERE gm.group_id = group_memberships.group_id
    AND gm.patient_id = auth.uid()
    AND gm.status = 'active'
  ));

CREATE POLICY "Members can view approved posts" ON community_posts
  FOR SELECT USING (
    moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_id = community_posts.group_id
      AND patient_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Authors can view own posts" ON community_posts
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_id = community_posts.group_id
      AND patient_id = auth.uid()
      AND status = 'active'
    )
  );

CREATE POLICY "Members can view comments" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN group_memberships gm ON cp.group_id = gm.group_id
      WHERE cp.id = post_comments.post_id
      AND gm.patient_id = auth.uid()
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Members can add comments" ON post_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN group_memberships gm ON cp.group_id = gm.group_id
      WHERE cp.id = post_comments.post_id
      AND gm.patient_id = auth.uid()
      AND gm.status = 'active'
      AND NOT cp.is_locked
    )
  );

CREATE POLICY "Users can add reactions" ON post_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own reactions" ON post_reactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can report content" ON content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view own notifications" ON community_notifications
  FOR SELECT USING (user_id = auth.uid());

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_anamnesis_updated_at BEFORE UPDATE ON anamnesis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamnesis_sections_updated_at BEFORE UPDATE ON anamnesis_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telemedicine_sessions_updated_at BEFORE UPDATE ON telemedicine_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update post counters when comment added
CREATE OR REPLACE FUNCTION increment_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_posts
  SET comment_count = comment_count + 1,
      last_activity_at = NOW()
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comment_count AFTER INSERT ON post_comments
  FOR EACH ROW EXECUTE FUNCTION increment_post_comment_count();

-- Update reaction counters
CREATE OR REPLACE FUNCTION increment_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE community_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
  END IF;
  IF NEW.comment_id IS NOT NULL THEN
    UPDATE post_comments SET reaction_count = reaction_count + 1 WHERE id = NEW.comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reaction_count AFTER INSERT ON post_reactions
  FOR EACH ROW EXECUTE FUNCTION increment_reaction_count();
