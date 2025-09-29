#!/usr/bin/env node

/**
 * Script to execute SQL migration via Supabase Management API
 */

const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20250929_user_numeric_id.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Migration to Apply: Numeric ID System');
console.log('================================================\n');
console.log('This migration will:');
console.log('1. Create a sequence for numeric IDs (starting at 10000001)');
console.log('2. Add numeric_id column to profiles table');
console.log('3. Create triggers for automatic ID generation');
console.log('4. Create user_identifiers view');
console.log('5. Create formatting functions for display IDs\n');

console.log('⚠️  IMPORTANT: To apply this migration:\n');
console.log('Option 1: Supabase Dashboard (Recommended)');
console.log('----------------------------------------');
console.log('1. Go to: https://app.supabase.com/project/gtyvdircfhmdjiaelqkg/editor');
console.log('2. Click on "SQL Editor"');
console.log('3. Copy the migration from:');
console.log(`   ${migrationPath}`);
console.log('4. Paste and click "Run"\n');

console.log('Option 2: Direct Database Connection');
console.log('----------------------------------------');
console.log('If you have the correct database password:');
console.log('psql "postgresql://postgres.gtyvdircfhmdjiaelqkg:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \\');
console.log(`  -f ${migrationPath}\n`);

console.log('Option 3: Using Supabase Service Role Key');
console.log('----------------------------------------');
console.log('If you have the service role key, you can use the Supabase Admin API');
console.log('to execute the SQL directly.\n');

console.log('📝 Migration SQL Preview (first 50 lines):');
console.log('----------------------------------------');
const lines = migrationSQL.split('\n').slice(0, 50);
lines.forEach((line, i) => {
  console.log(`${(i + 1).toString().padStart(3, ' ')} | ${line}`);
});
console.log('... (migration continues)\n');

console.log('✅ Migration file is ready at:');
console.log(`   ${migrationPath}\n`);

console.log('After applying the migration, you can verify it worked by:');
console.log('1. Checking if numeric_id column exists in profiles');
console.log('2. Testing the user_identifiers view');
console.log('3. Running: node scripts/apply-numeric-id-migration.js');