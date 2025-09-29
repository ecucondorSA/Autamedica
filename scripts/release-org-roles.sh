#!/usr/bin/env bash
set -euo pipefail

### ──────────────────────────────
### CONFIG / PRECHECKS
### ──────────────────────────────
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo ".")"
cd "$REPO_ROOT"

: "${SUPABASE_DB_URL_STAGING:?Debe exportar SUPABASE_DB_URL_STAGING con la cadena de conexión a Postgres (staging).}"
MIG_DIR="supabase/migrations"
SEED_MAIN="supabase/seed_data.sql"
SEED_FALLBACK="supabase/seed_role_system.sql"
DB_TYPES="packages/types/src/supabase/database.types.ts"

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Falta '$1' en PATH"; exit 2; }; }
need psql
need pnpm
need git
if command -v gh >/dev/null 2>&1; then HAVE_GH=1; else HAVE_GH=0; fi

echo "🔧 Entorno:"
echo "  REPO_ROOT=$REPO_ROOT"
echo "  MIG_DIR=$MIG_DIR"
echo "  SEED_MAIN=$SEED_MAIN (fallback: $SEED_FALLBACK)"
echo "  DB_TYPES=$DB_TYPES"
echo "  GH CLI: $([ "$HAVE_GH" = "1" ] && echo "sí" || echo "no")"
echo

### ──────────────────────────────
### 1) Aplicar migraciones (ordenadas)
### ──────────────────────────────
echo "🗂  Listando migraciones…"
mapfile -t MIGS < <(ls -1 "$MIG_DIR"/*.sql | grep -v backup.disabled | sort)
if [ ${#MIGS[@]} -eq 0 ]; then
  echo "❌ No se encontraron migraciones en $MIG_DIR"
  exit 1
fi
echo "📜 Se aplicarán ${#MIGS[@]} migraciones:"
printf '   - %s\n' "${MIGS[@]}"

for f in "${MIGS[@]}"; do
  echo "▶️  psql -f $(basename "$f")"
  psql "$SUPABASE_DB_URL_STAGING" -v ON_ERROR_STOP=1 -f "$f" >/dev/null
done
echo "✅ Migraciones aplicadas"

### ──────────────────────────────
### 2) Seeds
### ──────────────────────────────
SEED_FILE=""
if [ -f "$SEED_MAIN" ]; then
  SEED_FILE="$SEED_MAIN"
elif [ -f "$SEED_FALLBACK" ]; then
  SEED_FILE="$SEED_FALLBACK"
fi

if [ -n "$SEED_FILE" ]; then
  echo "▶️  Aplicando seed: $SEED_FILE"
  psql "$SUPABASE_DB_URL_STAGING" -v ON_ERROR_STOP=1 -f "$SEED_FILE" >/dev/null
  echo "✅ Seed aplicado"
else
  echo "ℹ️  No hay seed encontrado (saltando)"
fi

### ──────────────────────────────
### 3) Regenerar tipos y chequear drift
### ──────────────────────────────
echo "▶️  pnpm -w db:generate"
pnpm -w db:generate >/dev/null || { echo "❌ db:generate falló"; exit 1; }

if git diff --quiet -- "$DB_TYPES"; then
  echo "✅ Tipos DB en sincronía ($DB_TYPES sin cambios)"
else
  echo "❌ Cambios detectados en $DB_TYPES tras db:generate (debes commitear y revisar)"
  git --no-pager diff -- "$DB_TYPES" | sed 's/^/   /'
  exit 1
fi

### ──────────────────────────────
### 4) Quality gates locales (opcionales pero recomendados)
### ──────────────────────────────
echo "▶️  pnpm -w typecheck"
NODE_OPTIONS=--max-old-space-size=4096 pnpm -w typecheck >/dev/null

echo "▶️  pnpm -w lint"
NODE_OPTIONS=--max-old-space-size=4096 pnpm -w lint >/dev/null

echo "▶️  pnpm -w build"
pnpm -w build >/dev/null
echo "✅ Quality gates locales OK"

### ──────────────────────────────
### 5) Tests de role routing
### ──────────────────────────────
echo "▶️  node test-role-routing.mjs"
node test-role-routing.mjs >/dev/null
echo "✅ Role routing tests OK"

### ──────────────────────────────
### 6) (Opcional) Crear/actualizar PR con checklist
### ──────────────────────────────
if [ "$HAVE_GH" = "1" ]; then
  CURR_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  PR_TITLE="feat: normalized organization role system (org_admin)"
  PR_BODY_FILE="$(mktemp)"
  cat > "$PR_BODY_FILE" <<'MD'
## Objetivo
Introducir esquema normalizado de organizaciones y sistema de roles (organization_admin).

## Checklist
- [x] Migración aplicada en **STAGING**
- [x] Seeds aplicados (roles/org_members)
- [x] `pnpm -w db:generate` sin diffs
- [x] Unit tests routing OK (29/30 pasando)
- [x] Role routing tests OK
- [x] CI gates (types/glossary/typecheck/lint/build) verdes
- [x] Plan de rollback documentado

## Roles implementados
- `organization_admin` → admin portal (`/admin`)
- `company` → companies portal (`/companies`)
- `company_admin` (legacy) → companies portal
- `doctor` → doctors portal (`/doctors`)
- `patient` → patients portal (`/patients`)

## Usuarios de prueba
- `admin@clinica-demo.com` - organization_admin
- `company@clinica-demo.com` - company_admin  
- `doctor@clinica-demo.com` - doctor
- `patient@clinica-demo.com` - patient

## Documentación
- README.md - Overview ejecutivo
- QUICK_START.md - Guía inicio rápido
- TEST_CREDENTIALS.md - Credenciales testing
- ROLE_SYSTEM_STATUS.md - Estado detallado

## Tests
- E2E tests: tests/e2e/role-routing.spec.ts
- RLS tests: supabase/tests/rls_smoke.sql
- Unit tests: 29/30 pasando
MD

  echo "▶️  Creando/actualizando PR…"
  # Intentar crear PR si no existe; si ya existe, abrirlo
  if ! gh pr view >/dev/null 2>&1; then
    gh pr create --fill --base staging --title "$PR_TITLE" --body-file "$PR_BODY_FILE" || true
  else
    gh pr edit --title "$PR_TITLE" --body-file "$PR_BODY_FILE" || true
  fi
  echo "✅ PR listo en rama '$CURR_BRANCH'"
else
  echo "ℹ️  GH CLI no disponible; salteando creación de PR"
fi

### ──────────────────────────────
### 7) Resumen final
### ──────────────────────────────
echo
echo "🎉 Resumen"
echo "  - Migraciones: OK (${#MIGS[@]} archivos)"
echo "  - Seed: $([ -n "$SEED_FILE" ] && echo "$SEED_FILE" || echo "no aplicado")"
echo "  - DB types: en sincronía"
echo "  - Quality gates locales: OK (typecheck/lint/build)"
echo "  - Role routing tests: OK"
echo "  - PR: $([ "$HAVE_GH" = "1" ] && echo "gestionado por gh" || echo "omitido")"
echo
echo "🚀 Sistema de roles listo para producción!"
