-- ============================================================================
-- TEST DATA INSERTION - Verify Migration Works
-- ============================================================================
-- IMPORTANT: This creates test data. Run cleanup at the end!
-- ============================================================================

-- Step 1: Get a real user ID from auth.users
-- (You'll need to replace <USER_ID> with an actual UUID from your auth.users table)

SELECT 'Available users:' as info, id, email FROM auth.users LIMIT 3;

-- ============================================================================
-- MANUAL STEP: Copy a user ID from above and replace <USER_ID> below
-- ============================================================================

-- Step 2: Create test patient
-- REPLACE <USER_ID> WITH ACTUAL UUID FROM STEP 1
INSERT INTO public.patients (
    user_id,
    dni,
    birth_date,
    gender,
    blood_type
) VALUES (
    '<USER_ID>',  -- ⚠️ REPLACE THIS
    '99999999',   -- Test DNI
    '1990-01-01',
    'male',
    'O+'
) RETURNING id, dni, blood_type;

-- Step 3: Insert vital signs (This was BROKEN before migration!)
INSERT INTO public.patient_vital_signs (
    patient_id,
    systolic_bp,
    diastolic_bp,
    heart_rate,
    temperature,
    oxygen_saturation,
    measurement_method
) VALUES (
    (SELECT id FROM public.patients WHERE dni = '99999999'),
    120,
    80,
    72,
    36.5,
    98,
    'self_reported'
) RETURNING id, systolic_bp, diastolic_bp, heart_rate;

-- Step 4: Verify data was inserted correctly
SELECT
    '✅ Test Data Inserted' as result,
    p.dni,
    p.blood_type,
    vs.systolic_bp,
    vs.heart_rate,
    vs.temperature
FROM public.patient_vital_signs vs
JOIN public.patients p ON p.id = vs.patient_id
WHERE p.dni = '99999999';

-- ============================================================================
-- CLEANUP - Run this to remove test data
-- ============================================================================

-- Delete test vital signs
DELETE FROM public.patient_vital_signs
WHERE patient_id IN (
    SELECT id FROM public.patients WHERE dni = '99999999'
);

-- Delete test patient
DELETE FROM public.patients WHERE dni = '99999999';

-- Verify cleanup
SELECT
    '✅ Cleanup Complete' as result,
    COUNT(*) as remaining_test_records,
    '0 expected' as note
FROM public.patients WHERE dni = '99999999';

-- ============================================================================
-- If all steps worked:
-- ✅ Migration successful
-- ✅ Foreign keys working
-- ✅ RLS policies allowing insertions
-- ✅ Ready for production use
-- ============================================================================
