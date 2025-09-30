-- supabase/tests/rls_company.sql (versión ultra-estable)

DO $$
DECLARE
  u_admin  uuid := '11111111-1111-1111-1111-111111111111';
  u_member uuid := '22222222-2222-2222-2222-222222222222';
  c_a      uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  members_count int;
BEGIN
  RAISE NOTICE '--- RLS Test Setup ---';
  -- Limpieza y creación en orden correcto
  DELETE FROM public.company_members WHERE profile_id IN (u_admin, u_member);
  DELETE FROM public.companies WHERE owner_profile_id IN (u_admin, u_member);
  DELETE FROM public.profiles WHERE user_id IN (u_admin, u_member);
  EXECUTE 'DELETE FROM auth.users WHERE id IN (' || quote_literal(u_admin) || ', ' || quote_literal(u_member) || ')';

  EXECUTE 'INSERT INTO auth.users (id, email) VALUES (' || quote_literal(u_admin) || ', ''rls_admin@test.com'')';
  EXECUTE 'INSERT INTO auth.users (id, email) VALUES (' || quote_literal(u_member) || ', ''rls_member@test.com'')';

  INSERT INTO public.profiles (user_id, email, role, external_id) VALUES (u_admin, 'rls_admin@test.com', 'company', 'rls-admin') ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.profiles (user_id, email, role, external_id) VALUES (u_member, 'rls_member@test.com', 'company', 'rls-member') ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.companies (id, name, owner_profile_id) VALUES (c_a, 'Company A', u_admin) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.company_members (company_id, profile_id, role) VALUES (c_a, u_admin, 'admin') ON CONFLICT (company_id, profile_id) DO UPDATE SET role = 'admin';
  INSERT INTO public.company_members (company_id, profile_id, role) VALUES (c_a, u_member, 'member') ON CONFLICT (company_id, profile_id) DO UPDATE SET role = 'member';

  RAISE NOTICE '--- Running RLS tests ---';

  -- Simula ser u_member
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_member, 'role','authenticated')::text, true);

  -- Test: Member NO puede insertar
  BEGIN
    DECLARE new_profile_id uuid := gen_random_uuid();
    EXECUTE 'INSERT INTO auth.users (id, email) VALUES (' || quote_literal(new_profile_id) || ', ''temp_member@test.com'')';
    INSERT INTO public.profiles (user_id, email, role, external_id) VALUES (new_profile_id, 'temp_member@test.com', 'company', 'temp-member');
    INSERT INTO public.company_members(company_id, profile_id, role) VALUES (c_a, new_profile_id, 'member');
    RAISE EXCEPTION 'FAIL: Member debería tener prohibido insertar';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'OK: Member no puede INSERT';
  END;

  -- Simula ser u_admin
  PERFORM set_config('request.jwt.claims', json_build_object('sub', u_admin, 'role','authenticated')::text, true);

  -- Test: Admin SÍ puede insertar
  BEGIN
    DECLARE new_profile_id uuid := gen_random_uuid();
    EXECUTE 'INSERT INTO auth.users (id, email) VALUES (' || quote_literal(new_profile_id) || ', ''temp_admin_insert@test.com'')';
    INSERT INTO public.profiles (user_id, email, role, external_id) VALUES (new_profile_id, 'temp_admin_insert@test.com', 'company', 'temp-admin-insert');
    INSERT INTO public.company_members(company_id, profile_id, role) VALUES (c_a, new_profile_id, 'member');
    RAISE NOTICE 'OK: Admin puede INSERT';
  END;

  RAISE NOTICE '--- RLS tests completados con éxito ---';
END $$;
