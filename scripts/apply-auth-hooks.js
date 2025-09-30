#!/usr/bin/env node

/**
 * Script para aplicar Auth Lifecycle Hooks en Supabase
 * Aplica la migración de triggers, RPC functions y políticas RLS
 */

const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.SUPABASE_DB_URL;

async function applyMigration() {
  console.log('🔧 Aplicando Auth Lifecycle Hooks...');

  // Leer archivo de migración
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250930_auth_lifecycle_hooks.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ No se encontró el archivo de migración:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  if (DATABASE_URL) {
    // Opción 1: Usar psql directo
    console.log('📊 Aplicando vía psql...');

    const { spawn } = require('child_process');
    const psql = spawn('psql', [DATABASE_URL, '-f', migrationPath], {
      stdio: 'inherit'
    });

    psql.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migración aplicada exitosamente vía psql');
        testHooks();
      } else {
        console.error('❌ Error aplicando migración:', code);
        process.exit(1);
      }
    });

  } else if (SUPABASE_SERVICE_KEY) {
    // Opción 2: Usar Supabase REST API
    console.log('🌐 Aplicando vía Supabase REST API...');

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY
        },
        body: JSON.stringify({ sql: migrationSQL })
      });

      if (response.ok) {
        console.log('✅ Migración aplicada exitosamente vía REST API');
        await testHooks();
      } else {
        const error = await response.text();
        console.error('❌ Error aplicando migración:', error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Excepción aplicando migración:', error);
      process.exit(1);
    }

  } else {
    console.log('📋 Variables de entorno no encontradas.');
    console.log('');
    console.log('Para aplicar la migración, usa una de estas opciones:');
    console.log('');
    console.log('1️⃣ **Con psql directo:**');
    console.log('   export SUPABASE_DB_URL="postgresql://postgres.PROJECT:PASSWORD@HOST:6543/postgres"');
    console.log('   node scripts/apply-auth-hooks.js');
    console.log('');
    console.log('2️⃣ **Con Supabase CLI:**');
    console.log('   supabase db push');
    console.log('');
    console.log('3️⃣ **Manualmente:**');
    console.log('   Copia el contenido de supabase/migrations/20250930_auth_lifecycle_hooks.sql');
    console.log('   y ejecútalo en el SQL Editor de Supabase Dashboard');
    console.log('');
  }
}

async function testHooks() {
  console.log('');
  console.log('🧪 Testear hooks (opcional):');
  console.log('');
  console.log('1️⃣ **Test trigger de creación:**');
  console.log('   - Crear usuario en Auth Hub');
  console.log('   - Verificar que se crea automáticamente en profiles');
  console.log('   - Verificar audit log entry');
  console.log('');
  console.log('2️⃣ **Test RPC set_portal_and_role:**');
  console.log('   ```sql');
  console.log('   SELECT set_portal_and_role(\'doctors\', \'doctor\');');
  console.log('   SELECT * FROM profiles WHERE id = auth.uid();');
  console.log('   ```');
  console.log('');
  console.log('3️⃣ **Test audit log:**');
  console.log('   ```sql');
  console.log('   SELECT * FROM get_user_audit_log();');
  console.log('   ```');
  console.log('');
  console.log('✅ Auth Lifecycle Hooks listos para producción!');
}

// Ejecutar script
if (require.main === module) {
  applyMigration().catch(console.error);
}

module.exports = { applyMigration, testHooks };