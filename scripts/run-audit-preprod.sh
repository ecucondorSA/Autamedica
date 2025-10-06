#!/usr/bin/env bash
set -e

# Runner para Auditoría Pre-Producción AutaMedica
# Basado en ai-pr-review.sh adaptado para YAML multi-agente

PROMPT_FILE="${1:-prompts/auditoria-preprod-autamedica.yaml}"
OUTPUT_DIR="generated-docs"
LOG_DIR=".logs"

echo "🏥 AutaMedica - Auditoría Pre-Producción"
echo "========================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
  echo "❌ Error: Ejecutar desde el directorio raíz de AutaMedica"
  exit 1
fi

# Verificar que existe el prompt YAML
if [ ! -f "$PROMPT_FILE" ]; then
  echo "❌ Error: No se encuentra $PROMPT_FILE"
  exit 1
fi

# Crear directorios necesarios
mkdir -p "$OUTPUT_DIR" "$LOG_DIR"

echo "📋 Configuración:"
echo "  Prompt: $PROMPT_FILE"
echo "  Output: $OUTPUT_DIR/"
echo "  Logs:   $LOG_DIR/"
echo ""

# Función para ejecutar comandos y registrar
run_step() {
  local step_name=$1
  local command=$2
  local output_file=$3

  echo "🔄 $step_name..."
  if eval "$command" > "$output_file" 2>&1; then
    echo "   ✅ Completado"
    return 0
  else
    echo "   ⚠️  Con warnings (ver $output_file)"
    return 1
  fi
}

# AGENTE 1: Code Audit
echo ""
echo "🔍 AGENTE 1: Revisión de Código y Build"
echo "---------------------------------------"

run_step "Versiones de herramientas" \
  "pnpm -v && node -v" \
  "$OUTPUT_DIR/versions.txt"

run_step "Instalación de dependencias" \
  "pnpm -w install --frozen-lockfile" \
  "$OUTPUT_DIR/install.log"

run_step "Lint y TypeCheck" \
  "pnpm -w turbo run lint typecheck --filter=..." \
  "$OUTPUT_DIR/lint-typecheck.log"

run_step "Tests" \
  "pnpm -w turbo run test --filter=... || true" \
  "$OUTPUT_DIR/tests.log"

run_step "Build de aplicaciones" \
  "pnpm -w turbo run build --filter=apps/*" \
  "$OUTPUT_DIR/build.log"

run_step "Detección de código no usado (Knip)" \
  "pnpm dlx knip --report || true" \
  "$OUTPUT_DIR/knip-report.txt"

run_step "Detección de console.log y debugger" \
  "grep -R 'console\\.log\\|debugger' -n apps packages || echo 'No se encontraron'" \
  "$OUTPUT_DIR/console-debugger.txt"

# AGENTE 2: Database Audit (si Supabase está configurado)
echo ""
echo "🗄️  AGENTE 2: Revisión de Base de Datos"
echo "---------------------------------------"

if command -v supabase &> /dev/null; then
  run_step "Listar migraciones" \
    "supabase migration list || echo 'Supabase no vinculado'" \
    "$OUTPUT_DIR/migrations.txt"

  run_step "Diff de esquema" \
    "supabase db diff --linked --schema public || echo 'Supabase no vinculado'" \
    "$OUTPUT_DIR/db-diff.sql"
else
  echo "   ⚠️  Supabase CLI no instalado - omitiendo database audit"
fi

# AGENTE 3: Environment Audit
echo ""
echo "🔐 AGENTE 3: Variables de Entorno"
echo "---------------------------------------"

run_step "Inventario de archivos .env" \
  "find . -name '.env*' -not -path './node_modules/*' -not -path './.git/*'" \
  "$OUTPUT_DIR/env-files.txt"

run_step "Detección de secretos en código" \
  "grep -R 'SECRET\\|TOKEN\\|KEY\\|PASSWORD' -n . --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' | head -n 100 || echo 'No se encontraron'" \
  "$OUTPUT_DIR/secrets-scan.txt"

# AGENTE 4: DNS & SSL Audit
echo ""
echo "🌐 AGENTE 4: DNS, SSL/TLS y Routing"
echo "---------------------------------------"

for domain in "auth.autamedica.com" "doctors.autamedica.com" "patients.autamedica.com"; do
  run_step "Headers de $domain" \
    "curl -sI https://$domain || echo 'Dominio no accesible'" \
    "$OUTPUT_DIR/headers-${domain//./-}.txt"
done

# AGENTE 5: CI/CD Audit
echo ""
echo "⚙️  AGENTE 5: Pipelines CI/CD"
echo "---------------------------------------"

if [ -d ".github/workflows" ]; then
  run_step "Listar workflows" \
    "ls -la .github/workflows" \
    "$OUTPUT_DIR/workflows.txt"

  run_step "Contenido de workflows" \
    "cat .github/workflows/*.yml" \
    "$OUTPUT_DIR/workflows-content.yml"
else
  echo "   ⚠️  No se encontró .github/workflows"
fi

# AGENTE 6: Security Audit
echo ""
echo "🔒 AGENTE 6: Seguridad y Vulnerabilidades"
echo "---------------------------------------"

run_step "Auditoría de dependencias (pnpm)" \
  "pnpm audit --prod --json || true" \
  "$OUTPUT_DIR/pnpm-audit.json"

# Generar reporte con Claude/GPT si las APIs están disponibles
echo ""
echo "🤖 Generando Reporte con IA..."
echo "---------------------------------------"

# Preparar contexto consolidado
CONTEXT_FILE="$OUTPUT_DIR/audit-context.txt"
cat > "$CONTEXT_FILE" <<EOF
# AutaMedica - Contexto de Auditoría Pre-Producción
# Generado: $(date)

## Versiones
$(cat "$OUTPUT_DIR/versions.txt" 2>/dev/null || echo "No disponible")

## Build Status
$(tail -20 "$OUTPUT_DIR/build.log" 2>/dev/null || echo "No disponible")

## Código No Usado
$(cat "$OUTPUT_DIR/knip-report.txt" 2>/dev/null || echo "No disponible")

## Console.log/Debugger
$(cat "$OUTPUT_DIR/console-debugger.txt" 2>/dev/null || echo "No disponible")

## Secretos Detectados
$(cat "$OUTPUT_DIR/secrets-scan.txt" 2>/dev/null || echo "No disponible")

## Vulnerabilidades
$(cat "$OUTPUT_DIR/pnpm-audit.json" 2>/dev/null | head -50 || echo "No disponible")
EOF

# Prompt para IA
AI_PROMPT="Analiza esta auditoría de pre-producción de AutaMedica (plataforma médica):

CONTEXTO YAML:
$(cat "$PROMPT_FILE")

DATOS RECOLECTADOS:
$(cat "$CONTEXT_FILE")

Genera un reporte ejecutivo en formato Markdown con:
1. Resumen Ejecutivo (3-5 bullets)
2. Hallazgos Críticos (bloqueantes para producción)
3. Hallazgos Medios (recomendaciones importantes)
4. Hallazgos Menores (mejoras opcionales)
5. Plan de Remediación con comandos específicos
6. Score de Production-Readiness (0-100)

Usa el formato especificado en el YAML (secciones, severidad, artefactos)."

# Claude Review (si está configurado)
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "🤖 Generando reporte con Claude..."

  curl -s https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d @<(jq -n \
      --arg prompt "$AI_PROMPT" \
      '{
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.1,
        messages: [
          {role: "user", content: $prompt}
        ]
      }') \
    | jq -r '.content[0].text' > "$OUTPUT_DIR/AUDIT_PREPROD_AUTAMEDICA.md" 2>/dev/null || {
      echo "❌ Error llamando Claude API"
      echo "Error en Claude API" > "$OUTPUT_DIR/AUDIT_PREPROD_AUTAMEDICA.md"
    }

  if [ -s "$OUTPUT_DIR/AUDIT_PREPROD_AUTAMEDICA.md" ] && ! grep -q "Error" "$OUTPUT_DIR/AUDIT_PREPROD_AUTAMEDICA.md"; then
    echo "✅ Reporte Claude: $OUTPUT_DIR/AUDIT_PREPROD_AUTAMEDICA.md"
  else
    echo "⚠️  Claude review falló"
  fi
else
  echo "⚠️  ANTHROPIC_API_KEY no configurado"
  echo "   Para habilitar Claude review: export ANTHROPIC_API_KEY=sk-ant-..."
fi

# ChatGPT Review (si está configurado)
if [ -n "$OPENAI_API_KEY" ]; then
  echo "🧠 Generando reporte con ChatGPT..."

  curl -s https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d @<(jq -n \
      --arg prompt "$AI_PROMPT" \
      '{
        model: "gpt-4o",
        temperature: 0.1,
        max_tokens: 4000,
        messages: [
          {role: "system", content: "Eres auditor senior de AutaMedica. Enfócate en producción-readiness, seguridad y compliance."},
          {role: "user", content: $prompt}
        ]
      }') \
    | jq -r '.choices[0].message.content' > "$OUTPUT_DIR/AUDIT_PREPROD_GPT.md" 2>/dev/null || {
      echo "❌ Error llamando OpenAI API"
      echo "Error en OpenAI API" > "$OUTPUT_DIR/AUDIT_PREPROD_GPT.md"
    }

  if [ -s "$OUTPUT_DIR/AUDIT_PREPROD_GPT.md" ] && ! grep -q "Error" "$OUTPUT_DIR/AUDIT_PREPROD_GPT.md"; then
    echo "✅ Reporte ChatGPT: $OUTPUT_DIR/AUDIT_PREPROD_GPT.md"
  else
    echo "⚠️  ChatGPT review falló"
  fi
else
  echo "⚠️  OPENAI_API_KEY no configurado"
  echo "   Para habilitar ChatGPT review: export OPENAI_API_KEY=sk-..."
fi

# Resumen Final
echo ""
echo "📊 RESUMEN DE AUDITORÍA"
echo "========================================"
echo ""
echo "📁 Artefactos generados en $OUTPUT_DIR/:"
ls -lh "$OUTPUT_DIR"/ | tail -n +2

echo ""
echo "🔧 Configuración de APIs IA:"
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "   🤖 Claude: ✅ Configurado"
else
  echo "   🤖 Claude: ❌ No configurado (export ANTHROPIC_API_KEY=...)"
fi

if [ -n "$OPENAI_API_KEY" ]; then
  echo "   🧠 ChatGPT: ✅ Configurado"
else
  echo "   🧠 ChatGPT: ❌ No configurado (export OPENAI_API_KEY=...)"
fi

echo ""
echo "✅ Auditoría completada"
echo ""
echo "📚 Próximos pasos:"
echo "   1. Revisar: $OUTPUT_DIR/AUDIT_PREPROD_AUTAMEDICA.md"
echo "   2. Si hay críticos, revisar: $OUTPUT_DIR/AUDIT_QUICKFIX_PLAN.md"
echo "   3. Aplicar remediaciones en staging primero"
echo ""
