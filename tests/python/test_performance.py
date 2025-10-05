# tests/python/test_performance.py
import pytest
import time
from tests.utils import get_performance_metrics, wait_for_network_idle, log_test_step

def test_autamedica_login_page_performance(page, autamedica_config, test_artifacts_dir):
    """Test de performance para la página de login de AutaMedica"""
    
    # 1. Navegar a la página de login y medir tiempo de carga
    log_test_step(page, "Cargando página de login", test_artifacts_dir)
    start_time = time.time()
    
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    wait_for_network_idle(page)
    
    load_time = time.time() - start_time
    
    # 2. Obtener métricas de performance
    log_test_step(page, "Recopilando métricas de performance", test_artifacts_dir)
    metrics = get_performance_metrics(page)
    
    # 3. Verificar tiempos de carga
    print(f"⏱️ Tiempo de carga total: {load_time:.2f}s")
    print(f"⏱️ DOM Content Loaded: {metrics.get('domContentLoaded', 0)}ms")
    print(f"⏱️ Load Complete: {metrics.get('loadComplete', 0)}ms")
    print(f"⏱️ First Paint: {metrics.get('firstPaint', 0)}ms")
    
    # 4. Assertions de performance
    assert load_time < 5.0, f"Tiempo de carga demasiado lento: {load_time:.2f}s"
    assert metrics.get('domContentLoaded', 0) < 3000, f"DOM Content Loaded demasiado lento: {metrics.get('domContentLoaded', 0)}ms"
    assert metrics.get('loadComplete', 0) < 5000, f"Load Complete demasiado lento: {metrics.get('loadComplete', 0)}ms"
    
    # 5. Verificar memoria (si está disponible)
    memory = metrics.get('memory')
    if memory:
        print(f"💾 Memoria usada: {memory['usedJSHeapSize'] / 1024 / 1024:.2f}MB")
        print(f"💾 Memoria total: {memory['totalJSHeapSize'] / 1024 / 1024:.2f}MB")
        print(f"💾 Límite de memoria: {memory['jsHeapSizeLimit'] / 1024 / 1024:.2f}MB")
        
        # Verificar que no hay memory leaks
        memory_usage_ratio = memory['usedJSHeapSize'] / memory['jsHeapSizeLimit']
        assert memory_usage_ratio < 0.8, f"Uso de memoria demasiado alto: {memory_usage_ratio:.2%}"

def test_autamedica_doctors_dashboard_performance(page, autamedica_config, mock_supabase_auth, test_artifacts_dir):
    """Test de performance para el dashboard de doctores"""
    
    # 1. Login como doctor
    log_test_step(page, "Realizando login de doctor", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    # 2. Navegar al dashboard y medir performance
    log_test_step(page, "Cargando dashboard de doctores", test_artifacts_dir)
    start_time = time.time()
    
    page.goto(autamedica_config['doctors_url'])
    wait_for_network_idle(page)
    
    load_time = time.time() - start_time
    
    # 3. Obtener métricas de performance
    log_test_step(page, "Recopilando métricas de performance del dashboard", test_artifacts_dir)
    metrics = get_performance_metrics(page)
    
    # 4. Verificar tiempos de carga
    print(f"⏱️ Tiempo de carga del dashboard: {load_time:.2f}s")
    print(f"⏱️ DOM Content Loaded: {metrics.get('domContentLoaded', 0)}ms")
    print(f"⏱️ Load Complete: {metrics.get('loadComplete', 0)}ms")
    
    # 5. Assertions de performance
    assert load_time < 8.0, f"Tiempo de carga del dashboard demasiado lento: {load_time:.2f}s"
    assert metrics.get('domContentLoaded', 0) < 5000, f"DOM Content Loaded del dashboard demasiado lento: {metrics.get('domContentLoaded', 0)}ms"
    
    # 6. Verificar que no hay memory leaks después de la carga
    memory = metrics.get('memory')
    if memory:
        memory_usage_ratio = memory['usedJSHeapSize'] / memory['jsHeapSizeLimit']
        assert memory_usage_ratio < 0.8, f"Uso de memoria del dashboard demasiado alto: {memory_usage_ratio:.2%}"

def test_autamedica_video_call_performance(page, autamedica_config, mock_supabase_auth, mock_webrtc_signaling, test_artifacts_dir):
    """Test de performance para la interfaz de videollamada"""
    
    # 1. Login y navegar a videollamada
    log_test_step(page, "Iniciando flujo de videollamada", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    page.goto(autamedica_config['doctors_url'])
    page.wait_for_load_state("networkidle")
    
    # 2. Buscar y activar videollamada
    log_test_step(page, "Activando videollamada", test_artifacts_dir)
    call_button_selectors = [
        "button:has-text('Iniciar videollamada')",
        "button[title*='videollamada']",
        "button[title*='llamada']",
        "button:has(svg[class*='phone'])",
        "button:has(svg[class*='video'])"
    ]
    
    call_button = None
    for selector in call_button_selectors:
        try:
            if page.is_visible(selector):
                call_button = page.locator(selector).first
                break
        except:
            continue
    
    if call_button:
        start_time = time.time()
        call_button.click()
        page.wait_for_timeout(3000)  # Esperar a que se inicialice la videollamada
        activation_time = time.time() - start_time
        
        print(f"⏱️ Tiempo de activación de videollamada: {activation_time:.2f}s")
        assert activation_time < 5.0, f"Tiempo de activación de videollamada demasiado lento: {activation_time:.2f}s"
    
    # 3. Obtener métricas de performance después de la videollamada
    log_test_step(page, "Recopilando métricas de performance de videollamada", test_artifacts_dir)
    metrics = get_performance_metrics(page)
    
    # 4. Verificar que la videollamada no degrada significativamente el performance
    memory = metrics.get('memory')
    if memory:
        memory_usage_ratio = memory['usedJSHeapSize'] / memory['jsHeapSizeLimit']
        print(f"💾 Uso de memoria con videollamada: {memory_usage_ratio:.2%}")
        assert memory_usage_ratio < 0.9, f"Uso de memoria con videollamada demasiado alto: {memory_usage_ratio:.2%}"

def test_autamedica_network_performance(page, autamedica_config, test_artifacts_dir):
    """Test de performance de red para AutaMedica"""
    
    # 1. Interceptar requests para medir tiempos de respuesta
    log_test_step(page, "Configurando medición de performance de red", test_artifacts_dir)
    
    request_times = []
    response_times = []
    
    def handle_request(request):
        request_times.append({
            'url': request.url,
            'method': request.method,
            'timestamp': time.time()
        })
    
    def handle_response(response):
        response_times.append({
            'url': response.url,
            'status': response.status,
            'timestamp': time.time()
        })
    
    page.on("request", handle_request)
    page.on("response", handle_response)
    
    # 2. Navegar a la página de login
    log_test_step(page, "Cargando página de login para medir red", test_artifacts_dir)
    start_time = time.time()
    
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    wait_for_network_idle(page)
    
    total_time = time.time() - start_time
    
    # 3. Analizar tiempos de respuesta
    log_test_step(page, "Analizando tiempos de respuesta de red", test_artifacts_dir)
    
    print(f"🌐 Total de requests: {len(request_times)}")
    print(f"🌐 Total de responses: {len(response_times)}")
    print(f"⏱️ Tiempo total de carga: {total_time:.2f}s")
    
    # 4. Verificar que no hay requests lentos
    slow_requests = []
    for req in request_times:
        for resp in response_times:
            if req['url'] == resp['url']:
                response_time = resp['timestamp'] - req['timestamp']
                if response_time > 2.0:  # Más de 2 segundos
                    slow_requests.append({
                        'url': req['url'],
                        'time': response_time
                    })
                break
    
    if slow_requests:
        print(f"⚠️ Requests lentos encontrados: {len(slow_requests)}")
        for req in slow_requests[:5]:  # Mostrar los primeros 5
            print(f"  - {req['url']}: {req['time']:.2f}s")
    
    # 5. Verificar que no hay errores de red
    error_responses = [resp for resp in response_times if resp['status'] >= 400]
    assert len(error_responses) == 0, f"Errores de red encontrados: {len(error_responses)}"
    
    # 6. Verificar que el tiempo total de carga es razonable
    assert total_time < 10.0, f"Tiempo total de carga demasiado lento: {total_time:.2f}s"

def test_autamedica_mobile_performance(page, autamedica_config, test_artifacts_dir):
    """Test de performance en dispositivos móviles"""
    
    # 1. Configurar viewport móvil
    log_test_step(page, "Configurando viewport móvil", test_artifacts_dir)
    page.set_viewport_size({"width": 375, "height": 667})  # iPhone SE
    
    # 2. Navegar a la página de login
    log_test_step(page, "Cargando página de login en móvil", test_artifacts_dir)
    start_time = time.time()
    
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    wait_for_network_idle(page)
    
    mobile_load_time = time.time() - start_time
    
    # 3. Obtener métricas de performance móvil
    log_test_step(page, "Recopilando métricas de performance móvil", test_artifacts_dir)
    metrics = get_performance_metrics(page)
    
    # 4. Verificar tiempos de carga móvil
    print(f"📱 Tiempo de carga móvil: {mobile_load_time:.2f}s")
    print(f"📱 DOM Content Loaded: {metrics.get('domContentLoaded', 0)}ms")
    print(f"📱 Load Complete: {metrics.get('loadComplete', 0)}ms")
    
    # 5. Assertions de performance móvil (más permisivo que desktop)
    assert mobile_load_time < 8.0, f"Tiempo de carga móvil demasiado lento: {mobile_load_time:.2f}s"
    assert metrics.get('domContentLoaded', 0) < 5000, f"DOM Content Loaded móvil demasiado lento: {metrics.get('domContentLoaded', 0)}ms"
    
    # 6. Verificar que la página es responsive
    log_test_step(page, "Verificando responsividad", test_artifacts_dir)
    
    # Verificar que el formulario es visible en móvil
    form = page.locator("form")
    assert form.is_visible(), "Formulario no visible en móvil"
    
    # Verificar que los campos son accesibles
    email_input = page.locator("input[type='email']")
    password_input = page.locator("input[type='password']")
    
    assert email_input.is_visible(), "Campo de email no visible en móvil"
    assert password_input.is_visible(), "Campo de contraseña no visible en móvil"
    
    # Verificar que el botón de submit es accesible
    submit_button = page.locator("button[type='submit']")
    assert submit_button.is_visible(), "Botón de submit no visible en móvil"
    assert submit_button.is_enabled(), "Botón de submit no está habilitado en móvil"

def test_autamedica_memory_usage_over_time(page, autamedica_config, mock_supabase_auth, test_artifacts_dir):
    """Test de uso de memoria a lo largo del tiempo"""
    
    # 1. Login como doctor
    log_test_step(page, "Realizando login inicial", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    # 2. Medir memoria inicial
    log_test_step(page, "Midiendo memoria inicial", test_artifacts_dir)
    initial_metrics = get_performance_metrics(page)
    initial_memory = initial_metrics.get('memory', {})
    
    if initial_memory:
        initial_usage = initial_memory['usedJSHeapSize']
        print(f"💾 Memoria inicial: {initial_usage / 1024 / 1024:.2f}MB")
    
    # 3. Navegar varias veces para simular uso prolongado
    log_test_step(page, "Simulando navegación prolongada", test_artifacts_dir)
    
    for i in range(5):
        # Navegar al dashboard
        page.goto(autamedica_config['doctors_url'])
        wait_for_network_idle(page)
        page.wait_for_timeout(1000)
        
        # Navegar a login
        page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
        page.wait_for_timeout(1000)
        
        # Medir memoria después de cada ciclo
        metrics = get_performance_metrics(page)
        memory = metrics.get('memory', {})
        
        if memory:
            current_usage = memory['usedJSHeapSize']
            print(f"💾 Memoria después del ciclo {i+1}: {current_usage / 1024 / 1024:.2f}MB")
            
            # Verificar que no hay memory leaks significativos
            if initial_memory:
                memory_increase = current_usage - initial_usage
                memory_increase_mb = memory_increase / 1024 / 1024
                
                # Permitir un aumento de hasta 10MB
                assert memory_increase_mb < 10, f"Posible memory leak detectado: {memory_increase_mb:.2f}MB de aumento"
    
    # 4. Verificar memoria final
    log_test_step(page, "Verificando memoria final", test_artifacts_dir)
    final_metrics = get_performance_metrics(page)
    final_memory = final_metrics.get('memory', {})
    
    if final_memory and initial_memory:
        final_usage = final_memory['usedJSHeapSize']
        total_increase = final_usage - initial_usage
        total_increase_mb = total_increase / 1024 / 1024
        
        print(f"💾 Memoria final: {final_usage / 1024 / 1024:.2f}MB")
        print(f"💾 Aumento total: {total_increase_mb:.2f}MB")
        
        # Verificar que el aumento total es razonable
        assert total_increase_mb < 20, f"Memory leak significativo detectado: {total_increase_mb:.2f}MB de aumento total"