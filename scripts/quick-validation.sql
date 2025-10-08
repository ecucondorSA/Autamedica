-- ============================================================================
-- QUICK VALIDATION - Post Migration Check
-- ============================================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Expected results are commented for each test
-- ============================================================================

-- TEST 1: Verify all 7 tables exist
SELECT
    '✅ TEST 1: Tables Created' as test,
    COUNT(*) as found,
    '7 expected' as expected
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'companies', 'doctors', 'patients',
    'company_members', 'patient_care_team',
    'appointments', 'medical_records'
);

-- TEST 2: List all new tables
SELECT
    '📋 New Tables' as info,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'companies', 'doctors', 'patients',
    'company_members', 'patient_care_team',
    'appointments', 'medical_records'
)
ORDER BY table_name;

-- TEST 3: Verify CRITICAL FK repair (patient_vital_signs → patients)
SELECT
    '✅ TEST 3: Critical FK Repaired' as test,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    'Should reference patients table' as note
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'patient_vital_signs'
AND kcu.column_name = 'patient_id';
-- Expected: 1 row showing patient_vital_signs.patient_id → patients.id

-- TEST 4: Verify RLS is enabled
SELECT
    '✅ TEST 4: RLS Status' as test,
    tablename,
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'companies', 'doctors', 'patients',
    'appointments', 'medical_records'
)
ORDER BY tablename;
-- Expected: All tables show ✅ Enabled

-- TEST 5: Count RLS policies
SELECT
    '✅ TEST 5: RLS Policies Count' as test,
    tablename,
    COUNT(*) as policies
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'companies', 'doctors', 'patients',
    'appointments', 'medical_records'
)
GROUP BY tablename
ORDER BY tablename;
-- Expected: Each table has 2-3+ policies

-- TEST 6: Verify key indexes exist
SELECT
    '✅ TEST 6: Indexes' as test,
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('patients', 'doctors', 'appointments')
GROUP BY tablename
ORDER BY tablename;
-- Expected: Multiple indexes per table

-- TEST 7: Check patients table structure
SELECT
    '📋 Patients Table Structure' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
ORDER BY ordinal_position;

-- TEST 8: Check all foreign keys in new tables
SELECT
    '📋 Foreign Key Relationships' as info,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS fk_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'companies', 'doctors', 'patients',
    'company_members', 'patient_care_team',
    'appointments', 'medical_records'
)
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- FINAL SUMMARY
-- ============================================================================

SELECT
    '🎯 MIGRATION SUMMARY' as summary,
    (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public'
     AND table_name IN ('companies','doctors','patients','appointments','medical_records','patient_care_team','company_members')
    ) as tables_created,
    '7' as expected_tables,
    (SELECT COUNT(*) FROM pg_policies
     WHERE schemaname = 'public'
     AND tablename IN ('companies','doctors','patients','appointments','medical_records')
    ) as total_rls_policies,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'patient_vital_signs' AND kcu.column_name = 'patient_id'
        )
        THEN '✅ Fixed'
        ELSE '❌ Still Broken'
    END as critical_fk_status;

-- ============================================================================
-- Next Steps:
-- 1. If all tests show ✅ - Migration successful!
-- 2. Next: Test data insertion (see ACCIONES_INMEDIATAS.md Step 5)
-- 3. Then: Generate TypeScript types from database
-- ============================================================================
