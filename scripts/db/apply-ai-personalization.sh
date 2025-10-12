#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "❌ SUPABASE_DB_URL no seteado. Exportá la URL de conexión a tu DB."
  echo "   Ej: export SUPABASE_DB_URL='postgres://...'"
  exit 1
fi

echo "▶ Aplicando migración: AI user personalization"
psql "$SUPABASE_DB_URL" -f supabase/migrations/20251012_ai_user_personalization.sql

echo "▶ Aplicando seed opcional (FAQ/patrón de ejemplo)"
psql "$SUPABASE_DB_URL" -f supabase/seed_ai_personalization.sql || true

echo "✅ Listo"

