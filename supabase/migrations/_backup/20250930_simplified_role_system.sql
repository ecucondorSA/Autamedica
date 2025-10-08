-- 2025-09-30: Simplified single role per user system
-- Implements one unique role per user with role selection flow
BEGIN;

-- 1) Enum de rol (unique role per user)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'doctor','patient','company_admin','organization_admin','platform_admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Add role column to profiles (if it doesn't exist)
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN role user_role;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3) RPC para setear el rol una sola vez de forma atómica
CREATE OR REPLACE FUNCTION public.set_user_role(p_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Solo permitir setear rol si aún no tiene uno
  UPDATE public.profiles
    SET role = p_role,
        updated_at = NOW()
  WHERE user_id = v_uid
    AND role IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'role_already_set_or_profile_missing';
  END IF;

  -- Auto-provisionar fila específica por rol
  IF p_role = 'doctor' THEN
    INSERT INTO public.doctors (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  ELSIF p_role = 'patient' THEN
    INSERT INTO public.patients (user_id) VALUES (v_uid) ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$;

-- 4) Function para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION public.get_user_role(target_user_id uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Solo permitir consultar el propio rol o si es admin
  IF target_user_id != auth.uid() THEN
    -- Verificar si el usuario actual es admin
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('platform_admin', 'organization_admin')
    ) THEN
      RAISE EXCEPTION 'access_denied';
    END IF;
  END IF;

  SELECT role INTO user_role_value
  FROM public.profiles
  WHERE user_id = target_user_id;

  RETURN user_role_value;
END;
$$;

-- 5) RLS policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política de lectura: usuarios pueden leer su propio perfil
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

-- Política de lectura para admins
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_check
      WHERE admin_check.user_id = auth.uid()
        AND admin_check.role IN ('platform_admin', 'organization_admin')
    )
  );

-- Política de actualización: usuarios pueden actualizar su perfil (excepto role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Política de inserción: permitir creación de perfiles
DROP POLICY IF EXISTS "Enable profile creation" ON public.profiles;
CREATE POLICY "Enable profile creation"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 6) Trigger para auto-crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, external_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'external_id', new.id::text)
  );
  RETURN new;
END;
$$;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7) Grant permissions
GRANT EXECUTE ON FUNCTION public.set_user_role(user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

COMMIT;