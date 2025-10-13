#!/usr/bin/env node
/**
 * Script para crear un usuario médico de prueba en Supabase
 * Uso: node scripts/create-doctor-user.mjs
 */

import { createClient } from '@supabase/supabase-js';

const DOCTOR_USER = {
  email: 'doctor.test@autamedica.com',
  password: 'DoctorTest2025!',
  name: 'Dr. Juan Pérez',
  specialty: 'Medicina General',
  license_number: 'MED-12345',
};

async function createDoctorUser() {
  console.log('🏥 Creando usuario médico de prueba...\n');

  // Credenciales de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ewpsepaieakqbywxnidu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_Xmou75UAl7DG0gfL5Omgew_m0fptr37';

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // 1. Crear usuario en Supabase Auth
    console.log('📝 Creando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: DOCTOR_USER.email,
      password: DOCTOR_USER.password,
      email_confirm: true,
      user_metadata: {
        role: 'doctor',
        name: DOCTOR_USER.name,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuario ya existe, obteniendo ID...');

        // Intentar login para obtener el user_id
        const pubClient = createClient(
          supabaseUrl,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk'
        );

        const { data: signInData, error: signInError } = await pubClient.auth.signInWithPassword({
          email: DOCTOR_USER.email,
          password: DOCTOR_USER.password,
        });

        if (signInError || !signInData.user) {
          throw new Error(`No se pudo obtener usuario existente: ${signInError?.message}`);
        }

        console.log('✅ Usuario encontrado:', signInData.user.id);
        await createDoctorProfile(admin, signInData.user.id);
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuario creado en Auth:', authData.user.id);
      await createDoctorProfile(admin, authData.user.id);
    }

    console.log('\n🎉 Usuario médico configurado exitosamente!\n');
    console.log('📋 Credenciales de acceso:');
    console.log('   Email:', DOCTOR_USER.email);
    console.log('   Password:', DOCTOR_USER.password);
    console.log('   Rol: doctor');
    console.log('\n🌐 Acceder en: http://localhost:3001');
    console.log('   O usar login en: http://localhost:3000/auth/login?role=doctor\n');

  } catch (error) {
    console.error('❌ Error al crear usuario médico:', error);
    process.exit(1);
  }
}

async function createDoctorProfile(admin, userId) {
  console.log('👨‍⚕️ Creando perfil de doctor en la base de datos...');

  try {
    // Verificar si ya existe el perfil
    const { data: existingDoctor } = await admin
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingDoctor) {
      console.log('⚠️  Perfil de doctor ya existe, actualizando...');

      const { error: updateError } = await admin
        .from('doctors')
        .update({
          name: DOCTOR_USER.name,
          specialty: DOCTOR_USER.specialty,
          license_number: DOCTOR_USER.license_number,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('⚠️  No se pudo actualizar perfil:', updateError.message);
      } else {
        console.log('✅ Perfil actualizado');
      }
    } else {
      // Crear nuevo perfil
      const { error: insertError } = await admin.from('doctors').insert({
        user_id: userId,
        name: DOCTOR_USER.name,
        specialty: DOCTOR_USER.specialty,
        license_number: DOCTOR_USER.license_number,
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.warn('⚠️  No se pudo crear perfil en tabla doctors:', insertError.message);
        console.log('   Esto es normal si la tabla no existe aún.');
      } else {
        console.log('✅ Perfil de doctor creado en la base de datos');
      }
    }
  } catch (error) {
    console.warn('⚠️  Error al gestionar perfil de doctor:', error.message);
    console.log('   El usuario de Auth fue creado correctamente.');
  }
}

// Ejecutar script
createDoctorUser();
