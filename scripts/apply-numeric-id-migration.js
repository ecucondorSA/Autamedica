#!/usr/bin/env node

/**
 * Script to apply numeric ID migration to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  logger.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  logger.info('ℹ️  Using anon key for limited operations...');
}

// Create Supabase admin client
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY || 'REPLACE_WITH_ROTATED_KEY.7UFMVZsWTWOAynnhzkG76I_lhVCYtd_RmTt9EH3wJD4',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testNumericIdSystem() {
  logger.info('🔧 Testing Numeric ID System...\n');

  try {
    // 1. Check if numeric_id column exists
    logger.info('1️⃣ Checking if numeric_id column exists in profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, numeric_id, role, email')
      .limit(5);

    if (profileError) {
      if (profileError.message.includes('column "numeric_id" does not exist')) {
        logger.info('⚠️  numeric_id column not found. Migration needs to be applied.');
        logger.info('\n📝 To apply the migration:');
        logger.info('1. Go to Supabase Dashboard > SQL Editor');
        logger.info('2. Copy the contents of: supabase/migrations/20250929_user_numeric_id.sql');
        logger.info('3. Run the SQL query');
        return;
      }
      throw profileError;
    }

    logger.info('✅ numeric_id column exists!');
    logger.info(`📊 Sample profiles with numeric IDs:`);
    profiles?.forEach(p => {
      logger.info(`   - User ${p.id.slice(0, 8)}... | Email: ${p.email} | Numeric ID: ${p.numeric_id || 'NULL'} | Role: ${p.role}`);
    });

    // 2. Check if any profiles are missing numeric IDs
    const { count: missingCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .is('numeric_id', null);

    if (missingCount && missingCount > 0) {
      logger.info(`\n⚠️  Found ${missingCount} profiles without numeric IDs`);
      logger.info('These will be assigned IDs when the trigger runs on next update.');
    } else {
      logger.info('\n✅ All profiles have numeric IDs!');
    }

    // 3. Test the view
    logger.info('\n2️⃣ Testing user_identifiers view...');
    const { data: identifiers, error: viewError } = await supabase
      .from('user_identifiers')
      .select('*')
      .limit(3);

    if (viewError) {
      if (viewError.message.includes('does not exist')) {
        logger.info('⚠️  user_identifiers view not found. Migration needs to be applied.');
        return;
      }
      throw viewError;
    }

    logger.info('✅ user_identifiers view is working!');
    identifiers?.forEach(id => {
      logger.info(`   - ${id.display_id} | Email: ${id.email} | Role: ${id.role}`);
    });

    // 4. Test format_user_id function
    logger.info('\n3️⃣ Testing format_user_id function...');
    const { data: formatted, error: funcError } = await supabase.rpc('format_user_id', {
      p_numeric_id: 10000001,
      p_role: 'patient'
    });

    if (funcError) {
      if (funcError.message.includes('does not exist')) {
        logger.info('⚠️  format_user_id function not found. Migration needs to be applied.');
        return;
      }
      // Function might not exist, that's ok
      logger.info('ℹ️  format_user_id function not available (optional)');
    } else {
      logger.info(`✅ format_user_id function works! Sample: ${formatted}`);
    }

    logger.info('\n🎉 Numeric ID system is operational!');
    logger.info('\n📋 Summary:');
    logger.info('- numeric_id column: ✅');
    logger.info('- user_identifiers view: ✅');
    logger.info(`- Profiles with numeric IDs: ${profiles?.filter(p => p.numeric_id).length || 0}/${profiles?.length || 0}`);

    // 5. Show TypeScript usage example
    logger.info('\n💻 TypeScript Usage Example:');
    logger.info(`
import { createUserNumericId, formatUserNumericId } from '@autamedica/types';
import { logger } from '@autamedica/shared';

// Create a branded numeric ID
const numericId = createUserNumericId(10000001);

// Format it for display
const displayId = formatUserNumericId(numericId, 'patient');
logger.info(displayId); // "PT-10000001-1"
`);

  } catch (error) {
    logger.error('❌ Error testing numeric ID system:', error.message);
  }
}

// Run the test
testNumericIdSystem().catch(console.error);