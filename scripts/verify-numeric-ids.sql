-- Verificar que el sistema de IDs numéricos está funcionando
-- =====================================================

-- 1. Verificar que la columna numeric_id existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'numeric_id';

-- 2. Ver algunos perfiles con sus IDs numéricos
SELECT id, email, role, numeric_id
FROM profiles
LIMIT 5;

-- 3. Verificar la secuencia
SELECT last_value, is_called
FROM user_numeric_id_seq;

-- 4. Verificar la vista user_identifiers
SELECT * FROM user_identifiers LIMIT 3;

-- 5. Probar la función de formato
SELECT format_user_id(10000001, 'patient') as formatted_patient,
       format_user_id(10000002, 'doctor') as formatted_doctor,
       format_user_id(10000003, 'company') as formatted_company;