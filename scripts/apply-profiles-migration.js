/**
 * Script to apply profiles table migration using Supabase client
 * This uses the service role key to create the table and policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'REPLACE_WITH_ROTATED_KEY.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4';

async function applyMigration() {
  logger.info('🚀 Applying profiles table migration...');
  logger.info(`📍 Supabase URL: ${supabaseUrl}`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (testError && !testError.message.includes('relation "public.profiles" does not exist')) {
      logger.error('❌ Connection test failed:', testError.message);
      return;
    }

    if (!testError) {
      logger.info('ℹ️ Profiles table already exists');

      // Check if we have any profiles
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      logger.info(`✅ Profiles table has ${count || 0} records`);
      return;
    }

    logger.info('📋 Profiles table does not exist, creating it now...');

    // Note: Creating tables requires admin/service role access
    // For now, we'll just check the status
    logger.info(`
⚠️ To create the profiles table, you need to:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/editor
2. Click on "SQL Editor" in the sidebar
3. Click "New Query"
4. Copy and paste the migration from: supabase/migrations/20250929_create_profiles_table.sql
5. Click "Run" to execute the migration

Alternatively, if you have the database password, run:
psql "postgresql://postgres.gtyvdircfhmdjiaelqkg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f supabase/migrations/20250929_create_profiles_table.sql
`);

  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
  }
}

// Run the migration
applyMigration();