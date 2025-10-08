#!/usr/bin/env python3
"""
Client-Side Audit Logger
Audita y manipula logs del lado del cliente para la aplicación Autamedica.
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import argparse


class ClientAuditor:
    """Auditor de código del lado del cliente."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.issues = []
        self.stats = {
            'total_files': 0,
            'console_logs': 0,
            'fetch_calls': 0,
            'localStorage_usage': 0,
            'security_issues': 0,
            'client_components': 0,
            'server_components': 0,
            'css_files': 0,
            'inline_styles': 0,
            'tailwind_classes': 0,
            'important_usage': 0
        }

    def scan_directory(self, directory: str = 'apps') -> Dict[str, Any]:
        """Escanea directorio en busca de issues del cliente."""
        print(f"🔍 Escaneando {directory}...")

        target_dir = self.base_path / directory
        if not target_dir.exists():
            print(f"❌ Directorio {target_dir} no existe")
            return {}

        # Patrones a buscar
        patterns = {
            'console_log': r'console\.(log|warn|error|info|debug)',
            'fetch': r'fetch\(',
            'localStorage': r'localStorage\.(getItem|setItem|removeItem)',
            'sessionStorage': r'sessionStorage\.(getItem|setItem|removeItem)',
            'process_env': r'process\.env\.',
            'use_client': r'["\']use client["\']',
            'use_server': r'["\']use server["\']',
            'api_keys': r'(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*["\'][^"\']+["\']',
            'hardcoded_urls': r'https?://[^\s\'"]+',
        }

        # Escanear archivos JS/TS
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx']:
            for file_path in target_dir.rglob(ext):
                if 'node_modules' in str(file_path) or '.next' in str(file_path):
                    continue

                self.stats['total_files'] += 1
                self.audit_file(file_path, patterns)

        # Escanear archivos CSS
        for ext in ['*.css', '*.scss', '*.sass']:
            for file_path in target_dir.rglob(ext):
                if 'node_modules' in str(file_path) or '.next' in str(file_path):
                    continue

                self.stats['css_files'] += 1
                self.audit_css_file(file_path)

        return self.generate_report()

    def audit_file(self, file_path: Path, patterns: Dict[str, str]):
        """Audita un archivo individual."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')

                # Detectar tipo de componente
                if "'use client'" in content or '"use client"' in content:
                    self.stats['client_components'] += 1
                    component_type = 'client'
                elif "'use server'" in content or '"use server"' in content:
                    self.stats['server_components'] += 1
                    component_type = 'server'
                else:
                    component_type = 'unknown'

                # Detectar inline styles y Tailwind
                inline_style_matches = re.findall(r'style=\{[^}]+\}|style="[^"]+"', content)
                self.stats['inline_styles'] += len(inline_style_matches)

                tailwind_matches = re.findall(r'className=["\'`]([^"\'`]+)["\'`]', content)
                self.stats['tailwind_classes'] += len(tailwind_matches)

                # Buscar patrones
                for line_num, line in enumerate(lines, 1):
                    # Console logs (ignorar si está comentado)
                    if re.search(patterns['console_log'], line) and not line.strip().startswith('//'):
                        self.stats['console_logs'] += 1
                        self.issues.append({
                            'type': 'console_log',
                            'severity': 'warning',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': line.strip(),
                            'component_type': component_type
                        })

                    # Fetch calls
                    if re.search(patterns['fetch'], line):
                        self.stats['fetch_calls'] += 1
                        self.issues.append({
                            'type': 'fetch_call',
                            'severity': 'info',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': line.strip(),
                            'component_type': component_type
                        })

                    # localStorage
                    if re.search(patterns['localStorage'], line):
                        self.stats['localStorage_usage'] += 1
                        self.issues.append({
                            'type': 'localStorage',
                            'severity': 'info',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': line.strip(),
                            'component_type': component_type
                        })

                    # Security issues
                    if re.search(patterns['api_keys'], line):
                        self.stats['security_issues'] += 1
                        self.issues.append({
                            'type': 'security',
                            'severity': 'critical',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': '*** REDACTED ***',
                            'message': 'Posible API key hardcodeada',
                            'component_type': component_type
                        })

                    # process.env en cliente (excepto NODE_ENV y NEXT_PUBLIC que son válidos)
                    if component_type == 'client' and re.search(patterns['process_env'], line):
                        # NODE_ENV y NEXT_PUBLIC_* son válidos en Next.js (reemplazados en build time)
                        if 'NODE_ENV' not in line and 'NEXT_PUBLIC' not in line:
                            self.stats['security_issues'] += 1
                            self.issues.append({
                                'type': 'security',
                                'severity': 'error',
                                'file': str(file_path.relative_to(self.base_path)),
                                'line': line_num,
                                'content': line.strip(),
                                'message': 'process.env inseguro en componente cliente (usar NEXT_PUBLIC_* o mover a servidor)',
                                'component_type': component_type
                            })

        except Exception as e:
            print(f"⚠️  Error leyendo {file_path}: {e}")

    def audit_css_file(self, file_path: Path):
        """Audita un archivo CSS."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')

                for line_num, line in enumerate(lines, 1):
                    # Detectar !important
                    if '!important' in line:
                        self.stats['important_usage'] += 1
                        self.issues.append({
                            'type': 'css_important',
                            'severity': 'warning',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': line.strip(),
                            'message': 'Uso de !important detectado'
                        })

                    # Detectar URLs hardcodeadas en CSS
                    if re.search(r'url\(["\']?https?://[^)]+\)', line):
                        self.issues.append({
                            'type': 'css_hardcoded_url',
                            'severity': 'info',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': line.strip(),
                            'message': 'URL hardcodeada en CSS'
                        })

                    # Detectar colores inline (deberían estar en variables)
                    color_matches = re.findall(r'#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)', line)
                    if color_matches and 'var(' not in line:
                        self.issues.append({
                            'type': 'css_hardcoded_color',
                            'severity': 'info',
                            'file': str(file_path.relative_to(self.base_path)),
                            'line': line_num,
                            'content': line.strip(),
                            'message': f'Colores hardcodeados: {", ".join(color_matches)}'
                        })

        except Exception as e:
            print(f"⚠️  Error leyendo CSS {file_path}: {e}")

    def generate_report(self) -> Dict[str, Any]:
        """Genera reporte de auditoría."""
        return {
            'timestamp': datetime.now().isoformat(),
            'stats': self.stats,
            'issues': self.issues,
            'summary': {
                'total_issues': len(self.issues),
                'critical': len([i for i in self.issues if i['severity'] == 'critical']),
                'errors': len([i for i in self.issues if i['severity'] == 'error']),
                'warnings': len([i for i in self.issues if i['severity'] == 'warning']),
                'info': len([i for i in self.issues if i['severity'] == 'info'])
            }
        }


class LogManipulator:
    """Manipulador de logs del cliente."""

    def __init__(self, base_path: str):
        self.base_path = Path(base_path)

    def remove_console_logs(self, directory: str = 'apps', dry_run: bool = True):
        """Remueve console.logs del código."""
        print(f"🧹 {'[DRY RUN] ' if dry_run else ''}Removiendo console.logs...")

        target_dir = self.base_path / directory
        files_modified = 0
        logs_removed = 0

        for file_path in target_dir.rglob('*.{ts,tsx,js,jsx}'):
            if 'node_modules' in str(file_path) or '.next' in str(file_path):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    original = f.read()

                # Remover console.logs (preservar console.error/warn en dev)
                modified = re.sub(
                    r'^\s*console\.(log|info|debug)\([^)]*\);?\s*$',
                    '',
                    original,
                    flags=re.MULTILINE
                )

                if modified != original:
                    count = len(re.findall(r'console\.(log|info|debug)', original))
                    logs_removed += count
                    files_modified += 1

                    if not dry_run:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(modified)
                        print(f"✅ {file_path.relative_to(self.base_path)}: {count} logs removidos")
                    else:
                        print(f"🔍 {file_path.relative_to(self.base_path)}: {count} logs encontrados")

            except Exception as e:
                print(f"⚠️  Error procesando {file_path}: {e}")

        print(f"\n{'[DRY RUN] ' if dry_run else ''}📊 Archivos modificados: {files_modified}")
        print(f"{'[DRY RUN] ' if dry_run else ''}📊 Logs removidos: {logs_removed}")

        return files_modified, logs_removed

    def add_logging_wrapper(self, directory: str = 'apps'):
        """Agrega wrapper de logging centralizado."""
        logger_content = """// Auto-generated logger wrapper
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[APP]', ...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn('[APP]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[APP]', ...args);
    // Aquí se puede agregar logging a servicio externo (Sentry, etc.)
  },
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('[APP]', ...args);
    }
  }
};
"""

        # Crear logger en cada app
        target_dir = self.base_path / directory
        for app_dir in target_dir.iterdir():
            if app_dir.is_dir() and not app_dir.name.startswith('.'):
                logger_path = app_dir / 'src' / 'lib' / 'logger.ts'
                logger_path.parent.mkdir(parents=True, exist_ok=True)

                with open(logger_path, 'w', encoding='utf-8') as f:
                    f.write(logger_content)

                print(f"✅ Logger creado en {logger_path.relative_to(self.base_path)}")


def main():
    parser = argparse.ArgumentParser(description='Client-Side Audit Logger para Autamedica')
    parser.add_argument('command', choices=['audit', 'clean', 'add-logger'],
                       help='Comando a ejecutar')
    parser.add_argument('--path', default='/home/edu/Autamedica',
                       help='Path base del proyecto')
    parser.add_argument('--directory', default='apps',
                       help='Directorio a escanear')
    parser.add_argument('--output', default='audit-report.json',
                       help='Archivo de salida para reporte')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular cambios sin aplicarlos')

    args = parser.parse_args()

    if args.command == 'audit':
        auditor = ClientAuditor(args.path)
        report = auditor.scan_directory(args.directory)

        # Guardar reporte
        output_path = Path(args.path) / args.output
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)

        # Mostrar resumen
        print(f"\n{'='*60}")
        print("📊 RESUMEN DE AUDITORÍA")
        print(f"{'='*60}")
        print(f"📁 Archivos escaneados: {report['stats']['total_files']}")
        print(f"🔵 Componentes cliente: {report['stats']['client_components']}")
        print(f"🟢 Componentes servidor: {report['stats']['server_components']}")
        print(f"\n📝 Console logs: {report['stats']['console_logs']}")
        print(f"🌐 Fetch calls: {report['stats']['fetch_calls']}")
        print(f"💾 localStorage usage: {report['stats']['localStorage_usage']}")
        print(f"\n🎨 CSS:")
        print(f"  📄 Archivos CSS: {report['stats']['css_files']}")
        print(f"  🖌️  Inline styles: {report['stats']['inline_styles']}")
        print(f"  🏷️  Tailwind classes: {report['stats']['tailwind_classes']}")
        print(f"  ⚠️  !important usage: {report['stats']['important_usage']}")
        print(f"\n🚨 Issues encontrados:")
        print(f"  ❌ Critical: {report['summary']['critical']}")
        print(f"  🔴 Errors: {report['summary']['errors']}")
        print(f"  🟡 Warnings: {report['summary']['warnings']}")
        print(f"  ℹ️  Info: {report['summary']['info']}")
        print(f"\n📄 Reporte guardado en: {output_path}")

    elif args.command == 'clean':
        manipulator = LogManipulator(args.path)
        manipulator.remove_console_logs(args.directory, dry_run=args.dry_run)

    elif args.command == 'add-logger':
        manipulator = LogManipulator(args.path)
        manipulator.add_logging_wrapper(args.directory)


if __name__ == '__main__':
    main()
