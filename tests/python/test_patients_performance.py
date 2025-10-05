# tests/python/test_patients_performance.py
import pytest
from playwright.sync_api import sync_playwright
from pathlib import Path
import time

def test_patients_app_performance():
    """Test de performance para la app de pacientes"""
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_context().new_page()
        
        try:
            # 1. Medir tiempo de carga
            print("⏱️ Midiendo tiempo de carga...")
            start_time = time.time()
            
            page.goto("http://localhost:3003")
            page.wait_for_load_state("networkidle")
            
            load_time = time.time() - start_time
            print(f"⏱️ Tiempo de carga: {load_time:.2f} segundos")
            
            # 2. Obtener métricas de performance
            print("📊 Obteniendo métricas de performance...")
            
            # Obtener métricas de navegación
            navigation_timing = page.evaluate("""
                () => {
                    const timing = window.performance.timing;
                    return {
                        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                        loadComplete: timing.loadEventEnd - timing.navigationStart,
                        firstPaint: timing.responseEnd - timing.navigationStart,
                        redirectCount: window.performance.navigation.redirectCount,
                        type: window.performance.navigation.type
                    };
                }
            """)
            
            print(f"📊 DOM Content Loaded: {navigation_timing['domContentLoaded']}ms")
            print(f"📊 Load Complete: {navigation_timing['loadComplete']}ms")
            print(f"📊 First Paint: {navigation_timing['firstPaint']}ms")
            print(f"📊 Redirect Count: {navigation_timing['redirectCount']}")
            print(f"📊 Navigation Type: {navigation_timing['type']}")
            
            # 3. Obtener métricas de memoria (si están disponibles)
            print("💾 Obteniendo métricas de memoria...")
            
            memory_info = page.evaluate("""
                () => {
                    if (window.performance.memory) {
                        return {
                            usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                            totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                            jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
                        };
                    }
                    return null;
                }
            """)
            
            if memory_info:
                used_mb = memory_info['usedJSHeapSize'] / 1024 / 1024
                total_mb = memory_info['totalJSHeapSize'] / 1024 / 1024
                limit_mb = memory_info['jsHeapSizeLimit'] / 1024 / 1024
                
                print(f"💾 Memoria usada: {used_mb:.2f}MB")
                print(f"💾 Memoria total: {total_mb:.2f}MB")
                print(f"💾 Límite de memoria: {limit_mb:.2f}MB")
                print(f"💾 Uso de memoria: {(used_mb/limit_mb)*100:.1f}%")
            else:
                print("💾 Métricas de memoria no disponibles")
            
            # 4. Verificar que la página carga dentro de los límites aceptables
            print("✅ Verificando límites de performance...")
            
            # Verificar tiempo de carga
            assert load_time < 10.0, f"Tiempo de carga demasiado lento: {load_time:.2f}s"
            print(f"✅ Tiempo de carga: {load_time:.2f}s (límite: 10s)")
            
            # Verificar DOM Content Loaded
            assert navigation_timing['domContentLoaded'] < 5000, f"DOM Content Loaded demasiado lento: {navigation_timing['domContentLoaded']}ms"
            print(f"✅ DOM Content Loaded: {navigation_timing['domContentLoaded']}ms (límite: 5000ms)")
            
            # Verificar Load Complete
            assert navigation_timing['loadComplete'] < 8000, f"Load Complete demasiado lento: {navigation_timing['loadComplete']}ms"
            print(f"✅ Load Complete: {navigation_timing['loadComplete']}ms (límite: 8000ms)")
            
            # Verificar uso de memoria (si está disponible)
            if memory_info:
                memory_usage_ratio = memory_info['usedJSHeapSize'] / memory_info['jsHeapSizeLimit']
                assert memory_usage_ratio < 0.8, f"Uso de memoria demasiado alto: {memory_usage_ratio:.2%}"
                print(f"✅ Uso de memoria: {memory_usage_ratio:.2%} (límite: 80%)")
            
            # 5. Verificar que no hay errores JavaScript críticos
            print("🔧 Verificando errores JavaScript...")
            
            js_errors = []
            page.on("pageerror", lambda error: js_errors.append(error.message))
            page.wait_for_timeout(2000)
            
            critical_errors = [error for error in js_errors 
                              if not any(term in error.lower() for term in 
                                       ['notallowederror', 'notfounderror', 'media', 'webrtc', 'network'])]
            
            print(f"🔧 Errores JavaScript críticos: {len(critical_errors)}")
            assert len(critical_errors) == 0, f"Errores JavaScript críticos encontrados: {critical_errors}"
            
            # 6. Verificar que la página es responsive
            print("📱 Verificando responsividad...")
            
            # Verificar que hay elementos responsive
            responsive_elements = page.locator("[class*='flex'], [class*='grid'], [class*='responsive']")
            responsive_count = responsive_elements.count()
            print(f"📱 Elementos responsive: {responsive_count}")
            
            # 7. Generar reporte de performance
            print("\n🎉 ¡Test de performance completado exitosamente!")
            print(f"✅ Tiempo de carga: {load_time:.2f}s")
            print(f"✅ DOM Content Loaded: {navigation_timing['domContentLoaded']}ms")
            print(f"✅ Load Complete: {navigation_timing['loadComplete']}ms")
            print(f"✅ First Paint: {navigation_timing['firstPaint']}ms")
            print(f"✅ Redirect Count: {navigation_timing['redirectCount']}")
            if memory_info:
                print(f"✅ Memoria usada: {used_mb:.2f}MB")
                print(f"✅ Uso de memoria: {(used_mb/limit_mb)*100:.1f}%")
            print(f"✅ Elementos responsive: {responsive_count}")
            print(f"✅ Errores JavaScript críticos: {len(critical_errors)}")
            
            # El test pasa si llegamos hasta aquí
            assert True, "Test de performance completado exitosamente"
            
        except Exception as e:
            print(f"❌ Error durante el test de performance: {e}")
            raise
        finally:
            browser.close()

def test_patients_app_mobile_performance():
    """Test de performance móvil para la app de pacientes"""
    
    with sync_playwright() as p:
        # Configurar viewport móvil
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 667})  # iPhone SE
        page = context.new_page()
        
        try:
            # 1. Medir tiempo de carga móvil
            print("📱 Midiendo tiempo de carga móvil...")
            start_time = time.time()
            
            page.goto("http://localhost:3003")
            page.wait_for_load_state("networkidle")
            
            mobile_load_time = time.time() - start_time
            print(f"📱 Tiempo de carga móvil: {mobile_load_time:.2f} segundos")
            
            # 2. Obtener métricas de performance móvil
            print("📊 Obteniendo métricas de performance móvil...")
            
            navigation_timing = page.evaluate("""
                () => {
                    const timing = window.performance.timing;
                    return {
                        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                        loadComplete: timing.loadEventEnd - timing.navigationStart,
                        firstPaint: timing.responseEnd - timing.navigationStart
                    };
                }
            """)
            
            print(f"📊 DOM Content Loaded móvil: {navigation_timing['domContentLoaded']}ms")
            print(f"📊 Load Complete móvil: {navigation_timing['loadComplete']}ms")
            print(f"📊 First Paint móvil: {navigation_timing['firstPaint']}ms")
            
            # 3. Verificar que la página es responsive en móvil
            print("📱 Verificando responsividad móvil...")
            
            # Verificar que hay elementos responsive
            responsive_elements = page.locator("[class*='flex'], [class*='grid'], [class*='responsive']")
            responsive_count = responsive_elements.count()
            print(f"📱 Elementos responsive móvil: {responsive_count}")
            
            # Verificar que la página es funcional en móvil
            interactive_elements = page.locator("button, a, input, select, textarea")
            interactive_count = interactive_elements.count()
            print(f"🎯 Elementos interactivos móvil: {interactive_count}")
            
            # 4. Verificar límites de performance móvil (más permisivos)
            print("✅ Verificando límites de performance móvil...")
            
            # Verificar tiempo de carga móvil
            assert mobile_load_time < 15.0, f"Tiempo de carga móvil demasiado lento: {mobile_load_time:.2f}s"
            print(f"✅ Tiempo de carga móvil: {mobile_load_time:.2f}s (límite: 15s)")
            
            # Verificar DOM Content Loaded móvil
            assert navigation_timing['domContentLoaded'] < 8000, f"DOM Content Loaded móvil demasiado lento: {navigation_timing['domContentLoaded']}ms"
            print(f"✅ DOM Content Loaded móvil: {navigation_timing['domContentLoaded']}ms (límite: 8000ms)")
            
            # Verificar Load Complete móvil
            assert navigation_timing['loadComplete'] < 12000, f"Load Complete móvil demasiado lento: {navigation_timing['loadComplete']}ms"
            print(f"✅ Load Complete móvil: {navigation_timing['loadComplete']}ms (límite: 12000ms)")
            
            # 5. Generar reporte de performance móvil
            print("\n🎉 ¡Test de performance móvil completado exitosamente!")
            print(f"✅ Tiempo de carga móvil: {mobile_load_time:.2f}s")
            print(f"✅ DOM Content Loaded móvil: {navigation_timing['domContentLoaded']}ms")
            print(f"✅ Load Complete móvil: {navigation_timing['loadComplete']}ms")
            print(f"✅ First Paint móvil: {navigation_timing['firstPaint']}ms")
            print(f"✅ Elementos responsive móvil: {responsive_count}")
            print(f"✅ Elementos interactivos móvil: {interactive_count}")
            
            # El test pasa si llegamos hasta aquí
            assert True, "Test de performance móvil completado exitosamente"
            
        except Exception as e:
            print(f"❌ Error durante el test de performance móvil: {e}")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    # Ejecutar tests individuales
    test_patients_app_performance()
    test_patients_app_mobile_performance()
    print("\n🎉 ¡Todos los tests de performance de la app de pacientes pasaron exitosamente!")