/**
 * Script para crear usuarios de prueba en Supabase
 * Crea usuarios con diferentes roles para testing
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_SERVICE_KEY = 'REPLACE_WITH_ROTATED_KEY.zETc5W1OzznzfspXwd4zxA-ifW-aCKd9PGRneEs2IOk';

// Crear cliente con service key para bypass de RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Usuarios de prueba
const testUsers = [
  {
    email: 'patient@test.com',
    password: 'Test123456!',
    role: 'patient',
    metadata: {
      first_name: 'Juan',
      last_name: 'Paciente',
      phone: '+54 11 1234-5678'
    }
  },
  {
    email: 'doctor@test.com',
    password: 'Test123456!',
    role: 'doctor',
    metadata: {
      first_name: 'Dr. Carlos',
      last_name: 'Médico',
      specialty: 'Cardiología',
      license_number: 'MP-12345'
    }
  },
  {
    email: 'company@test.com',
    password: 'Test123456!',
    role: 'company_admin',
    metadata: {
      first_name: 'María',
      last_name: 'Empresa',
      company_name: 'Tech Corp SA',
      position: 'HR Manager'
    }
  },
  {
    email: 'admin@test.com',
    password: 'Test123456!',
    role: 'platform_admin',
    metadata: {
      first_name: 'Sistema',
      last_name: 'Admin',
      is_super_admin: true
    }
  }
];

async function seedTestUsers() {
  console.log('🚀 Iniciando creación de usuarios de prueba...\n');
  
  for (const user of testUsers) {
    try {
      // Crear usuario con auth.admin (bypass de verificación de email)
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          ...user.metadata,
          role: user.role
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  Usuario ${user.email} ya existe (rol: ${user.role})`);
        } else {
          console.error(`❌ Error creando ${user.email}:`, error.message);
        }
      } else {
        console.log(`✅ Usuario creado: ${user.email} (rol: ${user.role})`);
        
        // Crear entrada en tabla profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: user.email,
            role: user.role,
            first_name: user.metadata.first_name,
            last_name: user.metadata.last_name,
            phone: user.metadata.phone || null,
            active: true
          });
          
        if (profileError) {
          console.error(`   ⚠️  Error creando perfil:`, profileError.message);
        } else {
          console.log(`   ✅ Perfil creado en tabla profiles`);
        }
      }
      
    } catch (err) {
      console.error(`❌ Error inesperado con ${user.email}:`, err.message);
    }
  }
  
  console.log('\n📝 Resumen de usuarios de prueba:');
  console.log('================================');
  testUsers.forEach(user => {
    console.log(`📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.role}`);
  });
  
  console.log('\n✨ Proceso completado!');
  console.log('Puedes usar estos usuarios para probar los flujos de autenticación.');
}

// Ejecutar
seedTestUsers().then(() => {
  console.log('\n👋 Script finalizado');
  process.exit(0);
}).catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});