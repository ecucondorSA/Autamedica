#!/usr/bin/env node
/**
 * Analiza duplicación de types entre @autamedica/types y types locales en apps
 *
 * Este script:
 * 1. Lee todos los types documentados en el glosario
 * 2. Encuentra definiciones locales duplicadas en las apps
 * 3. Genera reporte de consolidación necesaria
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

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
 * Extrae types del glosario maestro
 */
function getDocumentedTypes() {
  try {
    const glosarioPath = join(rootDir, 'docs', 'GLOSARIO_MAESTRO.md');
    const content = readFileSync(glosarioPath, 'utf-8');

    const types = new Set();

    // Buscar entradas ### que representan exports documentados
    const headerRegex = /^### (.+)$/gm;
    let match;
    while ((match = headerRegex.exec(content)) !== null) {
      const exportName = match[1].trim();
      types.add(exportName);
    }

    return types;
  } catch (error) {
    log(`❌ Error al leer glosario: ${error.message}`, 'red');
    return new Set();
  }
}

/**
 * Busca definiciones de types en archivos
 */
function findTypeDefinitions(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const definitions = [];

    // Buscar definiciones de types
    const patterns = [
      /export\s+(?:interface|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
      /export\s+enum\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
      /export\s+const\s+([A-Z_$][A-Z0-9_$]*)/g  // Constantes en mayúsculas
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const typeName = match[1];
        definitions.push({
          name: typeName,
          file: filePath,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }

    return definitions;
  } catch (error) {
    return [];
  }
}

/**
 * Analiza imports de @autamedica/* en un archivo
 */
function analyzeImports(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const imports = {
      autamedicaTypes: [],
      localTypes: []
    };

    // Buscar imports de @autamedica/*
    const autamedicaRegex = /import\s*(?:type\s*)?(?:{([^}]+)}|\*\s+as\s+\w+|(\w+))\s*from\s*['"]@autamedica\/([^'"]+)['"]/g;
    let match;
    while ((match = autamedicaRegex.exec(content)) !== null) {
      const importList = match[1] || match[2];
      const packageName = match[3];

      if (importList) {
        if (match[1]) {
          // Named imports: { Type1, Type2 }
          const types = importList.split(',').map(t => t.trim()).filter(Boolean);
          imports.autamedicaTypes.push(...types.map(type => ({
            type,
            package: packageName,
            line: content.substring(0, match.index).split('\n').length
          })));
        } else {
          // Default import
          imports.autamedicaTypes.push({
            type: importList,
            package: packageName,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    }

    // Buscar imports locales de types
    const localRegex = /import\s*(?:type\s*)?(?:{([^}]+)}|\*\s+as\s+\w+|(\w+))\s*from\s*['"](?:\@\/types|\.\.?\/[^'"]*types)['"]/g;
    while ((match = localRegex.exec(content)) !== null) {
      const importList = match[1] || match[2];
      if (importList && match[1]) {
        const types = importList.split(',').map(t => t.trim()).filter(Boolean);
        imports.localTypes.push(...types.map(type => ({
          type,
          line: content.substring(0, match.index).split('\n').length
        })));
      }
    }

    return imports;
  } catch (error) {
    return { autamedicaTypes: [], localTypes: [] };
  }
}

/**
 * Función principal
 */
async function main() {
  log('🔍 Analizando duplicación de types entre @autamedica/* y apps locales...', 'cyan');

  // 1. Obtener types documentados
  const documentedTypes = getDocumentedTypes();
  log(`📋 Types documentados en glosario: ${documentedTypes.size}`, 'blue');

  // 2. Buscar archivos de types en apps
  const appFiles = await glob('apps/**/*.{ts,tsx}', {
    cwd: rootDir,
    ignore: ['**/.next/**', '**/node_modules/**', '**/*.d.ts']
  });

  log(`📁 Archivos encontrados en apps: ${appFiles.length}`, 'blue');

  // 3. Analizar definiciones locales
  const localDefinitions = new Map(); // type name -> [files]
  const importAnalysis = new Map(); // file -> import analysis

  for (const file of appFiles) {
    const fullPath = join(rootDir, file);

    // Analizar definiciones locales
    const definitions = findTypeDefinitions(fullPath);
    for (const def of definitions) {
      if (!localDefinitions.has(def.name)) {
        localDefinitions.set(def.name, []);
      }
      localDefinitions.get(def.name).push(def);
    }

    // Analizar imports
    const imports = analyzeImports(fullPath);
    if (imports.autamedicaTypes.length > 0 || imports.localTypes.length > 0) {
      importAnalysis.set(file, imports);
    }
  }

  // 4. Detectar duplicaciones
  const duplications = [];
  const missing = [];

  for (const [typeName, definitions] of localDefinitions) {
    if (documentedTypes.has(typeName)) {
      duplications.push({
        type: typeName,
        definitions: definitions
      });
    }
  }

  // 5. Analizar uso de types locales vs @autamedica
  const usageAnalysis = {
    onlyLocal: [],
    onlyAutamedica: [],
    mixed: [],
    needConsolidation: []
  };

  for (const [file, imports] of importAnalysis) {
    const localTypes = new Set(imports.localTypes.map(i => i.type));
    const autamedicaTypes = new Set(imports.autamedicaTypes.map(i => i.type));

    // Verificar si hay overlap entre types locales e importados
    const overlap = [...localTypes].filter(t => documentedTypes.has(t));
    if (overlap.length > 0) {
      usageAnalysis.needConsolidation.push({
        file,
        conflicts: overlap,
        localTypes: imports.localTypes,
        autamedicaTypes: imports.autamedicaTypes
      });
    } else if (localTypes.size > 0 && autamedicaTypes.size === 0) {
      usageAnalysis.onlyLocal.push(file);
    } else if (localTypes.size === 0 && autamedicaTypes.size > 0) {
      usageAnalysis.onlyAutamedica.push(file);
    } else if (localTypes.size > 0 && autamedicaTypes.size > 0) {
      usageAnalysis.mixed.push(file);
    }
  }

  // 6. Generar reporte
  log('\n📊 REPORTE DE ANÁLISIS DE TYPES', 'bright');
  log('=' .repeat(50), 'blue');

  // Duplicaciones detectadas
  if (duplications.length > 0) {
    log(`\n🚨 DUPLICACIONES DETECTADAS (${duplications.length}):`, 'red');
    for (const dup of duplications) {
      log(`\n  📋 ${dup.type}`, 'yellow');
      log(`     🎯 Documentado en glosario: ✅`, 'green');
      log(`     🔄 Definiciones locales:`, 'red');
      for (const def of dup.definitions) {
        log(`       - ${def.file}:${def.line}`, 'red');
      }
    }
  } else {
    log('\n✅ No se encontraron duplicaciones directas', 'green');
  }

  // Archivos que necesitan consolidación
  if (usageAnalysis.needConsolidation.length > 0) {
    log(`\n⚠️  ARCHIVOS QUE NECESITAN CONSOLIDACIÓN (${usageAnalysis.needConsolidation.length}):`, 'yellow');
    for (const item of usageAnalysis.needConsolidation) {
      log(`\n  📁 ${item.file}`, 'yellow');
      log(`     🔄 Types en conflicto: ${item.conflicts.join(', ')}`, 'red');
      log(`     📋 Usa types locales: ${item.localTypes.map(t => t.type).join(', ')}`, 'magenta');
      log(`     📦 Usa @autamedica: ${item.autamedicaTypes.map(t => t.type).join(', ')}`, 'green');
    }
  }

  // Estadísticas de uso
  log(`\n📈 ESTADÍSTICAS DE USO:`, 'cyan');
  log(`  📦 Solo @autamedica types: ${usageAnalysis.onlyAutamedica.length} archivos`, 'green');
  log(`  🏠 Solo types locales: ${usageAnalysis.onlyLocal.length} archivos`, 'yellow');
  log(`  🔀 Uso mixto: ${usageAnalysis.mixed.length} archivos`, 'blue');
  log(`  ⚠️  Necesitan consolidación: ${usageAnalysis.needConsolidation.length} archivos`, 'red');

  // Recomendaciones
  log(`\n💡 RECOMENDACIONES:`, 'bright');

  if (duplications.length > 0) {
    log(`\n1. 🔧 ELIMINAR DUPLICACIONES:`, 'cyan');
    for (const dup of duplications) {
      log(`   - Reemplazar definiciones locales de "${dup.type}" con import de @autamedica/types`, 'yellow');
    }
  }

  if (usageAnalysis.needConsolidation.length > 0) {
    log(`\n2. 🎯 CONSOLIDAR IMPORTS:`, 'cyan');
    log(`   - ${usageAnalysis.needConsolidation.length} archivos usan types locales que ya están en @autamedica/types`, 'yellow');
    log(`   - Migrar a usar solo @autamedica/* para consistencia`, 'yellow');
  }

  if (usageAnalysis.onlyLocal.length > 0) {
    log(`\n3. 📦 MIGRAR A @autamedica:`, 'cyan');
    log(`   - ${usageAnalysis.onlyLocal.length} archivos usan solo types locales`, 'yellow');
    log(`   - Evaluar si pueden migrar a types centralizados`, 'yellow');
  }

  // Comando de consolidación sugerido
  if (duplications.length > 0 || usageAnalysis.needConsolidation.length > 0) {
    log(`\n🚀 PRÓXIMO PASO SUGERIDO:`, 'green');
    log(`   pnpm run types:consolidate`, 'bright');
  } else {
    log(`\n✅ El proyecto está bien consolidado!`, 'green');
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`💥 Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { main as analyzeTypeDuplication };