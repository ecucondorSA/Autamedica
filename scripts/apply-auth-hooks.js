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
  logger.info('🔧 Aplicando Auth Lifecycle Hooks...');

  // Leer archivo de migración
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250930_auth_lifecycle_hooks.sql');

  if (!fs.existsSync(migrationPath)) {
    logger.error('❌ No se encontró el archivo de migración:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  if (DATABASE_URL) {
    // Opción 1: Usar psql directo
    logger.info('📊 Aplicando vía psql...');

    const { spawn } = require('child_process');
    const psql = spawn('psql', [DATABASE_URL, '-f', migrationPath], {
      stdio: 'inherit'
    });

    psql.on('close', (code) => {
      if (code === 0) {
        logger.info('✅ Migración aplicada exitosamente vía psql');
        testHooks();
      } else {
        logger.error('❌ Error aplicando migración:', code);
        process.exit(1);
      }
    });

  } else if (SUPABASE_SERVICE_KEY) {
    // Opción 2: Usar Supabase REST API
    logger.info('🌐 Aplicando vía Supabase REST API...');

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
        logger.info('✅ Migración aplicada exitosamente vía REST API');
        await testHooks();
      } else {
        const error = await response.text();
        logger.error('❌ Error aplicando migración:', error);
        process.exit(1);
      }
    } catch (error) {
      logger.error('❌ Excepción aplicando migración:', error);
      process.exit(1);
    }

  } else {
    logger.info('📋 Variables de entorno no encontradas.');
    logger.info('');
    logger.info('Para aplicar la migración, usa una de estas opciones:');
    logger.info('');
    logger.info('1️⃣ **Con psql directo:**');
    logger.info('   export SUPABASE_DB_URL="postgresql://postgres.PROJECT:PASSWORD@HOST:6543/postgres"');
    logger.info('   node scripts/apply-auth-hooks.js');
    logger.info('');
    logger.info('2️⃣ **Con Supabase CLI:**');
    logger.info('   supabase db push');
    logger.info('');
    logger.info('3️⃣ **Manualmente:**');
    logger.info('   Copia el contenido de supabase/migrations/20250930_auth_lifecycle_hooks.sql');
    logger.info('   y ejecútalo en el SQL Editor de Supabase Dashboard');
    logger.info('');
  }
}

async function testHooks() {
  logger.info('');
  logger.info('🧪 Testear hooks (opcional):');
  logger.info('');
  logger.info('1️⃣ **Test trigger de creación:**');
  logger.info('   - Crear usuario en Auth Hub');
  logger.info('   - Verificar que se crea automáticamente en profiles');
  logger.info('   - Verificar audit log entry');
  logger.info('');
  logger.info('2️⃣ **Test RPC set_portal_and_role:**');
  logger.info('   ```sql');
  logger.info('   SELECT set_portal_and_role(\'doctors\', \'doctor\');');
  logger.info('   SELECT * FROM profiles WHERE id = auth.uid();');
  logger.info('   ```');
  logger.info('');
  logger.info('3️⃣ **Test audit log:**');
  logger.info('   ```sql');
  logger.info('   SELECT * FROM get_user_audit_log();');
  logger.info('   ```');
  logger.info('');
  logger.info('✅ Auth Lifecycle Hooks listos para producción!');
}

// Ejecutar script
if (require.main === module) {
  applyMigration().catch(console.error);
}

module.exports = { applyMigration, testHooks };