#!/usr/bin/env node

/**
 * Script to execute SQL migration via Supabase Management API
 */

const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20250929_user_numeric_id.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

logger.info('📋 Migration to Apply: Numeric ID System');
logger.info('================================================\n');
logger.info('This migration will:');
logger.info('1. Create a sequence for numeric IDs (starting at 10000001)');
logger.info('2. Add numeric_id column to profiles table');
logger.info('3. Create triggers for automatic ID generation');
logger.info('4. Create user_identifiers view');
logger.info('5. Create formatting functions for display IDs\n');

logger.info('⚠️  IMPORTANT: To apply this migration:\n');
logger.info('Option 1: Supabase Dashboard (Recommended)');
logger.info('----------------------------------------');
logger.info('1. Go to: https://app.supabase.com/project/gtyvdircfhmdjiaelqkg/editor');
logger.info('2. Click on "SQL Editor"');
logger.info('3. Copy the migration from:');
logger.info(`   ${migrationPath}`);
logger.info('4. Paste and click "Run"\n');

logger.info('Option 2: Direct Database Connection');
logger.info('----------------------------------------');
logger.info('If you have the correct database password:');
logger.info('psql "postgresql://postgres.gtyvdircfhmdjiaelqkg:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \\');
logger.info(`  -f ${migrationPath}\n`);

logger.info('Option 3: Using Supabase Service Role Key');
logger.info('----------------------------------------');
logger.info('If you have the service role key, you can use the Supabase Admin API');
logger.info('to execute the SQL directly.\n');

logger.info('📝 Migration SQL Preview (first 50 lines):');
logger.info('----------------------------------------');
const lines = migrationSQL.split('\n').slice(0, 50);
lines.forEach((line, i) => {
  logger.info(`${(i + 1).toString().padStart(3, ' ')} | ${line}`);
});
logger.info('... (migration continues)\n');

logger.info('✅ Migration file is ready at:');
logger.info(`   ${migrationPath}\n`);

logger.info('After applying the migration, you can verify it worked by:');
logger.info('1. Checking if numeric_id column exists in profiles');
logger.info('2. Testing the user_identifiers view');
logger.info('3. Running: node scripts/apply-numeric-id-migration.js');