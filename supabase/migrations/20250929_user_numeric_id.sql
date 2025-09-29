-- =====================================================
-- Migration: Add numeric IDs to users
-- Purpose: Provide sequential numeric identifiers for users
-- Author: AutaMedica Team
-- Date: 2025-09-29
-- =====================================================

-- 1) Create sequence for numeric IDs
-- Starting at 10000001 for 8-digit IDs
CREATE SEQUENCE IF NOT EXISTS public.user_numeric_id_seq
  AS BIGINT
  START WITH 10000001
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 100;

-- Grant permissions on sequence
GRANT USAGE ON SEQUENCE public.user_numeric_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.user_numeric_id_seq TO service_role;

-- 2) Add numeric_id column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'numeric_id'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN numeric_id BIGINT UNIQUE;

    -- Set default for new records
    ALTER TABLE public.profiles
    ALTER COLUMN numeric_id SET DEFAULT nextval('public.user_numeric_id_seq');

    -- Populate existing records with sequential IDs
    UPDATE public.profiles
    SET numeric_id = nextval('public.user_numeric_id_seq')
    WHERE numeric_id IS NULL;

    -- Make it NOT NULL after populating
    ALTER TABLE public.profiles
    ALTER COLUMN numeric_id SET NOT NULL;
  END IF;
END $$;

-- 3) Create trigger to ensure numeric_id is always set
CREATE OR REPLACE FUNCTION public.ensure_numeric_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If numeric_id is not provided, generate one
  IF NEW.numeric_id IS NULL THEN
    NEW.numeric_id := nextval('public.user_numeric_id_seq');
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_profiles_numeric_id ON public.profiles;

-- Create trigger for insert operations
CREATE TRIGGER trg_profiles_numeric_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_numeric_id();

-- 4) Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_numeric_id
  ON public.profiles(numeric_id);

-- 5) Create a view for easy access to user info with numeric ID
CREATE OR REPLACE VIEW public.user_identifiers AS
SELECT
  p.id as user_id,
  p.numeric_id,
  p.role,
  p.email,
  p.created_at as profile_created_at,
  -- Generate human-readable ID with prefix
  CASE p.role
    WHEN 'patient' THEN 'PT-' || p.numeric_id
    WHEN 'doctor' THEN 'DR-' || p.numeric_id
    WHEN 'company' THEN 'CO-' || p.numeric_id
    WHEN 'company_admin' THEN 'CA-' || p.numeric_id
    WHEN 'organization_admin' THEN 'AD-' || p.numeric_id
    ELSE 'US-' || p.numeric_id
  END as display_id
FROM public.profiles p;

-- Grant permissions on the view
GRANT SELECT ON public.user_identifiers TO authenticated;

-- 6) Function to get next available numeric ID (for preview/testing)
CREATE OR REPLACE FUNCTION public.get_next_numeric_id()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT last_value + 1 FROM public.user_numeric_id_seq;
$$;

-- 7) Function to format human-readable ID with check digit
CREATE OR REPLACE FUNCTION public.format_user_id(
  p_numeric_id BIGINT,
  p_role TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_prefix TEXT;
  v_check_digit INT;
  v_sum INT := 0;
  v_weights INT[] := ARRAY[2,3,4,5,6,7];
  v_digit INT;
  v_weight_index INT := 0;
  v_id_str TEXT;
BEGIN
  -- Determine prefix based on role
  v_prefix := CASE p_role
    WHEN 'patient' THEN 'PT'
    WHEN 'doctor' THEN 'DR'
    WHEN 'company' THEN 'CO'
    WHEN 'company_admin' THEN 'CA'
    WHEN 'organization_admin' THEN 'AD'
    ELSE 'US'
  END;

  -- Convert numeric ID to string
  v_id_str := p_numeric_id::TEXT;

  -- Calculate check digit using MOD-11 algorithm
  FOR i IN REVERSE LENGTH(v_id_str)..1 LOOP
    v_digit := SUBSTRING(v_id_str FROM i FOR 1)::INT;
    v_sum := v_sum + (v_digit * v_weights[(v_weight_index % 6) + 1]);
    v_weight_index := v_weight_index + 1;
  END LOOP;

  v_check_digit := v_sum % 11;
  IF v_check_digit IN (0, 1) THEN
    v_check_digit := 0;
  ELSE
    v_check_digit := 11 - v_check_digit;
  END IF;

  -- Return formatted ID: PREFIX-NUMBER-CHECKDIGIT
  RETURN v_prefix || '-' || v_id_str || '-' || v_check_digit;
END;
$$;

-- 8) Add comment for documentation
COMMENT ON COLUMN public.profiles.numeric_id IS
'Unique sequential numeric identifier for the user, generated automatically. Used for human-readable IDs and internal references.';

COMMENT ON SEQUENCE public.user_numeric_id_seq IS
'Sequence generator for user numeric IDs. Starts at 10000001 to ensure 8-digit IDs.';

-- Test the functions (optional, can be commented out in production)
/*
-- Test format_user_id function
SELECT
  format_user_id(10000001, 'patient') as patient_id,
  format_user_id(10000002, 'doctor') as doctor_id,
  format_user_id(10000003, 'company') as company_id;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User numeric ID system successfully installed. New users will receive sequential IDs starting from %',
    (SELECT last_value FROM public.user_numeric_id_seq);
END $$;