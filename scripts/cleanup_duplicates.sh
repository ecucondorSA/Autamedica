#!/usr/bin/env bash
# AutaMedica - Cleanup Duplicates
# Elimina scripts/componentes duplicados por hash y nombres sospechosos

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🧹 AutaMedica - Cleanup de duplicados..."

# Arrays para tracking
declare -A file_hashes
removed_count=0

# Función para calcular hash
get_hash() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "$file" | awk '{print $1}'
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "$file" | awk '{print $1}'
    else
        md5sum "$file" | awk '{print $1}'
    fi
}

# 1. Eliminar archivos con nombres sospechosos (copy, old, bak, etc.)
echo "📋 Buscando archivos con nombres sospechosos..."
find scripts/ apps/ packages/ -type f \
    \( -name "*-copy.*" -o \
       -name "*-old.*" -o \
       -name "*-bak.*" -o \
       -name "*.backup" -o \
       -name "*duplicado*" -o \
       -name "*-2.*" -o \
       -name "*_copy.*" -o \
       -name "*_old.*" \) \
    2>/dev/null | while read -r suspicious; do
    if git ls-files --error-unmatch "$suspicious" &> /dev/null; then
        echo "  🗑️  Eliminando: $suspicious"
        git rm -f "$suspicious" 2>/dev/null || rm -f "$suspicious"
        ((removed_count++)) || true
    fi
done

# 2. Detectar duplicados exactos por hash en scripts/
echo "🔍 Detectando duplicados por hash en scripts/..."
while IFS= read -r -d '' file; do
    # Saltar si no es archivo regular o está en node_modules
    [ -f "$file" ] || continue
    [[ "$file" == *"node_modules"* ]] && continue

    hash=$(get_hash "$file")

    if [ -n "${file_hashes[$hash]:-}" ]; then
        # Duplicado encontrado
        original="${file_hashes[$hash]}"
        echo "  ⚠️  Duplicado detectado:"
        echo "      Original: $original"
        echo "      Duplicado: $file"

        # Mantener el primero encontrado (usualmente el más corto o en git)
        if git ls-files --error-unmatch "$file" &> /dev/null; then
            echo "      → Eliminando duplicado: $file"
            git rm -f "$file" 2>/dev/null || rm -f "$file"
            ((removed_count++)) || true
        fi
    else
        # Primer archivo con este hash
        file_hashes[$hash]="$file"
    fi
done < <(find scripts/ -type f \( -name "*.sh" -o -name "*.mjs" -o -name "*.js" -o -name "*.ts" \) -print0 2>/dev/null)

# 3. Detectar duplicados en componentes (apps/*/src/components/)
echo "🔍 Detectando duplicados por hash en componentes..."
declare -A component_hashes

while IFS= read -r -d '' file; do
    [ -f "$file" ] || continue
    [[ "$file" == *"node_modules"* ]] && continue
    [[ "$file" == *".next"* ]] && continue

    hash=$(get_hash "$file")

    if [ -n "${component_hashes[$hash]:-}" ]; then
        original="${component_hashes[$hash]}"
        echo "  ⚠️  Componente duplicado:"
        echo "      Original: $original"
        echo "      Duplicado: $file"

        # Mantener el original
        if git ls-files --error-unmatch "$file" &> /dev/null; then
            echo "      → Eliminando duplicado: $file"
            git rm -f "$file" 2>/dev/null || rm -f "$file"
            ((removed_count++)) || true
        fi
    else
        component_hashes[$hash]="$file"
    fi
done < <(find apps/*/src/components/ packages/*/src/components/ -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 2>/dev/null)

# 4. Limpiar archivos vacíos
echo "🔍 Eliminando archivos vacíos..."
find scripts/ apps/ packages/ -type f -size 0 2>/dev/null | while read -r empty; do
    if git ls-files --error-unmatch "$empty" &> /dev/null; then
        echo "  🗑️  Eliminando archivo vacío: $empty"
        git rm -f "$empty" 2>/dev/null || rm -f "$empty"
        ((removed_count++)) || true
    fi
done

# 5. Limpiar directorios vacíos
echo "🔍 Eliminando directorios vacíos..."
find scripts/ apps/ packages/ -type d -empty 2>/dev/null | while read -r emptydir; do
    echo "  🗑️  Eliminando directorio vacío: $emptydir"
    rmdir "$emptydir" 2>/dev/null || true
done

echo ""
echo "✅ Cleanup completado"
echo "   Archivos eliminados: $removed_count"
echo ""

exit 0
