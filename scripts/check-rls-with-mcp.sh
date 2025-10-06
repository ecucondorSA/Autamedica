#!/bin/bash
# AutaMedica - RLS Verification Script (MCP-Aware)
# Intenta usar MCP Supabase primero, luego Supabase CLI, luego psql directo

set -e

PROJECT_REF="gtyvdircfhmdjiaelqkg"
OUTPUT_DIR="generated-docs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$OUTPUT_DIR"

echo "🔍 AutaMedica - RLS Verification Tool"
echo "======================================"
echo ""

# SQL Query para verificar RLS
cat > /tmp/check_rls.sql << 'EOF'
-- 1. Verificar RLS en tablas sensibles
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '1. RLS STATUS EN TABLAS SENSIBLES'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT
  tablename,
  rowsecurity AS rls_enabled,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END AS status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'companies',
    'company_members',
    'doctors',
    'patients',
    'appointments',
    'medical_records',
    'patient_care_team',
    'roles',
    'user_roles',
    'audit_logs'
  )
ORDER BY tablename;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '2. POLICIES POR TABLA'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT
  tablename,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '3. TABLAS SIN RLS (POTENCIAL RIESGO)'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT
  tablename,
  '⚠️ NO RLS' as warning
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '4. TOTAL DE POLICIES ACTIVAS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

SELECT
  COUNT(*) as total_policies,
  COUNT(DISTINCT tablename) as tables_with_policies
FROM pg_policies
WHERE schemaname = 'public';
EOF

# ============================================================================
# MÉTODO 1: MCP Supabase (si está configurado)
# ============================================================================

if [ -n "$SUPABASE_MCP_ENDPOINT" ] && [ -n "$SUPABASE_MCP_TOKEN" ]; then
  echo "🤖 Método: MCP Supabase"
  echo "Endpoint: $SUPABASE_MCP_ENDPOINT"
  echo ""

  echo "Ejecutando query via MCP..."

  # Ejecutar via MCP
  RESPONSE=$(curl -fsS -H "Authorization: Bearer $SUPABASE_MCP_TOKEN" \
    -H "Content-Type: application/json" \
    "$SUPABASE_MCP_ENDPOINT/db/query" \
    -d @/tmp/check_rls.sql 2>&1) || {
      echo "⚠️  MCP request falló, intentando método alternativo..."
      RESPONSE=""
    }

  if [ -n "$RESPONSE" ]; then
    echo "$RESPONSE" | tee "$OUTPUT_DIR/rls-check-mcp-${TIMESTAMP}.txt"
    echo ""
    echo "✅ Query ejecutado via MCP Supabase"
    echo "📄 Resultado guardado en: $OUTPUT_DIR/rls-check-mcp-${TIMESTAMP}.txt"
    exit 0
  fi
fi

# ============================================================================
# MÉTODO 2: Supabase CLI (si está autenticado)
# ============================================================================

if command -v supabase &> /dev/null; then
  echo "🔧 Método: Supabase CLI"
  echo ""

  # Verificar si está autenticado
  if supabase projects list &> /dev/null; then
    echo "✅ Supabase CLI autenticado"
    echo ""

    # Link al proyecto si no está linkeado
    if ! supabase status &> /dev/null; then
      echo "🔗 Linking proyecto: $PROJECT_REF"
      supabase link --project-ref "$PROJECT_REF" || {
        echo "⚠️  Link falló, continuando..."
      }
    fi

    # Ejecutar query
    echo "Ejecutando RLS checks..."

    # Usar db push para ejecutar SQL
    supabase db remote set "$PROJECT_REF" 2>/dev/null || true

    # Ejecutar via psql con credentials del CLI
    if [ -n "$DATABASE_URL" ]; then
      psql "$DATABASE_URL" -f /tmp/check_rls.sql 2>&1 | tee "$OUTPUT_DIR/rls-check-cli-${TIMESTAMP}.txt"
    else
      echo "⚠️  DATABASE_URL no disponible, usando método directo..."
      # Intentar ejecutar directo
      supabase db execute --file /tmp/check_rls.sql 2>&1 | tee "$OUTPUT_DIR/rls-check-cli-${TIMESTAMP}.txt" || {
        echo "⚠️  Supabase CLI query falló"
      }
    fi

    if [ -f "$OUTPUT_DIR/rls-check-cli-${TIMESTAMP}.txt" ]; then
      echo ""
      echo "✅ Query ejecutado via Supabase CLI"
      echo "📄 Resultado guardado en: $OUTPUT_DIR/rls-check-cli-${TIMESTAMP}.txt"
      exit 0
    fi
  else
    echo "⚠️  Supabase CLI no autenticado"
    echo ""
    echo "Para autenticar, ejecuta:"
    echo "  supabase login"
    echo ""
    echo "O exporta un access token:"
    echo "  export SUPABASE_ACCESS_TOKEN='sbp_tu_token_aqui'"
    echo ""
  fi
fi

# ============================================================================
# MÉTODO 3: psql Directo (requiere DATABASE_URL o password)
# ============================================================================

echo "🐘 Método: PostgreSQL Directo"
echo ""

if [ -n "$DATABASE_URL" ]; then
  echo "✅ DATABASE_URL encontrado"
  echo "Ejecutando RLS checks..."

  psql "$DATABASE_URL" -f /tmp/check_rls.sql 2>&1 | tee "$OUTPUT_DIR/rls-check-psql-${TIMESTAMP}.txt"

  echo ""
  echo "✅ Query ejecutado via psql directo"
  echo "📄 Resultado guardado en: $OUTPUT_DIR/rls-check-psql-${TIMESTAMP}.txt"
  exit 0
else
  echo "⚠️  DATABASE_URL no configurado"
  echo ""
  echo "Para ejecutar con psql directo:"
  echo ""
  echo "1. Obtén tu database password desde:"
  echo "   https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
  echo ""
  echo "2. Ejecuta:"
  echo "   psql \"postgresql://postgres:[PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres\" \\"
  echo "     -f /tmp/check_rls.sql"
  echo ""
fi

# ============================================================================
# NO HAY MÉTODOS DISPONIBLES
# ============================================================================

echo "❌ No se pudo conectar a Supabase con ningún método"
echo ""
echo "📋 Opciones disponibles:"
echo ""
echo "1. 🤖 MCP Supabase:"
echo "   export SUPABASE_MCP_ENDPOINT='https://mcp.supabase.co'"
echo "   export SUPABASE_MCP_TOKEN='tu_token_mcp'"
echo ""
echo "2. 🔧 Supabase CLI:"
echo "   supabase login"
echo "   supabase link --project-ref $PROJECT_REF"
echo ""
echo "3. 🐘 PostgreSQL directo:"
echo "   export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.$PROJECT_REF.supabase.co:5432/postgres'"
echo ""
echo "Luego vuelve a ejecutar este script."
echo ""

exit 1
