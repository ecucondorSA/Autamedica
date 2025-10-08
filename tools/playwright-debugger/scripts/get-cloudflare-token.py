#!/usr/bin/env python3
"""
Script automatizado para obtener API Token de Cloudflare
Usando Playwright
"""
import asyncio
import sys
from pathlib import Path

# Agregar src al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout


async def get_cloudflare_token():
    """
    Automatizar obtención de token de Cloudflare
    """
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  🔐 Obtener API Token de Cloudflare - Automatizado         ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()

    async with async_playwright() as p:
        # Lanzar navegador (NO headless para que veas el proceso)
        print("🚀 Abriendo navegador...")
        browser = await p.chromium.launch(
            headless=False,
            slow_mo=1000  # Slow motion para que veas cada paso
        )

        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()

        try:
            # Paso 1: Ir a la página de API tokens
            print("\n📍 Paso 1: Navegando a Cloudflare API Tokens...")
            await page.goto("https://dash.cloudflare.com/profile/api-tokens")

            print("⏳ Esperando que inicies sesión...")
            print("   (Si ya estás logueado, esto será rápido)")

            # Esperar a que cargue la página (o el login)
            try:
                # Esperar por el botón "Create Token" (señal de que está logueado)
                await page.wait_for_selector('text=Create Token', timeout=60000)
                print("✅ Sesión iniciada")
            except PlaywrightTimeout:
                print("\n❌ Timeout esperando la página de tokens")
                print("   Por favor, inicia sesión manualmente en el navegador")
                print("   y presiona ENTER cuando estés listo...")
                input()
                await page.wait_for_selector('text=Create Token', timeout=30000)

            # Paso 2: Click en "Create Token"
            print("\n📍 Paso 2: Haciendo clic en 'Create Token'...")
            await page.click('text=Create Token')
            await asyncio.sleep(2)

            # Paso 3: Buscar la plantilla "Edit Cloudflare Workers"
            print("\n📍 Paso 3: Buscando plantilla 'Edit Cloudflare Workers'...")

            # Intentar diferentes selectores
            templates = [
                'text=Edit Cloudflare Workers',
                'text=Cloudflare Workers',
                '[data-testid*="worker"]',
                'text=Workers'
            ]

            template_found = False
            for selector in templates:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        print(f"✅ Encontrado con selector: {selector}")
                        template_found = True
                        break
                except:
                    continue

            if not template_found:
                print("\n⚠️  No se encontró automáticamente la plantilla")
                print("   Por favor:")
                print("   1. Busca manualmente 'Edit Cloudflare Workers' o 'Cloudflare Pages'")
                print("   2. Haz clic en 'Use template'")
                print("   3. Presiona ENTER cuando estés en la página de configuración...")
                input()
            else:
                # Intentar hacer clic en "Use template"
                print("\n📍 Paso 4: Haciendo clic en 'Use template'...")
                try:
                    await page.click('text=Use template')
                    await asyncio.sleep(2)
                except:
                    print("   (Manual: Haz clic en 'Use template' y presiona ENTER)")
                    input()

            # Paso 5: Configurar permisos
            print("\n📍 Paso 5: Configurando permisos...")
            print("   ⚠️  Asegúrate de que tenga estos permisos:")
            print("   • Account - Cloudflare Pages - Edit")
            print("   • Zone - Workers Routes - Edit (opcional)")
            print()
            print("   Presiona ENTER cuando hayas configurado los permisos...")
            input()

            # Paso 6: Continue to summary
            print("\n📍 Paso 6: Continuando al resumen...")
            try:
                await page.click('text=Continue to summary')
                await asyncio.sleep(2)
            except:
                print("   (Manual: Haz clic en 'Continue to summary' y presiona ENTER)")
                input()

            # Paso 7: Create Token
            print("\n📍 Paso 7: Creando token...")
            try:
                await page.click('text=Create Token')
                await asyncio.sleep(3)
            except:
                print("   (Manual: Haz clic en 'Create Token' y presiona ENTER)")
                input()

            # Paso 8: Capturar el token
            print("\n📍 Paso 8: Capturando token...")
            print("⏳ Buscando el token en la página...")

            # El token suele estar en un elemento con clase específica o en un input
            token_selectors = [
                'input[value^="v1."]',  # Tokens de CF empiezan con v1.
                'code',
                '[data-testid*="token"]',
                'pre',
                'input[type="text"]'
            ]

            token = None
            for selector in token_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element:
                        value = await element.get_attribute('value')
                        if not value:
                            value = await element.inner_text()

                        if value and len(value) > 30:  # Los tokens son largos
                            token = value.strip()
                            print(f"✅ Token encontrado (longitud: {len(token)})")
                            break
                except:
                    continue

            if not token:
                print("\n⚠️  No se pudo capturar el token automáticamente")
                print("   Por favor, copia el token manualmente y pégalo aquí:")
                token = input("Token: ").strip()

            # Paso 9: Guardar el token
            print("\n📍 Paso 9: Guardando token...")

            # Guardar en archivo temporal
            token_file = Path('/tmp/cloudflare_token.txt')
            token_file.write_text(token)

            # También crear el comando de export
            export_cmd = f'export CLOUDFLARE_API_TOKEN="{token}"'
            cmd_file = Path('/tmp/cloudflare_export.sh')
            cmd_file.write_text(export_cmd)
            cmd_file.chmod(0o600)  # Solo lectura por el usuario

            print("✅ Token guardado en:")
            print(f"   • {token_file}")
            print(f"   • {cmd_file}")
            print()
            print("═══════════════════════════════════════════════════════════════")
            print("🎉 TOKEN OBTENIDO EXITOSAMENTE")
            print("═══════════════════════════════════════════════════════════════")
            print()
            print("📋 Token:")
            print(f"   {token[:20]}...{token[-20:]}")
            print()
            print("🚀 Próximos pasos:")
            print()
            print("1. Exportar el token:")
            print(f"   source {cmd_file}")
            print("   # O manualmente:")
            print(f"   export CLOUDFLARE_API_TOKEN=\"{token}\"")
            print()
            print("2. Ejecutar el script de actualización:")
            print("   cd /home/edu/Autamedica")
            print("   ./update-cf-vars-simple.sh")
            print()
            print("═══════════════════════════════════════════════════════════════")

            # Esperar un poco antes de cerrar
            print("\nPresiona ENTER para cerrar el navegador...")
            input()

        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()

            print("\nPresiona ENTER para cerrar el navegador...")
            input()

        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(get_cloudflare_token())
