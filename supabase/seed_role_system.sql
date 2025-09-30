-- Seeds for Role System Testing
-- Apply after 20250929_introduce_role_system.sql migration

BEGIN;

-- Disable the trigger temporarily to avoid conflicts
ALTER TABLE public.user_roles DISABLE TRIGGER sync_profile_role_after_user_roles;

-- First, create test profiles (these would normally be created via Supabase Auth)
-- For demo purposes, we'll create them directly
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@clinica-demo.com', 'Admin', 'Clínica Demo', 'admin', NOW(), NOW()),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'company@clinica-demo.com', 'Usuario', 'Empresa', 'company_admin', NOW(), NOW()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'doctor@clinica-demo.com', 'Juan', 'Pérez', 'doctor', NOW(), NOW()),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'patient@clinica-demo.com', 'María', 'González', 'patient', NOW(), NOW()),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'platform@clinica-demo.com', 'Platform', 'Admin', 'platform_admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Create test organization
INSERT INTO public.organizations (id, owner_profile_id, name, slug, metadata)
VALUES (
  '00000000-0000-0000-0000-000000000111',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Clínica Demo AutaMedica',
  'clinica-demo',
  jsonb_build_object(
    'description', 'Organización de prueba para el sistema de roles',
    'type', 'healthcare',
    'created_by', 'system_seed'
  )
) ON CONFLICT (id) DO NOTHING;

-- Insert user roles for testing
INSERT INTO public.user_roles (profile_id, role, metadata)
SELECT profile_id::UUID, role, metadata FROM (VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'organization_admin', jsonb_build_object('seed', true, 'role', 'org_admin_test')),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'company_admin', jsonb_build_object('seed', true, 'role', 'company_user_test')),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'doctor', jsonb_build_object('seed', true, 'role', 'doctor_test')),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'patient', jsonb_build_object('seed', true, 'role', 'patient_test')),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'platform_admin', jsonb_build_object('seed', true, 'role', 'platform_admin_test'))
) AS t(profile_id, role, metadata)
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.profile_id = t.profile_id::UUID 
    AND ur.organization_id IS NULL
    AND ur.role = t.role
);

-- Insert organization memberships
INSERT INTO public.org_members (organization_id, profile_id, role, metadata) VALUES
  ('00000000-0000-0000-0000-000000000111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', jsonb_build_object('seed', true, 'permissions', array['manage_org', 'manage_users'])),
  ('00000000-0000-0000-0000-000000000111', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'member', jsonb_build_object('seed', true, 'permissions', array['view_org', 'access_portal']))
ON CONFLICT (organization_id, profile_id) DO UPDATE SET
  role = EXCLUDED.role,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- Verification queries to run after seeding
DO $$
DECLARE
  org_count integer;
  role_count integer;
  member_count integer;
BEGIN
  SELECT COUNT(*) INTO org_count FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000111';
  SELECT COUNT(*) INTO role_count FROM public.user_roles WHERE metadata->>'seed' = 'true';
  SELECT COUNT(*) INTO member_count FROM public.org_members WHERE organization_id = '00000000-0000-0000-0000-000000000111';

  RAISE NOTICE 'Seed Summary:';
  RAISE NOTICE '- Organizations created: %', org_count;
  RAISE NOTICE '- User roles created: %', role_count;
  RAISE NOTICE '- Organization members: %', member_count;

  IF org_count = 0 OR role_count = 0 OR member_count = 0 THEN
    RAISE EXCEPTION 'Seeding failed - missing data';
  END IF;

  RAISE NOTICE '✅ Role system seeds applied successfully!';
END $$;

-- Re-enable the trigger
ALTER TABLE public.user_roles ENABLE TRIGGER sync_profile_role_after_user_roles;

COMMIT;

-- Quick verification queries (run separately if needed):
/*
-- Verify organizations
SELECT id, name, slug FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000111';

-- Verify user roles
SELECT profile_id, role, created_at FROM public.user_roles WHERE metadata->>'seed' = 'true' ORDER BY role;

-- Verify organization members
SELECT om.organization_id, om.profile_id, om.role, ur.role as user_global_role
FROM public.org_members om
JOIN public.user_roles ur ON om.profile_id = ur.profile_id
WHERE om.organization_id = '00000000-0000-0000-0000-000000000111';

-- Test RLS policies (run as authenticated user)
-- SET LOCAL "request.jwt.claims" = '{"sub": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}';
-- SELECT * FROM public.organizations; -- Should see the org if user is organization_admin
*/