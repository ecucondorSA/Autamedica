#!/usr/bin/env node

/**
 * Script de migración automática: console.* → logger
 *
 * Migra console.log/warn/error/debug/info a logger de Pino
 *
 * Uso:
 *   node scripts/migrate-to-logger.mjs                    # Preview (dry-run)
 *   node scripts/migrate-to-logger.mjs --apply            # Aplicar cambios
 *   node scripts/migrate-to-logger.mjs --file path.ts     # Solo un archivo
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const DRY_RUN = !process.argv.includes('--apply');
const SINGLE_FILE = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1];

// Estadísticas
const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  replacements: 0,
  patterns: {
    'console.log': 0,
    'console.error': 0,
    'console.warn': 0,
    'console.info': 0,
    'console.debug': 0,
  }
};

/**
 * Migrar archivo individual
 */
async function migrateFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  let newContent = content;
  let fileChanged = false;

  // 1. Agregar import de logger si no existe y hay console.*
  const hasConsoleUsage = /console\.(log|error|warn|info|debug)/.test(content);
  const hasLoggerImport = /import.*logger.*from.*@autamedica\/shared/.test(content);

  if (hasConsoleUsage && !hasLoggerImport) {
    // Encontrar la última línea de import
    const importMatch = content.match(/^import[^;]+;$/gm);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      const importIndex = content.lastIndexOf(lastImport);
      const afterLastImport = importIndex + lastImport.length;

      newContent = content.slice(0, afterLastImport) +
        "\nimport { logger } from '@autamedica/shared';" +
        content.slice(afterLastImport);

      fileChanged = true;
    }
  }

  // 2. Reemplazar console.* por logger.*
  const replacements = [
    {
      pattern: /console\.log\(/g,
      replacement: 'logger.info(',
      name: 'console.log'
    },
    {
      pattern: /console\.error\(/g,
      replacement: 'logger.error(',
      name: 'console.error'
    },
    {
      pattern: /console\.warn\(/g,
      replacement: 'logger.warn(',
      name: 'console.warn'
    },
    {
      pattern: /console\.info\(/g,
      replacement: 'logger.info(',
      name: 'console.info'
    },
    {
      pattern: /console\.debug\(/g,
      replacement: 'logger.debug(',
      name: 'console.debug'
    },
  ];

  for (const { pattern, replacement, name } of replacements) {
    const matches = newContent.match(pattern) || [];
    if (matches.length > 0) {
      newContent = newContent.replace(pattern, replacement);
      stats.patterns[name] += matches.length;
      stats.replacements += matches.length;
      fileChanged = true;
    }
  }

  if (fileChanged) {
    stats.filesChanged++;

    if (!DRY_RUN) {
      await fs.writeFile(filePath, newContent, 'utf-8');
    }

    return {
      path: filePath,
      changes: Object.entries(stats.patterns)
        .filter(([, count]) => count > 0)
        .map(([name, count]) => `${name}: ${count}`)
        .join(', ')
    };
  }

  return null;
}

/**
 * Main
 */
async function main() {
  console.log('🔄 Migración console.* → logger\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (preview)' : '✅ APPLY CHANGES'}\n`);

  // Obtener archivos a procesar
  let files = [];

  if (SINGLE_FILE) {
    files = [SINGLE_FILE];
  } else {
    files = await glob('**/*.{ts,tsx}', {
      cwd: process.cwd(),
      ignore: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/dist-esm/**',
        '**/.turbo/**',
        '**/build/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ]
    });
  }

  console.log(`📁 Procesando ${files.length} archivos...\n`);

  const changes = [];

  for (const file of files) {
    stats.filesProcessed++;
    const result = await migrateFile(file);
    if (result) {
      changes.push(result);
    }
  }

  // Reporte
  console.log('\n📊 REPORTE DE MIGRACIÓN\n');
  console.log(`Archivos procesados: ${stats.filesProcessed}`);
  console.log(`Archivos modificados: ${stats.filesChanged}`);
  console.log(`Total reemplazos: ${stats.replacements}\n`);

  console.log('Detalles por patrón:');
  for (const [pattern, count] of Object.entries(stats.patterns)) {
    if (count > 0) {
      console.log(`  ${pattern.padEnd(20)} → ${count}`);
    }
  }

  if (changes.length > 0) {
    console.log('\n📝 Archivos modificados:');
    changes.slice(0, 20).forEach(({ path, changes }) => {
      console.log(`  ✓ ${path}`);
      console.log(`    ${changes}`);
    });

    if (changes.length > 20) {
      console.log(`  ... y ${changes.length - 20} más`);
    }
  }

  if (DRY_RUN && stats.filesChanged > 0) {
    console.log('\n💡 Para aplicar cambios: node scripts/migrate-to-logger.mjs --apply');
  }

  if (!DRY_RUN && stats.filesChanged > 0) {
    console.log('\n✅ Migración completada!');
    console.log('⚠️  Ejecuta: pnpm build && pnpm lint para verificar');
  }
}

main().catch(console.error);
