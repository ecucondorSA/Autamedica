#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTI3OTAsImV4cCI6MjA3MTg2ODc5MH0.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4';

console.log('🔍 Probando conexión con Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Check if we can connect
console.log('1. Verificando conexión...');
const { data: testData, error: testError } = await supabase.from('users').select('count').limit(1);

if (testError) {
  console.log('❌ Error de conexión:', testError.message);
  console.log('   Código:', testError.code);
  console.log('   Detalles:', testError.details);
} else {
  console.log('✅ Conexión exitosa');
}

// Test 2: Try to sign up a test user
console.log('\n2. Probando registro de usuario...');
const testEmail = `test-${Date.now()}@example.com`;
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: testEmail,
  password: 'TestPassword123!',
});

if (signUpError) {
  console.log('❌ Error en registro:', signUpError.message);
  console.log('   Código:', signUpError.code);
  console.log('   Status:', signUpError.status);

  if (signUpError.message.includes('not enabled') || signUpError.message.includes('disabled')) {
    console.log('\n⚠️  Los registros están deshabilitados en Supabase');
    console.log('   Solución: Ve al dashboard → Authentication → Settings');
    console.log('   Habilita: "Allow new users to sign up"');
  } else if (signUpError.status === 401) {
    console.log('\n⚠️  La anon key puede estar incorrecta o expirada');
    console.log('   Solución: Ve al dashboard → Settings → API');
    console.log('   Copia la nueva "anon public" key');
  }
} else {
  console.log('✅ Registro funcionando');
  console.log('   Usuario creado:', testEmail);
}

// Test 3: Check auth settings
console.log('\n3. Configuración de autenticación:');
console.log('   URL:', supabaseUrl);
console.log('   Key length:', supabaseAnonKey.length);

console.log('\n📝 Próximos pasos:');
console.log('1. Abre el dashboard: supabase dashboard');
console.log('2. Ve a Authentication → Settings');
console.log('3. Asegúrate que "Allow new users to sign up" está ON');
console.log('4. Para desarrollo local, desactiva "Enable email confirmations"');

process.exit(0);