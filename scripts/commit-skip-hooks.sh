#!/bin/bash
# Emergency commit without hooks
# Uso: ./scripts/commit-skip-hooks.sh "mensaje"

if [ -z "$1" ]; then
  echo "❌ Se requiere un mensaje de commit"
  echo "Uso: $0 \"mensaje del commit\""
  exit 1
fi

git commit --no-verify -m "$1

🚨 Hooks saltados (commit de emergencia)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ Commit creado (hooks saltados)"
echo "⚠️  Recordá que los checks correrán en CI"
