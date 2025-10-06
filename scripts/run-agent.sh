#!/usr/bin/env bash
set -euo pipefail

#############################################################################
# run-agent.sh - Ejecutar Agente Individual
#############################################################################
# Wrapper para ejecutar un agente específico del workflow agéntico
#############################################################################

AGENT_NAME="${1:-}"

if [[ -z "$AGENT_NAME" ]]; then
  echo "Usage: $0 <agent_name>"
  echo ""
  echo "Available agents:"
  echo "  agent_code      - Lint, typecheck, build, tests"
  echo "  agent_db        - DB migrations and RLS validation"
  echo "  agent_security  - Security headers and checks"
  echo "  agent_qa        - Final QA validation"
  echo "  agent_docs      - Auto-commit documentation"
  exit 1
fi

# Ejecutar el workflow con el agente específico
bash "$(dirname "$0")/run-agentic-local.sh" --agent "$AGENT_NAME"
