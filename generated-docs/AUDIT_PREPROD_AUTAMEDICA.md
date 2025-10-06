# Auditoría Pre-Producción – AutaMedica
**Fecha**: 2025-10-05
**Versión**: 1.0
**Plataforma**: Next.js 15 + Turborepo + Cloudflare + Supabase

---

## 📋 Resumen Ejecutivo

**Score de Production-Readiness: 65/100** ⚠️

La plataforma AutaMedica presenta una arquitectura sólida con Turborepo y múltiples aplicaciones especializadas, pero requiere atención urgente en varias áreas críticas antes del despliegue a producción.

### Hallazgos Clave:
- ✅ Arquitectura multi-app correctamente estructurada
- ✅ Sistema de autenticación Supabase configurado
- ❌ **CRÍTICO**: Falla en build por dependencias missing
- ❌ **CRÍTICO**: 142,617 ocurrencias de console.log/debugger
- ⚠️  Node v22 incompatible con requerimiento v20
- ⚠️  Código no usado sin analizar (Knip requiere configuración)

---

## 🔴 Hallazgos Críticos (BLOQUEANTES)

### 1. Build Failure - Missing Package Dist ⛔
**Severidad**: Crítico
**Impacto**: Aplicaciones no pueden construirse

**Problema**:
```
@autamedica/web-app:build: Failed to compile
Caused by: No such file or directory (os error 2)
/root/Autamedica/packages/shared/dist/index.js
```

**Causa Raíz**:
- El package `@autamedica/shared` no tiene su `dist/` generado
- Las apps intentan importar desde dist que no existe
- Orden de build incorrecto en Turborepo

**Remediación**:
```bash
# 1. Construir packages primero
pnpm --filter '@autamedica/*' --filter '!@autamedica/*-app' build

# 2. Verificar dist generados
ls -la packages/shared/dist/
ls -la packages/types/dist/
ls -la packages/auth/dist/

# 3. Luego construir apps
pnpm --filter 'apps/*' build

# 4. Verificar turbo.json tiene dependsOn correcto
cat turbo.json | jq '.tasks.build.dependsOn'
```

**Fix Permanente en turbo.json**:
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // Asegura packages antes que apps
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    }
  }
}
```

### 2. Código de Debugging en Producción ⛔
**Severidad**: Crítico
**Impacto**: Performance, seguridad, logs en producción

**Problema**:
- **142,617 ocurrencias** de `console.log` y `debugger` en código
- Distribuidas en apps y packages
- Riesgo de exponer información sensible en logs

**Remediación**:
```bash
# 1. Remover console.log de forma segura (preservar console.error/warn)
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i '/console\.log/d' {} \;

# 2. Remover debugger statements
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i '/debugger;/d' {} \;

# 3. Agregar ESLint rule para prevenir en futuro
# .eslintrc.json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "no-debugger": "error"
  }
}

# 4. Usar logger service en su lugar
import { logger } from '@autamedica/shared';
logger.info('Message'); // Controlado y filtrable
```

**Prevención Automática**:
```bash
# Pre-commit hook en .husky/pre-commit
npx lint-staged --config .lintstagedrc.json
```

---

## 🟡 Hallazgos Medios (IMPORTANTES)

### 3. Incompatibilidad de Node.js Version ⚠️
**Severidad**: Media
**Impacto**: Comportamiento inconsistente, warnings en CI/CD

**Problema**:
```
WARN Unsupported engine: wanted: {"node":"20.x"} (current: {"node":"v22.20.0"})
```

**Remediación**:
```bash
# Opción 1: Downgrade a Node 20 LTS (recomendado para producción)
nvm install 20
nvm use 20
nvm alias default 20

# Opción 2: Actualizar package.json para soportar Node 22
# package.json (root)
{
  "engines": {
    "node": ">=20.x <=22.x",
    "pnpm": ">=9.0.0"
  }
}

# Opción 3: Usar .nvmrc para team consistency
echo "20" > .nvmrc
```

### 4. Turborepo Selector Syntax Error ⚠️
**Severidad**: Media
**Impacto**: Scripts de CI/CD fallan

**Problema**:
```
selector "..." must have a reference, directory, or name pattern
```

**Causa**: El selector `...` (triple dot) no es válido en Turborepo 2.x

**Remediación**:
```bash
# ❌ INCORRECTO
pnpm turbo run build --filter=...

# ✅ CORRECTO - Build all packages
pnpm turbo run build

# ✅ CORRECTO - Build specific scope
pnpm turbo run build --filter='@autamedica/*'
pnpm turbo run build --filter='apps/*'

# ✅ CORRECTO - Build with dependents
pnpm turbo run build --filter='@autamedica/web-app...'
```

**Actualizar scripts en package.json**:
```json
{
  "scripts": {
    "build:packages": "turbo run build --filter='packages/*'",
    "build:apps": "turbo run build --filter='apps/*'",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

### 5. Análisis de Código No Usado Pendiente ⚠️
**Severidad**: Media
**Impacto**: Bundle size, performance

**Problema**:
- Knip requiere configuración específica
- No se puede determinar código muerto sin análisis

**Remediación**:
```bash
# 1. Crear configuración Knip
cat > knip.json <<EOF
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "workspaces": {
    "apps/*": {
      "entry": ["src/app/**/*.{ts,tsx}"],
      "project": ["src/**/*.{ts,tsx}"]
    },
    "packages/*": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts"]
    }
  },
  "ignore": ["**/*.test.ts", "**/*.spec.ts"],
  "ignoreDependencies": ["@types/*"]
}
EOF

# 2. Ejecutar análisis
pnpm dlx knip

# 3. Analizar solo producción
pnpm dlx knip --production

# 4. Fix automático de issues
pnpm dlx knip --fix
```

---

## 🟢 Hallazgos Menores (MEJORAS OPCIONALES)

### 6. Variables de Entorno - Inventario Completo ℹ️
**Acción Requerida**: Auditoría manual de archivos .env

**Archivos Encontrados**:
- `.env.local` (apps y root)
- `.env.production`, `.env.staging`
- `.env.example`, `.env.template`

**Checklist de Validación**:
```bash
# 1. No debe haber secrets hardcodeados en código
grep -R "SUPABASE_SERVICE_ROLE_KEY\|ANTHROPIC_API_KEY" apps packages

# 2. Variables públicas deben tener prefijo NEXT_PUBLIC_
grep -R "process\.env\.[^N]" apps | grep -v NEXT_PUBLIC

# 3. Cloudflare secrets deben estar en dashboard, no en .env
wrangler secret list --name autamedica-web-app
```

### 7. DNS & SSL - Validación en Vivo ℹ️
**Estado**: No se pudo verificar (dominios aún no públicos)

**Comandos de Validación Post-Deploy**:
```bash
# Headers de seguridad
curl -I https://auth.autamedica.com | grep -i "strict-transport\|content-security\|x-frame"

# SSL/TLS mode
curl -Iv https://doctors.autamedica.com 2>&1 | grep -i "SSL\|TLS"

# Redirecciones
curl -I http://autamedica.com # Debe redirigir a https://
```

---

## 🛠️ Plan de Remediación (Orden de Ejecución)

### FASE 1: CRÍTICOS (Antes de cualquier deploy) ⏰ 2-4 horas

1. **Fix Build Dependencies** (30 min)
   ```bash
   cd /root/Autamedica
   pnpm install
   pnpm --filter '@autamedica/shared' build
   pnpm --filter '@autamedica/types' build
   pnpm --filter '@autamedica/auth' build
   pnpm build:apps
   ```

2. **Limpiar Console.log/Debugger** (1-2 horas)
   ```bash
   # Backup primero
   git add -A && git commit -m "backup: pre console.log cleanup"

   # Cleanup automático
   find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) \
     -exec sed -i '/console\.log(/d' {} \;

   # Reemplazar con logger service
   # Revisar manualmente archivos críticos
   grep -R "console\." apps/web-app/src | head -20
   ```

3. **Agregar Protecciones ESLint** (30 min)
   ```bash
   # Actualizar .eslintrc.json
   echo '{
     "rules": {
       "no-console": ["error", { "allow": ["warn", "error"] }],
       "no-debugger": "error"
     }
   }' | jq -s '.[0] * .[1]' .eslintrc.json - > .eslintrc.tmp.json
   mv .eslintrc.tmp.json .eslintrc.json

   # Validar
   pnpm lint
   ```

### FASE 2: MEDIOS (Antes de merge a main) ⏰ 1-2 horas

4. **Node Version Alignment** (15 min)
   ```bash
   nvm install 20 && nvm use 20
   echo "20" > .nvmrc
   pnpm install # Re-install con Node 20
   ```

5. **Fix Turborepo Selectors** (30 min)
   ```bash
   # Actualizar package.json scripts
   # Actualizar CI/CD workflows (.github/workflows/*.yml)
   # Probar: pnpm build
   ```

6. **Knip Configuration & Analysis** (45 min)
   ```bash
   # Setup Knip
   cat > knip.json < [config de arriba]
   pnpm dlx knip --production
   # Revisar y remover código muerto
   ```

### FASE 3: VALIDACIÓN FINAL ⏰ 30 min

7. **Full Build & Test**
   ```bash
   rm -rf node_modules .next dist .turbo
   pnpm install
   pnpm build
   pnpm typecheck
   pnpm lint --max-warnings 0
   pnpm test
   ```

8. **Pre-Deploy Checklist**
   ```bash
   pnpm pre-deploy
   # Revisar: generated-docs/AUDIT_QUICKFIX_PLAN.md
   ```

---

## 📊 Métricas de Auditoría

| Categoría | Estado | Score |
|-----------|--------|-------|
| **Build System** | ❌ Fallo | 30/100 |
| **Code Quality** | ❌ Console.log masivo | 20/100 |
| **Dependencies** | ⚠️  Node incompatible | 60/100 |
| **Security** | ⚠️  Pendiente análisis | 70/100 |
| **CI/CD** | ⚠️  Selector errors | 65/100 |
| **Performance** | ℹ️  No analizado | N/A |
| **TOTAL** | ⚠️  **Requiere trabajo** | **65/100** |

---

## 🎯 Go/No-Go Decision

**RECOMENDACIÓN: NO-GO para producción** ❌

**Bloqueantes que deben resolverse**:
1. ❌ Build failure por missing dist files
2. ❌ 142K+ console.log statements en código
3. ⚠️  Node version mismatch

**Tiempo estimado para Production-Ready**: **4-6 horas** de trabajo enfocado

**Próximo checkpoint**: Ejecutar FASE 1 y FASE 2, luego re-auditar con:
```bash
./scripts/run-audit-preprod.sh
```

---

## 📚 Anexos

### A. Comandos de Validación Rápida

```bash
# Health Check Completo
pnpm health

# Build Status
pnpm build 2>&1 | tee build.log

# Code Quality Gate
pnpm lint --max-warnings 0 && pnpm typecheck && echo "✅ Quality Gate PASS"

# Pre-Deploy Validation
pnpm pre-deploy
```

### B. Logs Relevantes

- Build log: `generated-docs/audit-build-all.log`
- Lint/TypeCheck: `generated-docs/lint-typecheck.log`
- Console.log count: 142,617 occurrences
- Audit execution: `.logs/audit-run.log`

### C. Próximos Pasos

1. Ejecutar FASE 1 de remediación
2. Commit cambios: `git commit -m "fix: critical audit issues - build deps & console cleanup"`
3. Re-ejecutar auditoría: `./scripts/run-audit-preprod.sh`
4. Validar score > 85/100
5. Proceder con deployment a staging
6. Smoke tests en staging
7. Deployment a producción

---

**Generado**: 2025-10-05 21:52 UTC
**Runner**: `scripts/run-audit-preprod.sh`
**Prompt**: `prompts/auditoria-preprod-autamedica.yaml`
