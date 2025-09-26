# scripts/git-rescue.sh
# Uso:
#   bash scripts/git-rescue.sh <commit1> [<commit2> ...]
# Ejemplo:
#   bash scripts/git-rescue.sh 7490f7b f63d975 bc31494

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <commit1> [<commit2> ...]"
  exit 1
fi

# 1) Verificaciones básicas
git rev-parse --git-dir >/dev/null 2>&1
REMOTE=""
if git remote get-url ecucondor >/dev/null 2>&1; then
  REMOTE="ecucondor"
elif git remote get-url origin >/dev/null 2>&1; then
  REMOTE="origin"
else
  echo "No hay remoto 'ecucondor' ni 'origin' configurado."
  exit 1
fi

# 2) Sincroniza y crea rama base limpia desde remoto
git fetch "$REMOTE" --prune
BASE_BRANCH="${REMOTE}/main"
NEW_BRANCH="rescue-merge-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$NEW_BRANCH" "$BASE_BRANCH"

# 3) Crea ramas de rescate y aplica cherry-picks en orden
for COMMIT in "$@"; do
  if git cat-file -e "${COMMIT}^{commit}" 2>/dev/null; then
    # rama de rescate por commit (por si quieres revisar luego)
    git branch "rescue-${COMMIT}" "$COMMIT" || true
    # intenta cherry-pick limpio; si hay conflictos, pausa para resolver
    echo "==> cherry-pick ${COMMIT}"
    if ! git cherry-pick "$COMMIT"; then
      echo "Conflictos detectados en ${COMMIT}."
      echo "Resuelve, luego ejecuta: git add -A && git cherry-pick --continue"
      echo "Si deseas abortar: git cherry-pick --abort"
      exit 2
    fi
  else
    echo "Commit no válido: ${COMMIT} (saltado)"
  fi
done

# 4) Muestra resumen
echo "----------------------------------------"
echo "Rama creada: $NEW_BRANCH"
echo "Cherry-picks aplicados: $*"
echo "Sugerido: revisa cambios con 'git log --oneline -20' y 'git diff --stat ${BASE_BRANCH}..HEAD'"
