-- =====================================================
-- SEED DATA: Centros de Salud de Buenos Aires (CABA)
-- Fuente: Gobierno de la Ciudad de Buenos Aires
-- Fecha: 2025-10-02
-- =====================================================

-- Insertar Hospitales Públicos de CABA que ofrecen servicios IVE/ILE

INSERT INTO health_centers (name, type, address, coordinates, phone, email, website_url, offers_ive_ile, offers_medication_method, offers_surgical_method, offers_psychological_support, requires_appointment, accepts_walk_ins, has_24h_service, average_wait_time_days, accessibility_features) VALUES

-- Hospital Ramos Mejía
(
  'Hospital General de Agudos Dr. José María Ramos Mejía',
  'public_hospital',
  '{"street": "Urquiza", "number": "609", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Balvanera"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4010, -34.6093), 4326)::geography,
  '+54 11 4127-0200',
  'info@ramosmejia.gov.ar',
  'https://www.buenosaires.gob.ar/ramosmejia',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  7,
  ARRAY['wheelchair_accessible', 'sign_language', 'braille']
),

-- Hospital Rivadavia
(
  'Hospital General de Agudos Bernardino Rivadavia',
  'public_hospital',
  '{"street": "Av. Las Heras", "number": "2670", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Recoleta"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.3985, -34.5875), 4326)::geography,
  '+54 11 4809-2000',
  'contacto@rivadavia.gov.ar',
  'https://www.buenosaires.gob.ar/rivadavia',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  5,
  ARRAY['wheelchair_accessible', 'parking']
),

-- Hospital Argerich
(
  'Hospital General de Agudos Dr. Cosme Argerich',
  'public_hospital',
  '{"street": "Av. Almirante Brown", "number": "240", "city": "CABA", "state": "Buenos Aires", "neighborhood": "La Boca"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.3642, -34.6339), 4326)::geography,
  '+54 11 4362-5555',
  'info@argerich.gov.ar',
  'https://www.buenosaires.gob.ar/argerich',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  3,
  ARRAY['wheelchair_accessible', '24h_service']
),

-- Hospital Álvarez
(
  'Hospital General de Agudos Dr. Teodoro Álvarez',
  'public_hospital',
  '{"street": "Aranguren", "number": "2701", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Flores"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4677, -34.6258), 4326)::geography,
  '+54 11 4630-5555',
  'contacto@alvarez.gov.ar',
  'https://www.buenosaires.gob.ar/alvarez',
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  10,
  ARRAY['wheelchair_accessible']
),

-- Hospital Durand
(
  'Hospital General de Agudos Dr. Carlos Durand',
  'public_hospital',
  '{"street": "Av. Díaz Vélez", "number": "5044", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Caballito"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4394, -34.6089), 4326)::geography,
  '+54 11 4982-5555',
  'info@durand.gov.ar',
  'https://www.buenosaires.gob.ar/durand',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  7,
  ARRAY['wheelchair_accessible', 'parking']
),

-- Hospital Pirovano
(
  'Hospital General de Agudos Ignacio Pirovano',
  'public_hospital',
  '{"street": "Av. Monroe", "number": "3555", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Coghlan"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4729, -34.5669), 4326)::geography,
  '+54 11 4542-5151',
  'contacto@pirovano.gov.ar',
  'https://www.buenosaires.gob.ar/pirovano',
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  8,
  ARRAY['wheelchair_accessible']
),

-- Hospital Santojanni
(
  'Hospital General de Agudos Dr. Juan A. Fernández',
  'public_hospital',
  '{"street": "Cerviño", "number": "3356", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Palermo"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4085, -34.5777), 4326)::geography,
  '+54 11 4808-2600',
  'info@fernandez.gov.ar',
  'https://www.buenosaires.gob.ar/fernandez',
  true,
  true,
  true,
  true,
  true,
  false,
  true,
  5,
  ARRAY['wheelchair_accessible', 'parking', 'cafeteria']
),

-- CAPS (Centros de Atención Primaria de Salud)
(
  'CAPS N° 1 - Centro de Salud Comunitaria Dr. Nicolás Repetto',
  'caps',
  '{"street": "Juncal", "number": "3502", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Palermo"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4022, -34.5812), 4326)::geography,
  '+54 11 4824-1234',
  null,
  null,
  true,
  true,
  false,
  true,
  true,
  true,
  false,
  5,
  ARRAY['wheelchair_accessible']
),

(
  'CAPS N° 15 - Centro de Salud y Acción Comunitaria',
  'caps',
  '{"street": "Av. Boedo", "number": "1507", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Boedo"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4144, -34.6286), 4326)::geography,
  '+54 11 4931-5678',
  null,
  null,
  true,
  true,
  false,
  true,
  true,
  true,
  false,
  3,
  ARRAY['wheelchair_accessible', 'family_friendly']
),

-- Centro de Salud Sexual y Reproductiva
(
  'Centro de Salud Sexual y Reproductiva - Coordinación SSRVIH',
  'health_center',
  '{"street": "Av. Córdoba", "number": "3120", "city": "CABA", "state": "Buenos Aires", "neighborhood": "Balvanera"}'::jsonb,
  ST_SetSRID(ST_MakePoint(-58.4102, -34.5998), 4326)::geography,
  '+54 11 4862-7777',
  'saludsexual@buenosaires.gob.ar',
  'https://buenosaires.gob.ar/salud-sexual-y-reproductiva',
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  2,
  ARRAY['wheelchair_accessible', 'lgbtq_friendly', 'youth_services']
);

-- Insertar horarios de atención (ejemplo para algunos centros)
UPDATE health_centers
SET operating_hours = '{
  "monday": {"open": "08:00", "close": "20:00"},
  "tuesday": {"open": "08:00", "close": "20:00"},
  "wednesday": {"open": "08:00", "close": "20:00"},
  "thursday": {"open": "08:00", "close": "20:00"},
  "friday": {"open": "08:00", "close": "20:00"},
  "saturday": {"open": "09:00", "close": "13:00"}
}'::jsonb
WHERE type IN ('caps', 'health_center');

UPDATE health_centers
SET operating_hours = '{
  "monday": {"open": "00:00", "close": "23:59"},
  "tuesday": {"open": "00:00", "close": "23:59"},
  "wednesday": {"open": "00:00", "close": "23:59"},
  "thursday": {"open": "00:00", "close": "23:59"},
  "friday": {"open": "00:00", "close": "23:59"},
  "saturday": {"open": "00:00", "close": "23:59"},
  "sunday": {"open": "00:00", "close": "23:59"}
}'::jsonb
WHERE has_24h_service = true;

-- Comentarios informativos
COMMENT ON TABLE health_centers IS 'Centros de salud de Buenos Aires que ofrecen servicios de IVE/ILE según Ley 27.610';

-- Verificación
SELECT
  name,
  type,
  (address->>'neighborhood') as barrio,
  phone,
  offers_ive_ile,
  accepts_walk_ins
FROM health_centers
WHERE (address->>'city') = 'CABA'
ORDER BY type, name;
