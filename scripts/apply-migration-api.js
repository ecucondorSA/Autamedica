#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseKey = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test simple table creation first
async function testSimpleTable() {
  try {
    logger.info('Testing basic table operations...')

    // Try to create a simple test table first
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS test_calls (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    // Try using RPC with a simple SQL command
    const { data, error } = await supabase
      .from('test_calls')
      .select('count')
      .limit(1)

    if (error && error.code === '42P01') {
      logger.info('Table does not exist, which is expected')
      return false
    } else if (error) {
      logger.info('Different error:', error)
      return false
    } else {
      logger.info('Test table already exists')
      return true
    }

  } catch (err) {
    logger.info('Error in test:', err.message)
    return false
  }
}

// Create a minimal migration
async function createMinimalMigration() {
  try {
    logger.info('Creating minimal calls table via API...')

    // First, let's check what we can access
    const { data: userData, error: userError } = await supabase.auth.getUser()
    logger.info('Auth status:', userError ? 'Not authenticated' : 'Authenticated')

    // Let's try to check existing tables
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    logger.info('Tables query result:', { tablesData, tablesError })

    return true

  } catch (err) {
    logger.info('Error in migration:', err.message)
    return false
  }
}

async function main() {
  logger.info('Starting migration process...')

  await testSimpleTable()
  await createMinimalMigration()

  logger.info('Migration process completed.')
  logger.info('\n📋 Manual migration required:')
  logger.info('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new')
  logger.info('2. Copy and paste the content from: scripts/complete-migration.sql')
  logger.info('3. Execute the SQL script')
  logger.info('4. Verify with the verification queries at the end')
}

main().catch(console.error)