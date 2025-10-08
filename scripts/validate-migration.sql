-- ============================================================================
-- VALIDATION SCRIPT - Post-Migration 20251008
-- ============================================================================
-- Purpose: Validate that core medical tables migration was successful
-- Run this in Supabase SQL Editor after applying migration
-- ============================================================================

-- Set output formatting
\set QUIET on
\pset border 2
\pset format wrapped

-- ============================================================================
-- TEST 1: Verify all tables exist
-- ============================================================================

\echo '\n=== TEST 1: Verify Tables Exist ==='
SELECT
    'Table Existence Check' as test_name,
    CASE
        WHEN COUNT(*) = 7 THEN '✅ PASS - All 7 tables exist'
        ELSE '❌ FAIL - Expected 7 tables, found ' || COUNT(*)
    END as result
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'companies',
    'doctors',
    'patients',
    'company_members',
    'patient_care_team',
    'appointments',
    'medical_records'
);

-- List all public tables
\echo '\n=== All Public Tables ==='
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- TEST 2: Verify Foreign Keys
-- ============================================================================

\echo '\n=== TEST 2: Verify Foreign Keys ==='
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    ccu.column_name AS foreign_column,
    '✅' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'companies',
    'doctors',
    'patients',
    'company_members',
    'patient_care_team',
    'appointments',
    'medical_records',
    'patient_vital_signs'
)
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- TEST 3: Verify RLS is enabled
-- ============================================================================

\echo '\n=== TEST 3: Verify RLS Enabled ==='
SELECT
    schemaname,
    tablename,
    CASE
        WHEN rowsecurity = true THEN '✅ Enabled'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'companies',
    'doctors',
    'patients',
    'company_members',
    'patient_care_team',
    'appointments',
    'medical_records'
)
ORDER BY tablename;

-- ============================================================================
-- TEST 4: Count RLS Policies
-- ============================================================================

\echo '\n=== TEST 4: Count RLS Policies ==='
SELECT
    tablename,
    COUNT(*) as policy_count,
    CASE
        WHEN COUNT(*) >= 2 THEN '✅ Good'
        ELSE '⚠️ Low'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'companies',
    'doctors',
    'patients',
    'company_members',
    'patient_care_team',
    'appointments',
    'medical_records'
)
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- TEST 5: Verify Indexes
-- ============================================================================

\echo '\n=== TEST 5: Verify Indexes ==='
SELECT
    tablename,
    indexname,
    '✅' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'companies',
    'doctors',
    'patients',
    'appointments',
    'medical_records'
)
ORDER BY tablename, indexname;

-- ============================================================================
-- TEST 6: Verify Triggers
-- ============================================================================

\echo '\n=== TEST 6: Verify Updated_At Triggers ==='
SELECT
    event_object_table as table_name,
    trigger_name,
    CASE
        WHEN trigger_name LIKE '%updated_at%' THEN '✅ Present'
        ELSE '⚠️ Other'
    END as status
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN (
    'companies',
    'doctors',
    'patients',
    'appointments',
    'medical_records'
)
ORDER BY event_object_table;

-- ============================================================================
-- TEST 7: Verify patient_vital_signs FK is NOT broken
-- ============================================================================

\echo '\n=== TEST 7: Critical - patient_vital_signs Foreign Key ==='
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'patient_vital_signs'
            AND kcu.column_name = 'patient_id'
        ) THEN '✅ PASS - FK to patients.id exists'
        ELSE '❌ FAIL - FK is still broken'
    END as result;

-- ============================================================================
-- TEST 8: Verify table structures
-- ============================================================================

\echo '\n=== TEST 8: Patients Table Structure ==='
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
ORDER BY ordinal_position;

\echo '\n=== TEST 8: Doctors Table Structure ==='
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'doctors'
ORDER BY ordinal_position;

-- ============================================================================
-- TEST 9: Check for orphaned vital signs (shouldn't exist yet)
-- ============================================================================

\echo '\n=== TEST 9: Check Orphaned Vital Signs ==='
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ PASS - No orphaned vital signs'
        ELSE '⚠️ WARNING - ' || COUNT(*) || ' orphaned vital signs found'
    END as result,
    COUNT(*) as orphaned_count
FROM public.patient_vital_signs pvs
WHERE NOT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = pvs.patient_id
);

-- ============================================================================
-- SUMMARY
-- ============================================================================

\echo '\n=== MIGRATION VALIDATION SUMMARY ==='
\echo '✅ If all tests show PASS/Good, migration was successful'
\echo '⚠️ If any test shows FAIL/WARNING, review the specific issue'
\echo ''
\echo 'Next steps:'
\echo '1. Test data insertion (see ACCIONES_INMEDIATAS.md Step 5)'
\echo '2. Add Community types to packages/types'
\echo '3. Generate TypeScript types from database'
\echo '4. Create React hooks for new tables'
