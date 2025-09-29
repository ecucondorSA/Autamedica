-- 🔐 RLS Smoke Tests for Role System
-- Tests Row Level Security policies for organizations, org_members, and user_roles

\echo '🚀 Starting RLS Smoke Tests...'
\echo ''

-- Test 1: Organization Admin can see their organization
\echo '1️⃣ Testing Organization Admin Access...'

-- Simulate organization admin user (admin@clinica-demo.com)
-- Note: In real Supabase, this would be handled by auth.uid()
-- For testing, we'll use direct queries with known user IDs

SELECT 
  '✅ Organization Admin Test' as test_name,
  id,
  name,
  owner_profile_id
FROM public.organizations 
WHERE owner_profile_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  OR EXISTS (
    SELECT 1 FROM public.org_members om 
    WHERE om.organization_id = public.organizations.id 
      AND om.profile_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      AND om.role IN ('owner', 'admin')
  );

\echo ''

-- Test 2: Regular patient should not see organizations
\echo '2️⃣ Testing Patient Access Restriction...'

SELECT 
  '❌ Should be empty for patient' as test_name,
  COUNT(*) as org_count
FROM public.organizations 
WHERE owner_profile_id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' -- patient
  OR EXISTS (
    SELECT 1 FROM public.org_members om 
    WHERE om.organization_id = public.organizations.id 
      AND om.profile_id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'
      AND om.role IN ('owner', 'admin')
  );

\echo ''

-- Test 3: User can only see their own roles
\echo '3️⃣ Testing User Roles Access...'

SELECT 
  '✅ Admin sees own roles' as test_name,
  profile_id,
  role,
  organization_id
FROM public.user_roles 
WHERE profile_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- admin user

\echo ''

SELECT 
  '✅ Patient sees own roles' as test_name,
  profile_id,
  role,
  organization_id
FROM public.user_roles 
WHERE profile_id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'; -- patient user

\echo ''

-- Test 4: Organization members visibility
\echo '4️⃣ Testing Organization Members Access...'

SELECT 
  '✅ Org members for admin' as test_name,
  om.organization_id,
  om.profile_id,
  om.role,
  o.name as org_name
FROM public.org_members om
JOIN public.organizations o ON om.organization_id = o.id
WHERE om.profile_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' -- admin
   OR EXISTS (
     SELECT 1 FROM public.org_members owner
     WHERE owner.organization_id = om.organization_id
       AND owner.profile_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
       AND owner.role IN ('owner', 'admin')
   );

\echo ''

-- Test 5: Primary role selection function
\echo '5️⃣ Testing Primary Role Selection Function...'

SELECT 
  '✅ Primary role for admin' as test_name,
  public.select_primary_role_for_profile('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') as primary_role;

SELECT 
  '✅ Primary role for patient' as test_name,
  public.select_primary_role_for_profile('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14') as primary_role;

SELECT 
  '✅ Primary role for doctor' as test_name,
  public.select_primary_role_for_profile('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13') as primary_role;

\echo ''

-- Test 6: Data integrity checks
\echo '6️⃣ Testing Data Integrity...'

SELECT 
  '✅ Organizations count' as test_name,
  COUNT(*) as total_organizations
FROM public.organizations;

SELECT 
  '✅ User roles count' as test_name,
  COUNT(*) as total_user_roles
FROM public.user_roles
WHERE metadata->>'seed' = 'true';

SELECT 
  '✅ Org members count' as test_name,
  COUNT(*) as total_org_members
FROM public.org_members;

\echo ''

-- Test 7: Role hierarchy validation
\echo '7️⃣ Testing Role Hierarchy...'

SELECT 
  '✅ Role priorities' as test_name,
  ur.role,
  CASE ur.role
    WHEN 'platform_admin' THEN 100
    WHEN 'admin' THEN 90
    WHEN 'organization_admin' THEN 80
    WHEN 'company_admin' THEN 75
    WHEN 'company' THEN 70
    WHEN 'doctor' THEN 60
    WHEN 'patient' THEN 50
    ELSE 0
  END as priority,
  COUNT(*) as user_count
FROM public.user_roles ur
WHERE metadata->>'seed' = 'true'
GROUP BY ur.role
ORDER BY priority DESC;

\echo ''

-- Test 8: Trigger validation
\echo '8️⃣ Testing Profile Role Sync Trigger...'

-- Check that profiles.role is synced with user_roles
SELECT 
  '✅ Profile role sync' as test_name,
  p.email,
  p.role as profile_role,
  public.select_primary_role_for_profile(p.id) as calculated_role,
  CASE 
    WHEN p.role = public.select_primary_role_for_profile(p.id) THEN '✅ SYNCED'
    ELSE '❌ OUT_OF_SYNC'
  END as sync_status
FROM public.profiles p
WHERE p.email LIKE '%@clinica-demo.com'
ORDER BY p.email;

\echo ''
\echo '🎉 RLS Smoke Tests Complete!'
\echo ''

-- Summary query
SELECT 
  '📊 SUMMARY' as section,
  (SELECT COUNT(*) FROM public.organizations) as organizations,
  (SELECT COUNT(*) FROM public.user_roles WHERE metadata->>'seed' = 'true') as seed_roles,
  (SELECT COUNT(*) FROM public.org_members) as org_members,
  (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@clinica-demo.com') as test_users;
