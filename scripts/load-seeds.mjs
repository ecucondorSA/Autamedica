#!/usr/bin/env node

/**
 * Script para cargar seeds de datos de prueba en AltaMedica
 * Usa el service role key para bypass de RLS
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI5Mjc5MCwiZXhwIjoyMDcxODY4NzkwfQ.zETc5W1OzznzfspXwd4zxA-ifW-aCKd9PGRneEs2IOk';

console.log('🏥 AUTAMEDICA - Cargando Seeds de Datos');
console.log('=========================================\n');

// Crear cliente con service role para bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Datos de seed
const seedData = {
  profiles: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'admin@autamedica.com',
      role: 'platform_admin',
      first_name: 'Admin',
      last_name: 'Platform',
      phone: '+54 11 5555-0001',
      active: true
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'empresa@hospitalsanmartin.com',
      role: 'company_admin',
      first_name: 'Jorge',
      last_name: 'Empresa',
      phone: '+54 11 5555-0002',
      active: true
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'dr.garcia@autamedica.com',
      role: 'doctor',
      first_name: 'Carlos',
      last_name: 'García',
      phone: '+54 11 5555-0003',
      active: true
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'dra.martinez@autamedica.com',
      role: 'doctor',
      first_name: 'María',
      last_name: 'Martínez',
      phone: '+54 11 5555-0004',
      active: true
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      email: 'dr.lopez@autamedica.com',
      role: 'doctor',
      first_name: 'Roberto',
      last_name: 'López',
      phone: '+54 11 5555-0005',
      active: true
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      email: 'juan.perez@gmail.com',
      role: 'patient',
      first_name: 'Juan',
      last_name: 'Pérez',
      phone: '+54 11 5555-0006',
      active: true
    },
    {
      id: '77777777-7777-7777-7777-777777777777',
      email: 'maria.gonzalez@gmail.com',
      role: 'patient',
      first_name: 'María',
      last_name: 'González',
      phone: '+54 11 5555-0007',
      active: true
    },
    {
      id: '88888888-8888-8888-8888-888888888888',
      email: 'carlos.ruiz@empresa.com',
      role: 'patient',
      first_name: 'Carlos',
      last_name: 'Ruiz',
      phone: '+54 11 5555-0008',
      active: true
    },
    {
      id: '99999999-9999-9999-9999-999999999999',
      email: 'ana.lopez@empresa.com',
      role: 'patient',
      first_name: 'Ana',
      last_name: 'López',
      phone: '+54 11 5555-0009',
      active: true
    }
  ],
  
  companies: [
    {
      id: 'c0000001-0000-0000-0000-000000000001',
      name: 'Hospital San Martín',
      legal_name: 'Hospital San Martín S.A.',
      cuit: '30-68521478-9',
      industry: 'Healthcare',
      size: 'large',
      address: {
        street: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        province: 'Buenos Aires',
        postal_code: 'C1043',
        country: 'Argentina'
      },
      phone: '+54 11 4555-0100',
      email: 'info@hospitalsanmartin.com',
      website: 'https://www.hospitalsanmartin.com',
      owner_profile_id: '22222222-2222-2222-2222-222222222222',
      active: true
    },
    {
      id: 'c0000002-0000-0000-0000-000000000002',
      name: 'TechCorp SA',
      legal_name: 'Technology Corporation Argentina S.A.',
      cuit: '30-70125893-4',
      industry: 'Technology',
      size: 'medium',
      address: {
        street: 'Puerto Madero 456',
        city: 'Buenos Aires',
        province: 'Buenos Aires',
        postal_code: 'C1106',
        country: 'Argentina'
      },
      phone: '+54 11 4777-5000',
      email: 'rrhh@techcorp.com.ar',
      website: 'https://www.techcorp.com.ar',
      owner_profile_id: '22222222-2222-2222-2222-222222222222',
      active: true
    }
  ],
  
  doctors: [
    {
      id: 'd0000001-0000-0000-0000-000000000001',
      user_id: '33333333-3333-3333-3333-333333333333',
      license_number: 'MN-123456',
      specialty: 'Cardiología',
      subspecialty: 'Arritmias',
      years_experience: 15,
      education: {
        degree: 'Médico',
        university: 'Universidad de Buenos Aires',
        graduation_year: 2008
      },
      certifications: [
        { name: 'Board Certified in Cardiology', year: 2012 },
        { name: 'Advanced Cardiac Life Support', year: 2020 }
      ],
      schedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '14:00' }
      },
      consultation_fee: 15000.00,
      accepted_insurance: ['OSDE', 'Swiss Medical', 'Galeno'],
      bio: 'Especialista en cardiología con 15 años de experiencia.',
      languages: ['Spanish', 'English'],
      active: true
    },
    {
      id: 'd0000002-0000-0000-0000-000000000002',
      user_id: '44444444-4444-4444-4444-444444444444',
      license_number: 'MN-234567',
      specialty: 'Pediatría',
      subspecialty: 'Neonatología',
      years_experience: 12,
      education: {
        degree: 'Médico',
        university: 'Universidad Nacional de Córdoba',
        graduation_year: 2011
      },
      certifications: [
        { name: 'Board Certified in Pediatrics', year: 2015 }
      ],
      schedule: {
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '16:00' },
        friday: { start: '08:00', end: '13:00' }
      },
      consultation_fee: 12000.00,
      accepted_insurance: ['OSDE', 'Medicus', 'IOMA'],
      bio: 'Pediatra especializada en cuidados neonatales.',
      languages: ['Spanish', 'Portuguese'],
      active: true
    },
    {
      id: 'd0000003-0000-0000-0000-000000000003',
      user_id: '55555555-5555-5555-5555-555555555555',
      license_number: 'MN-345678',
      specialty: 'Medicina Laboral',
      subspecialty: null,
      years_experience: 10,
      education: {
        degree: 'Médico',
        university: 'Universidad Nacional de La Plata',
        graduation_year: 2013
      },
      certifications: [
        { name: 'Especialista en Medicina del Trabajo', year: 2017 }
      ],
      schedule: {
        monday: { start: '07:00', end: '15:00' },
        tuesday: { start: '07:00', end: '15:00' },
        wednesday: { start: '07:00', end: '15:00' },
        thursday: { start: '07:00', end: '15:00' },
        friday: { start: '07:00', end: '12:00' }
      },
      consultation_fee: 10000.00,
      accepted_insurance: ['ART', 'Swiss Medical', 'Prevención Salud'],
      bio: 'Médico laboral con experiencia en empresas multinacionales.',
      languages: ['Spanish'],
      active: true
    }
  ],
  
  patients: [
    {
      id: 'p0000001-0000-0000-0000-000000000001',
      user_id: '66666666-6666-6666-6666-666666666666',
      dni: '35123456',
      birth_date: '1985-03-15',
      gender: 'male',
      blood_type: 'O+',
      height_cm: 175,
      weight_kg: 78.5,
      emergency_contact: {
        name: 'María Pérez',
        relationship: 'Esposa',
        phone: '+54 11 5555-1001'
      },
      medical_history: [
        'Hipertensión arterial (2020)',
        'Cirugía de vesícula (2019)'
      ],
      allergies: ['Penicilina'],
      medications: ['Losartán 50mg'],
      insurance_info: {
        provider: 'OSDE',
        plan: '310',
        member_id: 'OSE-123456789'
      },
      company_id: null,
      active: true
    },
    {
      id: 'p0000002-0000-0000-0000-000000000002',
      user_id: '77777777-7777-7777-7777-777777777777',
      dni: '38654321',
      birth_date: '1992-07-22',
      gender: 'female',
      blood_type: 'A+',
      height_cm: 165,
      weight_kg: 62.0,
      emergency_contact: {
        name: 'Pedro González',
        relationship: 'Esposo',
        phone: '+54 11 5555-1002'
      },
      medical_history: ['Asma bronquial'],
      allergies: [],
      medications: ['Salbutamol inhalador'],
      insurance_info: {
        provider: 'Swiss Medical',
        plan: 'SMG30',
        member_id: 'SM-987654321'
      },
      company_id: null,
      active: true
    },
    {
      id: 'p0000003-0000-0000-0000-000000000003',
      user_id: '88888888-8888-8888-8888-888888888888',
      dni: '32789456',
      birth_date: '1988-11-10',
      gender: 'male',
      blood_type: 'B+',
      height_cm: 180,
      weight_kg: 85.0,
      emergency_contact: {
        name: 'Laura Ruiz',
        relationship: 'Esposa',
        phone: '+54 11 5555-1003'
      },
      medical_history: ['Diabetes tipo 2 (2021)'],
      allergies: [],
      medications: ['Metformina 500mg'],
      insurance_info: {
        provider: 'OSDE',
        plan: '210',
        member_id: 'OSE-456789123'
      },
      company_id: 'c0000002-0000-0000-0000-000000000002',
      active: true
    },
    {
      id: 'p0000004-0000-0000-0000-000000000004',
      user_id: '99999999-9999-9999-9999-999999999999',
      dni: '40123789',
      birth_date: '1995-02-28',
      gender: 'female',
      blood_type: 'AB+',
      height_cm: 170,
      weight_kg: 68.0,
      emergency_contact: {
        name: 'Juan López',
        relationship: 'Hermano',
        phone: '+54 11 5555-1004'
      },
      medical_history: [],
      allergies: ['Polen', 'Ácaros'],
      medications: [],
      insurance_info: {
        provider: 'Galeno',
        plan: 'Azul',
        member_id: 'GAL-789456123'
      },
      company_id: 'c0000002-0000-0000-0000-000000000002',
      active: true
    }
  ]
};

// Función para limpiar datos existentes
async function cleanExistingData() {
  console.log('🧹 Limpiando datos existentes...\n');
  
  const tables = ['appointments', 'medical_records', 'patients', 'doctors', 'companies', 'profiles'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.log(`⚠️  Error limpiando ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabla ${table} limpiada`);
      }
    } catch (err) {
      console.log(`⚠️  Error en tabla ${table}: ${err.message}`);
    }
  }
  
  console.log('');
}

// Función para cargar seeds
async function loadSeeds() {
  console.log('📦 Cargando datos de prueba...\n');
  
  // Cargar profiles
  console.log('👥 Cargando profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .upsert(seedData.profiles, { onConflict: 'id' })
    .select();
  
  if (profilesError) {
    console.log(`❌ Error cargando profiles: ${profilesError.message}`);
  } else {
    console.log(`✅ ${profiles.length} profiles cargados`);
  }
  
  // Cargar companies
  console.log('🏢 Cargando companies...');
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .upsert(seedData.companies, { onConflict: 'id' })
    .select();
  
  if (companiesError) {
    console.log(`❌ Error cargando companies: ${companiesError.message}`);
  } else {
    console.log(`✅ ${companies.length} companies cargadas`);
  }
  
  // Cargar doctors
  console.log('👨‍⚕️ Cargando doctors...');
  const { data: doctors, error: doctorsError } = await supabase
    .from('doctors')
    .upsert(seedData.doctors, { onConflict: 'id' })
    .select();
  
  if (doctorsError) {
    console.log(`❌ Error cargando doctors: ${doctorsError.message}`);
  } else {
    console.log(`✅ ${doctors.length} doctors cargados`);
  }
  
  // Cargar patients
  console.log('👤 Cargando patients...');
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .upsert(seedData.patients, { onConflict: 'id' })
    .select();
  
  if (patientsError) {
    console.log(`❌ Error cargando patients: ${patientsError.message}`);
  } else {
    console.log(`✅ ${patients.length} patients cargados`);
  }
  
  console.log('\n📊 Seeds cargados exitosamente!');
}

// Verificar datos cargados
async function verifyLoadedData() {
  console.log('\n🔍 Verificando datos cargados...\n');
  
  const tables = [
    { name: 'profiles', expected: 9 },
    { name: 'companies', expected: 2 },
    { name: 'doctors', expected: 3 },
    { name: 'patients', expected: 4 }
  ];
  
  let allCorrect = true;
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Error verificando ${table.name}: ${error.message}`);
      allCorrect = false;
    } else if (count === table.expected) {
      console.log(`✅ ${table.name}: ${count} registros (esperados: ${table.expected})`);
    } else {
      console.log(`⚠️  ${table.name}: ${count} registros (esperados: ${table.expected})`);
      allCorrect = false;
    }
  }
  
  return allCorrect;
}

// Función principal
async function main() {
  console.log('🚀 Iniciando carga de seeds para AltaMedica\n');
  
  // Limpiar datos existentes
  await cleanExistingData();
  
  // Cargar nuevos seeds
  await loadSeeds();
  
  // Verificar datos
  const allLoaded = await verifyLoadedData();
  
  if (allLoaded) {
    console.log('\n🎉 TODOS LOS SEEDS CARGADOS CORRECTAMENTE!');
    console.log('Ahora puedes ejecutar los tests RLS y de flujos médicos.');
  } else {
    console.log('\n⚠️  Algunos datos no se cargaron correctamente.');
    console.log('Verifica los errores arriba.');
  }
}

// Ejecutar
await main().catch(console.error);