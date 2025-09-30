#!/usr/bin/env node

/**
 * Script para aplicar el schema directamente usando Supabase SDK
 * con el service role key para permisos administrativos
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://gtyvdircfhmdjiaelqkg.supabase.co';
const SUPABASE_SERVICE_KEY = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA';

console.log('🏥 AUTAMEDICA - Aplicando Schema Médico');
console.log('========================================\n');

// Crear cliente administrativo
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySchema() {
  console.log('📋 Leyendo archivo de migración...');
  
  // Leer el archivo SQL de migración
  const migrationPath = './supabase/migrations/20250920000001_create_medical_tables.sql';
  let sqlContent;
  
  try {
    sqlContent = fs.readFileSync(migrationPath, 'utf8');
    console.log(`✅ Archivo leído: ${sqlContent.length} caracteres\n`);
  } catch (err) {
    console.error(`❌ Error leyendo archivo: ${err.message}`);
    return false;
  }

  // Dividir el SQL en statements individuales
  // Remover comentarios y dividir por punto y coma
  const statements = sqlContent
    .split(/;(?=(?:[^']*'[^']*')*[^']*$)/) // Split por ; fuera de strings
    .map(stmt => stmt.trim())
    .filter(stmt => 
      stmt.length > 0 && 
      !stmt.startsWith('--') &&
      !stmt.match(/^\/\*.*\*\/$/)
    );

  console.log(`📊 Encontrados ${statements.length} statements SQL para ejecutar\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Ejecutar cada statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Extraer descripción del statement
    let description = 'Statement SQL';
    if (stmt.includes('CREATE TABLE')) {
      const match = stmt.match(/CREATE TABLE[IF NOT EXISTS\s]+(\S+)/i);
      if (match) description = `Crear tabla ${match[1]}`;
    } else if (stmt.includes('CREATE POLICY')) {
      const match = stmt.match(/CREATE POLICY\s+"([^"]+)"/i);
      if (match) description = `Crear política: ${match[1]}`;
    } else if (stmt.includes('CREATE INDEX')) {
      const match = stmt.match(/CREATE INDEX[IF NOT EXISTS\s]+(\S+)/i);
      if (match) description = `Crear índice ${match[1]}`;
    } else if (stmt.includes('ALTER TABLE')) {
      const match = stmt.match(/ALTER TABLE\s+(\S+)/i);
      if (match) description = `Modificar tabla ${match[1]}`;
    }

    process.stdout.write(`[${i+1}/${statements.length}] ${description}... `);

    try {
      // Usar fetch directo para ejecutar SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query: stmt })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log('✅');
      successCount++;
    } catch (err) {
      console.log(`❌ ${err.message.substring(0, 50)}...`);
      errors.push({ statement: description, error: err.message });
      errorCount++;
    }

    // Pequeña pausa entre statements para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE APLICACIÓN DE SCHEMA');
  console.log('='.repeat(50));
  console.log(`✅ Statements exitosos: ${successCount}`);
  console.log(`❌ Statements con error: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORES ENCONTRADOS:');
    errors.forEach(e => {
      console.log(`  - ${e.statement}: ${e.error.substring(0, 100)}`);
    });
  }

  if (successCount === statements.length) {
    console.log('\n🎉 SCHEMA APLICADO EXITOSAMENTE!');
    return true;
  } else {
    console.log('\n⚠️  Schema parcialmente aplicado. Algunos statements fallaron.');
    return false;
  }
}

// Verificar tablas después de aplicar
async function verifyTablesAfterApply() {
  console.log('\n🔍 Verificando tablas creadas...\n');

  const tables = [
    'profiles', 
    'companies', 
    'doctors', 
    'patients', 
    'appointments', 
    'medical_records'
  ];
  
  let existingTables = 0;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error && error.message.includes('not found')) {
        console.log(`❌ Tabla '${table}' NO existe`);
      } else if (error) {
        console.log(`⚠️  Tabla '${table}' - Error: ${error.message}`);
      } else {
        console.log(`✅ Tabla '${table}' existe`);
        existingTables++;
      }
    } catch (err) {
      console.log(`❌ Error verificando tabla '${table}': ${err.message}`);
    }
  }

  console.log(`\n📊 Total: ${existingTables}/${tables.length} tablas existen`);
  return existingTables === tables.length;
}

// Ejecutar todo
async function main() {
  console.log('🚀 Iniciando aplicación de schema médico AltaMedica\n');
  
  // Intentar aplicar schema
  const schemaApplied = await applySchema();
  
  if (!schemaApplied) {
    console.log('\n⚠️  NOTA: La función exec_sql puede no estar disponible.');
    console.log('Esto es normal si no está habilitada en el proyecto.\n');
    console.log('📝 ALTERNATIVA MANUAL REQUERIDA:');
    console.log('================================');
    console.log('1. Accede a: https://supabase.com/dashboard/project/gtyvdircfhmdjiaelqkg/sql');
    console.log('2. Copia todo el contenido de:');
    console.log('   /root/altamedica-reboot/supabase/migrations/20250920000001_create_medical_tables.sql');
    console.log('3. Pégalo en el SQL Editor');
    console.log('4. Haz clic en "Run"');
    console.log('5. Luego ejecuta los seeds de la misma manera con:');
    console.log('   /root/altamedica-reboot/supabase/seed_data.sql');
    console.log('\n⚡ Este es el método más confiable y recomendado.');
  }
  
  // Verificar tablas
  console.log('\n' + '='.repeat(50));
  const allTablesExist = await verifyTablesAfterApply();
  
  if (allTablesExist) {
    console.log('\n🎉 TODAS LAS TABLAS ESTÁN LISTAS!');
    console.log('Ahora puedes ejecutar los tests RLS y de flujos médicos.');
  } else {
    console.log('\n⚠️  Algunas tablas aún no existen.');
    console.log('Por favor, usa el método manual descrito arriba.');
  }
}

// Ejecutar
await main().catch(console.error);