#!/usr/bin/env python3
"""
CLI Principal - Playwright Debugger Enterprise
"""
import asyncio
import sys
from pathlib import Path
from typing import Optional

import click
from rich.panel import Panel

from .utils.config import Config
from .utils.logger import logger
from .debugger.session import DebugSession
from .screenshot.manager import ScreenshotManager
from .analyzer.engine import DataAnalyzer


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """
    🔍 Playwright Debugger Enterprise - Autamedica

    Sistema profesional de debugging con captura completa de datos,
    análisis profundo y ciclo de desarrollo persistente.
    """
    # Banner
    banner = Panel.fit(
        "[bold cyan]Playwright Debugger Enterprise[/bold cyan]\n"
        "[dim]Autamedica Development Tools[/dim]",
        border_style="cyan"
    )
    logger.console.print(banner)


@cli.command()
@click.option("--url", help="URL de la app a debugear")
@click.option("--app", type=click.Choice(list(Config.APPS.keys())), help="App de Autamedica")
@click.option("--screenshots/--no-screenshots", default=True, help="Tomar screenshots")
@click.option("--analyze/--no-analyze", default=True, help="Analizar datos automáticamente")
@click.option("--headless/--no-headless", default=None, help="Modo headless")
@click.option("--slow-mo", type=int, help="Slow motion (ms)")
def debug(
    url: Optional[str],
    app: Optional[str],
    screenshots: bool,
    analyze: bool,
    headless: Optional[bool],
    slow_mo: Optional[int]
):
    """
    🐛 Iniciar sesión de debugging

    Ejemplos:

        autamedica-monitor debug --app web-app

        autamedica-monitor debug --url http://localhost:3000 --screenshots

        autamedica-monitor debug --app doctors --analyze
    """
    # Determinar URL
    if app:
        url = Config.get_app_url(app)
        app_name = app
    elif url:
        app_name = "custom"
    else:
        logger.error("Debe especificar --url o --app")
        sys.exit(1)

    logger.info(f"Debugging: {app_name} @ {url}")

    # Ejecutar debug session
    asyncio.run(
        _run_debug_session(
            url=url,
            app_name=app_name,
            take_screenshots=screenshots,
            auto_analyze=analyze,
            headless=headless,
            slow_mo=slow_mo
        )
    )


async def _run_debug_session(
    url: str,
    app_name: str,
    take_screenshots: bool = True,
    auto_analyze: bool = True,
    headless: Optional[bool] = None,
    slow_mo: Optional[int] = None
):
    """Ejecutar sesión de debugging"""
    # Crear session
    async with DebugSession(
        url=url,
        app_name=app_name,
        headless=headless,
        slow_mo=slow_mo
    ) as session:

        # Screenshot manager
        screenshot_manager = ScreenshotManager(
            session_id=session.session_id,
            app_name=app_name
        )

        # Navegar
        success = await session.navigate()
        if not success:
            logger.warning("Navegación falló, pero continuando...")

        # Screenshot inicial
        if take_screenshots:
            screenshot_path = await session.screenshot("initial")
            if screenshot_path:
                screenshot_manager.save_screenshot_metadata(screenshot_path)
                screenshot_manager.open_screenshot(screenshot_path)

        # Esperar un momento para capturar datos
        logger.info("Capturando datos... (10 segundos)")
        await asyncio.sleep(10)

        # Capturar métricas de performance
        await session.capture_performance_metrics()

        # Screenshot final
        if take_screenshots:
            screenshot_path = await session.screenshot("final")
            if screenshot_path:
                screenshot_manager.save_screenshot_metadata(screenshot_path)
                screenshot_manager.open_screenshot(screenshot_path)

        # Mostrar resumen
        session.print_summary()
        if take_screenshots:
            screenshot_manager.print_summary()

        # Analizar si está habilitado
        if auto_analyze or Config.AUTO_ANALYZE:
            logger.section("🔬 Analizando datos...")
            analyzer = DataAnalyzer(session.data)
            result = analyzer.analyze()
            analyzer.print_report()
            analyzer.save_analysis()


@cli.command()
@click.argument("session_id", required=False)
@click.option("--latest", is_flag=True, help="Analizar última sesión")
@click.option("--depth", type=click.Choice(["quick", "standard", "deep"]), help="Profundidad del análisis")
def analyze(session_id: Optional[str], latest: bool, depth: Optional[str]):
    """
    🔬 Analizar datos de una sesión

    Ejemplos:

        autamedica-monitor analyze abc123def

        autamedica-monitor analyze --latest --depth deep
    """
    # Buscar session file
    if latest:
        # Buscar el archivo más reciente
        session_files = sorted(
            Config.DATA_DIR.glob("session_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        if not session_files:
            logger.error("No se encontraron sesiones")
            sys.exit(1)
        session_file = session_files[0]
        logger.info(f"Analizando última sesión: {session_file.name}")
    elif session_id:
        session_file = Config.DATA_DIR / f"session_{session_id}.json"
        if not session_file.exists():
            logger.error(f"Sesión no encontrada: {session_id}")
            sys.exit(1)
    else:
        logger.error("Debe especificar session_id o --latest")
        sys.exit(1)

    # Analizar
    analyzer = DataAnalyzer.from_file(session_file)
    result = analyzer.analyze(depth=depth)
    analyzer.print_report()
    analyzer.save_analysis()


@cli.command()
@click.option("--apps", help="Apps a monitorear (comma-separated)")
@click.option("--interval", type=int, default=30, help="Intervalo en segundos")
@click.option("--max-runs", type=int, help="Máximo de runs (default: infinito)")
def watch(apps: Optional[str], interval: int, max_runs: Optional[int]):
    """
    👁️  Monitoreo persistente de apps

    Ejecuta debugging continuo en las apps especificadas.

    Ejemplos:

        autamedica-monitor watch --apps web-app,doctors --interval 30

        autamedica-monitor watch --apps patients --max-runs 10
    """
    if not apps:
        logger.error("Debe especificar --apps")
        sys.exit(1)

    app_list = [app.strip() for app in apps.split(",")]

    # Validar apps
    for app in app_list:
        if app not in Config.APPS:
            logger.error(f"App desconocida: {app}")
            sys.exit(1)

    logger.section(f"👁️  Iniciando Monitoreo Persistente")
    logger.info(f"Apps: {', '.join(app_list)}")
    logger.info(f"Intervalo: {interval}s")
    logger.info(f"Max runs: {max_runs or 'infinito'}")

    asyncio.run(_run_persistent_monitor(app_list, interval, max_runs))


async def _run_persistent_monitor(apps: list, interval: int, max_runs: Optional[int]):
    """Ejecutar monitor persistente"""
    run_count = 0

    try:
        while True:
            run_count += 1
            logger.section(f"🔄 Run #{run_count}")

            for app_name in apps:
                url = Config.get_app_url(app_name)
                logger.info(f"Monitoring: {app_name}")

                try:
                    async with DebugSession(
                        url=url,
                        app_name=app_name,
                        headless=True  # Headless para monitor continuo
                    ) as session:
                        await session.navigate()
                        await asyncio.sleep(5)  # Capturar datos brevemente
                        await session.capture_performance_metrics()

                        # Analizar quick
                        analyzer = DataAnalyzer(session.data)
                        result = analyzer.analyze(depth="quick")

                        # Solo mostrar si hay issues
                        if result.issues_found > 0:
                            logger.warning(f"{app_name}: {result.issues_found} issues (severity: {result.severity})")
                            analyzer.print_report()
                        else:
                            logger.success(f"{app_name}: OK")

                except Exception as e:
                    logger.error(f"Error monitoring {app_name}: {str(e)}")

            # Check max runs
            if max_runs and run_count >= max_runs:
                logger.info("Max runs alcanzado, terminando...")
                break

            # Esperar intervalo
            logger.info(f"Esperando {interval}s hasta próximo run...")
            await asyncio.sleep(interval)

    except KeyboardInterrupt:
        logger.info("\nMonitoreo interrumpido por usuario")


@cli.command()
@click.option("--session-id", help="Session ID")
@click.option("--latest", is_flag=True, help="Última sesión")
@click.option("--format", type=click.Choice(["html", "json", "md"]), default="html", help="Formato del reporte")
@click.option("--open", "open_report", is_flag=True, help="Abrir reporte automáticamente")
def report(session_id: Optional[str], latest: bool, format: str, open_report: bool):
    """
    📄 Generar reporte detallado

    Ejemplos:

        autamedica-monitor report --latest --format html --open

        autamedica-monitor report --session-id abc123 --format json
    """
    # Buscar session
    if latest:
        session_files = sorted(
            Config.DATA_DIR.glob("session_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        if not session_files:
            logger.error("No se encontraron sesiones")
            sys.exit(1)
        session_file = session_files[0]
    elif session_id:
        session_file = Config.DATA_DIR / f"session_{session_id}.json"
        if not session_file.exists():
            logger.error(f"Sesión no encontrada: {session_id}")
            sys.exit(1)
    else:
        logger.error("Debe especificar --session-id o --latest")
        sys.exit(1)

    # Generar reporte
    logger.info(f"Generando reporte {format}...")

    # Por ahora, solo JSON (HTML y MD requieren templates)
    if format == "json":
        analyzer = DataAnalyzer.from_file(session_file)
        result = analyzer.analyze()
        report_path = analyzer.save_analysis()
        logger.success(f"Reporte generado: {report_path}")

        if open_report:
            import subprocess
            subprocess.run(["xdg-open", str(report_path)])
    else:
        logger.warning(f"Formato {format} aún no implementado, usando JSON")
        analyzer = DataAnalyzer.from_file(session_file)
        result = analyzer.analyze()
        report_path = analyzer.save_analysis()
        logger.success(f"Reporte generado: {report_path}")


@cli.command()
@click.option("--days", type=int, default=7, help="Eliminar sesiones mayores a X días")
def cleanup(days: int):
    """
    🧹 Limpiar sesiones y screenshots antiguos

    Ejemplos:

        autamedica-monitor cleanup --days 7
    """
    logger.section("🧹 Limpiando datos antiguos")

    # Limpiar session files
    import time
    cutoff = time.time() - (days * 24 * 60 * 60)

    cleaned_sessions = 0
    for session_file in Config.DATA_DIR.glob("session_*.json"):
        if session_file.stat().st_mtime < cutoff:
            session_file.unlink()
            cleaned_sessions += 1

    logger.info(f"Sesiones eliminadas: {cleaned_sessions}")

    # Limpiar screenshots
    cleaned_screenshots = 0
    for screenshot_file in Config.SCREENSHOTS_DIR.glob("*.*"):
        if screenshot_file.stat().st_mtime < cutoff:
            screenshot_file.unlink()
            cleaned_screenshots += 1

    logger.info(f"Screenshots eliminados: {cleaned_screenshots}")

    logger.success(f"Limpieza completada")


@cli.command()
def sessions():
    """
    📋 Listar sesiones disponibles

    Muestra todas las sesiones de debugging guardadas.
    """
    logger.section("📋 Sesiones Disponibles")

    session_files = sorted(
        Config.DATA_DIR.glob("session_*.json"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )

    if not session_files:
        logger.info("No hay sesiones guardadas")
        return

    table = logger.print_table(
        title=f"{len(session_files)} Sesiones",
        show_header=True,
        header_style="bold cyan"
    )
    table.add_column("Session ID", style="cyan")
    table.add_column("App", style="green")
    table.add_column("Fecha", style="yellow")
    table.add_column("Tamaño", style="magenta")

    import json
    from datetime import datetime

    for session_file in session_files[:20]:  # Mostrar últimas 20
        with open(session_file, "r") as f:
            data = json.load(f)

        session_id = data["session_id"][:8]
        app_name = data["app_name"]
        started_at = datetime.fromisoformat(data["started_at"]).strftime("%Y-%m-%d %H:%M")
        size_kb = session_file.stat().st_size // 1024

        table.add_row(session_id, app_name, started_at, f"{size_kb} KB")

    logger.console.print(table)


@cli.command()
def config():
    """
    ⚙️  Mostrar configuración actual
    """
    logger.section("⚙️  Configuración Actual")
    logger.print_json(Config.to_dict())


if __name__ == "__main__":
    cli()
