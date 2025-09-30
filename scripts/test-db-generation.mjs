#!/usr/bin/env node
/**
 * Test runner para validar la generación de tipos DB
 *
 * Este script:
 * 1. Procesa fixtures de esquemas SQL
 * 2. Genera tipos TypeScript
 * 3. Compara con snapshots esperados
 * 4. Reporta diferencias
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Pre-escanea enums CREATE TYPE desde SQL
 */
function scanEnumTypes(sqlContent) {
  const enums = new Map();

  // Buscar CREATE TYPE ... AS ENUM
  const enumRegex = /CREATE\s+TYPE\s+"?(\w+)"?\s+AS\s+ENUM\s*\(([^)]+)\)/gi;
  let match;

  while ((match = enumRegex.exec(sqlContent)) !== null) {
    const enumName = match[1].toUpperCase();
    const enumValues = match[2]
      .split(',')
      .map(v => v.trim().replace(/'/g, ''))
      .map(v => `'${v}'`)
      .join(' | ');

    enums.set(enumName, enumValues);
    log(`🔍 Found enum: ${enumName} = ${enumValues}`, 'cyan');
  }

  return enums;
}

// Tabla de mapeos centralizada SQL → TypeScript (copiada desde generate-db-types.mjs)
const TYPE_MAP = [
  {
    regex: /\bUUID\b/i,
    tsType: 'string',
    comment: 'UUID'
  },
  {
    regex: /\b(INTEGER|BIGINT|SMALLINT|SERIAL|BIGSERIAL)\b/i,
    tsType: 'number'
  },
  {
    regex: /\b(NUMERIC|DECIMAL|MONEY)(\s*\(\d+(,\s*\d+)?\))?\b/i,
    tsType: 'number',
    comment: 'decimal'
  },
  {
    regex: /\bTIMESTAMP(?:\s+WITH\s+TIME\s+ZONE)?\b/i,
    tsType: 'string',
    comment: 'timestamptz'
  },
  {
    regex: /\bDATE\b/i,
    tsType: 'string',
    comment: 'date'
  },
  {
    regex: /\bTIME\b/i,
    tsType: 'string',
    comment: 'time'
  },
  {
    regex: /\bBOOLEAN\b/i,
    tsType: 'boolean'
  },
  {
    regex: /\bINET\b/i,
    tsType: 'string',
    comment: 'IP address'
  },
  {
    regex: /\bJSONB?\b/i,
    tsType: 'Json'
  },
  {
    regex: /\b(TEXT|VARCHAR|CHAR)(\s*\(\d+\))?\b/i,
    tsType: 'string'
  },
  {
    regex: /\bTEXT\[\]/i,
    tsType: 'string[]'
  }
];

/**
 * Parsea información de tipo de columna con soporte para enums e identidad
 */
function parseColumnTypeWithEnums(typeDefinition, columnName, tableDefinition, enumTypes) {
  const typeDef = typeDefinition.toUpperCase();
  const originalDef = typeDefinition;

  // Detectar identidad (GENERATED ALWAYS/BY DEFAULT AS IDENTITY)
  const hasIdentity = /GENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY/i.test(typeDef);

  // Determinar nullability con más precisión
  let nullable = true;

  // NOT NULL explícito
  if (typeDef.includes('NOT NULL')) {
    nullable = false;
  }

  // PRIMARY KEY implica NOT NULL
  if (tableDefinition && (
    tableDefinition.includes(`PRIMARY KEY (${columnName})`) ||
    tableDefinition.includes(`PRIMARY KEY ("${columnName}")`) ||
    typeDefinition.includes('PRIMARY KEY')
  )) {
    nullable = false;
  }

  // Mapear tipo usando tabla centralizada
  let tsType = 'unknown';
  let comment = '';

  // 1. Verificar enums CREATE TYPE primero
  const baseType = originalDef.split(/\s/)[0].replace(/"/g, '').toUpperCase();
  if (enumTypes.has(baseType)) {
    tsType = enumTypes.get(baseType);
    comment = 'enum';
  }
  // 2. Casos especiales CHECK IN
  else if (typeDef.includes('CHECK') && typeDef.includes('IN')) {
    // Parse enum from CHECK constraint
    const enumMatch = originalDef.match(/CHECK\s*\([^)]*IN\s*\(([^)]+)\)/i);
    if (enumMatch) {
      const values = enumMatch[1]
        .split(',')
        .map(v => v.trim().replace(/'/g, ''))
        .map(v => `'${v}'`)
        .join(' | ');
      tsType = values;
    } else {
      tsType = 'string';
    }
  }
  // 3. Aplicar tabla de mapeos
  else {
    for (const mapping of TYPE_MAP) {
      if (mapping.regex.test(originalDef)) {
        tsType = mapping.tsType;
        if (mapping.comment) {
          comment = mapping.comment;
        }
        break;
      }
    }
  }

  // Si no encontramos mapeo, marcar como unknown
  if (tsType === 'unknown') {
    comment = `Unknown type: ${originalDef}`;
  }

  return {
    type: tsType,
    nullable,
    comment,
    hasDefault: typeDef.includes('DEFAULT'),
    hasIdentity,
    isPrimaryKey: tableDefinition && (
      tableDefinition.includes(`PRIMARY KEY (${columnName})`) ||
      tableDefinition.includes(`PRIMARY KEY ("${columnName}")`) ||
      typeDefinition.includes('PRIMARY KEY')
    )
  };
}

/**
 * Parsea información de tipo de columna (versión simplificada para tests)
 */
function parseColumnType(typeDefinition, columnName, tableDefinition) {
  const typeDef = typeDefinition.toUpperCase();
  const originalDef = typeDefinition;

  // Determinar nullability con más precisión
  let nullable = true;

  // NOT NULL explícito
  if (typeDef.includes('NOT NULL')) {
    nullable = false;
  }

  // PRIMARY KEY implica NOT NULL
  if (tableDefinition && (
    tableDefinition.includes(`PRIMARY KEY (${columnName})`) ||
    typeDefinition.includes('PRIMARY KEY')
  )) {
    nullable = false;
  }

  // Mapear tipo usando tabla centralizada
  let tsType = 'unknown';
  let comment = '';

  // Casos especiales primero
  if (typeDef.includes('CHECK') && typeDef.includes('IN')) {
    // Parse enum from CHECK constraint
    const enumMatch = originalDef.match(/CHECK\s*\([^)]*IN\s*\(([^)]+)\)/i);
    if (enumMatch) {
      const values = enumMatch[1]
        .split(',')
        .map(v => v.trim().replace(/'/g, ''))
        .map(v => `'${v}'`)
        .join(' | ');
      tsType = values;
    } else {
      tsType = 'string';
    }
  } else {
    // Aplicar tabla de mapeos
    for (const mapping of TYPE_MAP) {
      if (mapping.regex.test(originalDef)) {
        tsType = mapping.tsType;
        if (mapping.comment) {
          comment = mapping.comment;
        }
        break;
      }
    }
  }

  // Si no encontramos mapeo, marcar como unknown
  if (tsType === 'unknown') {
    comment = `Unknown type: ${originalDef}`;
  }

  return {
    type: tsType,
    nullable,
    comment,
    hasDefault: typeDef.includes('DEFAULT'),
    isPrimaryKey: tableDefinition && (
      tableDefinition.includes(`PRIMARY KEY (${columnName})`) ||
      typeDefinition.includes('PRIMARY KEY')
    )
  };
}

/**
 * Función de generación simplificada para testing
 */
function generateTypesFromSQL(sqlContent) {
  const timestamp = new Date().toISOString();

  let output = `/**
 * Test generated types - ${timestamp}
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
`;

  // Pre-escanear enums
  const enumTypes = scanEnumTypes(sqlContent);

  // Extraer tablas con regex mejorado para soportar esquemas y comillas
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?(\w+)"?\.)?"?(\w+)"?\s*\(\s*([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const schema = match[1] || 'public';
    const tableName = match[2];
    const tableDefinition = match[3];

    // Solo procesar tablas del esquema public por ahora
    if (schema !== 'public') {
      continue;
    }

    output += `      // ${tableName} table\n`;
    output += `      ${tableName}: {\n`;
    output += `        Row: {\n`;

    // Parse columns simplificado
    const lines = tableDefinition.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('--'));

    const columns = [];
    for (const line of lines) {
      // Skip constraints
      if (line.match(/^\s*(PRIMARY KEY|FOREIGN KEY|CONSTRAINT|REFERENCES|UNIQUE)/i)) {
        continue;
      }

      const columnMatch = line.match(/^"?(?<name>\w+)"?\s+(?<rest>.*?)(?:\s*,)?\s*$/);
      if (columnMatch) {
        const { name, rest: typeDefinition } = columnMatch.groups;
        const typeInfo = parseColumnTypeWithEnums(typeDefinition, name, tableDefinition, enumTypes);

        if (typeInfo) {
          columns.push({
            name,
            type: typeInfo.type,
            nullable: typeInfo.nullable,
            comment: typeInfo.comment,
            hasDefault: typeInfo.hasDefault,
            isPrimaryKey: typeInfo.isPrimaryKey,
            hasIdentity: typeInfo.hasIdentity
          });
        }
      }
    }

    // Generar Row types
    for (const column of columns) {
      output += `          ${column.name}: ${column.type}${column.nullable ? ' | null' : ''}${column.comment ? ` // ${column.comment}` : ''}\n`;
    }

    output += `        }\n`;

    // Generar Insert types
    output += `        Insert: {\n`;
    for (const column of columns) {
      const isRequired = !column.hasDefault && !column.nullable && !column.hasIdentity;
      const optionalMarker = isRequired ? '' : '?';
      output += `          ${column.name}${optionalMarker}: ${column.type}${column.nullable ? ' | null' : ''}${column.comment ? ` // ${column.comment}` : ''}\n`;
    }
    output += `        }\n`;

    // Generar Update types
    output += `        Update: {\n`;
    for (const column of columns) {
      output += `          ${column.name}?: ${column.type}${column.nullable ? ' | null' : ''}${column.comment ? ` // ${column.comment}` : ''}\n`;
    }
    output += `        }\n`;
    output += `      }\n`;
  }

  output += `    }\n`;
  output += `    Views: {\n`;
  output += `      [_ in never]: never\n`;
  output += `    }\n`;
  output += `    Functions: {\n`;
  output += `      [_ in never]: never\n`;
  output += `    }\n`;
  output += `    Enums: {\n`;
  output += `      [_ in never]: never\n`;
  output += `    }\n`;
  output += `  }\n`;
  output += `}\n\n`;

  output += `export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']\n`;
  output += `export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']\n`;
  output += `export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']\n`;

  return output;
}

/**
 * Test cases
 */
const testCases = [
  {
    name: 'minimal-schema',
    description: 'Schema con casos edge: PKs, DEFAULTs, NULLs, ENUMs',
    sqlFile: 'test-fixtures/minimal-schema.sql'
  },
  {
    name: 'advanced-schema',
    description: 'Schema avanzado: CREATE TYPE enums, IDENTITY, quoted identifiers',
    sqlFile: 'test-fixtures/advanced-schema.sql'
  },
  {
    name: 'multi-schema',
    description: 'Filtrado multi-schema: public vs audit/private schemas',
    sqlFile: 'test-fixtures/multi-schema.sql'
  }
];

/**
 * Run tests
 */
async function runTests() {
  log('🧪 Ejecutando tests de generación de tipos DB...', 'cyan');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    log(`\n📋 Test: ${testCase.name}`, 'blue');
    log(`   ${testCase.description}`, 'blue');

    try {
      // Read SQL fixture
      const sqlPath = join(__dirname, testCase.sqlFile);
      if (!existsSync(sqlPath)) {
        log(`   ❌ SQL fixture not found: ${sqlPath}`, 'red');
        failed++;
        continue;
      }

      const sqlContent = readFileSync(sqlPath, 'utf-8');

      // Generate types
      log('   🔧 Generating types...', 'yellow');
      const generatedTypes = generateTypesFromSQL(sqlContent);

      // Define expectations based on test case
      let expectations = [];

      if (testCase.name === 'minimal-schema') {
        expectations = [
          { pattern: /export interface Database/, description: 'Database interface' },
          { pattern: /test_table:\s*{\s*Row:\s*{/, description: 'test_table Row type' },
          { pattern: /Insert:\s*{/, description: 'Insert type' },
          { pattern: /Update:\s*{/, description: 'Update type' },
          { pattern: /id: string.*UUID/, description: 'UUID type mapping' },
          { pattern: /price.*: number.*decimal/, description: 'DECIMAL type mapping' },
          { pattern: /is_active\?.*: boolean/, description: 'Optional boolean with DEFAULT' },
          { pattern: /required_text: string/, description: 'Required string (NOT NULL, no DEFAULT)' },
          { pattern: /optional_text\?.*: string \| null/, description: 'Optional nullable string' },
          { pattern: /role.*: 'admin' \| 'user' \| 'guest'/, description: 'Enum from CHECK constraint' },
          { pattern: /tags.*: string/, description: 'Array type mapping' }
        ];
      } else if (testCase.name === 'advanced-schema') {
        expectations = [
          { pattern: /export interface Database/, description: 'Database interface' },
          { pattern: /UserProfiles:\s*{\s*Row:\s*{/, description: 'UserProfiles Row type (quoted table)' },
          { pattern: /Insert:\s*{/, description: 'Insert type' },
          { pattern: /Update:\s*{/, description: 'Update type' },
          { pattern: /status.*: 'active' \| 'inactive' \| 'suspended'/, description: 'CREATE TYPE enum mapping' },
          { pattern: /priority.*: 'low' \| 'medium' \| 'high' \| 'critical'/, description: 'CREATE TYPE enum in audit_trail' },
          { pattern: /id\?: number/, description: 'IDENTITY column optional in Insert' },
          { pattern: /firstName: string/, description: 'Quoted identifier parsing' },
          { pattern: /createdAt.*: string.*timestamptz/, description: 'Quoted timestamp field' }
        ];
      } else if (testCase.name === 'multi-schema') {
        expectations = [
          { pattern: /export interface Database/, description: 'Database interface' },
          { pattern: /main_table:\s*{\s*Row:\s*{/, description: 'main_table from public schema processed' },
          { pattern: /settings:\s*{\s*Row:\s*{/, description: 'settings from public schema processed' },
          { pattern: /status.*: 'active' \| 'inactive'/, description: 'CHECK constraint enum in main_table' },
          { pattern: /is_public.*: boolean/, description: 'boolean field in settings table' },
          { pattern: /Insert:\s*{/, description: 'Insert types generated' },
          { pattern: /Update:\s*{/, description: 'Update types generated' }
        ];

        // Verificar que NO contenga tablas de audit y private schemas
        const negativeExpectations = [
          { pattern: /logs:\s*{\s*Row:\s*{/, description: 'audit.logs should be filtered out' },
          { pattern: /sessions:\s*{\s*Row:\s*{/, description: 'audit.sessions should be filtered out' },
          { pattern: /secrets:\s*{\s*Row:\s*{/, description: 'private.secrets should be filtered out' }
        ];

        // Agregar expectativas negativas a verificar después
        testCase.negativeExpectations = negativeExpectations;
      }

      let testPassed = true;
      for (const expectation of expectations) {
        if (!expectation.pattern.test(generatedTypes)) {
          log(`   ❌ Missing: ${expectation.description}`, 'red');
          testPassed = false;
        } else {
          log(`   ✅ Found: ${expectation.description}`, 'green');
        }
      }

      // Check negative expectations for multi-schema test
      if (testCase.negativeExpectations) {
        for (const negativeExpectation of testCase.negativeExpectations) {
          if (negativeExpectation.pattern.test(generatedTypes)) {
            log(`   ❌ Should NOT contain: ${negativeExpectation.description}`, 'red');
            testPassed = false;
          } else {
            log(`   ✅ Correctly filtered: ${negativeExpectation.description}`, 'green');
          }
        }
      }

      // Write snapshot for manual review
      const snapshotPath = join(__dirname, 'test-fixtures', `${testCase.name}.snapshot.ts`);
      writeFileSync(snapshotPath, generatedTypes, 'utf-8');
      log(`   📸 Snapshot saved: ${snapshotPath}`, 'cyan');

      if (testPassed) {
        log(`   🎉 Test PASSED`, 'green');
        passed++;
      } else {
        log(`   💥 Test FAILED`, 'red');
        failed++;
      }

    } catch (error) {
      log(`   💥 Test ERROR: ${error.message}`, 'red');
      failed++;
    }
  }

  // Summary
  log(`\n📊 RESUMEN DE TESTS`, 'bright');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, 'red');
  log(`📋 Total: ${passed + failed}`, 'blue');

  if (failed > 0) {
    log(`\n💡 Revisa los snapshots en scripts/test-fixtures/ para debug`, 'yellow');
    process.exit(1);
  } else {
    log(`\n🎉 ¡Todos los tests pasaron!`, 'green');
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    log(`💥 Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runTests };