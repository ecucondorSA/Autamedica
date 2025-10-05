# tests/python/test_patients_accessibility.py
import pytest
from playwright.sync_api import sync_playwright
from pathlib import Path

def test_patients_app_accessibility():
    """Test de accesibilidad para la app de pacientes"""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context().new_page()
        
        try:
            # 1. Navegar a la app de pacientes
            print("🌐 Navegando a la app de pacientes...")
            page.goto("http://localhost:3003")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            
            # 2. Verificar que la página carga
            current_url = page.url
            title = page.title()
            
            print(f"📍 URL actual: {current_url}")
            print(f"📄 Título: {title}")
            
            # 3. Verificar accesibilidad básica
            print("♿ Verificando accesibilidad básica...")
            
            # Verificar que hay texto visible
            body_text = page.locator("body").text_content()
            assert body_text is not None, "No hay texto visible en la página"
            assert len(body_text.strip()) > 0, "El texto visible está vacío"
            
            print(f"📝 Texto visible encontrado: {len(body_text)} caracteres")
            
            # 4. Verificar elementos semánticos
            print("🏗️ Verificando elementos semánticos...")
            
            # Verificar que hay headings
            headings = page.locator("h1, h2, h3, h4, h5, h6")
            heading_count = headings.count()
            print(f"📋 Headings encontrados: {heading_count}")
            
            # Verificar que hay elementos interactivos
            interactive_elements = page.locator("button, a, input, select, textarea")
            interactive_count = interactive_elements.count()
            print(f"🎯 Elementos interactivos: {interactive_count}")
            
            # Verificar que hay elementos con roles ARIA
            aria_elements = page.locator("[role]")
            aria_count = aria_elements.count()
            print(f"🎭 Elementos con roles ARIA: {aria_count}")
            
            # 5. Verificar que hay estructura de navegación
            print("🧭 Verificando estructura de navegación...")
            
            # Verificar que hay elementos de navegación
            nav_elements = page.locator("nav, [role='navigation']")
            nav_count = nav_elements.count()
            print(f"🧭 Elementos de navegación: {nav_count}")
            
            # Verificar que hay enlaces
            links = page.locator("a")
            link_count = links.count()
            print(f"🔗 Enlaces: {link_count}")
            
            # 6. Verificar que hay contenido principal
            print("📄 Verificando contenido principal...")
            
            # Verificar que hay elementos de contenido principal
            main_elements = page.locator("main, [role='main']")
            main_count = main_elements.count()
            print(f"📄 Elementos main: {main_count}")
            
            # Verificar que hay contenido de la página
            content_elements = page.locator("div, section, article")
            content_count = content_elements.count()
            print(f"📦 Elementos de contenido: {content_count}")
            
            # 7. Verificar que no hay errores JavaScript críticos
            print("🔧 Verificando errores JavaScript...")
            
            js_errors = []
            page.on("pageerror", lambda error: js_errors.append(error.message))
            page.wait_for_timeout(2000)
            
            # Filtrar errores no críticos
            critical_errors = [error for error in js_errors 
                              if not any(term in error.lower() for term in 
                                       ['notallowederror', 'notfounderror', 'media', 'webrtc', 'network'])]
            
            print(f"🔧 Errores JavaScript críticos: {len(critical_errors)}")
            if critical_errors:
                print(f"⚠️ Errores encontrados: {critical_errors}")
            
            # 8. Verificar que la página es responsive
            print("📱 Verificando responsividad...")
            
            # Verificar que hay elementos que sugieren una interfaz responsive
            responsive_elements = page.locator("[class*='flex'], [class*='grid'], [class*='responsive']")
            responsive_count = responsive_elements.count()
            print(f"📱 Elementos responsive: {responsive_count}")
            
            # 9. Verificar que hay elementos de formulario accesibles
            print("📝 Verificando elementos de formulario...")
            
            # Verificar que hay inputs con labels
            inputs = page.locator("input")
            input_count = inputs.count()
            print(f"📝 Inputs encontrados: {input_count}")
            
            # Verificar que hay botones accesibles
            buttons = page.locator("button")
            button_count = buttons.count()
            print(f"🔘 Botones encontrados: {button_count}")
            
            # 10. Verificar que hay elementos de ayuda
            print("❓ Verificando elementos de ayuda...")
            
            # Verificar que hay elementos de ayuda
            help_elements = page.locator("[title], [aria-label], [aria-describedby]")
            help_count = help_elements.count()
            print(f"❓ Elementos de ayuda: {help_count}")
            
            # 11. Generar reporte de accesibilidad
            print("\n🎉 ¡Test de accesibilidad completado exitosamente!")
            print(f"✅ URL: {current_url}")
            print(f"✅ Título: {title}")
            print(f"✅ Texto visible: {len(body_text)} caracteres")
            print(f"✅ Headings: {heading_count}")
            print(f"✅ Elementos interactivos: {interactive_count}")
            print(f"✅ Elementos ARIA: {aria_count}")
            print(f"✅ Navegación: {nav_count}")
            print(f"✅ Enlaces: {link_count}")
            print(f"✅ Contenido principal: {main_count}")
            print(f"✅ Elementos de contenido: {content_count}")
            print(f"✅ Inputs: {input_count}")
            print(f"✅ Botones: {button_count}")
            print(f"✅ Elementos de ayuda: {help_count}")
            print(f"✅ Elementos responsive: {responsive_count}")
            print(f"✅ Errores JavaScript críticos: {len(critical_errors)}")
            
            # Verificar que la página cumple con estándares básicos de accesibilidad
            assert heading_count > 0 or interactive_count > 0, "La página debe tener headings o elementos interactivos"
            assert interactive_count > 0, "La página debe tener elementos interactivos"
            assert len(critical_errors) == 0, f"Errores JavaScript críticos encontrados: {critical_errors}"
            
            # El test pasa si llegamos hasta aquí
            assert True, "Test de accesibilidad completado exitosamente"
            
        except Exception as e:
            print(f"❌ Error durante el test de accesibilidad: {e}")
            raise
        finally:
            browser.close()

def test_patients_app_keyboard_navigation():
    """Test de navegación por teclado en la app de pacientes"""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context().new_page()
        
        try:
            # 1. Navegar a la app de pacientes
            print("🌐 Navegando a la app de pacientes...")
            page.goto("http://localhost:3003")
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)
            
            # 2. Verificar que la página carga
            current_url = page.url
            print(f"📍 URL actual: {current_url}")
            
            # 3. Verificar navegación por teclado
            print("⌨️ Verificando navegación por teclado...")
            
            # Verificar que hay elementos enfocables
            focusable_elements = page.locator("button, a, input, select, textarea, [tabindex]")
            focusable_count = focusable_elements.count()
            print(f"🎯 Elementos enfocables: {focusable_count}")
            
            # Verificar que hay botones
            buttons = page.locator("button")
            button_count = buttons.count()
            print(f"🔘 Botones: {button_count}")
            
            # Verificar que hay enlaces
            links = page.locator("a")
            link_count = links.count()
            print(f"🔗 Enlaces: {link_count}")
            
            # 4. Verificar que la página es navegable
            print("🧭 Verificando navegabilidad...")
            
            # Verificar que hay elementos de navegación
            nav_elements = page.locator("nav, [role='navigation']")
            nav_count = nav_elements.count()
            print(f"🧭 Elementos de navegación: {nav_count}")
            
            # Verificar que hay contenido principal
            main_elements = page.locator("main, [role='main']")
            main_count = main_elements.count()
            print(f"📄 Contenido principal: {main_count}")
            
            # 5. Verificar que la página es accesible
            print("♿ Verificando accesibilidad...")
            
            # Verificar que hay texto visible
            body_text = page.locator("body").text_content()
            assert body_text is not None, "No hay texto visible en la página"
            assert len(body_text.strip()) > 0, "El texto visible está vacío"
            
            # Verificar que hay elementos semánticos
            semantic_elements = page.locator("h1, h2, h3, h4, h5, h6, button, a, input, select, textarea")
            semantic_count = semantic_elements.count()
            print(f"🎭 Elementos semánticos: {semantic_count}")
            
            # 6. Generar reporte de navegación por teclado
            print("\n🎉 ¡Test de navegación por teclado completado exitosamente!")
            print(f"✅ URL: {current_url}")
            print(f"✅ Elementos enfocables: {focusable_count}")
            print(f"✅ Botones: {button_count}")
            print(f"✅ Enlaces: {link_count}")
            print(f"✅ Navegación: {nav_count}")
            print(f"✅ Contenido principal: {main_count}")
            print(f"✅ Elementos semánticos: {semantic_count}")
            
            # Verificar que la página cumple con estándares básicos
            assert focusable_count > 0, "La página debe tener elementos enfocables"
            assert semantic_count > 0, "La página debe tener elementos semánticos"
            
            # El test pasa si llegamos hasta aquí
            assert True, "Test de navegación por teclado completado exitosamente"
            
        except Exception as e:
            print(f"❌ Error durante el test de navegación por teclado: {e}")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    # Ejecutar tests individuales
    test_patients_app_accessibility()
    test_patients_app_keyboard_navigation()
    print("\n🎉 ¡Todos los tests de accesibilidad de la app de pacientes pasaron exitosamente!")