#!/usr/bin/env node
/**
 * Auto-Generate Documentation for Missing Exports
 *
 * Este script:
 * 1. Detecta exports sin documentar
 * 2. Analiza el código fuente para inferir tipos y propósitos
 * 3. Genera automáticamente entradas para GLOSARIO_MAESTRO.md
 * 4. Actualiza el glosario con las nuevas entradas
 */

import { readFileSync, writeFileSync } from 'fs';
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Obtiene todos los exports de un package
 */
function getPackageExports(packagePath) {
  try {
    const packageFile = join(rootDir, packagePath, 'src', 'index.ts');
    const content = readFileSync(packageFile, 'utf-8');

    const exports = new Set();

    // Detectar exports directos: export { ... }
    const exportRegex = /export\s*{\s*([^}]+)\s*}/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const exportList = match[1];
      exportList.split(',').forEach(item => {
        const cleanItem = item.trim().split(/\s+as\s+/)[0].trim();
        if (cleanItem) exports.add(cleanItem);
      });
    }

    // Detectar exports nombrados: export const/function/interface/type/enum
    const namedExportRegex = /export\s+(const|function|interface|type|enum|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.add(match[2]);
    }

    // Detectar re-exports: export * from
    const reExportRegex = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
    while ((match = reExportRegex.exec(content)) !== null) {
      const reExportPath = match[1];
      try {
        const reExportFile = join(rootDir, packagePath, 'src', `${reExportPath}.ts`);
        const reExportContent = readFileSync(reExportFile, 'utf-8');

        // Recursivamente obtener exports del archivo re-exportado
        const subExports = extractExportsFromContent(reExportContent);
        subExports.forEach(exp => exports.add(exp));
      } catch (err) {
        // Si no puede leer el archivo, continúa
      }
    }

    return Array.from(exports).sort();
  } catch (error) {
    log(`⚠️  Error al leer exports de ${packagePath}: ${error.message}`, 'yellow');
    return [];
  }
}

/**
 * Extrae exports de contenido de archivo
 */
function extractExportsFromContent(content) {
  const exports = new Set();

  // Detectar exports directos
  const exportRegex = /export\s*{\s*([^}]+)\s*}/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    const exportList = match[1];
    exportList.split(',').forEach(item => {
      const cleanItem = item.trim().split(/\s+as\s+/)[0].trim();
      if (cleanItem) exports.add(cleanItem);
    });
  }

  // Detectar exports nombrados
  const namedExportRegex = /export\s+(const|function|interface|type|enum|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.add(match[2]);
  }

  return Array.from(exports);
}

/**
 * Analiza el código fuente para inferir el tipo y propósito de un export
 */
function analyzeExport(exportName, packagePath) {
  try {
    const srcDir = join(rootDir, packagePath, 'src');
    const files = [
      join(srcDir, 'index.ts'),
      join(srcDir, 'types.ts'),
      join(srcDir, 'constants.ts'),
      join(srcDir, 'utils.ts'),
      join(srcDir, 'validators.ts'),
      join(srcDir, 'auth.ts'),
      join(srcDir, 'client.ts'),
      join(srcDir, 'server.ts')
    ];

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');

        // Buscar la definición del export
        const patterns = [
          // interface/type
          new RegExp(`export\\s+(interface|type)\\s+${exportName}\\s*[={]`, 'g'),
          // const/let
          new RegExp(`export\\s+const\\s+${exportName}\\s*[:=]`, 'g'),
          // function
          new RegExp(`export\\s+function\\s+${exportName}\\s*\\(`, 'g'),
          // enum
          new RegExp(`export\\s+enum\\s+${exportName}\\s*{`, 'g'),
          // class
          new RegExp(`export\\s+class\\s+${exportName}\\s*{`, 'g')
        ];

        for (const pattern of patterns) {
          const match = pattern.exec(content);
          if (match) {
            const type = match[1] || 'const';
            const description = inferDescription(exportName, type, content);
            return { type, description };
          }
        }
      } catch (err) {
        // Continúa con el siguiente archivo
      }
    }

    // Si no encuentra definición, inferir por nombre
    return inferFromName(exportName);
  } catch (error) {
    return inferFromName(exportName);
  }
}

/**
 * Infiere descripción basada en el contexto del código
 */
function inferDescription(exportName, type, content) {
  const name = exportName.toLowerCase();

  // Patrones médicos específicos
  if (name.includes('patient')) return `${type === 'interface' ? 'Interfaz' : 'Utilidad'} para manejo de datos de pacientes en el sistema médico.`;
  if (name.includes('doctor')) return `${type === 'interface' ? 'Interfaz' : 'Utilidad'} para gestión de información de médicos.`;
  if (name.includes('appointment')) return `${type === 'interface' ? 'Interfaz' : 'Utilidad'} para gestión de citas médicas.`;
  if (name.includes('medical')) return `${type === 'interface' ? 'Interfaz' : 'Utilidad'} para datos médicos y registros clínicos.`;
  if (name.includes('auth')) return `${type === 'interface' ? 'Interfaz' : 'Utilidad'} para autenticación y autorización.`;
  if (name.includes('telemedicine')) return `${type === 'interface' ? 'Interfaz' : 'Utilidad'} para funcionalidades de telemedicina.`;

  // Patrones por tipo
  if (type === 'interface' || type === 'type') {
    if (name.endsWith('id')) return `Tipo de identificador único para ${name.replace('id', '')} en el sistema.`;
    if (name.endsWith('config')) return `Configuración para ${name.replace('config', '')} del sistema.`;
    if (name.endsWith('props')) return `Propiedades del componente ${name.replace('props', '')}.`;
    if (name.endsWith('response')) return `Respuesta de API para operaciones de ${name.replace('response', '')}.`;
    return `Interfaz de datos para ${exportName.toLowerCase()} en el ecosistema AutaMedica.`;
  }

  if (type === 'enum') {
    if (name.includes('status')) return `Estados posibles para ${name.replace('status', '')} en el sistema.`;
    if (name.includes('role')) return `Roles de usuario disponibles en la plataforma médica.`;
    return `Enumeración de valores posibles para ${exportName.toLowerCase()}.`;
  }

  if (type === 'const') {
    if (name.includes('config')) return `Configuración constante para ${name.replace('config', '')} del sistema.`;
    if (name.includes('validation')) return `Reglas de validación para ${name.replace('validation', '')}.`;
    return `Constante del sistema para ${exportName.toLowerCase()}.`;
  }

  if (type === 'function') {
    if (name.startsWith('validate')) return `Valida ${name.replace('validate', '')} según reglas médicas y de negocio.`;
    if (name.startsWith('create')) return `Crea una nueva instancia de ${name.replace('create', '')}.`;
    if (name.startsWith('get')) return `Obtiene información de ${name.replace('get', '')} del sistema.`;
    if (name.startsWith('use')) return `Hook de React para gestión de ${name.replace('use', '')}.`;
    return `Función utilitaria para ${exportName.toLowerCase()} en el sistema médico.`;
  }

  return `Utilidad del sistema AutaMedica para ${exportName.toLowerCase()}.`;
}

/**
 * Infiere tipo y descripción solo por el nombre
 */
function inferFromName(exportName) {
  const name = exportName.toLowerCase();

  // Inferir tipo por convenciones de naming
  if (exportName.endsWith('Id') || exportName.endsWith('ID')) {
    return {
      type: 'type',
      description: `Identificador único tipado para ${exportName.replace(/Id$|ID$/, '').toLowerCase()} en el sistema.`
    };
  }

  if (exportName.endsWith('Config') || exportName.endsWith('Configuration')) {
    return {
      type: 'interface',
      description: `Configuración para ${exportName.replace(/Config$|Configuration$/, '').toLowerCase()} del sistema médico.`
    };
  }

  if (exportName.endsWith('Props')) {
    return {
      type: 'interface',
      description: `Propiedades del componente ${exportName.replace('Props', '')} en la interfaz médica.`
    };
  }

  if (exportName.endsWith('Response') || exportName.endsWith('Result')) {
    return {
      type: 'interface',
      description: `Respuesta de API para operaciones de ${exportName.replace(/Response$|Result$/, '').toLowerCase()}.`
    };
  }

  if (exportName.endsWith('Status') || exportName.endsWith('State')) {
    return {
      type: 'enum',
      description: `Estados posibles para ${exportName.replace(/Status$|State$/, '').toLowerCase()} en el sistema.`
    };
  }

  if (exportName.startsWith('use') && exportName.length > 3) {
    return {
      type: 'function',
      description: `Hook de React para gestión de ${exportName.substring(3).toLowerCase()} en la aplicación médica.`
    };
  }

  if (exportName.startsWith('create') || exportName.startsWith('validate') || exportName.startsWith('get')) {
    return {
      type: 'function',
      description: `Función utilitaria para ${exportName.toLowerCase()} en el ecosistema AutaMedica.`
    };
  }

  // Default based on naming patterns
  if (/^[A-Z][a-z]+$/.test(exportName)) {
    return {
      type: 'interface',
      description: `Interfaz de datos para ${exportName.toLowerCase()} en el sistema médico.`
    };
  }

  if (/^[A-Z_]+$/.test(exportName)) {
    return {
      type: 'const',
      description: `Constante del sistema para ${exportName.toLowerCase().replace(/_/g, ' ')}.`
    };
  }

  return {
    type: 'unknown',
    description: `Utilidad del sistema AutaMedica para ${exportName.toLowerCase()}.`
  };
}

/**
 * Lee el glosario actual
 */
function readGlosario() {
  try {
    const glosarioPath = join(rootDir, 'docs', 'GLOSARIO_MAESTRO.md');
    const content = readFileSync(glosarioPath, 'utf-8');
    return content;
  } catch (error) {
    log(`❌ Error al leer GLOSARIO_MAESTRO.md: ${error.message}`, 'red');
    return '';
  }
}

/**
 * Extrae exports ya documentados del glosario
 */
function getDocumentedExports(glosarioContent) {
  const documented = new Set();

  // Buscar headers ### que representan exports documentados
  const headerRegex = /^### (.+)$/gm;
  let match;
  while ((match = headerRegex.exec(glosarioContent)) !== null) {
    const exportName = match[1].trim();
    documented.add(exportName);
  }

  return documented;
}

/**
 * Genera entrada de documentación para un export
 */
function generateDocEntry(exportName, analysis, packageName) {
  const { type, description } = analysis;

  return `### ${exportName}
- **Tipo:** ${type}
- **Package:** ${packageName}
- **Descripción:** ${description}
- **Contrato:** Pendiente de documentación detallada
`;
}

/**
 * Actualiza el glosario con nuevas entradas
 */
function updateGlosario(newEntries) {
  if (newEntries.length === 0) {
    log('✅ No hay nuevos exports para documentar', 'green');
    return false;
  }

  const glosarioPath = join(rootDir, 'docs', 'GLOSARIO_MAESTRO.md');
  let content = readGlosario();

  // Buscar la sección donde agregar nuevos exports
  const insertPoint = content.lastIndexOf('\n## ') || content.length;

  // Crear sección de nuevos exports
  const newSection = `\n## 📋 Exports Auto-generados\n\n${newEntries.join('\n')}`;

  // Insertar antes de la última sección o al final
  const updatedContent = content.slice(0, insertPoint) + newSection + content.slice(insertPoint);

  try {
    writeFileSync(glosarioPath, updatedContent, 'utf-8');
    log(`✅ Glosario actualizado con ${newEntries.length} nuevas entradas`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error al escribir GLOSARIO_MAESTRO.md: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  log('🔍 Generando documentación automática para exports faltantes...', 'cyan');

  const packages = [
    { path: 'packages/types', name: '@autamedica/types' },
    { path: 'packages/shared', name: '@autamedica/shared' },
    { path: 'packages/auth', name: '@autamedica/auth' },
    { path: 'packages/hooks', name: '@autamedica/hooks' }
  ];

  const glosarioContent = readGlosario();
  const documentedExports = getDocumentedExports(glosarioContent);

  const newEntries = [];
  let totalMissing = 0;

  for (const pkg of packages) {
    log(`📦 Analizando ${pkg.name}...`, 'blue');

    const exports = getPackageExports(pkg.path);
    const missingExports = exports.filter(exp => !documentedExports.has(exp));

    if (missingExports.length > 0) {
      log(`   📋 Encontrados ${missingExports.length} exports sin documentar`, 'yellow');

      for (const exportName of missingExports) {
        const analysis = analyzeExport(exportName, pkg.path);
        const entry = generateDocEntry(exportName, analysis, pkg.name);
        newEntries.push(entry);
        totalMissing++;

        log(`   ✨ ${exportName} (${analysis.type})`, 'magenta');
      }
    } else {
      log(`   ✅ Todos los exports están documentados`, 'green');
    }
  }

  if (totalMissing > 0) {
    log(`\n📝 Generando documentación para ${totalMissing} exports...`, 'cyan');
    const updated = updateGlosario(newEntries);

    if (updated) {
      log(`\n🎉 ¡Documentación generada exitosamente!`, 'green');
      log(`📖 Revisa docs/GLOSARIO_MAESTRO.md para ajustar descripciones si es necesario`, 'yellow');
    }
  } else {
    log('\n✅ ¡Todos los exports ya están documentados!', 'green');
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`💥 Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { main as autoGenerateDocs };