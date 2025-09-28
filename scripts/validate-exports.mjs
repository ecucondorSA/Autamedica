#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

/**
 * Valida que todos los exports documentados en el glosario estén implementados
 * y que no haya exports no documentados
 */

async function validateExports() {
  console.log("🔍 Validating exports against GLOSARIO_MAESTRO.md...");

  try {
    // Leer el glosario maestro
    const glosarioPath = "docs/GLOSARIO_MAESTRO.md";
    const glosario = fs.readFileSync(glosarioPath, "utf8");

    // Extraer exports esperados del glosario
    const expectedExports = extractExpectedExports(glosario);

    // Lista de tipos críticos que requieren ADR si cambian
    const CRITICAL_TYPES = [
      'PatientId', 'DoctorId', 'CompanyId', 'UUID',
      'Patient', 'Doctor', 'Appointment', 'MedicalRecord',
      'APIResponse', 'AuthUser', 'UserRole',
      'ISODateString', 'EmailAddress', 'PhoneNumber'
    ];

    // Validar cada package
    const packages = ["types", "shared", "auth", "hooks"];
    let hasErrors = false;
    let hasCriticalChanges = false;

    for (const pkg of packages) {
      const packagePath = `packages/${pkg}/src/index.ts`;

      if (!fs.existsSync(packagePath)) {
        console.error(`❌ Package index not found: ${packagePath}`);
        hasErrors = true;
        continue;
      }

      const indexContent = fs.readFileSync(packagePath, "utf8");
      const actualExports = extractActualExports(indexContent);
      const expected = expectedExports[`@autamedica/${pkg}`] || [];

      // Verificar exports faltantes
      const missing = expected.filter(exp => !actualExports.includes(exp));
      if (missing.length > 0) {
        console.error(`❌ @autamedica/${pkg} missing exports:`, missing.join(", "));
        hasErrors = true;
      }

      // Verificar exports no documentados
      const undocumented = actualExports.filter(exp => !expected.includes(exp));
      if (undocumented.length > 0) {
        console.warn(`⚠️  @autamedica/${pkg} undocumented exports:`, undocumented.join(", "));

        // Verificar si hay tipos críticos no documentados
        const criticalUndocumented = undocumented.filter(exp => CRITICAL_TYPES.includes(exp));
        if (criticalUndocumented.length > 0) {
          console.error(`🚨 CRITICAL: Undocumented critical types: ${criticalUndocumented.join(", ")}`);
          console.error(`   These require documentation in GLOSARIO_MAESTRO.md and ADR if breaking change`);
          hasErrors = true;
          hasCriticalChanges = true;
        }
      }

      // Verificar cambios en tipos críticos (para packages types)
      if (pkg === 'types') {
        const criticalExports = actualExports.filter(exp => CRITICAL_TYPES.includes(exp));
        if (criticalExports.length > 0) {
          console.log(`🔒 Critical types found: ${criticalExports.join(", ")}`);

          // Si es CI, verificar si hay ADR para cambios críticos
          if (process.env.CI && hasCriticalChanges) {
            const adrPath = 'docs/adr';
            if (!fs.existsSync(adrPath)) {
              console.error(`🚨 CRITICAL: No ADR directory found at ${adrPath}`);
              console.error(`   Critical type changes require Architecture Decision Records`);
              hasErrors = true;
            } else {
              console.log(`📋 ADR directory exists - ensure critical changes are documented`);
            }
          }
        }
      }

      if (!hasErrors) {
        console.log(`✅ @autamedica/${pkg} exports are valid`);
      }
    }

    if (hasErrors) {
      console.error("\n❌ Export validation failed!");
      process.exit(1);
    } else {
      console.log("\n🎉 All exports are properly documented and implemented!");
    }

  } catch (error) {
    console.error("❌ Validation script failed:", error.message);
    process.exit(1);
  }
}

function extractExpectedExports(glosarioContent) {
  const exports = {};

  // Regex para capturar bloques de exports por package
  const packageRegex = /### @autamedica\/([^\n]+)[\s\S]*?```typescript[\s\S]*?export \{([^}]+)\}/g;

  let match;
  while ((match = packageRegex.exec(glosarioContent)) !== null) {
    const packageName = match[1];
    const exportsStr = match[2];

    const exportsList = exportsStr
      .split(",")
      .map(exp => exp.trim())
      .filter(exp => exp && !exp.includes("//"))
      .map(exp => exp.replace(/^.*from.*$/, "").trim())
      .filter(Boolean);

    exports[`@autamedica/${packageName}`] = exportsList;
  }

  return exports;
}

function extractActualExports(indexContent) {
  const exports = [];

  // Regex para capturar exports named
  const namedExportsRegex = /export \{([^}]+)\}/g;

  let match;
  while ((match = namedExportsRegex.exec(indexContent)) !== null) {
    const exportsStr = match[1];
    const exportsList = exportsStr
      .split(",")
      .map(exp => exp.trim())
      .filter(exp => exp && !exp.includes("from"));

    exports.push(...exportsList);
  }

  // Regex para type exports
  const typeExportsRegex = /export type \{([^}]+)\}/g;
  while ((match = typeExportsRegex.exec(indexContent)) !== null) {
    const exportsStr = match[1];
    const exportsList = exportsStr
      .split(",")
      .map(exp => exp.trim())
      .filter(exp => exp && !exp.includes("from"));

    exports.push(...exportsList);
  }

  return exports;
}

validateExports();