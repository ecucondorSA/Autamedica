-- Seed mínimo para AI personalization (opcional)
-- Inserta una FAQ y un patrón para el último usuario existente.

DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users ORDER BY created_at DESC LIMIT 1;
  IF uid IS NULL THEN
    RAISE NOTICE 'No users found. Skipping AI personalization seeds.';
    RETURN;
  END IF;

  -- FAQ: horario de atención
  IF NOT EXISTS (
    SELECT 1 FROM public.ai_user_faq WHERE user_id = uid AND question = 'horario atencion'
  ) THEN
    INSERT INTO public.ai_user_faq (user_id, question, answer)
    VALUES (uid, 'horario atencion', 'Atendemos de 8 a 20 hs.');
  END IF;

  -- Patrón: obra social → intent general
  IF NOT EXISTS (
    SELECT 1 FROM public.ai_user_patterns WHERE user_id = uid AND pattern = 'obra social'
  ) THEN
    INSERT INTO public.ai_user_patterns (user_id, pattern, intent)
    VALUES (uid, 'obra social', 'general');
  END IF;

  RAISE NOTICE 'AI personalization seeds applied for user: %', uid;
END $$;

