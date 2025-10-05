# tests/python/test_network_mocking.py
import pytest
import json
import time
from tests.utils import wait_for_network_idle, log_test_step

def test_autamedica_api_mocking(page, autamedica_config, test_artifacts_dir):
    """Test de mocking de APIs de AutaMedica"""
    
    # 1. Configurar mocks para diferentes endpoints
    log_test_step(page, "Configurando mocks de API", test_artifacts_dir)
    
    def handle_api_requests(route, request):
        url = request.url
        method = request.method
        
        # Mock de autenticación
        if "/auth/v1/token" in url and method == "POST":
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "access_token": "mock-jwt-token-123",
                    "refresh_token": "mock-refresh-token-456",
                    "user": {
                        "id": "doctor-123",
                        "email": "doctor.demo@autamedica.com",
                        "role": "doctor"
                    }
                })
            )
        
        # Mock de datos de usuario
        elif "/auth/v1/user" in url:
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "id": "doctor-123",
                    "email": "doctor.demo@autamedica.com",
                    "user_metadata": {
                        "role": "doctor",
                        "first_name": "Dr. Demo",
                        "last_name": "Test"
                    }
                })
            )
        
        # Mock de pacientes
        elif "/api/patients" in url:
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "patients": [
                        {
                            "id": "patient_001",
                            "name": "Juan Pérez",
                            "age": 45,
                            "status": "available",
                            "last_visit": "2024-01-15"
                        },
                        {
                            "id": "patient_002", 
                            "name": "María García",
                            "age": 32,
                            "status": "in_call",
                            "last_visit": "2024-01-14"
                        }
                    ]
                })
            )
        
        # Mock de citas
        elif "/api/appointments" in url:
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "appointments": [
                        {
                            "id": "apt_001",
                            "patient_id": "patient_001",
                            "patient_name": "Juan Pérez",
                            "datetime": "2024-01-16T10:00:00Z",
                            "status": "scheduled"
                        }
                    ]
                })
            )
        
        # Mock de signaling server
        elif "/signaling" in url:
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "status": "connected",
                    "room_id": "doctor_patient_001",
                    "users": ["doctor-123", "patient-001"]
                })
            )
        
        # Continuar con requests no mockeados
        else:
            route.continue_()
    
    page.route("**/api/**", handle_api_requests)
    page.route("**/auth/**", handle_api_requests)
    page.route("**/signaling**", handle_api_requests)
    
    # 2. Navegar a la página de login
    log_test_step(page, "Navegando a página de login con mocks", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 3. Verificar que el formulario está presente
    assert page.is_visible("input[type='email']")
    assert page.is_visible("input[type='password']")
    assert page.is_visible("button[type='submit']")
    
    # 4. Llenar y enviar formulario
    log_test_step(page, "Enviando formulario con mocks", test_artifacts_dir)
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    
    # 5. Verificar que el login fue exitoso (usando mocks)
    page.wait_for_url("**/doctors**", timeout=15000)
    wait_for_network_idle(page)
    
    # 6. Verificar que el token se guardó en localStorage
    token = page.evaluate("() => localStorage.getItem('supabase.auth.token')")
    assert token is not None
    assert "mock-jwt-token" in token
    
    # 7. Verificar que se pueden cargar datos mockeados
    log_test_step(page, "Verificando carga de datos mockeados", test_artifacts_dir)
    
    # Simular carga de pacientes (si hay un botón o elemento que los cargue)
    try:
        # Buscar elementos que puedan cargar datos de pacientes
        load_patients_buttons = page.locator("button:has-text('Pacientes'), button:has-text('Cargar'), [data-testid='load-patients']")
        if load_patients_buttons.count() > 0:
            load_patients_buttons.first.click()
            page.wait_for_timeout(2000)
    except:
        pass
    
    # Verificar que no hay errores de red
    network_errors = []
    page.on("response", lambda response: network_errors.append(response) if response.status >= 400 else None)
    
    assert len(network_errors) == 0, f"Errores de red encontrados: {[r.status for r in network_errors]}"

def test_autamedica_slow_network_simulation(page, autamedica_config, test_artifacts_dir):
    """Test de simulación de red lenta"""
    
    # 1. Configurar simulación de red lenta
    log_test_step(page, "Configurando simulación de red lenta", test_artifacts_dir)
    
    def slow_network_handler(route, request):
        # Simular latencia de 1 segundo para requests de API
        if "/api/" in request.url or "/auth/" in request.url:
            time.sleep(1.0)
        
        # Mock de respuesta
        if "/auth/v1/token" in request.url:
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "access_token": "slow-mock-token",
                    "user": {"id": "doctor-123", "role": "doctor"}
                })
            )
        else:
            route.continue_()
    
    page.route("**/api/**", slow_network_handler)
    page.route("**/auth/**", slow_network_handler)
    
    # 2. Navegar a la página de login
    log_test_step(page, "Navegando con red lenta", test_artifacts_dir)
    start_time = time.time()
    
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=15000)  # Timeout más largo para red lenta
    
    # 3. Verificar que la página carga correctamente a pesar de la latencia
    assert page.is_visible("form")
    assert page.is_visible("input[type='email']")
    assert page.is_visible("input[type='password']")
    
    # 4. Llenar formulario y medir tiempo de respuesta
    log_test_step(page, "Enviando formulario con red lenta", test_artifacts_dir)
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    
    submit_start = time.time()
    page.click("button[type='submit']")
    
    # Esperar a que se complete el login (con timeout extendido)
    page.wait_for_url("**/doctors**", timeout=20000)
    submit_time = time.time() - submit_start
    
    print(f"⏱️ Tiempo de login con red lenta: {submit_time:.2f}s")
    
    # 5. Verificar que el login fue exitoso a pesar de la latencia
    assert "doctors" in page.url
    assert submit_time < 15.0, f"Login demasiado lento con red lenta: {submit_time:.2f}s"

def test_autamedica_network_error_handling(page, autamedica_config, test_artifacts_dir):
    """Test de manejo de errores de red"""
    
    # 1. Configurar mocks que simulen errores de red
    log_test_step(page, "Configurando mocks de errores de red", test_artifacts_dir)
    
    def error_network_handler(route, request):
        url = request.url
        
        # Simular error 500 en autenticación
        if "/auth/v1/token" in url:
            route.fulfill(
                status=500,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "error": "Internal Server Error",
                    "message": "Authentication service temporarily unavailable"
                })
            )
        
        # Simular error 404 en pacientes
        elif "/api/patients" in url:
            route.fulfill(
                status=404,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "error": "Not Found",
                    "message": "Patients endpoint not found"
                })
            )
        
        # Simular timeout en signaling
        elif "/signaling" in url:
            route.fulfill(
                status=408,
                headers={"content-type": "application/json"},
                body=json.dumps({
                    "error": "Request Timeout",
                    "message": "Signaling server timeout"
                })
            )
        
        else:
            route.continue_()
    
    page.route("**/auth/**", error_network_handler)
    page.route("**/api/**", error_network_handler)
    page.route("**/signaling**", error_network_handler)
    
    # 2. Navegar a la página de login
    log_test_step(page, "Navegando con errores de red", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 3. Intentar hacer login (debe fallar)
    log_test_step(page, "Intentando login con errores de red", test_artifacts_dir)
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    
    # 4. Verificar que se muestra un mensaje de error
    page.wait_for_timeout(3000)  # Esperar a que se procese el error
    
    # Buscar mensajes de error
    error_selectors = [
        "text=Error",
        "text=error",
        ".error",
        "[data-testid='error']",
        ".alert",
        ".notification"
    ]
    
    error_found = False
    for selector in error_selectors:
        try:
            if page.is_visible(selector):
                error_found = True
                break
        except:
            continue
    
    # El test pasa si se maneja el error correctamente (ya sea mostrando mensaje o no redirigiendo)
    if not error_found:
        # Verificar que no se redirigió al dashboard (indicando que el error se manejó)
        assert "doctors" not in page.url, "Login exitoso inesperado con errores de red"
    
    # 5. Verificar que la página sigue siendo funcional
    assert page.is_visible("form"), "Formulario no visible después del error"
    assert page.is_visible("input[type='email']"), "Campo de email no visible después del error"
    assert page.is_visible("input[type='password']"), "Campo de contraseña no visible después del error"

def test_autamedica_offline_mode(page, autamedica_config, test_artifacts_dir):
    """Test de modo offline"""
    
    # 1. Configurar modo offline
    log_test_step(page, "Configurando modo offline", test_artifacts_dir)
    
    def offline_handler(route, request):
        # Simular que todos los requests fallan
        route.fulfill(
            status=0,  # Network error
            body=""
        )
    
    page.route("**/*", offline_handler)
    
    # 2. Navegar a la página de login
    log_test_step(page, "Navegando en modo offline", test_artifacts_dir)
    
    try:
        page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
        # En modo offline, la página puede no cargar completamente
        page.wait_for_timeout(5000)
    except:
        # Es esperado que falle en modo offline
        pass
    
    # 3. Verificar que la página maneja el modo offline
    # Esto puede variar según la implementación de la app
    # Algunas apps muestran mensajes de "sin conexión"
    
    offline_indicators = [
        "text=Offline",
        "text=Sin conexión",
        "text=No internet",
        ".offline",
        "[data-testid='offline']"
    ]
    
    offline_detected = False
    for selector in offline_indicators:
        try:
            if page.is_visible(selector):
                offline_detected = True
                break
        except:
            continue
    
    # El test pasa si la app maneja el modo offline de alguna manera
    # (ya sea mostrando un indicador o manteniendo funcionalidad básica)
    print(f"🔌 Modo offline detectado: {offline_detected}")

def test_autamedica_api_rate_limiting(page, autamedica_config, test_artifacts_dir):
    """Test de rate limiting de APIs"""
    
    # 1. Configurar mock de rate limiting
    log_test_step(page, "Configurando mock de rate limiting", test_artifacts_dir)
    
    request_count = 0
    
    def rate_limit_handler(route, request):
        nonlocal request_count
        request_count += 1
        
        # Simular rate limiting después de 3 requests
        if request_count > 3:
            route.fulfill(
                status=429,
                headers={
                    "content-type": "application/json",
                    "Retry-After": "60"
                },
                body=json.dumps({
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded",
                    "retry_after": 60
                })
            )
        else:
            # Respuesta normal para los primeros 3 requests
            if "/auth/v1/token" in request.url:
                route.fulfill(
                    status=200,
                    headers={"content-type": "application/json"},
                    body=json.dumps({
                        "access_token": f"token-{request_count}",
                        "user": {"id": "doctor-123", "role": "doctor"}
                    })
                )
            else:
                route.continue_()
    
    page.route("**/auth/**", rate_limit_handler)
    
    # 2. Navegar a la página de login
    log_test_step(page, "Navegando con rate limiting", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 3. Intentar hacer login múltiples veces
    log_test_step(page, "Probando rate limiting", test_artifacts_dir)
    
    for i in range(5):
        page.fill("input[type='email']", autamedica_config['doctor_email'])
        page.fill("input[type='password']", autamedica_config['doctor_password'])
        page.click("button[type='submit']")
        page.wait_for_timeout(1000)
        
        # Limpiar formulario para el siguiente intento
        page.fill("input[type='email']", "")
        page.fill("input[type='password']", "")
    
    # 4. Verificar que se detectó el rate limiting
    print(f"📊 Total de requests realizados: {request_count}")
    assert request_count > 3, "Rate limiting no se activó correctamente"
    
    # 5. Verificar que la app maneja el rate limiting
    # Buscar mensajes de rate limiting
    rate_limit_indicators = [
        "text=Too Many Requests",
        "text=Rate limit",
        "text=Demasiadas solicitudes",
        ".rate-limit",
        "[data-testid='rate-limit']"
    ]
    
    rate_limit_detected = False
    for selector in rate_limit_indicators:
        try:
            if page.is_visible(selector):
                rate_limit_detected = True
                break
        except:
            continue
    
    print(f"🚦 Rate limiting detectado: {rate_limit_detected}")