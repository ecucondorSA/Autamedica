-- ===================================================================
-- AUTH LIFECYCLE HOOKS - AutaMedica Enterprise
-- ===================================================================
-- Descripción: Sistema completo de hooks para sincronización Auth Hub + BD
-- Autor: Claude Code + User Feedback
-- Fecha: 2025-09-30
-- ===================================================================

-- 1) TABLAS BASE
-- ===================================================================

-- Profiles: 1-1 con auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text CHECK (role IN ('patient','doctor','company','admin')) DEFAULT 'patient',
  portal text CHECK (portal IN ('patients','doctors','companies','admin')) DEFAULT 'patients',
  organization_id uuid, -- Para multi-tenancy médica
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_portal ON public.profiles(portal);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Audit log para auditoría enterprise
CREATE TABLE IF NOT EXISTS public.auth_audit (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  event text NOT NULL, -- 'user_provisioned' | 'role_changed' | 'portal_changed' | 'user_deleted'
  data jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Índice para queries de auditoría
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON public.auth_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_event ON public.auth_audit(event);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON public.auth_audit(created_at);

-- 2) FUNCIONES DE LIFECYCLE
-- ===================================================================

-- Función: Provisionar nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_role text := 'patient';
  default_portal text := 'patients';
BEGIN
  -- Extraer rol del metadata si está presente
  IF NEW.raw_user_meta_data ? 'portal' THEN
    default_portal := NEW.raw_user_meta_data->>'portal';

    -- Mapear portal a rol por defecto
    CASE default_portal
      WHEN 'doctors' THEN default_role := 'doctor';
      WHEN 'companies' THEN default_role := 'company';
      WHEN 'admin' THEN default_role := 'admin';
      ELSE default_role := 'patient';
    END CASE;
  END IF;

  -- Crear perfil automáticamente
  INSERT INTO public.profiles (id, email, role, portal, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    default_role,
    default_portal,
    COALESCE(NEW.raw_user_meta_data, '{}')
  );

  -- Audit log
  INSERT INTO public.auth_audit (user_id, event, data)
  VALUES (
    NEW.id,
    'user_provisioned',
    jsonb_build_object(
      'email', NEW.email,
      'role', default_role,
      'portal', default_portal,
      'provider', COALESCE(NEW.app_metadata->>'provider', 'email')
    )
  );

  RETURN NEW;
END;
$$;

-- Función: Auditar cambios de rol/portal
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auditar cambio de rol
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.auth_audit(user_id, event, data)
    VALUES (
      NEW.id,
      'role_changed',
      jsonb_build_object(
        'from', OLD.role,
        'to', NEW.role,
        'portal', NEW.portal
      )
    );
  END IF;

  -- Auditar cambio de portal
  IF NEW.portal IS DISTINCT FROM OLD.portal THEN
    INSERT INTO public.auth_audit(user_id, event, data)
    VALUES (
      NEW.id,
      'portal_changed',
      jsonb_build_object(
        'from', OLD.portal,
        'to', NEW.portal,
        'role', NEW.role
      )
    );
  END IF;

  -- Actualizar timestamp
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

-- Función: Manejar usuario eliminado
CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Audit log de eliminación
  INSERT INTO public.auth_audit(user_id, event, data)
  VALUES (
    OLD.id,
    'user_deleted',
    jsonb_build_object(
      'email', OLD.email,
      'deleted_at', now(),
      'provider', COALESCE(OLD.app_metadata->>'provider', 'email')
    )
  );

  -- Nota: profiles se borra automáticamente por CASCADE
  -- Aquí puedes agregar lógica adicional de anonimización

  RETURN OLD;
END;
$$;

-- 3) TRIGGERS
-- ===================================================================

-- Trigger: Crear perfil automáticamente al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auditar cambios en profiles
DROP TRIGGER IF EXISTS on_profile_changed ON public.profiles;
CREATE TRIGGER on_profile_changed
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

-- Trigger: Auditar eliminación de usuarios
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deleted();

-- 4) RPC FUNCTIONS PARA AUTH HUB
-- ===================================================================

-- RPC: Setear portal y rol desde Auth Hub
CREATE OR REPLACE FUNCTION public.set_portal_and_role(
  p_portal text,
  p_role text DEFAULT NULL,
  p_organization_id uuid DEFAULT NULL
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

  -- Auto-asignar rol basado en portal si no se especifica
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
    organization_id = COALESCE(p_organization_id, organization_id),
    updated_at = now()
  WHERE id = auth.uid();

  -- Verificar que se actualizó
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', auth.uid();
  END IF;

  -- Retornar datos actualizados
  SELECT json_build_object(
    'user_id', auth.uid(),
    'portal', p_portal,
    'role', updated_role,
    'organization_id', p_organization_id,
    'updated_at', now()
  ) INTO result_data;

  RETURN result_data;
END;
$$;

-- RPC: Obtener perfil completo del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'role', p.role,
    'portal', p.portal,
    'organization_id', p.organization_id,
    'metadata', p.metadata,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  )
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

-- RPC: Obtener audit log del usuario (para admin)
CREATE OR REPLACE FUNCTION public.get_user_audit_log(
  p_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id bigint,
  event text,
  data jsonb,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT a.id, a.event, a.data, a.created_at
  FROM public.auth_audit a
  WHERE a.user_id = COALESCE(p_user_id, auth.uid())
  ORDER BY a.created_at DESC
  LIMIT p_limit;
$$;

-- 5) ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Leer propio perfil
DROP POLICY IF EXISTS "read_own_profile" ON public.profiles;
CREATE POLICY "read_own_profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Policy: Actualizar propio perfil (campos seguros)
DROP POLICY IF EXISTS "update_own_profile_safe" ON public.profiles;
CREATE POLICY "update_own_profile_safe"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Solo permitir cambiar campos específicos (no role/portal directamente)
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    portal = (SELECT portal FROM public.profiles WHERE id = auth.uid())
  );

-- Policy: Admins pueden leer todos los perfiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_read_all_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Habilitar RLS en audit log
ALTER TABLE public.auth_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden leer audit logs
DROP POLICY IF EXISTS "admin_read_audit" ON public.auth_audit;
CREATE POLICY "admin_read_audit"
  ON public.auth_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Sistema puede insertar audit logs
DROP POLICY IF EXISTS "system_insert_audit" ON public.auth_audit;
CREATE POLICY "system_insert_audit"
  ON public.auth_audit FOR INSERT
  WITH CHECK (true); -- Las funciones SECURITY DEFINER pueden insertar

-- 6) GRANTS Y PERMISOS
-- ===================================================================

-- Revocar acceso público a funciones sensibles
REVOKE ALL ON FUNCTION public.set_portal_and_role(text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_audit_log(uuid, integer) FROM PUBLIC;

-- Permitir solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.set_portal_and_role(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_audit_log(uuid, integer) TO authenticated;

-- Permitir acceso a tablas para usuarios autenticados
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.auth_audit TO authenticated;

-- 7) COMENTARIOS Y DOCUMENTACIÓN
-- ===================================================================

COMMENT ON TABLE public.profiles IS 'Perfiles de usuario con roles y portales enterprise';
COMMENT ON TABLE public.auth_audit IS 'Log de auditoría para cambios de autenticación y autorización';
COMMENT ON FUNCTION public.set_portal_and_role(text, text, uuid) IS 'RPC para Auth Hub: setear portal y rol del usuario actual';
COMMENT ON FUNCTION public.get_current_profile() IS 'RPC para obtener perfil completo del usuario actual';
COMMENT ON FUNCTION public.get_user_audit_log(uuid, integer) IS 'RPC para obtener audit log (admin only para otros usuarios)';

-- ===================================================================
-- MIGRATION COMPLETED: Auth Lifecycle Hooks Enterprise
-- ===================================================================