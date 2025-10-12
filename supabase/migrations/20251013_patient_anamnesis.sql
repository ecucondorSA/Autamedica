-- Patient Anamnesis schema

CREATE TABLE IF NOT EXISTS public.anamnesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'in_progress',
  completion_percentage integer NOT NULL DEFAULT 0,
  sections_status jsonb NOT NULL DEFAULT '{}'::jsonb,
  privacy_accepted boolean,
  terms_accepted boolean,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS anamnesis_patient_unique ON public.anamnesis (patient_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.anamnesis_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anamnesis_id uuid NOT NULL REFERENCES public.anamnesis(id) ON DELETE CASCADE,
  section text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS anamnesis_sections_unique ON public.anamnesis_sections (anamnesis_id, section);

CREATE INDEX IF NOT EXISTS anamnesis_sections_section_idx ON public.anamnesis_sections (section);

ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis_sections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'anamnesis'
      AND policyname = 'patient_select_anamnesis'
  ) THEN
    CREATE POLICY patient_select_anamnesis ON public.anamnesis
      FOR SELECT
      USING (auth.uid() = patient_id AND deleted_at IS NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'anamnesis'
      AND policyname = 'patient_insert_anamnesis'
  ) THEN
    CREATE POLICY patient_insert_anamnesis ON public.anamnesis
      FOR INSERT
      WITH CHECK (auth.uid() = patient_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'anamnesis'
      AND policyname = 'patient_update_anamnesis'
  ) THEN
    CREATE POLICY patient_update_anamnesis ON public.anamnesis
      FOR UPDATE
      USING (auth.uid() = patient_id)
      WITH CHECK (auth.uid() = patient_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'anamnesis_sections'
      AND policyname = 'patient_select_anamnesis_sections'
  ) THEN
    CREATE POLICY patient_select_anamnesis_sections ON public.anamnesis_sections
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.anamnesis a
          WHERE a.id = anamnesis_sections.anamnesis_id
            AND a.patient_id = auth.uid()
            AND a.deleted_at IS NULL
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'anamnesis_sections'
      AND policyname = 'patient_upsert_anamnesis_sections'
  ) THEN
    CREATE POLICY patient_upsert_anamnesis_sections ON public.anamnesis_sections
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.anamnesis a
          WHERE a.id = anamnesis_sections.anamnesis_id
            AND a.patient_id = auth.uid()
            AND a.deleted_at IS NULL
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.anamnesis a
          WHERE a.id = anamnesis_sections.anamnesis_id
            AND a.patient_id = auth.uid()
            AND a.deleted_at IS NULL
        )
      );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_on_anamnesis'
  ) THEN
    CREATE TRIGGER set_updated_at_on_anamnesis
    BEFORE UPDATE ON public.anamnesis
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_on_anamnesis_sections'
  ) THEN
    CREATE TRIGGER set_updated_at_on_anamnesis_sections
    BEFORE UPDATE ON public.anamnesis_sections
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;
