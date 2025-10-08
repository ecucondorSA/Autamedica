"""
Ejemplo: Monitoreo persistente de múltiples apps
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Agregar src al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.debugger.session import DebugSession
from src.analyzer.engine import DataAnalyzer
from src.utils.logger import logger


async def monitor_app(app_name: str, url: str) -> dict:
    """Monitorear una app y retornar resultados"""
    try:
        async with DebugSession(
            url=url,
            app_name=app_name,
            headless=True  # Headless para monitoreo continuo
        ) as session:

            # Navegar
            await session.navigate()

            # Esperar brevemente
            await asyncio.sleep(5)

            # Capturar métricas
            await session.capture_performance_metrics()

            # Analizar quick
            analyzer = DataAnalyzer(session.data)
            result = analyzer.analyze(depth="quick")

            return {
                "app": app_name,
                "success": True,
                "issues": result.issues_found,
                "severity": result.severity,
                "errors": len(session.data.javascript_errors),
                "failed_requests": len(session.get_failed_requests()),
            }

    except Exception as e:
        logger.error(f"Error monitoring {app_name}: {str(e)}")
        return {
            "app": app_name,
            "success": False,
            "error": str(e)
        }


async def run_monitor_cycle(apps: dict):
    """Ejecutar un ciclo de monitoreo"""
    logger.section(f"🔄 Monitor Cycle - {datetime.now().strftime('%H:%M:%S')}")

    results = await asyncio.gather(
        *[monitor_app(app_name, url) for app_name, url in apps.items()]
    )

    # Mostrar resultados
    all_ok = True
    for result in results:
        if not result["success"]:
            logger.error(f"❌ {result['app']}: {result.get('error', 'Unknown error')}")
            all_ok = False
        elif result["issues"] > 0:
            logger.warning(
                f"⚠️  {result['app']}: {result['issues']} issues "
                f"(severity: {result['severity']}, "
                f"errors: {result['errors']}, "
                f"failed: {result['failed_requests']})"
            )
            all_ok = False
        else:
            logger.success(f"✅ {result['app']}: OK")

    return all_ok


async def main():
    """Monitoreo persistente de todas las apps"""
    logger.section("👁️  Monitoreo Persistente - Autamedica")

    # Apps a monitorear
    apps = {
        "web-app": "http://localhost:3000",
        "doctors": "http://localhost:3001",
        "patients": "http://localhost:3002",
        "companies": "http://localhost:3003",
    }

    logger.info(f"Monitoreando: {', '.join(apps.keys())}")
    logger.info("Intervalo: 30 segundos")
    logger.info("Presiona Ctrl+C para detener\n")

    try:
        cycle = 0
        while True:
            cycle += 1
            logger.info(f"Cycle #{cycle}")

            all_ok = await run_monitor_cycle(apps)

            if all_ok:
                logger.success("✅ Todas las apps OK")
            else:
                logger.warning("⚠️  Algunas apps tienen issues")

            # Esperar 30 segundos
            logger.info("Esperando 30 segundos...\n")
            await asyncio.sleep(30)

    except KeyboardInterrupt:
        logger.info("\n\nMonitoreo detenido por usuario")


if __name__ == "__main__":
    asyncio.run(main())
