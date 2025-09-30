#!/usr/bin/env node

/**
 * Script para crear las tablas de AltaMedica usando la API de Supabase
 * Este script usa el service role key para operaciones administrativas
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_SERVICE_KEY = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA';

console.log('🏥 AUTAMEDICA - Creación de Tablas vía API');
console.log('===========================================\n');

// Crear cliente con service role key para operaciones administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  console.log(`⚙️  ${description}...`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });
    
    if (error) {
      console.error(`❌ Error: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${description} - completado`);
    return true;
  } catch (err) {
    console.error(`❌ Error ejecutando SQL: ${err.message}`);
    return false;
  }
}

async function createTables() {
  console.log('🔧 Iniciando creación de tablas...\n');

  // SQL simplificado para crear tablas básicas
  const createProfilesSQL = `
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      avatar_url TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createCompaniesSQL = `
    CREATE TABLE IF NOT EXISTS public.companies (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      legal_name TEXT,
      cuit TEXT UNIQUE,
      industry TEXT,
      size TEXT,
      address JSONB,
      phone TEXT,
      email TEXT,
      website TEXT,
      owner_profile_id UUID REFERENCES public.profiles(id),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createDoctorsSQL = `
    CREATE TABLE IF NOT EXISTS public.doctors (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) UNIQUE,
      license_number TEXT UNIQUE NOT NULL,
      specialty TEXT NOT NULL,
      subspecialty TEXT,
      years_experience INTEGER DEFAULT 0,
      education JSONB,
      certifications JSONB,
      schedule JSONB,
      consultation_fee DECIMAL(10,2),
      accepted_insurance JSONB,
      bio TEXT,
      languages JSONB DEFAULT '["Spanish"]',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createPatientsSQL = `
    CREATE TABLE IF NOT EXISTS public.patients (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) UNIQUE,
      dni TEXT UNIQUE,
      birth_date DATE,
      gender TEXT,
      blood_type TEXT,
      height_cm INTEGER,
      weight_kg DECIMAL(5,2),
      emergency_contact JSONB,
      medical_history JSONB DEFAULT '[]',
      allergies JSONB DEFAULT '[]',
      medications JSONB DEFAULT '[]',
      insurance_info JSONB,
      company_id UUID REFERENCES public.companies(id),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createAppointmentsSQL = `
    CREATE TABLE IF NOT EXISTS public.appointments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      patient_id UUID REFERENCES public.patients(id),
      doctor_id UUID REFERENCES public.doctors(id),
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE,
      duration_minutes INTEGER DEFAULT 30,
      type TEXT DEFAULT 'consultation',
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      location TEXT,
      meeting_url TEXT,
      created_by UUID REFERENCES public.profiles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const createMedicalRecordsSQL = `
    CREATE TABLE IF NOT EXISTS public.medical_records (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      patient_id UUID REFERENCES public.patients(id),
      doctor_id UUID REFERENCES public.doctors(id),
      appointment_id UUID REFERENCES public.appointments(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content JSONB NOT NULL,
      attachments JSONB DEFAULT '[]',
      visibility TEXT DEFAULT 'care_team',
      date_recorded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // Ejecutar creación de tablas
  const results = [];
  
  results.push(await executeSQL(createProfilesSQL, 'Crear tabla profiles'));
  results.push(await executeSQL(createCompaniesSQL, 'Crear tabla companies'));
  results.push(await executeSQL(createDoctorsSQL, 'Crear tabla doctors'));
  results.push(await executeSQL(createPatientsSQL, 'Crear tabla patients'));
  results.push(await executeSQL(createAppointmentsSQL, 'Crear tabla appointments'));
  results.push(await executeSQL(createMedicalRecordsSQL, 'Crear tabla medical_records'));

  // Resumen
  const success = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log('\n📊 RESUMEN DE CREACIÓN');
  console.log('======================');
  console.log(`✅ Tablas creadas exitosamente: ${success}`);
  console.log(`❌ Tablas con errores: ${failed}`);

  if (success === results.length) {
    console.log('\n🎉 TODAS LAS TABLAS CREADAS EXITOSAMENTE');
    return true;
  } else {
    console.log('\n⚠️  Algunas tablas no se pudieron crear. Revisar errores arriba.');
    return false;
  }
}

// Función alternativa: verificar si las tablas ya existen
async function verifyTables() {
  console.log('\n🔍 Verificando tablas existentes...\n');

  const tables = ['profiles', 'companies', 'doctors', 'patients', 'appointments', 'medical_records'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('not found')) {
        console.log(`❌ Tabla '${table}' NO existe`);
      } else if (error) {
        console.log(`⚠️  Tabla '${table}' - Error: ${error.message}`);
      } else {
        console.log(`✅ Tabla '${table}' existe`);
      }
    } catch (err) {
      console.log(`❌ Error verificando tabla '${table}': ${err.message}`);
    }
  }
}

// Ejecutar
async function main() {
  // Primero verificar qué tablas existen
  await verifyTables();
  
  console.log('\n' + '='.repeat(50));
  console.log('¿Deseas crear las tablas que faltan?');
  console.log('Nota: Este script intentará usar la API de Supabase.');
  console.log('Si falla, deberás usar el Dashboard de Supabase.\n');
  
  // Por ahora, intentar crear directamente
  // await createTables();
  
  console.log('\n📝 ALTERNATIVA RECOMENDADA:');
  console.log('===========================');
  console.log('1. Ve a https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg');
  console.log('2. Navega a SQL Editor');
  console.log('3. Copia y pega el contenido de:');
  console.log('   supabase/migrations/20250920000001_create_medical_tables.sql');
  console.log('4. Ejecuta el SQL');
  console.log('5. Luego ejecuta los seeds desde:');
  console.log('   supabase/seed_data.sql');
}

// Ejecutar el script
await main();