#!/usr/bin/env python3
"""
Auto-fix issues encontrados por AUT
"""

import json
import re
from pathlib import Path
from collections import defaultdict


def fix_console_logs():
    """Remueve o comenta console.logs según el contexto."""
    print("🧹 Corrigiendo console.logs...")

    with open('audit-report.json', 'r') as f:
        data = json.load(f)

    # Agrupar por archivo
    files_to_fix = defaultdict(list)
    for issue in data['issues']:
        if issue['type'] == 'console_log':
            files_to_fix[issue['file']].append(issue)

    fixed_count = 0
    for file_path, issues in files_to_fix.items():
        full_path = Path('/home/edu/Autamedica') / file_path

        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            # Ordenar issues por línea descendente para no alterar números de línea
            issues.sort(key=lambda x: x['line'], reverse=True)

            for issue in issues:
                line_idx = issue['line'] - 1
                line = lines[line_idx]

                # Determinar si comentar o eliminar
                # Si es la única cosa en la línea, comentar
                stripped = line.strip()
                if stripped.startswith('console.'):
                    # Comentar la línea
                    indent = len(line) - len(line.lstrip())
                    lines[line_idx] = ' ' * indent + '// ' + stripped + '\n'
                    fixed_count += 1

            # Escribir archivo
            with open(full_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)

            print(f"✅ {file_path}: {len(issues)} logs comentados")

        except Exception as e:
            print(f"⚠️  Error en {file_path}: {e}")

    print(f"\n✅ Total: {fixed_count} console.logs comentados")
    return fixed_count


def fix_css_important():
    """Analiza y reporta !important en CSS."""
    print("\n🎨 Analizando !important en CSS...")

    with open('audit-report.json', 'r') as f:
        data = json.load(f)

    # Agrupar por archivo
    files_with_important = defaultdict(list)
    for issue in data['issues']:
        if issue['type'] == 'css_important':
            files_with_important[issue['file']].append(issue)

    print(f"\n📄 Archivos con !important: {len(files_with_important)}")
    for file_path, issues in sorted(files_with_important.items()):
        print(f"  • {file_path}: {len(issues)} usos")

    # Para CSS, es mejor revisar manualmente
    # Mostrar los más problemáticos
    print("\n⚠️  !important debe revisarse manualmente para mejorar especificidad CSS")
    print("   Considera usar clases más específicas en lugar de !important")

    return len(files_with_important)


def main():
    print("="*60)
    print("🔧 AUTO-FIX AUDIT ISSUES")
    print("="*60)

    # Fix console.logs
    console_fixed = fix_console_logs()

    # Analizar CSS important
    css_files = fix_css_important()

    print("\n" + "="*60)
    print("📊 RESUMEN")
    print("="*60)
    print(f"✅ Console logs comentados: {console_fixed}")
    print(f"📄 Archivos CSS con !important: {css_files}")
    print("\n💡 Ejecuta 'python3 scripts/client-audit-logger.py audit' para verificar")


if __name__ == '__main__':
    main()
