"""
Ejemplo básico: Debug de una app
"""
import asyncio
import sys
from pathlib import Path

# Agregar src al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.debugger.session import DebugSession
from src.screenshot.manager import ScreenshotManager
from src.analyzer.engine import DataAnalyzer


async def main():
    """Debug básico de web-app"""
    print("🔍 Debug Básico - Web App")
    print("=" * 50)

    # Crear sesión de debugging
    async with DebugSession(
        url="http://localhost:3000",
        app_name="web-app",
        headless=False,
        slow_mo=500  # Slow motion para ver qué pasa
    ) as session:

        # Crear manager de screenshots
        screenshot_mgr = ScreenshotManager(
            session_id=session.session_id,
            app_name="web-app"
        )

        print("\n1. Navegando a la app...")
        success = await session.navigate(wait_until="networkidle")

        if not success:
            print("⚠️  Navegación falló")
            return

        print("✅ Navegación exitosa")

        # Screenshot inicial
        print("\n2. Tomando screenshot inicial...")
        screenshot_path = await session.screenshot("home")
        if screenshot_path:
            screenshot_mgr.save_screenshot_metadata(screenshot_path)
            screenshot_mgr.open_screenshot(screenshot_path)

        # Esperar para capturar datos
        print("\n3. Capturando datos (15 segundos)...")
        await asyncio.sleep(15)

        # Capturar métricas de performance
        print("\n4. Capturando métricas de performance...")
        await session.capture_performance_metrics()

        # Screenshot final
        print("\n5. Tomando screenshot final...")
        screenshot_path = await session.screenshot("after_wait")
        if screenshot_path:
            screenshot_mgr.save_screenshot_metadata(screenshot_path)
            screenshot_mgr.open_screenshot(screenshot_path)

        # Mostrar resumen
        print("\n" + "=" * 50)
        session.print_summary()
        screenshot_mgr.print_summary()

        # Analizar datos
        print("\n6. Analizando datos capturados...")
        analyzer = DataAnalyzer(session.data)
        result = analyzer.analyze(depth="deep")
        analyzer.print_report()

        # Guardar análisis
        analysis_file = analyzer.save_analysis()
        print(f"\n✅ Análisis guardado: {analysis_file}")


if __name__ == "__main__":
    asyncio.run(main())
