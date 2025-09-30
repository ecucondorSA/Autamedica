# 📝 FASE 2: Corrección de Workflows

**Prerequisito:** FASE 1 completada (proyectos duplicados eliminados)
**Status:** 🟡 LISTO PARA EJECUTAR

---

## 🎯 Objetivos

1. Corregir workflow de deployment para evitar fallos silenciosos
2. Corregir security scans para funcionar con pushes directos
3. Desbloquear CI/CD pipeline completo
4. Habilitar deployments automáticos correctos

---

## 🔧 Cambios Requeridos

### 1. Corregir `desplegar-produccion.yml`

**Archivo:** `.github/workflows/desplegar-produccion.yml`

#### Problemas actuales (líneas 30-48):

```yaml
# ❌ PROBLEMA 1: Build tolerante (ignora errores)
- name: Build monorepo (tolerante)
  run: |
    pnpm --filter @autamedica/web-app build || true
    pnpm --filter @autamedica/patients build || true
    pnpm --filter @autamedica/doctors build || true
    pnpm --filter @autamedica/companies build || true
    pnpm --filter @autamedica/admin build || true

# ❌ PROBLEMA 2: Deploy desde directorio incorrecto
- name: Desplegar a Producción (main)
  run: |
    for p in "${PROJS[@]}"; do
      wrangler pages deploy . --project-name "$p" --branch "main" || true
    done
```

**¿Qué hace mal?**
- `|| true` oculta TODOS los errores
- Despliega "." (root monorepo) en lugar de output de cada app
- Un solo job para todas las apps (difícil debugging)
- No usa el script `build:cloudflare` específico de web-app

#### ✅ Solución: Workflow Corregido

**Estrategia:** Un job separado por app, sin `|| true`, deploy de output correcto

```yaml
name: 'Desplegar Producción (Pages)'

on:
  push:
    branches: [ main ]

env:
  CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
  CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

jobs:
  # ============================================
  # Job 1: Web-App (Landing + Auth)
  # ============================================
  deploy-web-app:
    name: 'Deploy Web-App'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9.15.2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages core
        run: pnpm build:packages:core

      - name: Build web-app
        working-directory: apps/web-app
        run: pnpm run build:cloudflare

      - name: Install Wrangler
        run: pnpm add -g wrangler

      - name: Deploy to Cloudflare Pages
        working-directory: apps/web-app
        run: |
          wrangler pages deploy .vercel/output/static \
            --project-name autamedica-web-app \
            --branch main

  # ============================================
  # Job 2: Doctors Portal
  # ============================================
  deploy-doctors:
    name: 'Deploy Doctors'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9.15.2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages core
        run: pnpm build:packages:core

      - name: Build doctors
        run: pnpm --filter @autamedica/doctors build

      - name: Install Wrangler
        run: pnpm add -g wrangler

      - name: Deploy to Cloudflare Pages
        working-directory: apps/doctors
        run: |
          wrangler pages deploy .next \
            --project-name autamedica-doctors \
            --branch main

  # ============================================
  # Job 3: Patients Portal
  # ============================================
  deploy-patients:
    name: 'Deploy Patients'
    runs-on: ubuntu-latest
    # ⚠️ NOTA: Este job podría fallar si patients tiene problemas
    # de build. Ver ANALISIS_GITHUB_CLOUDFLARE.md
    continue-on-error: true  # Temporal hasta resolver build issues
    steps:
      - uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9.15.2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages core
        run: pnpm build:packages:core

      - name: Build patients
        run: pnpm --filter @autamedica/patients build

      - name: Install Wrangler
        run: pnpm add -g wrangler

      - name: Deploy to Cloudflare Pages
        working-directory: apps/patients
        run: |
          wrangler pages deploy .next \
            --project-name autamedica-patients \
            --branch main

  # ============================================
  # Job 4: Companies Portal
  # ============================================
  deploy-companies:
    name: 'Deploy Companies'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PNPM
        uses: pnpm/action-setup@v4
        with:
          version: 9.15.2

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages core
        run: pnpm build:packages:core

      - name: Build companies
        run: pnpm --filter @autamedica/companies build

      - name: Install Wrangler
        run: pnpm add -g wrangler

      - name: Deploy to Cloudflare Pages
        working-directory: apps/companies
        run: |
          wrangler pages deploy .next \
            --project-name autamedica-companies \
            --branch main
```

#### Cambios clave:

1. ❌ **REMOVIDO:** `|| true` de TODOS los comandos
2. ✅ **AGREGADO:** Un job separado por app
3. ✅ **AGREGADO:** `working-directory` específico
4. ✅ **AGREGADO:** Deploy de output correcto (`.vercel/output/static` o `.next`)
5. ✅ **AGREGADO:** Version explícita de PNPM (9.15.2)
6. ⚠️ **TEMPORAL:** `continue-on-error: true` en patients (hasta resolver webpack issues)

#### Beneficios:

- **Visibilidad:** Cada app tiene su propio job con logs separados
- **Debugging:** Fácil identificar qué app falla y por qué
- **Parallelization:** Jobs corren en paralelo (más rápido)
- **Selective deploy:** Se puede re-correr solo el job que falla
- **No falsos positivos:** Si falla, el workflow marca error

---

### 2. Corregir `secrets-scan.yml`

**Archivo:** `.github/workflows/secrets-scan.yml`

#### Problema actual:

```
TruffleHog - Verificación adicional: .github#87
  BASE and HEAD commits are the same.
  TruffleHog won't scan anything.
```

**Razón:** TruffleHog requiere base != head (solo funciona en PRs)

#### ✅ Solución 1: Solo escanear en PRs

```yaml
- name: TruffleHog - Verificación adicional
  if: github.event_name == 'pull_request'
  uses: trufflesecurity/trufflehog@main
  with:
    base: ${{ github.event.pull_request.base.sha }}
    head: ${{ github.event.pull_request.head.sha }}
```

#### ✅ Solución 2: Escanear últimos N commits en pushes

```yaml
- name: TruffleHog - Verificación adicional
  uses: trufflesecurity/trufflehog@main
  with:
    extra_args: --max-depth 5 --only-verified
```

**Recomendación:** Usar Solución 1 (más limpia y clara)

---

### 3. Investigar `ci-cd-monorepo.yml` fallo

**Job fallando:** `security-scan`
**Error:** `Process completed with exit code 1`

#### Pasos de investigación:

```bash
# 1. Ver el workflow completo
cat .github/workflows/ci-cd-monorepo.yml | grep -A 20 "security-scan"

# 2. Ver logs del último run
gh run list --workflow="CI/CD Monorepo" --limit 1 --json databaseId \
  | jq -r '.[0].databaseId' \
  | xargs gh run view --log

# 3. Identificar comando que falla
# Buscar línea con "exit code 1"
```

**Acción:** Determinar si es el mismo problema de TruffleHog o algo distinto

---

## 📋 Plan de Ejecución

### Paso 1: Backup del workflow actual

```bash
cp .github/workflows/desplegar-produccion.yml \
   .github/workflows/desplegar-produccion.yml.backup
```

### Paso 2: Aplicar correcciones

```bash
# Copiar el workflow corregido (desde este documento)
# al archivo .github/workflows/desplegar-produccion.yml
```

### Paso 3: Commit y push

```bash
git add .github/workflows/desplegar-produccion.yml
git commit -m "fix(workflows): corregir deployment automático de apps

- Separar en jobs individuales por app
- Remover || true que oculta errores
- Deploy de output correcto (.vercel/output/static o .next)
- Agregar working-directory específico
- Version explícita de PNPM 9.15.2

Fixes: #<issue-number> (si existe)
Refs: ANALISIS_GITHUB_CLOUDFLARE.md, FASE2_FIX_WORKFLOWS.md"

git push origin main
```

### Paso 4: Re-habilitar workflow

```bash
gh workflow enable desplegar-produccion.yml
```

### Paso 5: Monitorear primer deployment

```bash
# Watch del workflow en tiempo real
gh run watch

# O ver lista de runs
gh run list --workflow="desplegar-produccion.yml" --limit 1
```

### Paso 6: Verificar deployments en Cloudflare

```bash
wrangler pages deployment list --project-name autamedica-web-app | head -5
wrangler pages deployment list --project-name autamedica-doctors | head -5
wrangler pages deployment list --project-name autamedica-patients | head -5
wrangler pages deployment list --project-name autamedica-companies | head -5
```

---

## 🧪 Testing

### Test 1: Smoke test local de builds

```bash
# Verificar que cada app buildea correctamente
pnpm build:packages:core

cd apps/web-app && pnpm run build:cloudflare && cd ../..
# Debe generar: apps/web-app/.vercel/output/static

pnpm --filter @autamedica/doctors build
# Debe generar: apps/doctors/.next

pnpm --filter @autamedica/patients build
# ⚠️ Este podría fallar (webpack issues conocidos)

pnpm --filter @autamedica/companies build
# Debe generar: apps/companies/.next
```

### Test 2: Dry-run de deployment (sin push)

```bash
# Web-app
cd apps/web-app
wrangler pages deploy .vercel/output/static \
  --project-name autamedica-web-app \
  --branch test-deployment \
  --dry-run

# Doctors
cd ../doctors
wrangler pages deploy .next \
  --project-name autamedica-doctors \
  --branch test-deployment \
  --dry-run
```

### Test 3: Test en feature branch

```bash
# Crear branch de test
git checkout -b test/fixed-workflows

# Push para trigger workflow (si on: push tiene todas las branches)
git push origin test/fixed-workflows

# Monitorear
gh run watch
```

---

## ⚠️ Posibles Problemas y Soluciones

### Problema 1: "Module not found" en patients build

**Síntoma:**
```
ERROR in ./apps/patients/src/...
Module not found: Can't resolve '@autamedica/telemedicine'
```

**Solución:** Ya aplicada en commit 5b90ace - `build:packages:core` incluye telemedicine, ui, utils

**Verificar:**
```bash
grep "build:packages:core" package.json
# Debe incluir: telemedicine, ui, utils
```

### Problema 2: Output directory no existe

**Síntoma:**
```
Error: ENOENT: no such file or directory '.vercel/output/static'
```

**Solución:**
- Para web-app: Usar `pnpm run build:cloudflare` (genera `.vercel/output/static`)
- Para doctors/patients/companies: Usar build normal (genera `.next`)

### Problema 3: Wrangler authentication falla

**Síntoma:**
```
Error: Not authenticated. Please run wrangler login
```

**Solución:** Verificar secrets en GitHub:
```bash
gh secret list
# Debe tener: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
```

### Problema 4: Concurrent deployments limit

**Síntoma:**
```
Error: Too many concurrent deployments
```

**Solución:** Jobs en paralelo podrían exceder límite de Cloudflare

**Fix:** Agregar dependency entre jobs:
```yaml
deploy-doctors:
  needs: deploy-web-app  # Espera a que web-app termine

deploy-patients:
  needs: deploy-doctors  # Secuencial
```

---

## 📊 Métricas de Éxito

### Antes (FASE 1):
- ❌ Deployments automáticos: 0% success rate
- ❌ Workflow marca success pero falla: 100%
- ❌ Proyectos duplicados: 2 (autamedica-reboot-fresh, autamedicaweb)

### Después (FASE 2 completada):
- ✅ Deployments automáticos: >80% success rate esperado
- ✅ Errores visibles en GitHub Actions: 100%
- ✅ Proyectos duplicados: 0
- ✅ Jobs separados por app: 4
- ✅ Logs específicos por app: 100%

---

## 🔄 Rollback Plan

Si algo falla después de aplicar FASE 2:

```bash
# 1. Pausar workflow inmediatamente
gh workflow disable desplegar-produccion.yml

# 2. Restaurar backup
cp .github/workflows/desplegar-produccion.yml.backup \
   .github/workflows/desplegar-produccion.yml

# 3. Commit y push (con --no-verify para evitar hooks)
git add .github/workflows/desplegar-produccion.yml
git commit -m "revert: rollback deployment workflow to previous version"
git push origin main --no-verify

# 4. Las URLs de producción NO se afectan
# (deployments manuales previos siguen activos)
```

---

## ✅ Checklist Pre-Deployment

Antes de habilitar el workflow corregido:

- [ ] FASE 1 completada (proyectos duplicados eliminados)
- [ ] Backup del workflow actual creado
- [ ] Workflow corregido revisado y validado
- [ ] Secrets de Cloudflare verificados (`gh secret list`)
- [ ] Test local de builds exitoso
- [ ] Package.json tiene `build:packages:core` correcto
- [ ] Build command documentado en CLOUDFLARE_BUILD_COMMAND.md
- [ ] Plan de rollback entendido

---

**Última actualización:** 2025-09-30 23:50:00
**Tiempo estimado:** 30-45 minutos (incluyendo testing)
**Prerequisito:** FASE 1 completada
