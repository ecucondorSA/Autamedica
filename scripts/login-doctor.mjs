#!/usr/bin/env node
/**
 * Script para hacer login con el usuario médico y obtener la sesión
 * Uso: node scripts/login-doctor.mjs
 */

import { createClient } from '@supabase/supabase-js';

const DOCTOR_USER = {
  email: 'doctor.test@autamedica.com',
  password: 'DoctorTest2025!',
};

async function loginDoctor() {
  console.log('🔐 Iniciando sesión como doctor...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ewpsepaieakqbywxnidu.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Realizar login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DOCTOR_USER.email,
      password: DOCTOR_USER.password,
    });

    if (error) {
      throw error;
    }

    console.log('✅ Login exitoso!\n');
    console.log('👤 Usuario:');
    console.log('   ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('   Rol:', data.user.user_metadata?.role || 'No especificado');
    console.log('   Nombre:', data.user.user_metadata?.name || 'No especificado');

    console.log('\n🔑 Sesión:');
    console.log('   Access Token:', data.session.access_token.substring(0, 50) + '...');
    console.log('   Refresh Token:', data.session.refresh_token.substring(0, 50) + '...');
    console.log('   Expires at:', new Date(data.session.expires_at * 1000).toLocaleString());

    console.log('\n📝 Para usar esta sesión en el navegador:');
    console.log('   1. Abre DevTools (F12) en http://localhost:3001');
    console.log('   2. Ve a la pestaña "Application" -> "Local Storage"');
    console.log('   3. Busca la key que contiene "supabase.auth.token"');
    console.log('   4. O simplemente navega a la app y usa el formulario de login\n');

    // Verificar información del doctor en la base de datos
    console.log('🔍 Verificando información del doctor en la base de datos...\n');

    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (doctorError) {
      console.warn('⚠️  No se encontró perfil de doctor en la tabla doctors:', doctorError.message);
      console.log('   Esto es normal si la tabla no tiene la estructura correcta aún.');
    } else {
      console.log('✅ Perfil de doctor encontrado:');
      console.log('   Nombre:', doctorData.name);
      console.log('   Especialidad:', doctorData.specialty);
      console.log('   Licencia:', doctorData.license_number);
    }

    console.log('\n🌐 Acceso directo:');
    console.log('   Portal Doctors: http://localhost:3001');
    console.log('   Login Auth: http://localhost:3000/auth/login?role=doctor\n');

  } catch (error) {
    console.error('❌ Error al hacer login:', error.message);
    process.exit(1);
  }
}

// Ejecutar script
loginDoctor();
