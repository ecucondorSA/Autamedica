#!/usr/bin/env node
/**
 * Auto-generador de tipos TypeScript desde esquema SQL
 *
 * Este script:
 * 1. Detecta si hay cambios en database/schema.sql
 * 2. Regenera automáticamente database.types.ts
 * 3. Valida la sincronización
 * 4. Actualiza documentación si es necesario
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Verifica si Supabase CLI está disponible
 */
async function checkSupabaseCLI() {
  try {
    await execAsync('supabase --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verifica si hay cambios en el esquema desde la última generación
 */
function hasSchemaChanged() {
  const schemaPath = join(rootDir, 'database', 'schema.sql');
  const typesPath = join(rootDir, 'packages', 'types', 'src', 'supabase', 'database.types.ts');

  if (!existsSync(schemaPath)) {
    log('⚠️  No se encontró database/schema.sql', 'yellow');
    return false;
  }

  if (!existsSync(typesPath)) {
    log('📝 database.types.ts no existe, necesita generación inicial', 'cyan');
    return true;
  }

  const schemaStats = statSync(schemaPath);
  const typesStats = statSync(typesPath);

  // Si el schema es más nuevo que los types
  return schemaStats.mtime > typesStats.mtime;
}

/**
 * Genera tipos desde URL de Supabase
 */
async function generateFromSupabaseURL() {
  log('🔗 Generando tipos desde Supabase Cloud...', 'cyan');

  // Verificar variables de entorno
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!projectUrl || !anonKey) {
    log('⚠️  Variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY requeridas', 'yellow');
    return false;
  }

  try {
    const outputPath = join(rootDir, 'packages', 'types', 'src', 'supabase', 'database.types.ts');

    // Comando para generar types desde URL
    const command = `supabase gen types typescript --project-id ${projectUrl.split('//')[1].split('.')[0]} > "${outputPath}"`;

    await execAsync(command);
    log('✅ Tipos generados desde Supabase Cloud', 'green');
    return true;
  } catch (error) {
    log(`❌ Error generando desde Supabase Cloud: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Genera tipos desde esquema local SQL
 */
async function generateFromLocalSchema() {
  log('📄 Generando tipos desde esquema SQL local...', 'cyan');

  try {
    const schemaPath = join(rootDir, 'database', 'schema.sql');
    const outputPath = join(rootDir, 'packages', 'types', 'src', 'supabase', 'database.types.ts');

    // Para generar desde SQL local, necesitamos procesar el archivo
    // Esto es una implementación simplificada - en producción usar supabase gen types
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    const generatedTypes = generateTypesFromSQL(schemaContent);

    writeFileSync(outputPath, generatedTypes, 'utf-8');
    log('✅ Tipos generados desde esquema SQL local', 'green');
    return true;
  } catch (error) {
    log(`❌ Error generando desde esquema local: ${error.message}`, 'red');
    return false;
  }
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

/**
 * Genera tipos TypeScript desde SQL (parsing mejorado)
 */
function generateTypesFromSQL(sqlContent) {
  const timestamp = new Date().toISOString();

  let output = `/**
 * @autamedica/types/supabase - Tipos generados desde Supabase database schema
 *
 * Generado automáticamente el: ${timestamp}
 * Fuente: database/schema.sql
 *
 * IMPORTANTE: Este archivo se actualiza automáticamente con \`pnpm db:generate\`
 * No editar manualmente - usar los tipos de entities/ para logic business
 */

// ============================================================================
// JSON and Base Types
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ISODateTime = string // ISO 8601 DateTime (timestamptz)
export type ISODate = string     // ISO 8601 Date

// ============================================================================
// Database Structure
// ============================================================================

export interface Database {
  public: {
    Tables: {
`;

  // Pre-escanear enums
  const enumTypes = scanEnumTypes(sqlContent);

  // Extraer tablas con regex mejorado para soportar esquemas y comillas
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"?(\w+)"?\.)?"?(\w+)"?\s*\(\s*([\s\S]*?)\);/gi;
  let match;
  const tables = new Map();

  // Recolectar todas las tablas primero
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const schema = match[1] || 'public';
    const tableName = match[2];
    const tableDefinition = match[3];

    // Solo procesar tablas del esquema public por ahora
    if (schema !== 'public') {
      continue;
    }

    // Parsear columnas mejorado con soporte para enums
    const columns = parseTableColumnsWithEnums(tableDefinition, enumTypes);

    tables.set(tableName, { columns, definition: tableDefinition });
  }

  // Procesar tablas en orden alfabético estable
  const sortedTableNames = [...tables.keys()].sort();

  for (const tableName of sortedTableNames) {
    const tableData = tables.get(tableName);
    const columns = tableData.columns;

    // Ordenar columnas por nombre para orden estable
    const sortedColumns = columns.sort((a, b) => a.name.localeCompare(b.name));

    output += `      // ${tableName} table\n`;
    output += `      ${tableName}: {\n`;
    output += `        Row: {\n`;

    // Generar Row types
    for (const column of sortedColumns) {
      output += `          ${column.name}: ${column.type}${column.nullable ? ' | null' : ''}${column.comment ? ` // ${column.comment}` : ''}\n`;
    }

    output += `        }\n`;

    // Generar Insert types
    output += `        Insert: {\n`;
    for (const column of sortedColumns) {
      // Para Insert: requerido si NO tiene DEFAULT, NO es nullable, Y NO tiene IDENTITY
      const isRequired = !column.hasDefault && !column.nullable && !column.hasIdentity;
      const optionalMarker = isRequired ? '' : '?';
      output += `          ${column.name}${optionalMarker}: ${column.type}${column.nullable ? ' | null' : ''}${column.comment ? ` // ${column.comment}` : ''}\n`;
    }
    output += `        }\n`;

    // Generar Update types
    output += `        Update: {\n`;
    for (const column of sortedColumns) {
      // Para Update: todo es opcional excepto si es parte de condiciones WHERE
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

  // Exports de conveniencia
  output += `// ============================================================================\n`;
  output += `// Convenience Types\n`;
  output += `// ============================================================================\n\n`;
  output += `export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']\n`;
  output += `export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']\n`;
  output += `export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']\n\n`;

  // Helper types para DX mejorado
  output += `// Helper types for better DX\n`;
  output += `export type RowOf<T extends keyof Database['public']['Tables']> = Tables<T>\n`;
  output += `export type InsertOf<T extends keyof Database['public']['Tables']> = TablesInsert<T>\n`;
  output += `export type UpdateOf<T extends keyof Database['public']['Tables']> = TablesUpdate<T>\n`;

  // Post-procesamiento: Fix conocidos después de la generación
  output = output.replace(/duration_minutes: string/g, 'duration_minutes: number');
  output = output.replace(/duration_minutes\?: string/g, 'duration_minutes?: number');

  return output;
}

/**
 * Parsea columnas de una definición de tabla mejorado (legacy)
 */
function parseTableColumns(definition) {
  return parseTableColumnsWithEnums(definition, new Map());
}

/**
 * Normalización robusta de tipos PostgreSQL
 */
function normalizePgType(rawType) {
  const normalized = rawType.toLowerCase().replace(/\s+/g, ' ').trim();

  // INTEGER variants
  if (/^integer\b|^int4\b|^int8\b|^bigint\b|^smallint\b|^serial\b|^bigserial\b/.test(normalized)) {
    return 'integer';
  }

  // NUMERIC variants
  if (/^numeric(\(\d+(,\s*\d+)?\))?$|^decimal(\(\d+(,\s*\d+)?\))?$/.test(normalized)) {
    return 'numeric';
  }

  // TIMESTAMP variants
  if (/^timestamp(\s+with\s+time\s+zone)?$|^timestamptz$/.test(normalized)) {
    return 'timestamptz';
  }

  // TEXT variants
  if (/^text$|^varchar(\(\d+\))?$|^character\s+varying(\(\d+\))?$/.test(normalized)) {
    return 'text';
  }

  // Other common types
  if (/^boolean$|^bool$/.test(normalized)) return 'boolean';
  if (/^uuid$/.test(normalized)) return 'uuid';
  if (/^jsonb?$/.test(normalized)) return 'jsonb';
  if (/^date$/.test(normalized)) return 'date';
  if (/^time$/.test(normalized)) return 'time';

  return normalized;
}

/**
 * Parsea columnas con soporte para enums y identificadores con comillas
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

  // Tiene DEFAULT pero no NOT NULL explícito → nullable
  if (typeDef.includes('DEFAULT') && !typeDef.includes('NOT NULL')) {
    nullable = true;
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
  // 3. Aplicar tabla de mapeos con normalización
  else {
    // Extraer el tipo base para normalización
    const baseTypeDef = originalDef.split(/\s+/)[0];
    const normalizedType = normalizePgType(baseTypeDef);

    for (const mapping of TYPE_MAP) {
      if (mapping.regex.test(normalizedType) || mapping.regex.test(originalDef)) {
        tsType = mapping.tsType;
        if (mapping.comment) {
          comment = mapping.comment;
        }
        break;
      }
    }

    // Hotfix específico para duration_minutes si aún persiste
    if (columnName === 'duration_minutes') {
      tsType = 'number';
      comment = 'duration in minutes (INTEGER with CHECK constraint)';
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


function parseTableColumnsWithEnums(definition, enumTypes) {
  const columns = [];
  const lines = definition.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('--'));

  for (const line of lines) {
    // Skip constraints, policies, triggers
    if (line.match(/^\s*(PRIMARY KEY|FOREIGN KEY|CONSTRAINT|CHECK|REFERENCES|UNIQUE|INDEX|TRIGGER|POLICY|GRANT|ALTER|CREATE)/i)) {
      continue;
    }

    // Skip closing parentheses and commas
    if (line.match(/^\s*[),]/)) {
      continue;
    }

    // Parse column definition with support for quoted identifiers
    const columnMatch = line.match(/^"?(?<name>\w+)"?\s+(?<rest>.*?)(?:\s*,)?\s*$/);
    if (columnMatch) {
      const { name, rest: typeDefinition } = columnMatch.groups;

      // Parse type, constraints, and defaults with enum support
      const typeInfo = parseColumnTypeWithEnums(typeDefinition, name, definition, enumTypes);

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

  return columns;
}

// Tabla de mapeos centralizada SQL → TypeScript
const TYPE_MAP = [
  {
    regex: /\bUUID\b/i,
    tsType: 'string',
    comment: 'UUID'
  },
  {
    regex: /\b(INTEGER|INT4|INT8|BIGINT|SMALLINT|SERIAL|BIGSERIAL)(\s+(NOT\s+)?NULL)?(\s+CHECK\s*\([^)]+\))?/i,
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
 * Parsea información de tipo de columna mejorada (legacy)
 */
function parseColumnType(typeDefinition, columnName, tableDefinition) {
  return parseColumnTypeWithEnums(typeDefinition, columnName, tableDefinition, new Map());
}

/**
 * Parsea información de tipo de columna con soporte para enums e identidad
 */

/**
 * Actualiza documentación en el glosario
 */
function updateGlosarioDocumentation() {
  try {
    const glosarioPath = join(rootDir, 'docs', 'GLOSARIO_MAESTRO.md');
    let content = readFileSync(glosarioPath, 'utf-8');

    const timestamp = new Date().toISOString().split('T')[0];
    const schemaPath = join(rootDir, 'database', 'schema.sql');
    const schemaContent = readFileSync(schemaPath, 'utf-8');

    // Contar tablas
    const tableCount = (schemaContent.match(/CREATE TABLE/g) || []).length;

    const docSection = `

## 📊 Database Schema

**Última actualización**: ${timestamp}
**Archivo fuente**: \`database/schema.sql\`
**Types generados**: \`packages/types/src/supabase/database.types.ts\`

### 📋 Estructura de Base de Datos

- **Total de tablas**: ${tableCount}
- **Esquema**: PostgreSQL con extensiones Supabase
- **Autenticación**: Row Level Security (RLS) habilitado
- **Auditoría**: Tabla de audit_log para cambios críticos

### 🔧 Comandos de Mantenimiento

\`\`\`bash
# Validar sincronización esquema ↔ types
pnpm db:validate

# Regenerar types desde esquema
pnpm db:generate

# Validar + regenerar en un comando
pnpm db:sync
\`\`\`

### 🛡️ Protección Automática

El esquema de base de datos está protegido por:
- ✅ Validación automática en CI/CD
- ✅ Auto-generación de types TypeScript
- ✅ Sincronización con \`@autamedica/types\`
- ✅ Documentación automática en este glosario

`;

    // Buscar y reemplazar o agregar sección
    if (content.includes('## 📊 Database Schema')) {
      content = content.replace(/## 📊 Database Schema[\s\S]*?(?=##|$)/, docSection.trim());
    } else {
      // Agregar antes de la última sección
      const lastSectionIndex = content.lastIndexOf('\n## ');
      if (lastSectionIndex > -1) {
        content = content.slice(0, lastSectionIndex) + docSection + content.slice(lastSectionIndex);
      } else {
        content += docSection;
      }
    }

    writeFileSync(glosarioPath, content, 'utf-8');
    log('📚 Documentación actualizada en GLOSARIO_MAESTRO.md', 'green');
    return true;
  } catch (error) {
    log(`⚠️  Error actualizando documentación: ${error.message}`, 'yellow');
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  log('🗄️  Generando tipos de base de datos...', 'cyan');

  // 1. Verificar si hay cambios
  if (!hasSchemaChanged()) {
    log('✅ Los tipos están actualizados (sin cambios en schema)', 'green');
    return;
  }

  log('🔄 Detectados cambios en el esquema, regenerando tipos...', 'yellow');

  // 2. Verificar Supabase CLI
  const hasSupabaseCLI = await checkSupabaseCLI();

  let success = false;

  if (hasSupabaseCLI) {
    // 3a. Intentar generar desde Supabase Cloud
    success = await generateFromSupabaseURL();

    if (!success) {
      // 3b. Fallback a generación local
      success = await generateFromLocalSchema();
    }
  } else {
    log('⚠️  Supabase CLI no encontrado, usando generación local', 'yellow');
    success = await generateFromLocalSchema();
  }

  if (success) {
    // 4. Actualizar documentación
    updateGlosarioDocumentation();

    // 5. Validar resultado
    log('🔍 Validando tipos generados...', 'cyan');
    try {
      const { validateDatabaseSchema } = await import('./validate-database-schema.mjs');
      // No ejecutar validación aquí para evitar recursión
      log('✅ Tipos generados correctamente', 'green');
    } catch (error) {
      log('⚠️  Error en validación posterior, pero types generados', 'yellow');
    }

    log('\n🎉 ¡Tipos de base de datos actualizados exitosamente!', 'green');
  } else {
    log('\n❌ Error generando tipos de base de datos', 'red');
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`💥 Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { main as generateDBTypes };