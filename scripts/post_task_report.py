#!/usr/bin/env python3
"""
AutaMedica - Post Task Report
Genera reporte consolidado después de cada tarea del agente
"""

import json
import glob
import os
import datetime
from pathlib import Path
from typing import Dict, List, Any

PROJECT_ROOT = Path(__file__).parent.parent
GENERATED_DOCS = PROJECT_ROOT / "generated-docs"
LOGS_DIR = PROJECT_ROOT / ".logs"

# Colors para terminal
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'

def log(msg: str, color: str = Colors.RESET):
    print(f"{color}{msg}{Colors.RESET}")

def collect_artifacts() -> Dict[str, Any]:
    """Recolecta todos los artefactos generados"""

    artifacts = {
        "docs": [],
        "logs": [],
        "screenshots": [],
        "reports": [],
    }

    # Documentos generados
    if GENERATED_DOCS.exists():
        artifacts["docs"] = sorted([
            str(f.relative_to(PROJECT_ROOT))
            for f in GENERATED_DOCS.glob("*")
            if f.is_file()
        ])

    # Logs
    if LOGS_DIR.exists():
        artifacts["logs"] = sorted([
            str(f.relative_to(PROJECT_ROOT))
            for f in LOGS_DIR.glob("*.log")
        ])

    # Screenshots
    artifacts["screenshots"] = sorted([
        str(f.relative_to(PROJECT_ROOT))
        for f in GENERATED_DOCS.glob("*.png")
    ]) if GENERATED_DOCS.exists() else []

    # Reportes JSON
    artifacts["reports"] = sorted([
        str(f.relative_to(PROJECT_ROOT))
        for f in GENERATED_DOCS.glob("*-report.json")
    ]) if GENERATED_DOCS.exists() else []

    return artifacts

def load_report_summaries() -> List[Dict[str, Any]]:
    """Carga resúmenes de reportes JSON existentes"""

    summaries = []

    if not GENERATED_DOCS.exists():
        return summaries

    for report_file in GENERATED_DOCS.glob("*-report.json"):
        try:
            with open(report_file, 'r') as f:
                data = json.load(f)
                summaries.append({
                    "file": report_file.name,
                    "summary": data.get("summary", {}),
                    "timestamp": data.get("timestamp", "unknown")
                })
        except (json.JSONDecodeError, IOError) as e:
            log(f"⚠️  Error leyendo {report_file.name}: {e}", Colors.YELLOW)

    return summaries

def generate_report() -> Dict[str, Any]:
    """Genera el reporte consolidado"""

    log("🐍 AutaMedica - Python Post Task Report", Colors.CYAN)
    log("=" * 60, Colors.CYAN)

    # Timestamp
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    # Branch y commit info (si está disponible)
    branch = "unknown"
    commit = "unknown"

    try:
        import subprocess
        branch = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=PROJECT_ROOT,
            text=True
        ).strip()
        commit = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=PROJECT_ROOT,
            text=True
        ).strip()
    except Exception:
        pass

    # Recolectar artefactos
    log("\n📦 Recolectando artefactos...", Colors.CYAN)
    artifacts = collect_artifacts()

    log(f"   Docs: {len(artifacts['docs'])}", Colors.GREEN)
    log(f"   Logs: {len(artifacts['logs'])}", Colors.GREEN)
    log(f"   Screenshots: {len(artifacts['screenshots'])}", Colors.GREEN)
    log(f"   Reports: {len(artifacts['reports'])}", Colors.GREEN)

    # Cargar resúmenes de reportes
    log("\n📊 Cargando resúmenes de reportes...", Colors.CYAN)
    report_summaries = load_report_summaries()

    for summary in report_summaries:
        log(f"   ✅ {summary['file']}: {summary['summary']}", Colors.GREEN)

    # Generar reporte consolidado
    report = {
        "timestamp": timestamp,
        "branch": branch,
        "commit": commit,
        "artifacts": artifacts,
        "report_summaries": report_summaries,
        "note": "Post-task verification completed by Python agent."
    }

    # Guardar reporte
    report_path = GENERATED_DOCS / "POST_TASK_REPORT.json"
    GENERATED_DOCS.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    log(f"\n📄 Reporte guardado en: {report_path.relative_to(PROJECT_ROOT)}", Colors.CYAN)

    # Generar también versión Markdown
    markdown_report = generate_markdown_report(report)
    markdown_path = GENERATED_DOCS / "POST_TASK_REPORT.md"

    with open(markdown_path, 'w') as f:
        f.write(markdown_report)

    log(f"📄 Reporte Markdown: {markdown_path.relative_to(PROJECT_ROOT)}", Colors.CYAN)

    return report

def generate_markdown_report(report: Dict[str, Any]) -> str:
    """Genera versión Markdown del reporte"""

    md = f"""# Post Task Report - AutaMedica Agentic OS

**Fecha**: {report['timestamp']}
**Branch**: {report['branch']}
**Commit**: {report['commit']}

## Artefactos Generados

### Documentos ({len(report['artifacts']['docs'])})
"""

    for doc in report['artifacts']['docs']:
        md += f"- `{doc}`\n"

    md += f"""
### Logs ({len(report['artifacts']['logs'])})
"""

    for log_file in report['artifacts']['logs']:
        md += f"- `{log_file}`\n"

    md += f"""
### Screenshots ({len(report['artifacts']['screenshots'])})
"""

    for screenshot in report['artifacts']['screenshots']:
        md += f"- `{screenshot}`\n"

    md += f"""
### Reportes JSON ({len(report['artifacts']['reports'])})
"""

    for report_file in report['artifacts']['reports']:
        md += f"- `{report_file}`\n"

    md += """
## Resúmenes de Checks

"""

    for summary in report['report_summaries']:
        md += f"### {summary['file']}\n\n"
        md += f"```json\n{json.dumps(summary['summary'], indent=2)}\n```\n\n"

    md += f"""
## Nota

{report['note']}

---
*Generado automáticamente por el sistema Agentic OS*
"""

    return md

def main():
    """Punto de entrada principal"""

    try:
        report = generate_report()

        log("\n" + "=" * 60, Colors.CYAN)
        log("✅ Post task report completado exitosamente", Colors.GREEN)
        log("=" * 60, Colors.CYAN)

        return 0

    except Exception as e:
        log(f"\n❌ Error generando reporte: {e}", Colors.RED)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
