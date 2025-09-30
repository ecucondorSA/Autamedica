-- Fix profiles table RLS policies
-- Remove existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

-- Recreate policies without recursion
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow inserts for new users (handled by trigger)
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Check if any profiles exist
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Show sample profiles (if any)
SELECT user_id, role, created_at FROM public.profiles LIMIT 5;