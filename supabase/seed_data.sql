-- AutaMedica Test Seeds
-- Datos de prueba controlados por rol para testing de flujos médicos
-- 
-- IMPORTANTE: Este archivo crea datos de prueba que respetan las políticas RLS
-- Los usuarios creados aquí pueden ser utilizados para testing de todas las funcionalidades

-- ============================================================================
-- LIMPIEZA INICIAL (solo para desarrollo/testing)
-- ============================================================================

-- Limpiar datos existentes en orden correcto (respetando foreign keys)
TRUNCATE TABLE public.medical_records CASCADE;
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.patient_care_team CASCADE;
TRUNCATE TABLE public.org_members CASCADE;
TRUNCATE TABLE public.user_roles CASCADE;
TRUNCATE TABLE public.patients CASCADE;
TRUNCATE TABLE public.doctors CASCADE;
TRUNCATE TABLE public.organizations CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- ============================================================================
-- USUARIOS BASE (Profiles)
-- ============================================================================

-- Platform Admin
INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@autamedica.com', 'platform_admin', 'Sistema', 'Administrador');

-- Organization Admin
INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES
('22222222-2222-2222-2222-222222222222', 'empresa@hospitalsanmartin.com', 'organization_admin', 'María', 'Rodriguez');

-- Doctors
INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES
('33333333-3333-3333-3333-333333333333', 'dr.garcia@autamedica.com', 'doctor', 'Carlos', 'García'),
('44444444-4444-4444-4444-444444444444', 'dra.martinez@autamedica.com', 'doctor', 'Ana', 'Martínez'),
('55555555-5555-5555-5555-555555555555', 'dr.lopez@autamedica.com', 'doctor', 'José', 'López');

-- Patients
INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES
('66666666-6666-6666-6666-666666666666', 'juan.perez@gmail.com', 'patient', 'Juan', 'Pérez'),
('77777777-7777-7777-7777-777777777777', 'maria.gonzalez@gmail.com', 'patient', 'María', 'González'),
('88888888-8888-8888-8888-888888888888', 'carlos.ruiz@empresa.com', 'patient', 'Carlos', 'Ruiz'),
('99999999-9999-9999-9999-999999999999', 'ana.torres@empresa.com', 'patient', 'Ana', 'Torres');

-- ============================================================================
-- ORGANIZATIONS (Empresas y clínicas)
-- ============================================================================

INSERT INTO public.organizations (id, owner_profile_id, slug, name, legal_name, tax_id, type, industry, size, address, contact, metadata, is_active) VALUES
(
    'c0000001-0000-0000-0000-000000000001', 
    '22222222-2222-2222-2222-222222222222',
    'hospital-san-martin',
    'Hospital San Martín',
    'Hospital San Martín S.A.',
    '30-12345678-9',
    'clinic',
    'Healthcare',
    'medium',
    '{"street": "Av. San Martín 1234", "city": "Buenos Aires", "province": "CABA", "postal_code": "C1010AAA", "country": "Argentina"}',
    '{"phone": "+54-11-4567-8900", "email": "contacto@hospitalsanmartin.com", "website": "https://hospitalsanmartin.com"}',
    '{}'::JSONB,
    true
),
(
    'c0000002-0000-0000-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'techcorp-sa',
    'Empresa TechCorp SA',
    'TechCorp Sociedad Anónima',
    '30-87654321-2',
    'company',
    'Technology',
    'large',
    '{"street": "Av. Corrientes 5678", "city": "Buenos Aires", "province": "CABA", "postal_code": "C1043AAB", "country": "Argentina"}',
    '{"phone": "+54-11-2345-6789", "email": "rrhh@techcorp.com.ar", "website": "https://techcorp.com.ar"}',
    '{}'::JSONB,
    true
);

-- ============================================================================
-- ORGANIZATION MEMBERS (Membership en organizaciones)
-- ============================================================================

-- Organization admin como miembro de su propia organización
INSERT INTO public.org_members (organization_id, profile_id, role) VALUES
('c0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'owner'),
('c0000002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'owner');

-- Empleados corporativos
INSERT INTO public.org_members (organization_id, profile_id, role) VALUES
('c0000002-0000-0000-0000-000000000002', '88888888-8888-8888-8888-888888888888', 'member'),
('c0000002-0000-0000-0000-000000000002', '99999999-9999-9999-9999-999999999999', 'member');

-- ============================================================================
-- USER ROLES (Asignaciones globales y por organización)
-- ============================================================================

-- Roles globales
INSERT INTO public.user_roles (profile_id, organization_id, role, granted_by) VALUES
('11111111-1111-1111-1111-111111111111', NULL, 'platform_admin', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222222', NULL, 'organization_admin', '22222222-2222-2222-2222-222222222222'),
('33333333-3333-3333-3333-333333333333', NULL, 'doctor', '33333333-3333-3333-3333-333333333333'),
('44444444-4444-4444-4444-444444444444', NULL, 'doctor', '44444444-4444-4444-4444-444444444444'),
('55555555-5555-5555-5555-555555555555', NULL, 'doctor', '55555555-5555-5555-5555-555555555555'),
('66666666-6666-6666-6666-666666666666', NULL, 'patient', '66666666-6666-6666-6666-666666666666'),
('77777777-7777-7777-7777-777777777777', NULL, 'patient', '77777777-7777-7777-7777-777777777777'),
('88888888-8888-8888-8888-888888888888', NULL, 'patient', '88888888-8888-8888-8888-888888888888'),
('99999999-9999-9999-9999-999999999999', NULL, 'patient', '99999999-9999-9999-9999-999999999999');

-- Roles por organización
INSERT INTO public.user_roles (profile_id, organization_id, role, granted_by) VALUES
('22222222-2222-2222-2222-222222222222', 'c0000001-0000-0000-0000-000000000001', 'organization_admin', '22222222-2222-2222-2222-222222222222'),
('22222222-2222-2222-2222-222222222222', 'c0000002-0000-0000-0000-000000000002', 'organization_admin', '22222222-2222-2222-2222-222222222222'),
('88888888-8888-8888-8888-888888888888', 'c0000002-0000-0000-0000-000000000002', 'company', '22222222-2222-2222-2222-222222222222'),
('99999999-9999-9999-9999-999999999999', 'c0000002-0000-0000-0000-000000000002', 'company', '22222222-2222-2222-2222-222222222222');

-- ============================================================================
-- DOCTORS (Perfiles médicos)
-- ============================================================================

INSERT INTO public.doctors (id, user_id, first_name, last_name, email, phone, license_number, specialties, bio, education, experience, is_active) VALUES
(
    'd0000001-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'Carlos',
    'García',
    'dr.garcia@autamedica.com',
    '+54-11-1234-5678',
    'MP-12345-CABA',
    ARRAY['Cardiología', 'Medicina Interna'],
    'Cardiólogo con 15 años de experiencia en hospitales públicos y privados. Especialista en cardiología intervencionista.',
    '{"undergraduate": {"institution": "Universidad de Buenos Aires", "degree": "Médico", "year": 2005}, "postgraduate": [{"institution": "Hospital Italiano", "specialty": "Cardiología", "year": 2008}]}',
    '{"positions": [{"institution": "Hospital San Martín", "position": "Jefe de Cardiología", "start_year": 2015, "end_year": null, "current": true}], "total_years": 15}',
    true
),
(
    'd0000002-0000-0000-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'Ana',
    'Martínez',
    'dra.martinez@autamedica.com',
    '+54-11-2345-6789',
    'MP-67890-CABA',
    ARRAY['Pediatría', 'Neonatología'],
    'Pediatra especializada en neonatología. Atención integral de niños desde el nacimiento hasta la adolescencia.',
    '{"undergraduate": {"institution": "Universidad Católica Argentina", "degree": "Médico", "year": 2008}, "postgraduate": [{"institution": "Hospital Garrahan", "specialty": "Pediatría", "year": 2011}, {"institution": "Hospital Garrahan", "specialty": "Neonatología", "year": 2013}]}',
    '{"positions": [{"institution": "Hospital Garrahan", "position": "Médica de Planta", "start_year": 2013, "end_year": 2020}, {"institution": "Consultorios Privados", "position": "Pediatra", "start_year": 2020, "end_year": null, "current": true}], "total_years": 12}',
    true
),
(
    'd0000003-0000-0000-0000-000000000003',
    '55555555-5555-5555-5555-555555555555',
    'José',
    'López',
    'dr.lopez@autamedica.com',
    '+54-11-3456-7890',
    'MP-11111-CABA',
    ARRAY['Medicina Laboral', 'Medicina General'],
    'Médico laboral especializado en salud ocupacional y medicina preventiva empresarial.',
    '{"undergraduate": {"institution": "Universidad del Salvador", "degree": "Médico", "year": 2010}, "postgraduate": [{"institution": "Universidad Favaloro", "specialty": "Medicina Laboral", "year": 2012}]}',
    '{"positions": [{"institution": "Consultora Médica SA", "position": "Médico Laboral", "start_year": 2012, "end_year": null, "current": true}], "total_years": 10}',
    true
);

-- ============================================================================
-- PATIENTS (Perfiles de pacientes)
-- ============================================================================

INSERT INTO public.patients (id, user_id, organization_id, first_name, last_name, email, phone, date_of_birth, gender, medical_record_number, address, emergency_contact) VALUES
(
    'p0000001-0000-0000-0000-000000000001',
    '66666666-6666-6666-6666-666666666666',
    NULL, -- Paciente individual
    'Juan',
    'Pérez',
    'juan.perez@gmail.com',
    '+54-11-4567-8901',
    '1985-03-15',
    'male',
    'HC-000001',
    '{"street": "Av. Rivadavia 1234", "apartment": "2B", "city": "Buenos Aires", "province": "CABA", "postal_code": "C1033AAC", "country": "Argentina"}',
    '{"name": "María Pérez", "relationship": "spouse", "phone": "+54-11-4567-8902", "email": "maria.perez@gmail.com"}'
),
(
    'p0000002-0000-0000-0000-000000000002',
    '77777777-7777-7777-7777-777777777777',
    NULL, -- Paciente individual
    'María',
    'González',
    'maria.gonzalez@gmail.com',
    '+54-11-5678-9012',
    '1992-08-22',
    'female',
    'HC-000002',
    '{"street": "Calle Belgrano 567", "city": "Buenos Aires", "province": "CABA", "postal_code": "C1092AAD", "country": "Argentina"}',
    '{"name": "Carlos González", "relationship": "father", "phone": "+54-11-5678-9013", "email": "carlos.gonzalez@gmail.com"}'
),
(
    'p0000003-0000-0000-0000-000000000003',
    '88888888-8888-8888-8888-888888888888',
    'c0000002-0000-0000-0000-000000000002', -- Empleado de TechCorp
    'Carlos',
    'Ruiz',
    'carlos.ruiz@empresa.com',
    '+54-11-6789-0123',
    '1988-12-10',
    'male',
    'HC-000003',
    '{"street": "Av. Santa Fe 890", "apartment": "10A", "city": "Buenos Aires", "province": "CABA", "postal_code": "C1059ABE", "country": "Argentina"}',
    '{"name": "Lucía Ruiz", "relationship": "spouse", "phone": "+54-11-6789-0124", "email": "lucia.ruiz@gmail.com"}'
),
(
    'p0000004-0000-0000-0000-000000000004',
    '99999999-9999-9999-9999-999999999999',
    'c0000002-0000-0000-0000-000000000002', -- Empleada de TechCorp
    'Ana',
    'Torres',
    'ana.torres@empresa.com',
    '+54-11-7890-1234',
    '1995-06-18',
    'female',
    'HC-000004',
    '{"street": "Av. Córdoba 123", "city": "Buenos Aires", "province": "CABA", "postal_code": "C1054AAF", "country": "Argentina"}',
    '{"name": "Roberto Torres", "relationship": "father", "phone": "+54-11-7890-1235", "email": "roberto.torres@gmail.com"}'
);

-- ============================================================================
-- PATIENT CARE TEAM (Asignaciones médico-paciente)
-- ============================================================================

-- Dr. García (Cardiólogo) atiende a Juan Pérez
INSERT INTO public.patient_care_team (patient_id, doctor_id, relationship, added_by) VALUES
('p0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'primary', '11111111-1111-1111-1111-111111111111');

-- Dra. Martínez (Pediatra) atiende a María González 
INSERT INTO public.patient_care_team (patient_id, doctor_id, relationship, added_by) VALUES
('p0000002-0000-0000-0000-000000000002', 'd0000002-0000-0000-0000-000000000002', 'primary', '11111111-1111-1111-1111-111111111111');

-- Dr. López (Medicina Laboral) atiende a empleados de TechCorp
INSERT INTO public.patient_care_team (patient_id, doctor_id, relationship, added_by) VALUES
('p0000003-0000-0000-0000-000000000003', 'd0000003-0000-0000-0000-000000000003', 'occupational', '22222222-2222-2222-2222-222222222222'),
('p0000004-0000-0000-0000-000000000004', 'd0000003-0000-0000-0000-000000000003', 'occupational', '22222222-2222-2222-2222-222222222222');

-- Dr. García también ve a Carlos Ruiz por tema cardíaco
INSERT INTO public.patient_care_team (patient_id, doctor_id, relationship, added_by) VALUES
('p0000003-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001', 'specialist', '22222222-2222-2222-2222-222222222222');

-- ============================================================================
-- APPOINTMENTS (Citas médicas para testing)
-- ============================================================================

-- Citas pasadas (completadas)
INSERT INTO public.appointments (id, patient_id, doctor_id, organization_id, start_time, duration_minutes, type, status, notes, created_by) VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    'p0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0000-0000-000000000001',
    NULL,
    '2025-09-15 10:00:00+00',
    60,
    'consultation',
    'completed',
    'Consulta de control cardiológico. Paciente estable.',
    '33333333-3333-3333-3333-333333333333'
),
(
    'a0000002-0000-0000-0000-000000000002',
    'p0000002-0000-0000-0000-000000000002',
    'd0000002-0000-0000-0000-000000000002',
    NULL,
    '2025-09-16 14:30:00+00',
    45,
    'follow-up',
    'completed',
    'Control pediátrico rutinario. Desarrollo normal.',
    '44444444-4444-4444-4444-444444444444'
);

-- Citas actuales (programadas)
INSERT INTO public.appointments (id, patient_id, doctor_id, organization_id, start_time, duration_minutes, type, status, notes, created_by) VALUES
(
    'a0000003-0000-0000-0000-000000000003',
    'p0000003-0000-0000-0000-000000000003',
    'd0000003-0000-0000-0000-000000000003',
    'c0000002-0000-0000-0000-000000000002',
    '2025-09-25 09:00:00+00',
    30,
    'consultation',
    'scheduled',
    'Examen médico laboral anual.',
    '22222222-2222-2222-2222-222222222222'
),
(
    'a0000004-0000-0000-0000-000000000004',
    'p0000004-0000-0000-0000-000000000004',
    'd0000003-0000-0000-0000-000000000003',
    'c0000002-0000-0000-0000-000000000002',
    '2025-09-25 09:30:00+00',
    30,
    'consultation',
    'scheduled',
    'Examen médico laboral anual.',
    '22222222-2222-2222-2222-222222222222'
),
(
    'a0000005-0000-0000-0000-000000000005',
    'p0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0000-0000-000000000001',
    NULL,
    '2025-09-30 11:00:00+00',
    60,
    'follow-up',
    'scheduled',
    'Control post-tratamiento cardiológico.',
    '66666666-6666-6666-6666-666666666666'
);

-- Cita de emergencia
INSERT INTO public.appointments (id, patient_id, doctor_id, organization_id, start_time, duration_minutes, type, status, notes, created_by) VALUES
(
    'a0000006-0000-0000-0000-000000000006',
    'p0000003-0000-0000-0000-000000000003',
    'd0000001-0000-0000-0000-000000000001',
    'c0000002-0000-0000-0000-000000000002',
    '2025-09-21 15:00:00+00',
    90,
    'emergency',
    'in-progress',
    'Consulta de emergencia por dolor en el pecho.',
    '88888888-8888-8888-8888-888888888888'
);

-- ============================================================================
-- MEDICAL RECORDS (Registros médicos)
-- ============================================================================

-- Registros médicos de citas completadas
INSERT INTO public.medical_records (id, patient_id, doctor_id, appointment_id, title, summary, data, visibility, created_by) VALUES
(
    'm0000001-0000-0000-0000-000000000001',
    'p0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'Control Cardiológico Septiembre 2025',
    'Paciente masculino de 40 años en control de rutina. Presión arterial controlada, ECG normal.',
    '{"vital_signs": {"blood_pressure": "120/80", "heart_rate": 72, "temperature": 36.5, "weight": 75}, "examination": {"cardiovascular": "normal", "pulmonary": "normal"}, "medications": [{"name": "Enalapril", "dose": "10mg", "frequency": "daily"}], "recommendations": "Continuar con medicación actual, control en 3 meses"}',
    'care_team',
    '33333333-3333-3333-3333-333333333333'
),
(
    'm0000002-0000-0000-0000-000000000002',
    'p0000002-0000-0000-0000-000000000002',
    'd0000002-0000-0000-0000-000000000002',
    'a0000002-0000-0000-0000-000000000002',
    'Control Pediátrico Septiembre 2025',
    'Paciente femenina de 33 años en control ginecológico de rutina. Examen normal.',
    '{"vital_signs": {"blood_pressure": "110/70", "weight": 60, "height": 165}, "examination": {"general": "normal", "gynecological": "normal"}, "vaccines": "up_to_date", "recommendations": "Control anual, continuar con métodos preventivos"}',
    'care_team',
    '44444444-4444-4444-4444-444444444444'
);

-- Registro médico laboral (visible para organization admin)
INSERT INTO public.medical_records (id, patient_id, doctor_id, appointment_id, title, summary, data, visibility, created_by) VALUES
(
    'm0000003-0000-0000-0000-000000000003',
    'p0000003-0000-0000-0000-000000000003',
    'd0000003-0000-0000-0000-000000000003',
    NULL,
    'Apto Médico Laboral 2025',
    'Empleado apto para continuar en su puesto de trabajo. Sin restricciones.',
    '{"examination_type": "occupational", "fitness": "apt", "restrictions": "none", "valid_until": "2026-09-20", "workplace_risks": ["computer_work", "sedentary"], "recommendations": ["ergonomic_breaks", "physical_activity"]}',
    'care_team',
    '55555555-5555-5555-5555-555555555555'
);

-- Registro privado del médico (no visible para paciente)
INSERT INTO public.medical_records (id, patient_id, doctor_id, appointment_id, title, summary, data, visibility, created_by) VALUES
(
    'm0000004-0000-0000-0000-000000000004',
    'p0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'Notas Médicas Privadas - Juan Pérez',
    'Notas confidenciales del médico para seguimiento interno.',
    '{"differential_diagnosis": ["hypertension_stage_1", "metabolic_syndrome"], "risk_factors": ["family_history", "sedentary_lifestyle"], "follow_up_plan": "monitor_bp_monthly", "internal_notes": "considerar derivación a nutricionista"}',
    'private',
    '33333333-3333-3333-3333-333333333333'
);

-- ============================================================================
-- VERIFICACIÓN DE DATOS
-- ============================================================================

-- Mostrar resumen de datos creados
DO $$
BEGIN
    RAISE NOTICE 'Seeds creados exitosamente:';
    RAISE NOTICE '- Profiles: %', (SELECT COUNT(*) FROM public.profiles);
    RAISE NOTICE '- Organizations: %', (SELECT COUNT(*) FROM public.organizations);
    RAISE NOTICE '- Doctors: %', (SELECT COUNT(*) FROM public.doctors);
    RAISE NOTICE '- Patients: %', (SELECT COUNT(*) FROM public.patients);
    RAISE NOTICE '- Organization Members: %', (SELECT COUNT(*) FROM public.org_members);
    RAISE NOTICE '- User Roles: %', (SELECT COUNT(*) FROM public.user_roles);
    RAISE NOTICE '- Patient Care Team: %', (SELECT COUNT(*) FROM public.patient_care_team);
    RAISE NOTICE '- Appointments: %', (SELECT COUNT(*) FROM public.appointments);
    RAISE NOTICE '- Medical Records: %', (SELECT COUNT(*) FROM public.medical_records);
END $$;
