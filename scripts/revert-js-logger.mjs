#!/usr/bin/env node
/**
 * Revertir migración de logger en archivos .js
 * (logger → console.* solo en archivos JavaScript)
 */

import fs from 'fs/promises';
import { glob } from 'glob';

const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  replacements: 0
};

async function revertFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  let newContent = content;
  let fileChanged = false;

  // Solo revertir si tiene logger.* calls
  const hasLoggerUsage = /logger\.(info|error|warn|debug)\(/.test(content);

  if (hasLoggerUsage) {
    // Revertir logger.* a console.*
    newContent = newContent.replace(/logger\.info\(/g, 'console.log(');
    newContent = newContent.replace(/logger\.error\(/g, 'console.error(');
    newContent = newContent.replace(/logger\.warn\(/g, 'console.warn(');
    newContent = newContent.replace(/logger\.debug\(/g, 'console.debug(');

    // Remover import de logger si existe
    newContent = newContent.replace(/import \{ logger \} from '@autamedica\/shared';\n?/g, '');

    fileChanged = true;
    stats.filesChanged++;

    await fs.writeFile(filePath, newContent, 'utf-8');
    return filePath;
  }

  return null;
}

async function main() {
  console.log('🔄 Revirtiendo logger en archivos .js...\n');

  const files = await glob('**/*.{js,jsx}', {
    cwd: process.cwd(),
    ignore: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/.turbo/**',
      '**/build/**',
    ]
  });

  console.log(`📁 Procesando ${files.length} archivos JavaScript...\n`);

  const changes = [];

  for (const file of files) {
    stats.filesProcessed++;
    const result = await revertFile(file);
    if (result) {
      changes.push(result);
    }
  }

  console.log('📊 REPORTE\n');
  console.log(`Archivos procesados: ${stats.filesProcessed}`);
  console.log(`Archivos revertidos: ${stats.filesChanged}\n`);

  if (changes.length > 0) {
    console.log('📝 Archivos revertidos:');
    changes.slice(0, 20).forEach(path => {
      console.log(`  ✓ ${path}`);
    });

    if (changes.length > 20) {
      console.log(`  ... y ${changes.length - 20} más`);
    }
  }

  console.log('\n✅ Reversión completada!');
}

main().catch(console.error);
