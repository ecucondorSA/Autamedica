#!/usr/bin/env node

/**
 * Script de validación anti-hardcode para AutaMedica
 *
 * Detecta patrones prohibidos de código hardcodeado:
 * - Nombres de usuarios ficticios (Dr. Invitado, Carlos Ruiz, etc.)
 * - Datos de demo (Consultas activas X/Y hardcodeado)
 * - Horarios hardcodeados con nombres (Próxima: HH:MM - Nombre)
 * - FALLBACK constants sin uso de datos reales primero
 *
 * Uso:
 *   node scripts/validate-no-hardcode.mjs
 *   node scripts/validate-no-hardcode.mjs --fix
 *
 * Exit codes:
 *   0 - Sin violaciones
 *   1 - Violaciones encontradas
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')

// Patrones prohibidos
const FORBIDDEN_PATTERNS = [
  {
    pattern: /Dr\.\s+Invitado/g,
    message: 'Nombre de usuario hardcodeado "Dr. Invitado"',
    severity: 'error'
  },
  {
    pattern: /Carlos\s+Ruiz/g,
    message: 'Nombre de paciente hardcodeado "Carlos Ruiz"',
    severity: 'error'
  },
  {
    pattern: /Consultas\s+activas\s+\d+\/\d+/g,
    message: 'Estadísticas de consultas hardcodeadas',
    severity: 'error'
  },
  {
    pattern: /Próxima:\s*\d{1,2}:\d{2}\s*-\s*[A-Z][a-z]+\s+[A-Z]/g,
    message: 'Cita hardcodeada con nombre específico',
    severity: 'error'
  },
  {
    pattern: /const\s+FALLBACK_USER\s*=\s*['"]/g,
    message: 'FALLBACK_USER definido sin strategy de datos reales primero',
    severity: 'warning'
  },
  {
    pattern: /useState\(['"](Dr\.|Dra\.)\s+[A-Z]/g,
    message: 'useState inicializado con nombre hardcodeado',
    severity: 'error'
  }
]

// Directorios a escanear
const SCAN_DIRS = [
  'apps/doctors/src',
  'apps/patients/src',
  'apps/companies/src',
  'apps/admin/src',
  'apps/web-app/src'
]

// Archivos excluidos
const EXCLUDED_FILES = [
  'node_modules',
  '.next',
  'dist',
  '.turbo',
  '.git',
  'test',
  '__tests__',
  'test-webrtc-simple.html' // Test file allowed to have hardcode
]

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function shouldExcludeFile(filePath) {
  return EXCLUDED_FILES.some(excluded => filePath.includes(excluded))
}

function scanFile(filePath) {
  const violations = []

  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    for (const { pattern, message, severity } of FORBIDDEN_PATTERNS) {
      lines.forEach((line, index) => {
        const matches = line.matchAll(pattern)
        for (const match of matches) {
          violations.push({
            file: relative(ROOT_DIR, filePath),
            line: index + 1,
            column: match.index + 1,
            message,
            severity,
            code: line.trim()
          })
        }
      })
    }
  } catch (error) {
    console.error(`${colors.red}Error reading file ${filePath}:${colors.reset}`, error.message)
  }

  return violations
}

function scanDirectory(dir) {
  let allViolations = []

  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)

      if (shouldExcludeFile(fullPath)) {
        continue
      }

      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        allViolations = allViolations.concat(scanDirectory(fullPath))
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry)) {
        const violations = scanFile(fullPath)
        allViolations = allViolations.concat(violations)
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error scanning directory ${dir}:${colors.reset}`, error.message)
  }

  return allViolations
}

function printViolations(violations) {
  const errors = violations.filter(v => v.severity === 'error')
  const warnings = violations.filter(v => v.severity === 'warning')

  console.log(`\n${colors.bold}${colors.cyan}🔍 Validación Anti-Hardcode${colors.reset}\n`)

  if (violations.length === 0) {
    console.log(`${colors.green}✅ No se encontraron violaciones de código hardcodeado${colors.reset}\n`)
    return 0
  }

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ ERRORES (${errors.length}):${colors.reset}\n`)
    errors.forEach(v => {
      console.log(`${colors.red}  ${v.file}:${v.line}:${v.column}${colors.reset}`)
      console.log(`  ${colors.yellow}${v.message}${colors.reset}`)
      console.log(`  ${colors.cyan}${v.code}${colors.reset}\n`)
    })
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  WARNINGS (${warnings.length}):${colors.reset}\n`)
    warnings.forEach(v => {
      console.log(`${colors.yellow}  ${v.file}:${v.line}:${v.column}${colors.reset}`)
      console.log(`  ${v.message}`)
      console.log(`  ${colors.cyan}${v.code}${colors.reset}\n`)
    })
  }

  console.log(`${colors.bold}Resumen:${colors.reset}`)
  console.log(`  Errores: ${colors.red}${errors.length}${colors.reset}`)
  console.log(`  Warnings: ${colors.yellow}${warnings.length}${colors.reset}\n`)

  return errors.length > 0 ? 1 : 0
}

function main() {
  console.log(`${colors.cyan}Escaneando apps para detectar código hardcodeado...${colors.reset}\n`)

  let allViolations = []

  for (const scanDir of SCAN_DIRS) {
    const fullPath = join(ROOT_DIR, scanDir)
    try {
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        console.log(`Escaneando ${scanDir}...`)
        const violations = scanDirectory(fullPath)
        allViolations = allViolations.concat(violations)
      }
    } catch (error) {
      // Directory doesn't exist, skip
      console.log(`  ${colors.yellow}⚠ ${scanDir} no existe, omitido${colors.reset}`)
    }
  }

  const exitCode = printViolations(allViolations)
  process.exit(exitCode)
}

main()
