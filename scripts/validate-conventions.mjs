#!/usr/bin/env node
/**
 * AutaMedica - Validate Naming Conventions
 *
 * Valida convenciones SSK_FAE/snake_híbrido:
 * - DB (Supabase): snake_case para tablas/columnas
 * - TS types: PascalCase
 * - Variables TS: camelCase
 * - Carpetas: kebab-case
 * - Archivos componentes: PascalCase.tsx
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// Regexes para validación
const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;
const CAMEL_CASE_REGEX = /^[a-z][a-zA-Z0-9]*$/;
const SNAKE_CASE_REGEX = /^[a-z][a-z0-9_]*$/;
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9-]*$/;

class ConventionValidator {
  constructor() {
    this.violations = [];
  }

  addViolation(type, file, message) {
    this.violations.push({ type, file, message });
  }

  async validateTypeNames() {
    log("\n📋 Validando nombres de tipos (PascalCase)...", "cyan");

    const typeFiles = await glob("packages/*/src/**/*.ts", {
      cwd: PROJECT_ROOT,
      ignore: ["**/node_modules/**", "**/*.test.ts", "**/*.spec.ts"],
    });

    for (const file of typeFiles) {
      const content = await fs.readFile(path.join(PROJECT_ROOT, file), "utf-8");

      // Buscar type/interface declarations
      const typeMatches = content.matchAll(/(?:type|interface)\s+([A-Za-z0-9_]+)/g);

      for (const match of typeMatches) {
        const typeName = match[1];

        if (!PASCAL_CASE_REGEX.test(typeName)) {
          this.addViolation(
            "TYPE_NAMING",
            file,
            `Tipo "${typeName}" debe estar en PascalCase`
          );
          log(`  ❌ ${file}: ${typeName} debe ser PascalCase`, "red");
        }
      }
    }
  }

  async validateDatabaseNaming() {
    log("\n📋 Validando nombres de DB (snake_case)...", "cyan");

    const migrationFiles = await glob("supabase/migrations/*.sql", {
      cwd: PROJECT_ROOT,
    });

    for (const file of migrationFiles) {
      const content = await fs.readFile(path.join(PROJECT_ROOT, file), "utf-8");

      // Buscar CREATE TABLE statements
      const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi);

      for (const match of tableMatches) {
        const tableName = match[1];

        if (!SNAKE_CASE_REGEX.test(tableName)) {
          this.addViolation(
            "DB_TABLE_NAMING",
            file,
            `Tabla "${tableName}" debe estar en snake_case`
          );
          log(`  ❌ ${file}: ${tableName} debe ser snake_case`, "red");
        }
      }

      // Buscar nombres de columnas en CREATE TABLE
      const columnMatches = content.matchAll(/^\s+([a-zA-Z0-9_]+)\s+[A-Z]/gm);

      for (const match of columnMatches) {
        const columnName = match[1];

        // Ignorar palabras clave SQL
        if (["CREATE", "ALTER", "DROP", "TABLE", "INDEX"].includes(columnName.toUpperCase())) {
          continue;
        }

        if (!SNAKE_CASE_REGEX.test(columnName)) {
          this.addViolation(
            "DB_COLUMN_NAMING",
            file,
            `Columna "${columnName}" debe estar en snake_case`
          );
          log(`  ⚠️  ${file}: ${columnName} debe ser snake_case`, "yellow");
        }
      }
    }
  }

  async validateFolderNames() {
    log("\n📋 Validando nombres de carpetas (kebab-case)...", "cyan");

    const allDirs = await glob("apps/*/src/**/", {
      cwd: PROJECT_ROOT,
      ignore: ["**/node_modules/**", "**/.next/**"],
    });

    for (const dir of allDirs) {
      const folderName = path.basename(dir);

      // Excepciones permitidas
      if (["app", "src", "components", "lib", "utils", "api", "public"].includes(folderName)) {
        continue;
      }

      if (!KEBAB_CASE_REGEX.test(folderName)) {
        this.addViolation(
          "FOLDER_NAMING",
          dir,
          `Carpeta "${folderName}" debe estar en kebab-case`
        );
        log(`  ⚠️  ${dir}: debe ser kebab-case`, "yellow");
      }
    }
  }

  async validateComponentFiles() {
    log("\n📋 Validando nombres de componentes (PascalCase.tsx)...", "cyan");

    const componentFiles = await glob("apps/*/src/components/**/*.tsx", {
      cwd: PROJECT_ROOT,
      ignore: ["**/node_modules/**", "**/.next/**"],
    });

    for (const file of componentFiles) {
      const fileName = path.basename(file, ".tsx");

      if (!PASCAL_CASE_REGEX.test(fileName)) {
        this.addViolation(
          "COMPONENT_NAMING",
          file,
          `Componente "${fileName}.tsx" debe estar en PascalCase`
        );
        log(`  ❌ ${file}: debe ser PascalCase.tsx`, "red");
      }
    }
  }

  async validateRouterStructure() {
    log("\n📋 Validando estructura de Router (app/ no pages/)...", "cyan");

    // Verificar que no existan directorios pages/
    const pagesDir = await glob("apps/*/pages/", {
      cwd: PROJECT_ROOT,
      ignore: ["**/node_modules/**"],
    });

    if (pagesDir.length > 0) {
      for (const dir of pagesDir) {
        this.addViolation(
          "ROUTER_STRUCTURE",
          dir,
          `Directorio "pages/" detectado - AutaMedica usa App Router (app/)`
        );
        log(`  ❌ ${dir}: debe usar app/ en lugar de pages/`, "red");
      }
    } else {
      log("  ✅ No se detectaron directorios pages/", "green");
    }

    // Verificar que existan directorios app/
    const appDirs = await glob("apps/*/app/", {
      cwd: PROJECT_ROOT,
      ignore: ["**/node_modules/**"],
    });

    if (appDirs.length > 0) {
      log(`  ✅ Encontrados ${appDirs.length} directorios app/`, "green");
    }
  }

  printSummary() {
    log("\n" + "=".repeat(60), "cyan");
    log("📊 RESUMEN DE VALIDACIÓN", "cyan");
    log("=".repeat(60), "cyan");

    if (this.violations.length === 0) {
      log("\n✅ No se encontraron violaciones de convenciones", "green");
      return true;
    }

    log(`\n❌ Se encontraron ${this.violations.length} violaciones:\n`, "red");

    const groupedViolations = this.violations.reduce((acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v);
      return acc;
    }, {});

    for (const [type, violations] of Object.entries(groupedViolations)) {
      log(`\n${type} (${violations.length} violaciones):`, "yellow");
      for (const v of violations.slice(0, 5)) {
        log(`  - ${v.file}: ${v.message}`, "yellow");
      }
      if (violations.length > 5) {
        log(`  ... y ${violations.length - 5} más`, "yellow");
      }
    }

    return false;
  }
}

async function main() {
  log("🔍 AutaMedica - Validador de Convenciones", "cyan");
  log("=".repeat(60), "cyan");

  const validator = new ConventionValidator();

  try {
    await validator.validateTypeNames();
    await validator.validateDatabaseNaming();
    await validator.validateFolderNames();
    await validator.validateComponentFiles();
    await validator.validateRouterStructure();

    const success = validator.printSummary();

    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\n❌ Error fatal: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  }
}

main();
