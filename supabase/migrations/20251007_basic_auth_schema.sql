-- ===================================================================
-- BASIC AUTH SCHEMA - AltaMedica
-- ===================================================================
-- Descripción: Schema básico de autenticación con roles y portales
-- Fecha: 2025-10-07
-- ===================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- 1. TABLA PROFILES
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text CHECK (role IN ('patient','doctor','company','admin')) DEFAULT 'patient',
  portal text CHECK (portal IN ('patients','doctors','companies','admin')) DEFAULT 'patients',
  organization_id uuid,
  avatar_url text,
  phone text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_portal ON public.profiles(portal);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ===================================================================
-- 2. TABLA AUTH_AUDIT (Auditoría)
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.auth_audit (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  event text NOT NULL,
  data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON public.auth_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event ON public.auth_audit(event);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON public.auth_audit(created_at);

-- ===================================================================
-- 3. FUNCIONES DE LIFECYCLE
-- ===================================================================

-- Función: Auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role text := 'patient';
  default_portal text := 'patients';
BEGIN
  -- Extraer portal del metadata si existe
  IF NEW.raw_user_meta_data ? 'portal' THEN
    default_portal := NEW.raw_user_meta_data->>'portal';

    -- Mapear portal a rol
    CASE default_portal
      WHEN 'doctors' THEN default_role := 'doctor';
      WHEN 'companies' THEN default_role := 'company';
      WHEN 'admin' THEN default_role := 'admin';
      ELSE default_role := 'patient';
    END CASE;
  END IF;

  -- Crear perfil
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    portal,
    metadata
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    default_role,
    default_portal,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  );

  -- Log de auditoría
  INSERT INTO public.auth_audit (user_id, event, data)
  VALUES (
    NEW.id,
    'user_created',
    jsonb_build_object(
      'email', NEW.email,
      'role', default_role,
      'portal', default_portal
    )
  );

  RETURN NEW;
END;
$$;

-- Trigger: Crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función: Actualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger: Auto-actualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ===================================================================
-- 4. RPC FUNCTIONS
-- ===================================================================

-- RPC: Obtener perfil actual
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'role', role,
    'portal', portal,
    'avatar_url', avatar_url,
    'phone', phone,
    'metadata', metadata,
    'created_at', created_at,
    'updated_at', updated_at
  )
  FROM public.profiles
  WHERE id = auth.uid();
$$;

-- RPC: Setear portal y rol
CREATE OR REPLACE FUNCTION public.set_portal_and_role(
  p_portal text,
  p_role text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_data json;
  updated_role text;
BEGIN
  -- Validar portal
  IF p_portal NOT IN ('patients','doctors','companies','admin') THEN
    RAISE EXCEPTION 'Invalid portal: %', p_portal;
  END IF;

  -- Auto-asignar rol si no se especifica
  IF p_role IS NULL THEN
    CASE p_portal
      WHEN 'doctors' THEN updated_role := 'doctor';
      WHEN 'companies' THEN updated_role := 'company';
      WHEN 'admin' THEN updated_role := 'admin';
      ELSE updated_role := 'patient';
    END CASE;
  ELSE
    updated_role := p_role;
  END IF;

  -- Validar rol
  IF updated_role NOT IN ('patient','doctor','company','admin') THEN
    RAISE EXCEPTION 'Invalid role: %', updated_role;
  END IF;

  -- Actualizar perfil
  UPDATE public.profiles
  SET
    portal = p_portal,
    role = updated_role,
    updated_at = now()
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', auth.uid();
  END IF;

  -- Log de auditoría
  INSERT INTO public.auth_audit (user_id, event, data)
  VALUES (
    auth.uid(),
    'portal_changed',
    jsonb_build_object(
      'portal', p_portal,
      'role', updated_role
    )
  );

  -- Retornar datos actualizados
  SELECT json_build_object(
    'user_id', auth.uid(),
    'portal', p_portal,
    'role', updated_role,
    'updated_at', now()
  ) INTO result_data;

  RETURN result_data;
END;
$$;

-- ===================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_audit ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies para audit (solo lectura propia)
DROP POLICY IF EXISTS "Users can read own audit" ON public.auth_audit;
CREATE POLICY "Users can read own audit"
  ON public.auth_audit FOR SELECT
  USING (auth.uid() = user_id);

-- Policy para insertar auditoría (sistema)
DROP POLICY IF EXISTS "System can insert audit" ON public.auth_audit;
CREATE POLICY "System can insert audit"
  ON public.auth_audit FOR INSERT
  WITH CHECK (true);

-- ===================================================================
-- 6. GRANTS
-- ===================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.auth_audit TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_current_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_portal_and_role(text, text) TO authenticated;

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con roles y portales';
COMMENT ON TABLE public.auth_audit IS 'Log de auditoría de autenticación';
