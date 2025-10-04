#!/usr/bin/env node

/**
 * validate-contracts.js - Validador de Contratos Autamedica
 *
 * Verifica que todos los exports de @autamedica/types estén documentados
 * en el Glosario Maestro y cumplan las reglas establecidas.
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

class ContractsValidator {
  constructor() {
    this.glossaryPath = path.join(process.cwd(), 'docs/GLOSARIO_MAESTRO.md');
    this.typesPath = path.join(process.cwd(), 'packages/types/src');
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
    this.documentedTypes = new Set();
    this.actualExports = new Set();
  }

  log(level, message, context = '') {
    const entry = { level, message, context, timestamp: new Date().toISOString() };

    switch (level) {
      case 'error':
        this.errors.push(entry);
        break;
      case 'warning':
        this.warnings.push(entry);
        break;
      case 'suggestion':
        this.suggestions.push(entry);
        break;
    }
  }

  /**
   * Extrae todos los tipos documentados del glosario maestro
   */
  parseGlossary() {
    try {
      const glossaryContent = fs.readFileSync(this.glossaryPath, 'utf8');

      // Extraer tipos de bloques de código TypeScript
      const codeBlockRegex = /```typescript\n([\s\S]*?)\n```/g;
      let match;

      while ((match = codeBlockRegex.exec(glossaryContent)) !== null) {
        const codeBlock = match[1];

        // Extraer exports de tipo
        const exportRegex = /export\s+(?:type|interface|enum|const)\s+([A-Za-z0-9_]+)/g;
        let exportMatch;

        while ((exportMatch = exportRegex.exec(codeBlock)) !== null) {
          const typeName = exportMatch[1];
          this.documentedTypes.add(typeName);
        }
      }

      logger.info(`📚 Tipos documentados en glosario: ${this.documentedTypes.size}`);

    } catch (error) {
      this.log('error', `Error leyendo glosario: ${error.message}`, this.glossaryPath);
    }
  }

  /**
   * Extrae todos los exports reales de @autamedica/types
   */
  parseActualExports() {
    try {
      const indexPath = path.join(this.typesPath, 'index.ts');

      if (!fs.existsSync(indexPath)) {
        this.log('error', 'Archivo packages/types/src/index.ts no encontrado');
        return;
      }

      const indexContent = fs.readFileSync(indexPath, 'utf8');

      // Extraer exports directos
      const directExportRegex = /export\s+(?:type|interface|enum|const)\s+([A-Za-z0-9_]+)/g;
      let match;

      while ((match = directExportRegex.exec(indexContent)) !== null) {
        const typeName = match[1];
        this.actualExports.add(typeName);
      }

      // Extraer re-exports (export { ... } from './...')
      const reExportRegex = /export\s+\{\s*([^}]+)\s*\}/g;
      while ((match = reExportRegex.exec(indexContent)) !== null) {
        const exports = match[1];
        // Separar múltiples exports
        const exportList = exports.split(',').map(exp => exp.trim());

        exportList.forEach(exp => {
          // Skip empty exports
          if (!exp || exp.trim() === '') return;

          // Manejar alias: export { Foo as Bar }
          const aliasMatch = exp.match(/(\w+)\s+as\s+(\w+)/);
          if (aliasMatch) {
            this.actualExports.add(aliasMatch[2]); // Usar el alias
          } else {
            this.actualExports.add(exp);
          }
        });
      }

      logger.info(`📦 Exports reales en @autamedica/types: ${this.actualExports.size}`);

    } catch (error) {
      this.log('error', `Error leyendo exports: ${error.message}`, this.typesPath);
    }
  }

  /**
   * Valida que todos los exports estén documentados
   */
  validateExportsDocumentation() {
    // Exports no documentados
    for (const exportName of this.actualExports) {
      if (!this.documentedTypes.has(exportName)) {
        this.log('error',
          `Tipo '${exportName}' exportado pero NO documentado en glosario`,
          'packages/types/src/index.ts'
        );
      }
    }

    // Tipos documentados pero no exportados (pueden ser válidos si están en desarrollo)
    for (const documentedType of this.documentedTypes) {
      if (!this.actualExports.has(documentedType)) {
        this.log('warning',
          `Tipo '${documentedType}' documentado en glosario pero NO exportado`,
          'docs/GLOSARIO_MAESTRO.md'
        );
      }
    }
  }

  /**
   * Verifica reglas de naming conventions
   */
  validateNamingConventions() {
    for (const typeName of this.actualExports) {
      // Solo flagear como ID types si realmente son branded ID types, no validadores
      const isLikelyIdType = (
        typeName.toLowerCase().includes('id') &&
        !typeName.endsWith('Id') &&
        !typeName.startsWith('isValid') &&
        !typeName.startsWith('validate') &&
        !typeName.startsWith('generate') &&
        !typeName.includes('CONFIG') &&
        !typeName.includes('VALIDATION') &&
        !typeName.includes('PROVIDERS') &&
        !typeName.startsWith('is') &&
        !typeName.includes('idle')
      );

      if (isLikelyIdType) {
        this.log('error',
          `Tipo '${typeName}' parece ser un ID pero no sigue la convención *Id`,
          'Naming Convention'
        );
      }

      // Branded types para identificadores
      if (typeName.endsWith('Id') && typeName !== 'UUID') {
        // Verificar que esté branded correctamente (esto requeriría análisis más profundo)
        this.log('suggestion',
          `Verificar que '${typeName}' sea un branded type basado en UUID`,
          'Branded Types'
        );
      }

      // Evitar nombres genéricos
      const genericNames = ['Data', 'Info', 'Item', 'Object', 'Type', 'Model'];
      if (genericNames.some(generic => typeName.includes(generic))) {
        this.log('warning',
          `Tipo '${typeName}' usa nombre genérico. Considerar algo más específico`,
          'Semantic Naming'
        );
      }
    }
  }

  /**
   * Verifica estructura de directorios y organización
   */
  validateStructure() {
    const expectedDirs = ['entities', 'api', 'utils'];

    expectedDirs.forEach(dir => {
      const dirPath = path.join(this.typesPath, dir);
      if (!fs.existsSync(dirPath)) {
        this.log('suggestion',
          `Directorio '${dir}' no encontrado. Considerar organizacion: entities/, api/, utils/`,
          'Package Structure'
        );
      }
    });
  }

  /**
   * Ejecuta todas las validaciones
   */
  async validate() {
    logger.info(`${colors.blue}🏛️  Autamedica Contracts Validator${colors.reset}`);
    logger.info(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    logger.info(`📋 Validando contratos según Glosario Maestro v1.0`);
    logger.info('');

    // Ejecutar validaciones
    this.parseGlossary();
    this.parseActualExports();
    this.validateExportsDocumentation();
    this.validateNamingConventions();
    this.validateStructure();

    this.printResults();
  }

  /**
   * Imprime resultados del análisis
   */
  printResults() {
    logger.info(`${colors.blue}📊 RESULTADOS DE VALIDACIÓN${colors.reset}`);
    logger.info(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    const totalIssues = this.errors.length + this.warnings.length;

    logger.info(`📈 Total de issues: ${totalIssues}`);
    logger.info(`${colors.red}❌ Errores críticos: ${this.errors.length}${colors.reset}`);
    logger.info(`${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
    logger.info(`${colors.blue}💡 Sugerencias: ${this.suggestions.length}${colors.reset}`);
    logger.info('');

    // Mostrar errores críticos
    if (this.errors.length > 0) {
      logger.info(`${colors.red}${colors.bold}ERRORES CRÍTICOS:${colors.reset}`);
      this.errors.forEach((error, index) => {
        logger.info(`${colors.red}${index + 1}. ${error.message}${colors.reset}`);
        if (error.context) {
          logger.info(`   📁 ${error.context}`);
        }
      });
      logger.info('');
    }

    // Mostrar warnings importantes
    if (this.warnings.length > 0) {
      logger.info(`${colors.yellow}${colors.bold}WARNINGS (Documentación):${colors.reset}`);
      this.warnings.slice(0, 5).forEach((warning, index) => {
        logger.info(`${colors.yellow}${index + 1}. ${warning.message}${colors.reset}`);
      });
      if (this.warnings.length > 5) {
        logger.info(`${colors.yellow}... y ${this.warnings.length - 5} warnings más${colors.reset}`);
      }
      logger.info('');
    }

    // Mostrar sugerencias
    if (this.suggestions.length > 0) {
      logger.info(`${colors.blue}💡 SUGERENCIAS DE MEJORA:${colors.reset}`);
      this.suggestions.slice(0, 3).forEach((suggestion, index) => {
        logger.info(`${colors.blue}${index + 1}. ${suggestion.message}${colors.reset}`);
      });
      logger.info('');
    }

    // Resumen y acción requerida
    if (totalIssues === 0) {
      logger.info(`${colors.green}🎉 ¡PERFECTO! Todos los contratos están validados${colors.reset}`);
      logger.info(`${colors.green}✅ Exports documentados: ${this.actualExports.size}${colors.reset}`);
      logger.info(`${colors.green}✅ Glosario sincronizado${colors.reset}`);
      logger.info(`${colors.green}✅ Naming conventions OK${colors.reset}`);
    } else {
      logger.info(`${colors.yellow}🛠️  PLAN DE CORRECCIÓN:${colors.reset}`);

      if (this.errors.length > 0) {
        logger.info('1️⃣ Documentar tipos faltantes en docs/GLOSARIO_MAESTRO.md');
        logger.info('2️⃣ Seguir convenciones de naming (IDs, branded types)');
      }

      if (this.warnings.length > 0) {
        logger.info('3️⃣ Revisar tipos documentados pero no exportados');
        logger.info('4️⃣ Actualizar glosario si tipos fueron removidos');
      }

      logger.info('');
      logger.info(`${colors.blue}📚 Referencias:${colors.reset}`);
      logger.info('• Glosario Maestro: docs/GLOSARIO_MAESTRO.md');
      logger.info('• Package Types: packages/types/src/index.ts');
      logger.info('• Reglas de naming: ver glosario sección "Convenciones"');
    }

    // Exit code
    if (this.errors.length > 0) {
      logger.info(`${colors.red}❌ Validación de contratos falló${colors.reset}`);
      process.exit(1);
    } else if (this.warnings.length > 3) {
      logger.info(`${colors.yellow}⚠️  Demasiados warnings, revisar sincronización${colors.reset}`);
      process.exit(1);
    } else {
      logger.info(`${colors.green}✅ Validación de contratos exitosa${colors.reset}`);
      process.exit(0);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const validator = new ContractsValidator();
  validator.validate().catch(error => {
    logger.error(`${colors.red}❌ Error ejecutando validator: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = ContractsValidator;