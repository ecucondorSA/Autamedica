#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseKey = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCallFlow() {
  logger.info('🧪 Testing Call Flow...')
  logger.info('Supabase URL:', supabaseUrl)
  logger.info('')

  try {
    // Test 1: Check if create_call function exists
    logger.info('1. Testing create_call function...')
    const { data, error } = await supabase
      .rpc('create_call', {
        p_doctor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        p_patient_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
      })

    if (error) {
      logger.info('❌ create_call function error:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })

      if (error.code === '42883' || error.message.includes('function create_call')) {
        logger.info('')
        logger.info('🚨 DIAGNOSIS: create_call function does not exist')
        logger.info('💡 SOLUTION: Apply the migration from apply-migration-direct.sql')
        logger.info('')
        return false
      }
    } else {
      logger.info('✅ create_call function works!')
      logger.info('Result:', data)
    }

    // Test 2: Check calls table
    logger.info('')
    logger.info('2. Testing calls table access...')
    const { data: callsData, error: callsError } = await supabase
      .from('calls')
      .select('count')
      .limit(1)

    if (callsError) {
      logger.info('❌ calls table error:', {
        message: callsError.message,
        code: callsError.code
      })

      if (callsError.code === '42P01') {
        logger.info('')
        logger.info('🚨 DIAGNOSIS: calls table does not exist')
        logger.info('💡 SOLUTION: Apply the migration from apply-migration-direct.sql')
        logger.info('')
        return false
      }
    } else {
      logger.info('✅ calls table accessible!')
    }

    // Test 3: Check update_call_status function
    if (data && data.length > 0) {
      logger.info('')
      logger.info('3. Testing update_call_status function...')
      const callId = data[0].id

      const { data: updateData, error: updateError } = await supabase
        .rpc('update_call_status', {
          p_call_id: callId,
          p_status: 'ringing'
        })

      if (updateError) {
        logger.info('❌ update_call_status error:', updateError.message)
      } else {
        logger.info('✅ update_call_status works!')
      }
    }

    return true

  } catch (err) {
    logger.info('❌ Unexpected error:', err.message)
    return false
  }
}

async function main() {
  const success = await testCallFlow()

  if (success) {
    logger.info('')
    logger.info('🎉 All tests passed! Call flow should work.')
  } else {
    logger.info('')
    logger.info('⚠️  Migration needed. Apply apply-migration-direct.sql in Supabase Dashboard.')
    logger.info('URL: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new')
  }
}

main().catch(console.error)