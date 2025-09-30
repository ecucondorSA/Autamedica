#!/bin/sh
set -e
echo "🔴 Sesión finalizada – sincronizando glosarios"

pnpm -s docs:db:ci
pnpm -s docs:db:check-diff || {
  echo "❌ DB Glossary desincronizado. Ejecutá pnpm docs:db y commiteá los cambios."; exit 1;
}

# También guarda el payload JSON del cierre de sesión en logs/sessions/
mkdir -p logs/sessions 2>/dev/null || true

# timestamp seguro para nombre de archivo
ts="$(date -Is | tr ':' '-' | tr '+' '_')"
out="logs/sessions/session-${ts}.json"

# El hook nos pasa un JSON por STDIN → lo guardamos tal cual
cat > "$out" 2>/dev/null || true

echo "🔒 SessionEnd guardado en $out"