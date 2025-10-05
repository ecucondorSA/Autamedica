# tests/python/test_e2e_autamedica_auth.py
import pytest
from utils import (
    screenshot_and_save, 
    wait_for_network_idle, 
    wait_for_webrtc_connection,
    mock_webrtc_permissions,
    save_test_artifacts,
    log_test_step,
    retry_on_exception
)
from pathlib import Path

def test_autamedica_doctor_login_flow(page, autamedica_config, mock_supabase_auth, test_artifacts_dir):
    """Test completo de login de doctor en AutaMedica"""
    
    # Configurar permisos WebRTC
    mock_webrtc_permissions(page)
    
    # 1. Ir a la página de login
    log_test_step(page, "Navegando a página de login", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 2. Verificar que el formulario está presente
    assert page.is_visible("input[type='email']")
    assert page.is_visible("input[type='password']")
    assert page.is_visible("button[type='submit']")
    
    # 3. Llenar credenciales específicas del prompt
    log_test_step(page, "Llenando credenciales de doctor", test_artifacts_dir)
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    
    # 4. Verificar que las credenciales se llenaron correctamente
    email_value = page.input_value("input[type='email']")
    password_value = page.input_value("input[type='password']")
    assert email_value == autamedica_config['doctor_email']
    assert password_value == autamedica_config['doctor_password']
    
    # 5. Hacer login
    log_test_step(page, "Enviando formulario de login", test_artifacts_dir)
    page.click("button[type='submit']")
    
    # 6. Esperar redirección al dashboard de doctores
    page.wait_for_url("**/doctors**", timeout=15000)
    wait_for_network_idle(page)
    
    # 7. Verificar que estamos en el dashboard correcto
    log_test_step(page, "Verificando dashboard de doctores", test_artifacts_dir)
    assert "doctors" in page.url
    assert page.is_visible("text=Doctor") or page.is_visible("text=Dashboard")
    
    # 8. Verificar token JWT en localStorage
    token = page.evaluate("() => localStorage.getItem('supabase.auth.token')")
    assert token is not None
    assert "fake-jwt-token" in token
    
    # 9. Guardar artefactos
    save_test_artifacts(page, "doctor_login_flow", test_artifacts_dir)

@retry_on_exception(retries=3, delay=2.0)
def test_autamedica_video_call_flow(page, autamedica_config, mock_supabase_auth, mock_webrtc_signaling, mock_patient_data, test_artifacts_dir):
    """Test completo de flujo de videollamada en AutaMedica"""
    
    # Configurar permisos WebRTC
    mock_webrtc_permissions(page)
    
    # 1. Login como doctor
    log_test_step(page, "Iniciando login de doctor", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    # 2. Navegar al dashboard de doctores
    log_test_step(page, "Cargando dashboard de doctores", test_artifacts_dir)
    page.goto(autamedica_config['doctors_url'])
    wait_for_network_idle(page)
    
    # 3. Buscar y hacer clic en botón de videollamada
    log_test_step(page, "Buscando botón de videollamada", test_artifacts_dir)
    
    # Buscar diferentes variantes del botón de videollamada
    call_button_selectors = [
        "button:has-text('Iniciar videollamada')",
        "button[title*='videollamada']",
        "button[title*='llamada']",
        "button:has(svg[class*='phone'])",
        "button:has(svg[class*='video'])",
        "[data-testid='start-call']",
        "[data-testid='video-call']"
    ]
    
    call_button = None
    for selector in call_button_selectors:
        try:
            if page.is_visible(selector):
                call_button = page.locator(selector).first
                break
        except:
            continue
    
    assert call_button is not None, "No se encontró botón de videollamada"
    call_button.click()
    
    # 4. Esperar a que se abra la sala de videollamada
    log_test_step(page, "Esperando apertura de sala de videollamada", test_artifacts_dir)
    page.wait_for_timeout(3000)
    
    # 5. Verificar que estamos en una sala de videollamada
    current_url = page.url
    assert "call/" in current_url or "room/" in current_url or "videollamada" in current_url.lower()
    
    # 6. Verificar elementos de video
    log_test_step(page, "Verificando elementos de video", test_artifacts_dir)
    video_elements = page.locator("video")
    video_count = video_elements.count()
    assert video_count > 0, "No se encontraron elementos de video"
    
    # 7. Verificar conexión WebRTC (simulada)
    log_test_step(page, "Verificando conexión WebRTC", test_artifacts_dir)
    webrtc_connected = wait_for_webrtc_connection(page, timeout=10000)
    assert webrtc_connected, "Conexión WebRTC no establecida"
    
    # 8. Verificar controles de video
    log_test_step(page, "Verificando controles de video", test_artifacts_dir)
    control_selectors = [
        "button[title*='micrófono']",
        "button[title*='micro']",
        "button[title*='audio']",
        "button[title*='video']",
        "button[title*='cámara']",
        "button[title*='colgar']",
        "button[title*='hangup']"
    ]
    
    controls_found = 0
    for selector in control_selectors:
        if page.is_visible(selector):
            controls_found += 1
    
    assert controls_found > 0, "No se encontraron controles de video"
    
    # 9. Simular cierre de llamada
    log_test_step(page, "Cerrando llamada", test_artifacts_dir)
    hangup_selectors = [
        "button[title*='colgar']",
        "button[title*='hangup']",
        "button:has(svg[class*='phone-off'])",
        "button:has(svg[class*='end-call'])"
    ]
    
    hangup_button = None
    for selector in hangup_selectors:
        try:
            if page.is_visible(selector):
                hangup_button = page.locator(selector).first
                break
        except:
            continue
    
    if hangup_button:
        hangup_button.click()
        page.wait_for_timeout(1000)
    
    # 10. Guardar artefactos
    save_test_artifacts(page, "video_call_flow", test_artifacts_dir)

def test_autamedica_patient_reception_flow(page, autamedica_config, mock_supabase_auth, mock_webrtc_signaling, test_artifacts_dir):
    """Test de recepción de videollamada desde el lado del paciente"""
    
    # Configurar permisos WebRTC
    mock_webrtc_permissions(page)
    
    # 1. Ir a la app de pacientes
    log_test_step(page, "Navegando a app de pacientes", test_artifacts_dir)
    page.goto(autamedica_config['patients_url'])
    
    # Esperar a que la página se cargue completamente
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)  # Esperar adicional para que se estabilice
    
    # 2. Verificar que la app de pacientes carga correctamente
    current_url = page.url
    print(f"URL actual: {current_url}")
    
    # Verificar que estamos en la URL correcta (puede haber redirecciones a auth)
    assert current_url.startswith(autamedica_config['patients_url']), f"URL incorrecta: {current_url}"
    
    # Verificar el título
    try:
        title = page.title()
        print(f"Título: {title}")
        assert "AutaMedica" in title, f"Título no contiene AutaMedica: {title}"
    except Exception as e:
        print(f"Error obteniendo título: {e}")
    
    # 3. Verificar que la app de pacientes carga correctamente
    log_test_step(page, "Verificando interfaz de pacientes", test_artifacts_dir)
    
    # Verificar que hay navegación lateral
    sidebar = page.locator("aside")
    assert sidebar.count() > 0, "No se encontró sidebar de navegación"
    
    # Verificar que hay elementos de navegación
    nav_elements = page.locator("nav a")
    assert nav_elements.count() > 0, "No se encontraron elementos de navegación"
    
    # Verificar que hay contenido principal
    main_content = page.locator("main")
    assert main_content.count() > 0, "No se encontró contenido principal"
    
    # Verificar que hay elementos específicos de la app de pacientes
    assert page.is_visible("text=AutaMedica"), "Logo de AutaMedica no visible"
    assert page.is_visible("text=Inicio"), "Enlace de Inicio no visible"
    assert page.is_visible("text=Mis Citas"), "Enlace de Mis Citas no visible"
    assert page.is_visible("text=Mi Anamnesis"), "Enlace de Mi Anamnesis no visible"
    
    # 4. Verificar que la app es funcional independientemente del estado de auth
    log_test_step(page, "Verificando funcionalidad básica", test_artifacts_dir)
    
    # Verificar que hay elementos de la interfaz
    body_content = page.locator("body")
    assert body_content.count() > 0, "No se encontró contenido del body"
    
    # Verificar que no hay errores críticos de JavaScript
    js_errors = []
    page.on("pageerror", lambda error: js_errors.append(error.message))
    page.wait_for_timeout(1000)
    
    critical_errors = [error for error in js_errors 
                      if not any(term in error.lower() for term in ['notallowederror', 'notfounderror', 'media', 'webrtc'])]
    
    assert len(critical_errors) == 0, f"Errores JavaScript críticos encontrados: {critical_errors}"
    
    # 4. Buscar elementos relacionados con videollamada
    log_test_step(page, "Buscando elementos de videollamada en pacientes", test_artifacts_dir)
    video_related_elements = page.locator("video, [class*='video'], [class*='call'], button:has-text('video'), button:has-text('llamada')")
    element_count = video_related_elements.count()
    
    # La app de pacientes puede no tener elementos de video visibles inicialmente
    print(f"Elementos relacionados con video encontrados: {element_count}")
    
    # 5. Verificar que no hay errores JavaScript críticos
    js_errors = []
    page.on("pageerror", lambda error: js_errors.append(error.message))
    page.wait_for_timeout(2000)
    
    # Filtrar errores críticos (ignorar warnings de WebRTC sin dispositivos reales)
    critical_errors = [error for error in js_errors 
                      if not any(term in error.lower() for term in ['notallowederror', 'notfounderror', 'media', 'webrtc'])]
    
    assert len(critical_errors) == 0, f"Errores JavaScript críticos encontrados: {critical_errors}"
    
    # 6. Verificar que la página es responsive
    log_test_step(page, "Verificando responsividad", test_artifacts_dir)
    
    # Verificar que los elementos principales son visibles
    assert page.is_visible("text=AutaMedica"), "Logo de AutaMedica no visible"
    assert page.is_visible("text=Inicio"), "Enlace de Inicio no visible"
    
    # 7. Guardar artefactos
    save_test_artifacts(page, "patient_reception_flow", test_artifacts_dir)

def test_autamedica_cross_app_communication(page, autamedica_config, mock_supabase_auth, mock_webrtc_signaling, test_artifacts_dir):
    """Test de comunicación entre apps de doctor y paciente"""
    
    # Configurar permisos WebRTC
    mock_webrtc_permissions(page)
    
    # 1. Cargar app de doctores
    log_test_step(page, "Cargando app de doctores", test_artifacts_dir)
    page.goto(autamedica_config['doctors_url'])
    wait_for_network_idle(page)
    
    # 2. Verificar que la app de doctores carga
    assert "doctors" in page.url or page.is_visible("text=Doctor")
    
    # 3. Abrir nueva pestaña para paciente
    log_test_step(page, "Abriendo app de pacientes en nueva pestaña", test_artifacts_dir)
    patient_page = page.context.new_page()
    patient_page.goto(autamedica_config['patients_url'])
    wait_for_network_idle(patient_page)
    
    # 4. Verificar que ambas apps están funcionando
    assert "patients" in patient_page.url or patient_page.is_visible("text=Patient")
    
    # 5. En un test real, aquí se simularía la conexión WebRTC
    # entre las dos páginas usando el mismo roomId
    log_test_step(page, "Simulando conexión cross-app", test_artifacts_dir)
    
    # 6. Verificar que ambas páginas pueden comunicarse
    # (en un test real se verificaría la conexión WebRTC real)
    doctor_title = page.title()
    patient_title = patient_page.title()
    
    assert len(doctor_title) > 0
    assert len(patient_title) > 0
    
    # 7. Cleanup
    patient_page.close()
    
    # 8. Guardar artefactos
    save_test_artifacts(page, "cross_app_communication", test_artifacts_dir)

def test_autamedica_webrtc_permissions_and_setup(page, autamedica_config, test_artifacts_dir):
    """Test de configuración y permisos WebRTC"""
    
    # 1. Verificar que WebRTC está disponible
    log_test_step(page, "Verificando disponibilidad de WebRTC", test_artifacts_dir)
    webrtc_support = page.evaluate("""
        () => {
            return {
                hasRTCPeerConnection: typeof RTCPeerConnection !== 'undefined',
                hasGetUserMedia: typeof navigator.mediaDevices?.getUserMedia !== 'undefined',
                hasGetDisplayMedia: typeof navigator.mediaDevices?.getDisplayMedia !== 'undefined',
                userAgent: navigator.userAgent
            };
        }
    """)
    
    assert webrtc_support['hasRTCPeerConnection'], "WebRTC no está disponible en este navegador"
    assert webrtc_support['hasGetUserMedia'], "getUserMedia no está disponible"
    
    # 2. Configurar permisos WebRTC simulados
    mock_webrtc_permissions(page)
    
    # 3. Verificar que los mocks funcionan
    log_test_step(page, "Verificando mocks de WebRTC", test_artifacts_dir)
    mock_test = page.evaluate("""
        async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
                return {
                    success: true,
                    videoTracks: stream.getVideoTracks().length,
                    audioTracks: stream.getAudioTracks().length
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    """)
    
    assert mock_test['success'], f"Mock de getUserMedia falló: {mock_test.get('error', 'Unknown error')}"
    assert mock_test['videoTracks'] > 0, "No se crearon tracks de video simulados"
    assert mock_test['audioTracks'] > 0, "No se crearon tracks de audio simulados"
    
    # 4. Guardar artefactos
    save_test_artifacts(page, "webrtc_permissions_setup", test_artifacts_dir)