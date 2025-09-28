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

      console.log(`📚 Tipos documentados en glosario: ${this.documentedTypes.size}`);

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
          // Manejar alias: export { Foo as Bar }
          const aliasMatch = exp.match(/(\w+)\s+as\s+(\w+)/);
          if (aliasMatch) {
            this.actualExports.add(aliasMatch[2]); // Usar el alias
          } else {
            this.actualExports.add(exp);
          }
        });
      }

      console.log(`📦 Exports reales en @autamedica/types: ${this.actualExports.size}`);

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
      // IDs deben terminar en "Id"
      if (typeName.toLowerCase().includes('id') && !typeName.endsWith('Id')) {
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
    console.log(`${colors.blue}🏛️  Autamedica Contracts Validator${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`📋 Validando contratos según Glosario Maestro v1.0`);
    console.log('');

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
    console.log(`${colors.blue}📊 RESULTADOS DE VALIDACIÓN${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    const totalIssues = this.errors.length + this.warnings.length;

    console.log(`📈 Total de issues: ${totalIssues}`);
    console.log(`${colors.red}❌ Errores críticos: ${this.errors.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.blue}💡 Sugerencias: ${this.suggestions.length}${colors.reset}`);
    console.log('');

    // Mostrar errores críticos
    if (this.errors.length > 0) {
      console.log(`${colors.red}${colors.bold}ERRORES CRÍTICOS:${colors.reset}`);
      this.errors.forEach((error, index) => {
        console.log(`${colors.red}${index + 1}. ${error.message}${colors.reset}`);
        if (error.context) {
          console.log(`   📁 ${error.context}`);
        }
      });
      console.log('');
    }

    // Mostrar warnings importantes
    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bold}WARNINGS (Documentación):${colors.reset}`);
      this.warnings.slice(0, 5).forEach((warning, index) => {
        console.log(`${colors.yellow}${index + 1}. ${warning.message}${colors.reset}`);
      });
      if (this.warnings.length > 5) {
        console.log(`${colors.yellow}... y ${this.warnings.length - 5} warnings más${colors.reset}`);
      }
      console.log('');
    }

    // Mostrar sugerencias
    if (this.suggestions.length > 0) {
      console.log(`${colors.blue}💡 SUGERENCIAS DE MEJORA:${colors.reset}`);
      this.suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`${colors.blue}${index + 1}. ${suggestion.message}${colors.reset}`);
      });
      console.log('');
    }

    // Resumen y acción requerida
    if (totalIssues === 0) {
      console.log(`${colors.green}🎉 ¡PERFECTO! Todos los contratos están validados${colors.reset}`);
      console.log(`${colors.green}✅ Exports documentados: ${this.actualExports.size}${colors.reset}`);
      console.log(`${colors.green}✅ Glosario sincronizado${colors.reset}`);
      console.log(`${colors.green}✅ Naming conventions OK${colors.reset}`);
    } else {
      console.log(`${colors.yellow}🛠️  PLAN DE CORRECCIÓN:${colors.reset}`);

      if (this.errors.length > 0) {
        console.log('1️⃣ Documentar tipos faltantes en docs/GLOSARIO_MAESTRO.md');
        console.log('2️⃣ Seguir convenciones de naming (IDs, branded types)');
      }

      if (this.warnings.length > 0) {
        console.log('3️⃣ Revisar tipos documentados pero no exportados');
        console.log('4️⃣ Actualizar glosario si tipos fueron removidos');
      }

      console.log('');
      console.log(`${colors.blue}📚 Referencias:${colors.reset}`);
      console.log('• Glosario Maestro: docs/GLOSARIO_MAESTRO.md');
      console.log('• Package Types: packages/types/src/index.ts');
      console.log('• Reglas de naming: ver glosario sección "Convenciones"');
    }

    // Exit code
    if (this.errors.length > 0) {
      console.log(`${colors.red}❌ Validación de contratos falló${colors.reset}`);
      process.exit(1);
    } else if (this.warnings.length > 3) {
      console.log(`${colors.yellow}⚠️  Demasiados warnings, revisar sincronización${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Validación de contratos exitosa${colors.reset}`);
      process.exit(0);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const validator = new ContractsValidator();
  validator.validate().catch(error => {
    console.error(`${colors.red}❌ Error ejecutando validator: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = ContractsValidator;