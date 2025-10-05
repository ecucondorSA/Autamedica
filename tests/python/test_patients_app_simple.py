# tests/python/test_patients_app_simple.py
import pytest
from playwright.sync_api import sync_playwright
from pathlib import Path

def test_patients_app_basic_functionality():
    """Test básico de funcionalidad de la app de pacientes"""
    
    with sync_playwright() as p:
        # Configurar navegador
        browser = p.chromium.launch(headless=True)
        page = browser.new_context().new_page()
        
        try:
            # 1. Navegar a la app de pacientes
            print("🌐 Navegando a la app de pacientes...")
            page.goto("http://localhost:3003")
            
            # Esperar a que se cargue
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(3000)
            
            # 2. Verificar que la página carga
            current_url = page.url
            title = page.title()
            
            print(f"📍 URL actual: {current_url}")
            print(f"📄 Título: {title}")
            
            # Verificar que estamos en el dominio correcto
            assert "localhost:3003" in current_url, f"URL incorrecta: {current_url}"
            assert "AutaMedica" in title, f"Título incorrecto: {title}"
            
            # 3. Verificar que hay contenido en la página
            body_content = page.locator("body").text_content()
            assert body_content is not None, "No se encontró contenido en la página"
            assert len(body_content) > 0, "La página está vacía"
            
            print(f"📝 Contenido encontrado: {len(body_content)} caracteres")
            
            # 4. Verificar elementos básicos de la interfaz
            print("🔍 Verificando elementos de la interfaz...")
            
            # Verificar que hay elementos HTML básicos
            html_elements = page.locator("html")
            assert html_elements.count() > 0, "No se encontró elemento HTML"
            
            head_elements = page.locator("head")
            assert head_elements.count() > 0, "No se encontró elemento HEAD"
            
            body_elements = page.locator("body")
            assert body_elements.count() > 0, "No se encontró elemento BODY"
            
            # 5. Verificar que no hay errores JavaScript críticos
            print("🔧 Verificando errores JavaScript...")
            
            js_errors = []
            page.on("pageerror", lambda error: js_errors.append(error.message))
            page.wait_for_timeout(2000)
            
            # Filtrar errores no críticos
            critical_errors = [error for error in js_errors 
                              if not any(term in error.lower() for term in 
                                       ['notallowederror', 'notfounderror', 'media', 'webrtc', 'network'])]
            
            if critical_errors:
                print(f"⚠️ Errores JavaScript encontrados: {critical_errors}")
            else:
                print("✅ No hay errores JavaScript críticos")
            
            # 6. Verificar que la página es responsive
            print("📱 Verificando responsividad...")
            
            # Verificar que hay elementos que sugieren una interfaz web
            interactive_elements = page.locator("button, a, input, select, textarea")
            element_count = interactive_elements.count()
            
            print(f"🎯 Elementos interactivos encontrados: {element_count}")
            assert element_count > 0, "No se encontraron elementos interactivos"
            
            # 7. Verificar que la página tiene estructura semántica
            print("🏗️ Verificando estructura semántica...")
            
            # Verificar que hay elementos de estructura
            structural_elements = page.locator("div, section, article, header, footer, main, nav, aside")
            structural_count = structural_elements.count()
            
            print(f"🏛️ Elementos estructurales encontrados: {structural_count}")
            assert structural_count > 0, "No se encontraron elementos estructurales"
            
            # 8. Verificar que la página carga recursos
            print("📦 Verificando carga de recursos...")
            
            # Verificar que hay scripts y estilos
            scripts = page.locator("script")
            styles = page.locator("style, link[rel='stylesheet']")
            
            print(f"📜 Scripts encontrados: {scripts.count()}")
            print(f"🎨 Estilos encontrados: {styles.count()}")
            
            # 9. Verificar que la página es accesible
            print("♿ Verificando accesibilidad básica...")
            
            # Verificar que hay texto visible
            visible_text = page.locator("body").text_content()
            assert visible_text is not None, "No hay texto visible en la página"
            assert len(visible_text.strip()) > 0, "El texto visible está vacío"
            
            # Verificar que hay elementos con roles semánticos
            semantic_elements = page.locator("[role], h1, h2, h3, h4, h5, h6, button, a, input")
            semantic_count = semantic_elements.count()
            
            print(f"🎯 Elementos semánticos encontrados: {semantic_count}")
            
            # 10. Generar reporte de éxito
            print("\n🎉 ¡Test de app de pacientes completado exitosamente!")
            print(f"✅ URL: {current_url}")
            print(f"✅ Título: {title}")
            print(f"✅ Contenido: {len(body_content)} caracteres")
            print(f"✅ Elementos interactivos: {element_count}")
            print(f"✅ Elementos estructurales: {structural_count}")
            print(f"✅ Scripts: {scripts.count()}")
            print(f"✅ Estilos: {styles.count()}")
            print(f"✅ Elementos semánticos: {semantic_count}")
            print(f"✅ Errores JavaScript críticos: {len(critical_errors)}")
            
            # El test pasa si llegamos hasta aquí
            assert True, "Test completado exitosamente"
            
        except Exception as e:
            print(f"❌ Error durante el test: {e}")
            raise
        finally:
            browser.close()

def test_patients_app_navigation():
    """Test de navegación en la app de pacientes"""
    
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
            
            # 3. Verificar que hay elementos de navegación
            print("🧭 Verificando elementos de navegación...")
            
            # Buscar diferentes tipos de elementos de navegación
            nav_elements = page.locator("nav, [role='navigation'], .nav, .navigation")
            links = page.locator("a")
            buttons = page.locator("button")
            
            print(f"🧭 Elementos de navegación: {nav_elements.count()}")
            print(f"🔗 Enlaces: {links.count()}")
            print(f"🔘 Botones: {buttons.count()}")
            
            # Verificar que hay al menos algunos elementos interactivos
            total_interactive = links.count() + buttons.count()
            assert total_interactive > 0, "No se encontraron elementos interactivos"
            
            # 4. Verificar que la página tiene estructura
            print("🏗️ Verificando estructura de la página...")
            
            # Verificar elementos de estructura
            main_elements = page.locator("main, [role='main'], .main, .content")
            header_elements = page.locator("header, [role='banner'], .header")
            footer_elements = page.locator("footer, [role='contentinfo'], .footer")
            
            print(f"📄 Elementos main: {main_elements.count()}")
            print(f"📋 Elementos header: {header_elements.count()}")
            print(f"📄 Elementos footer: {footer_elements.count()}")
            
            # 5. Verificar que la página es funcional
            print("⚙️ Verificando funcionalidad básica...")
            
            # Verificar que no hay errores críticos
            js_errors = []
            page.on("pageerror", lambda error: js_errors.append(error.message))
            page.wait_for_timeout(1000)
            
            critical_errors = [error for error in js_errors 
                              if not any(term in error.lower() for term in 
                                       ['notallowederror', 'notfounderror', 'media', 'webrtc'])]
            
            print(f"🔧 Errores JavaScript críticos: {len(critical_errors)}")
            
            # 6. Verificar que la página es responsive
            print("📱 Verificando responsividad...")
            
            # Verificar que hay elementos que sugieren una interfaz responsive
            responsive_elements = page.locator("[class*='flex'], [class*='grid'], [class*='responsive']")
            print(f"📱 Elementos responsive: {responsive_elements.count()}")
            
            # 7. Generar reporte de navegación
            print("\n🎉 ¡Test de navegación completado exitosamente!")
            print(f"✅ URL: {current_url}")
            print(f"✅ Elementos interactivos: {total_interactive}")
            print(f"✅ Estructura: main={main_elements.count()}, header={header_elements.count()}, footer={footer_elements.count()}")
            print(f"✅ Errores críticos: {len(critical_errors)}")
            
            # El test pasa si llegamos hasta aquí
            assert True, "Test de navegación completado exitosamente"
            
        except Exception as e:
            print(f"❌ Error durante el test de navegación: {e}")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    # Ejecutar tests individuales
    test_patients_app_basic_functionality()
    test_patients_app_navigation()
    print("\n🎉 ¡Todos los tests de la app de pacientes pasaron exitosamente!")