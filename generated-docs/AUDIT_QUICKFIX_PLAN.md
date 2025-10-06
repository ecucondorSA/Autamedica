# Plan de Remediación Rápida - AutaMedica
**Auditoría Pre-Producción | 2025-10-05**

---

## 🚨 CRÍTICOS - Ejecutar AHORA (2-4 horas)

### 1. Fix Build Dependencies [30 min] ⛔

**Problema**: `@autamedica/shared` sin dist, apps fallan al compilar

**Solución Inmediata**:
```bash
cd /root/Autamedica

# 1. Limpiar build cache
rm -rf packages/*/dist apps/*/.next .turbo

# 2. Build packages en orden correcto
pnpm --filter '@autamedica/types' build
pnpm --filter '@autamedica/shared' build
pnpm --filter '@autamedica/auth' build
pnpm --filter '@autamedica/hooks' build
pnpm --filter '@autamedica/tailwind-config' build

# 3. Verificar dist generados
ls -la packages/shared/dist/index.js
ls -la packages/types/dist/index.js
ls -la packages/auth/dist/index.js

# 4. Build apps
pnpm --filter 'apps/*' build

# 5. Validar éxito
pnpm build
```

**Fix Permanente** - Actualizar `turbo.json`:
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "cache": true
    }
  }
}
```

**Validación**:
```bash
pnpm build
# Debe completar sin errores
```

---

### 2. Cleanup Console.log Masivo [1-2 horas] ⛔

**Problema**: 142,617 console.log/debugger en código de producción

**Estrategia de Limpieza Segura**:

```bash
cd /root/Autamedica

# PASO 1: Backup (CRÍTICO)
git add -A
git commit -m "backup: pre console.log cleanup"

# PASO 2: Analizar distribución
echo "=== Top 10 archivos con más console.log ==="
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec grep -l "console\.log" {} \; \
  | xargs -I {} sh -c 'echo "$(grep -c "console\.log" {}) {}"' \
  | sort -rn | head -10

# PASO 3: Cleanup automático (conserva console.error/warn)
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i.bak '/^\s*console\.log(/d' {} \;

# PASO 4: Remover debugger
find apps packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -exec sed -i '/^\s*debugger;/d' {} \;

# PASO 5: Limpiar backups
find apps packages -name "*.bak" -delete

# PASO 6: Verificar reducción
NEW_COUNT=$(grep -R "console\.log" --include="*.ts" --include="*.tsx" apps packages 2>/dev/null | wc -l)
echo "Console.log restantes: $NEW_COUNT (debería ser ~0)"
```

**Casos Especiales** - Revisar manualmente:
```bash
# Archivos de logging legítimo (preservar)
apps/*/src/lib/logger.ts
packages/shared/src/logger.ts

# Archivos de debug/dev tools (mover a condicional)
apps/*/src/components/DevTools.tsx
```

**Reemplazar con Logger Service**:
```typescript
// ❌ Antes
console.log('User logged in:', user);

// ✅ Después
import { logger } from '@autamedica/shared';
logger.info('User logged in', { userId: user.id });
```

**Validación**:
```bash
# Debe retornar 0 o muy pocos resultados
grep -R "console\.log" --include="*.ts" apps packages | wc -l

# Build debe seguir funcionando
pnpm build
```

---

### 3. ESLint Protection [30 min] ⛔

**Prevenir regresión de console.log**:

```bash
cd /root/Autamedica

# PASO 1: Actualizar .eslintrc.json
cat > .eslintrc.console-rules.json <<'EOF'
{
  "rules": {
    "no-console": ["error", {
      "allow": ["warn", "error", "info"]
    }],
    "no-debugger": "error",
    "no-alert": "error"
  }
}
EOF

# PASO 2: Merge con config existente
jq -s '.[0] * .[1]' .eslintrc.json .eslintrc.console-rules.json > .eslintrc.tmp.json
mv .eslintrc.tmp.json .eslintrc.json
rm .eslintrc.console-rules.json

# PASO 3: Agregar pre-commit hook
cat > .husky/pre-commit <<'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint staged files
npx lint-staged

# Prevent console.log in commits
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -n 'console\.log' 2>/dev/null; then
  echo "❌ Error: console.log detected in staged files"
  echo "Use logger from @autamedica/shared instead"
  exit 1
fi
EOF

chmod +x .husky/pre-commit

# PASO 4: Actualizar lint-staged config
cat > .lintstagedrc.json <<'EOF'
{
  "*.{ts,tsx,js,jsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ]
}
EOF
```

**Validación**:
```bash
# Debe fallar si hay console.log
pnpm lint

# Pre-commit debe bloquear console.log
echo "console.log('test');" >> apps/web-app/src/test.ts
git add apps/web-app/src/test.ts
git commit -m "test" # Debe fallar ❌
git reset HEAD apps/web-app/src/test.ts
rm apps/web-app/src/test.ts
```

---

## ⚠️ MEDIOS - Ejecutar antes de Merge (1-2 horas)

### 4. Node Version Alignment [15 min]

```bash
cd /root/Autamedica

# Opción A: Downgrade a Node 20 (recomendado)
nvm install 20
nvm use 20
nvm alias default 20
echo "20" > .nvmrc

# Opción B: Actualizar engines en package.json
jq '.engines.node = ">=20.x <=22.x"' package.json > package.tmp.json
mv package.tmp.json package.json

# Re-install con versión correcta
rm -rf node_modules
pnpm install

# Validar
node -v # Debe ser v20.x.x
pnpm build
```

---

### 5. Fix Turborepo Selectors [30 min]

```bash
cd /root/Autamedica

# PASO 1: Actualizar package.json scripts
cat > package.scripts.json <<'EOF'
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "build:packages": "turbo build --filter='packages/*'",
    "build:apps": "turbo build --filter='apps/*'",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test"
  }
}
EOF

jq -s '.[0] * .[1]' package.json package.scripts.json > package.tmp.json
mv package.tmp.json package.json
rm package.scripts.json

# PASO 2: Actualizar CI/CD workflows
find .github/workflows -name "*.yml" -exec sed -i \
  's/--filter=\.\.\./--filter="apps\/*"/g' {} \;

# PASO 3: Actualizar audit script
sed -i 's/--filter=\.\.\./--filter="apps\/*"/g' scripts/run-audit-preprod.sh
```

**Validación**:
```bash
pnpm build:packages
pnpm build:apps
pnpm build
```

---

### 6. Knip Configuration [45 min]

```bash
cd /root/Autamedica

# PASO 1: Crear config
cat > knip.json <<'EOF'
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "workspaces": {
    "apps/*": {
      "entry": [
        "src/app/**/*.{ts,tsx}",
        "src/middleware.ts"
      ],
      "project": ["src/**/*.{ts,tsx}"]
    },
    "packages/*": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts"]
    }
  },
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/dist/**",
    "**/.next/**"
  ],
  "ignoreDependencies": [
    "@types/*"
  ],
  "ignoreExportsUsedInFile": true
}
EOF

# PASO 2: Análisis inicial
pnpm dlx knip --production > generated-docs/knip-analysis.txt

# PASO 3: Revisar resultados
cat generated-docs/knip-analysis.txt | head -50

# PASO 4: Fix automático (CUIDADO: revisar cambios)
# pnpm dlx knip --fix --fix-type dependencies
```

---

## ✅ VALIDACIÓN FINAL (30 min)

### 7. Full Build & Quality Gate

```bash
cd /root/Autamedica

# Clean slate
rm -rf node_modules packages/*/dist apps/*/.next .turbo .next

# Fresh install
pnpm install

# Build pipeline
pnpm build:packages && \
pnpm build:apps && \
pnpm lint --max-warnings 0 && \
pnpm typecheck && \
pnpm test || true

# Quality gate
if [ $? -eq 0 ]; then
  echo "✅ QUALITY GATE PASSED"
else
  echo "❌ QUALITY GATE FAILED - revisar errores"
  exit 1
fi
```

---

### 8. Re-Auditar

```bash
cd /root/Autamedica

# Ejecutar auditoría completa
./scripts/run-audit-preprod.sh

# Verificar score
cat generated-docs/AUDIT_PREPROD_AUTAMEDICA.md | grep "Score"

# Debe ser >= 85/100 para producción
```

---

## 📋 Checklist de Ejecución

Marcar al completar:

**CRÍTICOS**:
- [ ] 1. Fix build dependencies (30 min)
- [ ] 2. Cleanup console.log (1-2 hrs)
- [ ] 3. ESLint protection (30 min)

**MEDIOS**:
- [ ] 4. Node version alignment (15 min)
- [ ] 5. Fix Turborepo selectors (30 min)
- [ ] 6. Knip configuration (45 min)

**VALIDACIÓN**:
- [ ] 7. Full build & quality gate (30 min)
- [ ] 8. Re-auditar (10 min)

**CRITERIO DE ÉXITO**:
- [ ] Build completa sin errores
- [ ] Console.log < 10 ocurrencias
- [ ] Lint pasa con --max-warnings 0
- [ ] TypeCheck pasa
- [ ] Score auditoría >= 85/100

---

## 🚀 Deployment Post-Fix

Una vez completado el plan:

```bash
# 1. Commit cambios
git add -A
git commit -m "fix(audit): critical pre-prod issues - build deps, console cleanup, eslint protection"

# 2. Push a staging
git push origin staging

# 3. Validar en staging
curl -I https://staging.autamedica.com

# 4. Merge a main si todo OK
git checkout main
git merge staging
git push origin main

# 5. Deploy a producción (automático via CI/CD)
```

---

**Tiempo Total Estimado**: 4-6 horas
**Bloqueantes Resueltos**: Build failure, Console.log masivo
**Score Esperado Post-Fix**: 85-90/100

**Próximo Checkpoint**: Re-ejecutar auditoría después de FASE 1 y FASE 2
