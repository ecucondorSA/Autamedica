#!/usr/bin/env node

/**
 * check-glossary.js - Validador de terminología médica para Autamedica
 *
 * Valida que el código fuente siga las convenciones de nomenclatura médica
 * y terminología específica del proyecto Autamedica.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

class GlossaryChecker {
  constructor() {
    this.glossary = this.loadGlossary();
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }

  loadGlossary() {
    try {
      const glossaryPath = path.join(process.cwd(), 'glossary.json');
      return JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
    } catch (error) {
      console.error(`${colors.red}❌ Error cargando glossary.json: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  log(level, message, file = '', line = 0) {
    const entry = { level, message, file, line, timestamp: new Date().toISOString() };

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

  checkForbiddenTerms(content, filePath) {
    const allForbidden = [
      ...this.glossary.forbidden.general,
      ...this.glossary.forbidden.medical,
      ...this.glossary.forbidden.security
    ];

    allForbidden.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = content.match(regex);

      if (matches) {
        matches.forEach(() => {
          this.log('error',
            `Término prohibido encontrado: "${term}"`,
            filePath
          );
        });
      }
    });
  }

  checkPreferredTerminology(content, filePath) {
    Object.entries(this.glossary.preferred.terminology).forEach(([incorrect, correct]) => {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      const matches = content.match(regex);

      if (matches) {
        matches.forEach(() => {
          this.log('warning',
            `Usar "${correct}" en lugar de "${incorrect}"`,
            filePath
          );
        });
      }
    });
  }

  checkVariableNaming(content, filePath) {
    // Buscar declaraciones de variables
    const variableRegex = /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variableName = match[2];

      // Verificar abreviaciones prohibidas
      this.glossary.patterns.variables.no_abbreviations.forEach(abbrev => {
        if (variableName.toLowerCase().includes(abbrev)) {
          this.log('warning',
            `Evitar abreviación "${abbrev}" en variable "${variableName}". Usar nombre descriptivo.`,
            filePath
          );
        }
      });

      // Verificar camelCase
      if (this.glossary.patterns.variables.camelCase) {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(variableName) && !variableName.startsWith('_')) {
          this.log('suggestion',
            `Variable "${variableName}" debería usar camelCase`,
            filePath
          );
        }
      }
    }
  }

  checkComponentNaming(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));

    // Verificar sufijos prohibidos
    this.glossary.patterns.components.forbidden_suffixes.forEach(suffix => {
      if (fileName.endsWith(suffix)) {
        this.log('error',
          `Archivo "${fileName}" no debe terminar en "${suffix}"`,
          filePath
        );
      }
    });

    // Verificar nombres prohibidos
    this.glossary.patterns.files.forbidden_names.forEach(forbiddenName => {
      if (path.basename(filePath).toLowerCase() === forbiddenName.toLowerCase()) {
        this.log('error',
          `Nombre de archivo prohibido: "${forbiddenName}"`,
          filePath
        );
      }
    });
  }

  checkHIPAACompliance(content, filePath) {
    // Buscar console.log con posibles datos médicos
    const consoleLogRegex = /console\.(log|info|debug|warn|error)\s*\([^)]*\)/g;
    let match;

    while ((match = consoleLogRegex.exec(content)) !== null) {
      const logContent = match[0].toLowerCase();

      // Palabras que podrían indicar datos médicos
      const medicalDataIndicators = [
        'patient', 'paciente', 'medical', 'médico', 'diagnosis', 'diagnóstico',
        'prescription', 'prescripción', 'treatment', 'tratamiento', 'phi', 'pii'
      ];

      medicalDataIndicators.forEach(indicator => {
        if (logContent.includes(indicator)) {
          this.log('error',
            `Posible violación HIPAA: console.log con datos médicos detectado ("${indicator}")`,
            filePath
          );
        }
      });
    }

    // Verificar comentarios requeridos para PHI
    const phiRegex = /\b(phi|pii|patient.*data|medical.*record|health.*information)\b/gi;
    if (phiRegex.test(content)) {
      const hasRequiredComment = this.glossary.compliance.hipaa.required_comments.some(
        comment => content.toLowerCase().includes(comment.toLowerCase())
      );

      if (!hasRequiredComment) {
        this.log('warning',
          'Archivo maneja datos PHI pero no tiene comentarios de compliance HIPAA requeridos',
          filePath
        );
      }
    }
  }

  async checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Ejecutar todas las validaciones
      this.checkForbiddenTerms(content, filePath);
      this.checkPreferredTerminology(content, filePath);
      this.checkVariableNaming(content, filePath);
      this.checkComponentNaming(filePath);
      this.checkHIPAACompliance(content, filePath);

    } catch (error) {
      this.log('error', `Error leyendo archivo: ${error.message}`, filePath);
    }
  }

  async checkProject() {
    console.log(`${colors.blue}🔍 Autamedica Glossary Checker${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`📋 Validando terminología médica según ${this.glossary.metadata.name} v${this.glossary.metadata.version}`);
    console.log('');

    // Patrones de archivos a validar (solo nuestro código fuente)
    const patterns = [
      'apps/web-app/src/**/*.{ts,tsx,js,jsx}',
      'apps/doctors/src/**/*.{ts,tsx,js,jsx}',
      'apps/patients/src/**/*.{ts,tsx,js,jsx}',
      'apps/companies/src/**/*.{ts,tsx,js,jsx}',
      'apps/admin/src/**/*.{ts,tsx,js,jsx}',
      'packages/*/src/**/*.{ts,tsx,js,jsx}',
      'scripts/**/*.js'
    ];

    const files = [];
    patterns.forEach(pattern => {
      try {
        const matched = glob.sync(pattern, { cwd: process.cwd() });
        files.push(...matched);
      } catch (error) {
        // Ignorar errores de glob
      }
    });

    const uniqueFiles = [...new Set(files)];
    console.log(`📁 Analizando ${uniqueFiles.length} archivos...`);
    console.log('');

    // Procesar archivos
    for (const file of uniqueFiles) {
      await this.checkFile(file);
    }

    this.printResults();
  }

  printResults() {
    console.log(`${colors.blue}📊 RESULTADOS DEL ANÁLISIS${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    const totalIssues = this.errors.length + this.warnings.length;

    console.log(`📈 Total de issues: ${totalIssues}`);
    console.log(`${colors.red}❌ Errores: ${this.errors.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
    console.log(`${colors.blue}💡 Sugerencias: ${this.suggestions.length}${colors.reset}`);
    console.log('');

    if (this.errors.length > 0) {
      console.log(`${colors.red}${colors.bold}ERRORES CRÍTICOS:${colors.reset}`);
      this.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${colors.red}${index + 1}. ${error.file}: ${error.message}${colors.reset}`);
      });
      if (this.errors.length > 10) {
        console.log(`${colors.red}... y ${this.errors.length - 10} errores más${colors.reset}`);
      }
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log(`${colors.yellow}${colors.bold}WARNINGS (Terminología):${colors.reset}`);
      this.warnings.slice(0, 5).forEach((warning, index) => {
        console.log(`${colors.yellow}${index + 1}. ${warning.file}: ${warning.message}${colors.reset}`);
      });
      if (this.warnings.length > 5) {
        console.log(`${colors.yellow}... y ${this.warnings.length - 5} warnings más${colors.reset}`);
      }
      console.log('');
    }

    if (this.suggestions.length > 0) {
      console.log(`${colors.blue}💡 SUGERENCIAS DE MEJORA:${colors.reset}`);
      this.suggestions.slice(0, 3).forEach((suggestion, index) => {
        console.log(`${colors.blue}${index + 1}. ${suggestion.message}${colors.reset}`);
      });
      console.log('');
    }

    // Resumen y recomendaciones
    if (totalIssues === 0) {
      console.log(`${colors.green}🎉 ¡PERFECTO! El código cumple con todas las convenciones de Autamedica${colors.reset}`);
      console.log(`${colors.green}✅ Terminología médica consistente${colors.reset}`);
      console.log(`${colors.green}✅ Naming conventions correctas${colors.reset}`);
      console.log(`${colors.green}✅ Compliance HIPAA verificado${colors.reset}`);
    } else {
      console.log(`${colors.yellow}🛠️  PLAN DE CORRECCIÓN:${colors.reset}`);

      if (this.errors.length > 0) {
        console.log('1️⃣ Corregir errores críticos (términos prohibidos, violaciones HIPAA)');
      }

      if (this.warnings.length > 0) {
        console.log('2️⃣ Revisar warnings de terminología médica');
      }

      if (this.suggestions.length > 0) {
        console.log('3️⃣ Considerar sugerencias de naming conventions');
      }

      console.log('');
      console.log(`${colors.blue}📚 Referencia: consultar glossary.json para convenciones completas${colors.reset}`);
    }

    // Exit code
    if (this.errors.length > 0) {
      console.log(`${colors.red}❌ Falló la validación de glosario${colors.reset}`);
      process.exit(1);
    } else if (this.warnings.length > 5) {
      console.log(`${colors.yellow}⚠️  Demasiados warnings, revisar terminología${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}✅ Validación de glosario exitosa${colors.reset}`);
      process.exit(0);
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const checker = new GlossaryChecker();
  checker.checkProject().catch(error => {
    console.error(`${colors.red}❌ Error ejecutando glossary checker: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = GlossaryChecker;