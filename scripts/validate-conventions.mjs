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
      let content = await fs.readFile(path.join(PROJECT_ROOT, file), "utf-8");

      // Eliminar comentarios para evitar falsos positivos
      // Remover comentarios de línea //
      content = content.replace(/\/\/.*$/gm, '');
      // Remover comentarios de bloque /* */
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');

      // Buscar type/interface declarations (solo export explícitos y declaraciones top-level)
      const typeMatches = content.matchAll(/^(?:export\s+)?(?:type|interface)\s+([A-Z][A-Za-z0-9_]*)/gm);

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

      // Lista completa de palabras clave SQL a ignorar
      const SQL_KEYWORDS = [
        "CREATE", "ALTER", "DROP", "TABLE", "INDEX", "PRIMARY", "KEY", "FOREIGN", "REFERENCES",
        "CONSTRAINT", "UNIQUE", "CHECK", "DEFAULT", "NOT", "NULL", "AUTO_INCREMENT", "SERIAL",
        "BIGSERIAL", "SMALLSERIAL", "BOOLEAN", "INTEGER", "BIGINT", "SMALLINT", "DECIMAL",
        "NUMERIC", "REAL", "DOUBLE", "PRECISION", "VARCHAR", "CHAR", "TEXT", "DATE", "TIME",
        "TIMESTAMP", "TIMESTAMPTZ", "INTERVAL", "UUID", "JSON", "JSONB", "ARRAY", "BYTEA",
        "SELECT", "INSERT", "UPDATE", "DELETE", "FROM", "WHERE", "AND", "OR", "IN", "IS",
        "LIKE", "BETWEEN", "ORDER", "BY", "GROUP", "HAVING", "LIMIT", "OFFSET", "JOIN",
        "LEFT", "RIGHT", "INNER", "OUTER", "CROSS", "ON", "AS", "DISTINCT", "UNION", "ALL",
        "CASE", "WHEN", "THEN", "ELSE", "END", "IF", "EXISTS", "ANY", "SOME", "CAST",
        "GRANT", "REVOKE", "EXECUTE", "FUNCTION", "PROCEDURE", "TRIGGER", "BEFORE", "AFTER",
        "FOR", "EACH", "ROW", "STATEMENT", "RETURNS", "RETURN", "DECLARE", "BEGIN", "LOOP",
        "WHILE", "REPEAT", "UNTIL", "EXIT", "CONTINUE", "RAISE", "EXCEPTION", "NOTICE",
        "WARNING", "INFO", "DEBUG", "LOG", "COMMENT", "DO", "LANGUAGE", "PLPGSQL", "SQL",
        "VOLATILE", "STABLE", "IMMUTABLE", "STRICT", "SECURITY", "DEFINER", "INVOKER",
        "OWNER", "TO", "WITH", "WITHOUT", "ZONE", "AT", "LOCAL", "SESSION", "CURRENT",
        "GENERATED", "ALWAYS", "IDENTITY", "INCREMENT", "MINVALUE", "MAXVALUE", "START",
        "CACHE", "CYCLE", "OWNED", "NONE", "REPLACE", "VIEW", "MATERIALIZED", "REFRESH",
        "CONCURRENTLY", "CASCADE", "RESTRICT", "SET", "RESET", "SHOW", "COPY", "EXPLAIN",
        "ANALYZE", "VACUUM", "REINDEX", "CLUSTER", "LISTEN", "NOTIFY", "UNLISTEN", "LOCK",
        "ADVISORY", "SHARE", "EXCLUSIVE", "ACCESS", "MODE", "NOWAIT", "SKIP", "LOCKED",
        "ONLY", "FIRST", "LAST", "NULLS", "ASC", "DESC", "USING", "OVER", "PARTITION",
        "WINDOW", "RANGE", "ROWS", "UNBOUNDED", "PRECEDING", "FOLLOWING", "EXCLUDE", "TIES",
        "CORRESPONDING", "NATURAL", "LATERAL", "ORDINALITY", "TABLESAMPLE", "BERNOULLI",
        "SYSTEM", "REPEATABLE", "RECURSIVE", "WITHIN", "FILTER", "VARIADIC", "SETOF", "OUT",
        "GET", "NO", "ADD", "DIAGNOSTICS", "FOUND", "ACTION", "ABSOLUTE", "RELATIVE"
      ];

      for (const match of columnMatches) {
        const columnName = match[1];

        // Ignorar palabras clave SQL (case-insensitive)
        if (SQL_KEYWORDS.includes(columnName.toUpperCase())) {
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

      // Excepciones permitidas para convenciones de framework
      const allowedFolders = [
        "app", "src", "components", "lib", "utils", "api", "public",
        // Next.js special folders
        "__tests__", // Jest/Vitest test folders
        // Next.js App Router route groups and dynamic routes
      ];

      if (allowedFolders.includes(folderName)) {
        continue;
      }

      // Permitir Next.js route groups: (group-name)
      if (folderName.match(/^\([a-z][a-z0-9-]*\)$/)) {
        continue;
      }

      // Permitir Next.js dynamic routes: [param] o [...param] o [[...param]]
      if (folderName.match(/^\[{1,2}\.{0,3}[a-zA-Z][a-zA-Z0-9]*\]{1,2}$/)) {
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

      // Permitir archivos de utilidades con sufijos especiales
      const allowedSuffixes = ["-helpers", "-utils", "-constants", "-types", "-config"];
      const hasAllowedSuffix = allowedSuffixes.some(suffix => fileName.endsWith(suffix));

      if (hasAllowedSuffix) {
        // Para archivos de utilidades, validar kebab-case
        if (!KEBAB_CASE_REGEX.test(fileName)) {
          this.addViolation(
            "COMPONENT_NAMING",
            file,
            `Archivo de utilidades "${fileName}.tsx" debe estar en kebab-case`
          );
          log(`  ❌ ${file}: debe ser kebab-case.tsx (archivo de utilidades)`, "red");
        }
      } else {
        // Para componentes React, validar PascalCase
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
