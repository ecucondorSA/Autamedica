-- AI User Personalization: patterns, FAQs, and telemetry tables
-- Creates lightweight tables to let each user customize Auta without model training.

CREATE TABLE IF NOT EXISTS public.ai_user_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pattern text NOT NULL,
  intent text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_user_patterns_user_idx ON public.ai_user_patterns (user_id);
CREATE INDEX IF NOT EXISTS ai_user_patterns_active_idx ON public.ai_user_patterns (active);

ALTER TABLE public.ai_user_patterns ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_user_patterns' AND policyname = 'owner_can_manage_patterns'
  ) THEN
    CREATE POLICY owner_can_manage_patterns ON public.ai_user_patterns
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_user_faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_user_faq_user_idx ON public.ai_user_faq (user_id);
CREATE INDEX IF NOT EXISTS ai_user_faq_active_idx ON public.ai_user_faq (active);

ALTER TABLE public.ai_user_faq ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ai_user_faq' AND policyname = 'owner_can_manage_faq'
  ) THEN
    CREATE POLICY owner_can_manage_faq ON public.ai_user_faq
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.patient_ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  intent text NOT NULL,
  confidence double precision,
  used_pattern boolean NOT NULL DEFAULT false,
  reply_preview text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS patient_ai_chats_user_idx ON public.patient_ai_chats (user_id);
CREATE INDEX IF NOT EXISTS patient_ai_chats_created_idx ON public.patient_ai_chats (created_at DESC);

ALTER TABLE public.patient_ai_chats ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'patient_ai_chats' AND policyname = 'owner_can_read_chats'
  ) THEN
    CREATE POLICY owner_can_read_chats ON public.patient_ai_chats
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'patient_ai_chats' AND policyname = 'owner_can_insert_chats'
  ) THEN
    CREATE POLICY owner_can_insert_chats ON public.patient_ai_chats
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

