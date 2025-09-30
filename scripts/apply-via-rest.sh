#!/bin/bash

# Script para aplicar migración vía REST API de Supabase
# Uso: ./apply-via-rest.sh

echo "🚀 Aplicando migración via Supabase REST API..."

# Leer el SQL de migración
MIGRATION_SQL=$(cat apply-migration-direct.sql)

# Aplicar usando curl
curl -X POST "https://gtyvdircfhmdjiaelqkg.supabase.co/rest/v1/rpc/exec" \
  -H "apikey: REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA" \
  -H "Authorization: Bearer REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$MIGRATION_SQL\"}" \
  --max-time 30

echo ""
echo "✅ Migración aplicada. Verifica el resultado arriba."