#!/usr/bin/env bash
set -e

# AI PR Review CLI - AutaMedica
# Genera revisiones automáticas con Claude y ChatGPT

base=${1:-origin/main}
echo "🔍 Generando revisión IA contra $base..."

# Ensure we have the latest from remote
git fetch origin --depth=1 >/dev/null 2>&1 || true

# Generate diff
echo "📊 Generando diff..."
git diff --unified=3 "$base"...HEAD > pr.diff 2>/dev/null || {
  echo "⚠️  No se pudo comparar contra $base, probando con HEAD~1..."
  git diff --unified=3 HEAD~1...HEAD > pr.diff 2>/dev/null || {
    echo "❌ No se pudo generar diff. Verificar que existan commits."
    exit 1
  }
  base="HEAD~1"
}

if [ ! -s pr.diff ]; then
  echo "❌ No hay cambios detectados contra $base"
  echo "💡 Tip: Haz algunos cambios primero o usa otro branch base"
  exit 1
fi

diff_lines=$(wc -l < pr.diff)
echo "📋 Diff generado: $diff_lines líneas"

# Medical software review prompt
MEDICAL_PROMPT="Revisá este diff de AutaMedica (plataforma médica HIPAA-compliant):

CONTEXTO:
- Monorepo: 4 apps especializadas + packages críticos
- TypeScript estricto con branded types médicos
- Compliance HIPAA obligatorio
- ESLint enterprise con boundaries

FOCO CRÍTICO:
🔒 SEGURIDAD: PHI/PII, secrets, validaciones médicas
📋 CONTRATOS: breaking changes @autamedica/types
⚡ PERFORMANCE: bundle size, async patterns
🏗️ ARQUITECTURA: boundaries, imports, deps

Entrega:
- Riesgos críticos (bloqueantes)
- Recomendaciones con ejemplos
- Checklist verificación HIPAA
- Score 0-100 + go/no-go"

# Claude Review
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "🤖 Consultando Claude..."

  curl -s https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d @<(jq -n \
      --arg prompt "$MEDICAL_PROMPT" \
      --arg diff "$(cat pr.diff)" \
      '{
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {role: "user", content: $prompt},
          {role: "user", content: $diff}
        ]
      }') \
    | jq -r '.content[0].text' > ai-review-claude.md 2>/dev/null || {
      echo "❌ Error llamando Claude API"
      echo "Error en Claude API" > ai-review-claude.md
    }

  if [ -s ai-review-claude.md ] && ! grep -q "Error" ai-review-claude.md; then
    echo "✅ Revisión Claude: ai-review-claude.md"
  else
    echo "⚠️  Claude review falló o incompleta"
  fi
else
  echo "⚠️  ANTHROPIC_API_KEY no configurado - omitiendo Claude"
fi

# ChatGPT Review
if [ -n "$OPENAI_API_KEY" ]; then
  echo "🧠 Consultando ChatGPT..."

  curl -s https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d @<(jq -n \
      --arg prompt "$MEDICAL_PROMPT" \
      --arg diff "$(cat pr.diff)" \
      '{
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 2000,
        messages: [
          {role: "system", content: "Eres revisor senior de AutaMedica. Enfócate en seguridad médica, contratos TypeScript y compliance HIPAA."},
          {role: "user", content: $prompt},
          {role: "user", content: $diff}
        ]
      }') \
    | jq -r '.choices[0].message.content' > ai-review-gpt.md 2>/dev/null || {
      echo "❌ Error llamando OpenAI API"
      echo "Error en OpenAI API" > ai-review-gpt.md
    }

  if [ -s ai-review-gpt.md ] && ! grep -q "Error" ai-review-gpt.md; then
    echo "✅ Revisión ChatGPT: ai-review-gpt.md"
  else
    echo "⚠️  ChatGPT review falló o incompleta"
  fi
else
  echo "⚠️  OPENAI_API_KEY no configurado - omitiendo ChatGPT"
fi

# Summary
echo ""
echo "📋 RESUMEN:"
echo "----------------------------------------"
echo "📊 Diff: $diff_lines líneas contra $base"

if [ -s ai-review-claude.md ] && ! grep -q "Error" ai-review-claude.md; then
  echo "🤖 Claude: ✅ ai-review-claude.md"
else
  echo "🤖 Claude: ❌ No disponible"
fi

if [ -s ai-review-gpt.md ] && ! grep -q "Error" ai-review-gpt.md; then
  echo "🧠 ChatGPT: ✅ ai-review-gpt.md"
else
  echo "🧠 ChatGPT: ❌ No disponible"
fi

echo ""
echo "🔧 CONFIGURACIÓN:"
echo "export ANTHROPIC_API_KEY=sk-ant-..."
echo "export OPENAI_API_KEY=sk-..."
echo ""
echo "📚 USO:"
echo "pnpm ai:review                    # vs origin/main"
echo "pnpm ai:review origin/develop     # vs origin/develop"
echo "bash scripts/ai-pr-review.sh      # directo"

# Clean up
rm -f pr.diff

echo ""
echo "✅ Revisión IA completada"