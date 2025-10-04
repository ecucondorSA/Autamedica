#!/usr/bin/env bash
set +e  # Continue on errors

COMMAND="${1:-build}"
EXIT_CODE=0
FAILED_APPS=()

APPS=(
  "web-app"
  "auth"
  "doctors"
  "patients"
  "companies"
  "admin"
)

echo "🚀 Ejecutando '$COMMAND' en todas las apps..."
echo "----------------------------------------"

for APP in "${APPS[@]}"; do
  echo ""
  echo "📦 App: $APP"
  echo "   Comando: pnpm --filter @autamedica/$APP $COMMAND"

  if pnpm --filter "@autamedica/$APP" "$COMMAND"; then
    echo "   ✅ $APP: SUCCESS"
  else
    APP_EXIT=$?
    echo "   ❌ $APP: FAILED (exit code: $APP_EXIT)"
    FAILED_APPS+=("$APP")
    EXIT_CODE=1
  fi
done

echo ""
echo "========================================="
echo "📊 RESUMEN FINAL"
echo "========================================="

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Todas las apps completaron '$COMMAND' exitosamente"
else
  echo "⚠️  Algunas apps fallaron:"
  for FAILED in "${FAILED_APPS[@]}"; do
    echo "   ❌ $FAILED"
  done
  echo ""
  echo "Total exitosas: $((${#APPS[@]} - ${#FAILED_APPS[@]}))/${#APPS[@]}"
  echo "Total fallidas: ${#FAILED_APPS[@]}/${#APPS[@]}"
fi

echo "========================================="
exit $EXIT_CODE
