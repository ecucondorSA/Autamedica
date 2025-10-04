#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseKey = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA'

async function applyMigrationStepByStep() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  logger.info('🚀 Aplicando migración paso a paso...')

  // Paso 1: Test de función create_call (para ver si ya existe)
  logger.info('1️⃣ Probando si create_call ya existe...')
  const { data: testExisting, error: testError } = await supabase
    .rpc('create_call', {
      p_doctor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      p_patient_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    })

  if (!testError) {
    logger.info('✅ create_call ya existe y funciona!')
    logger.info('   Resultado:', testExisting)
    return true
  }

  logger.info('   create_call no existe:', testError.message)

  // Paso 2: Crear tabla calls si no existe
  logger.info('2️⃣ Verificando tabla calls...')
  const { data: _callsCheck, error: callsError } = await supabase
    .from('calls')
    .select('count')
    .limit(1)

  if (callsError && callsError.code === '42P01') {
    logger.info('   Tabla calls no existe, necesitamos aplicar migración manual')
  } else if (!callsError) {
    logger.info('✅ Tabla calls ya existe')
  }

  // Paso 3: Test simple para ver permisos
  logger.info('3️⃣ Probando permisos básicos...')
  const { data: _basicTest, error: basicError } = await supabase
    .from('_realtime_schema_versions')
    .select('*')
    .limit(1)

  if (basicError) {
    logger.info('   Permisos limitados:', basicError.message)
  } else {
    logger.info('✅ Permisos básicos funcionan')
  }

  logger.info('')
  logger.info('🚨 DIAGNOSIS: La migración debe aplicarse manualmente')
  logger.info('💡 SOLUTION: Usar el SQL Editor de Supabase')
  logger.info('')
  logger.info('📋 PASOS MANUAL:')
  logger.info('1. Abrir: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql/new')
  logger.info('2. Copiar todo el contenido de: apply-migration-direct.sql')
  logger.info('3. Pegar en el editor y hacer click en "Run"')
  logger.info('4. Verificar que muestre: "Migración completada exitosamente!"')
  logger.info('')

  return false
}

async function main() {
  const success = await applyMigrationStepByStep()

  if (success) {
    logger.info('🎉 Sistema completamente funcional!')
  } else {
    logger.info('⚠️  Migración manual requerida - seguir pasos arriba.')
    process.exit(1)
  }
}

main().catch(console.error)