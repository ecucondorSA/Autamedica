# tests/python/test_accessibility.py
import pytest
from utils import run_accessibility_audit, wait_for_network_idle, log_test_step

def test_autamedica_login_page_accessibility(page, autamedica_config, test_artifacts_dir):
    """Test de accesibilidad para la página de login de AutaMedica"""
    
    # 1. Navegar a la página de login
    log_test_step(page, "Navegando a página de login", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    wait_for_network_idle(page)
    
    # 2. Ejecutar auditoría de accesibilidad
    log_test_step(page, "Ejecutando auditoría de accesibilidad", test_artifacts_dir)
    result = run_accessibility_audit(page)
    
    # 3. Analizar resultados
    violations = result.get("violations", [])
    passes = result.get("passes", [])
    
    print(f"✅ Tests de accesibilidad pasados: {len(passes)}")
    print(f"❌ Violaciones encontradas: {len(violations)}")
    
    # 4. Filtrar violaciones críticas
    critical_violations = [v for v in violations if v.get("impact") in ("serious", "critical")]
    moderate_violations = [v for v in violations if v.get("impact") == "moderate"]
    minor_violations = [v for v in violations if v.get("impact") == "minor"]
    
    # 5. Reportar violaciones
    if critical_violations:
        print(f"🚨 Violaciones críticas ({len(critical_violations)}):")
        for violation in critical_violations:
            print(f"  - {violation['id']}: {violation['description']}")
            print(f"    Impacto: {violation['impact']}")
            print(f"    Nodos afectados: {len(violation['nodes'])}")
            print()
    
    if moderate_violations:
        print(f"⚠️ Violaciones moderadas ({len(moderate_violations)}):")
        for violation in moderate_violations[:5]:  # Mostrar solo las primeras 5
            print(f"  - {violation['id']}: {violation['description']}")
    
    # 6. Assertions
    assert len(critical_violations) == 0, f"Violaciones críticas de accesibilidad encontradas: {len(critical_violations)}"
    
    # Permitir algunas violaciones moderadas pero reportarlas
    if len(moderate_violations) > 10:
        print(f"⚠️ Muchas violaciones moderadas encontradas: {len(moderate_violations)}")
    
    # 7. Verificaciones específicas para formulario de login
    log_test_step(page, "Verificando accesibilidad del formulario", test_artifacts_dir)
    
    # Verificar que los campos tienen labels
    email_input = page.locator("input[type='email']")
    password_input = page.locator("input[type='password']")
    
    # Verificar que los inputs están asociados con labels
    email_label = page.locator("label[for='email'], label:has-text('email'), label:has-text('correo')")
    password_label = page.locator("label[for='password'], label:has-text('password'), label:has-text('contraseña')")
    
    assert email_input.is_visible(), "Campo de email no visible"
    assert password_input.is_visible(), "Campo de contraseña no visible"
    
    # Verificar que hay al menos un label visible
    assert email_label.count() > 0 or page.locator("label").count() > 0, "No se encontraron labels en el formulario"
    
    # Verificar que el botón de submit es accesible
    submit_button = page.locator("button[type='submit']")
    assert submit_button.is_visible(), "Botón de submit no visible"
    assert submit_button.is_enabled(), "Botón de submit no está habilitado"

def test_autamedica_doctors_dashboard_accessibility(page, autamedica_config, mock_supabase_auth, test_artifacts_dir):
    """Test de accesibilidad para el dashboard de doctores"""
    
    # 1. Login como doctor
    log_test_step(page, "Realizando login de doctor", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    # 2. Navegar al dashboard
    log_test_step(page, "Navegando al dashboard de doctores", test_artifacts_dir)
    page.goto(autamedica_config['doctors_url'])
    wait_for_network_idle(page)
    
    # 3. Ejecutar auditoría de accesibilidad
    log_test_step(page, "Ejecutando auditoría de accesibilidad del dashboard", test_artifacts_dir)
    result = run_accessibility_audit(page)
    
    # 4. Analizar resultados
    violations = result.get("violations", [])
    critical_violations = [v for v in violations if v.get("impact") in ("serious", "critical")]
    
    print(f"✅ Tests de accesibilidad del dashboard pasados: {len(result.get('passes', []))}")
    print(f"❌ Violaciones encontradas: {len(violations)}")
    print(f"🚨 Violaciones críticas: {len(critical_violations)}")
    
    # 5. Assertions
    assert len(critical_violations) == 0, f"Violaciones críticas de accesibilidad en dashboard: {len(critical_violations)}"
    
    # 6. Verificaciones específicas del dashboard
    log_test_step(page, "Verificando elementos específicos del dashboard", test_artifacts_dir)
    
    # Verificar que hay navegación principal
    nav_elements = page.locator("nav, [role='navigation'], .navigation, .nav")
    assert nav_elements.count() > 0, "No se encontró navegación principal"
    
    # Verificar que hay contenido principal
    main_content = page.locator("main, [role='main'], .main-content, .content")
    assert main_content.count() > 0, "No se encontró contenido principal"
    
    # Verificar que los botones tienen texto o aria-label
    buttons = page.locator("button")
    for i in range(min(buttons.count(), 5)):  # Verificar los primeros 5 botones
        button = buttons.nth(i)
        button_text = button.text_content()
        aria_label = button.get_attribute("aria-label")
        title = button.get_attribute("title")
        
        assert button_text or aria_label or title, f"Botón {i} no tiene texto, aria-label o title accesible"

def test_autamedica_video_call_interface_accessibility(page, autamedica_config, mock_supabase_auth, mock_webrtc_signaling, test_artifacts_dir):
    """Test de accesibilidad para la interfaz de videollamada"""
    
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
        call_button.click()
        page.wait_for_timeout(2000)
    
    # 3. Ejecutar auditoría de accesibilidad
    log_test_step(page, "Ejecutando auditoría de accesibilidad de videollamada", test_artifacts_dir)
    result = run_accessibility_audit(page)
    
    # 4. Analizar resultados
    violations = result.get("violations", [])
    critical_violations = [v for v in violations if v.get("impact") in ("serious", "critical")]
    
    print(f"✅ Tests de accesibilidad de videollamada pasados: {len(result.get('passes', []))}")
    print(f"❌ Violaciones encontradas: {len(violations)}")
    print(f"🚨 Violaciones críticas: {len(critical_violations)}")
    
    # 5. Assertions
    assert len(critical_violations) == 0, f"Violaciones críticas de accesibilidad en videollamada: {len(critical_violations)}"
    
    # 6. Verificaciones específicas de videollamada
    log_test_step(page, "Verificando controles de videollamada", test_artifacts_dir)
    
    # Verificar que los controles de video tienen labels accesibles
    video_controls = page.locator("button[title*='video'], button[title*='cámara'], button[title*='micrófono'], button[title*='audio']")
    for i in range(min(video_controls.count(), 3)):  # Verificar los primeros 3 controles
        control = video_controls.nth(i)
        title = control.get_attribute("title")
        aria_label = control.get_attribute("aria-label")
        
        assert title or aria_label, f"Control de video {i} no tiene title o aria-label accesible"
    
    # Verificar que hay elementos de video
    video_elements = page.locator("video")
    if video_elements.count() > 0:
        video = video_elements.first
        # Verificar que el video tiene atributos de accesibilidad
        aria_label = video.get_attribute("aria-label")
        title = video.get_attribute("title")
        
        # Al menos uno de estos atributos debe estar presente
        assert aria_label or title, "Elemento de video no tiene aria-label o title accesible"

def test_autamedica_keyboard_navigation(page, autamedica_config, test_artifacts_dir):
    """Test de navegación por teclado"""
    
    # 1. Navegar a la página de login
    log_test_step(page, "Navegando a página de login para test de teclado", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 2. Verificar que se puede navegar con Tab
    log_test_step(page, "Probando navegación con Tab", test_artifacts_dir)
    
    # Enfocar el primer elemento interactivo
    page.keyboard.press("Tab")
    
    # Verificar que hay elementos enfocables
    focused_element = page.evaluate("() => document.activeElement.tagName")
    assert focused_element in ["INPUT", "BUTTON", "A"], f"Primer elemento enfocable no es interactivo: {focused_element}"
    
    # 3. Navegar por el formulario
    page.keyboard.press("Tab")
    page.keyboard.press("Tab")
    
    # 4. Verificar que se puede llenar el formulario con teclado
    log_test_step(page, "Probando llenado de formulario con teclado", test_artifacts_dir)
    
    # Enfocar campo de email
    page.keyboard.press("Tab")
    page.keyboard.type(autamedica_config['doctor_email'])
    
    # Navegar al campo de contraseña
    page.keyboard.press("Tab")
    page.keyboard.type(autamedica_config['doctor_password'])
    
    # Navegar al botón de submit
    page.keyboard.press("Tab")
    
    # Verificar que el botón está enfocado
    focused_element = page.evaluate("() => document.activeElement.tagName")
    assert focused_element == "BUTTON", "Botón de submit no está enfocado"
    
    # 5. Verificar que se puede enviar con Enter
    page.keyboard.press("Enter")
    
    # Esperar a que se procese el formulario
    page.wait_for_timeout(2000)

def test_autamedica_screen_reader_compatibility(page, autamedica_config, test_artifacts_dir):
    """Test de compatibilidad con lectores de pantalla"""
    
    # 1. Navegar a la página de login
    log_test_step(page, "Navegando a página de login para test de lector de pantalla", test_artifacts_dir)
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 2. Verificar que hay heading principal
    log_test_step(page, "Verificando estructura de headings", test_artifacts_dir)
    headings = page.locator("h1, h2, h3, h4, h5, h6")
    assert headings.count() > 0, "No se encontraron headings en la página"
    
    # Verificar que hay al menos un h1
    h1_elements = page.locator("h1")
    assert h1_elements.count() > 0, "No se encontró heading principal (h1)"
    
    # 3. Verificar que los campos de formulario tienen labels asociados
    log_test_step(page, "Verificando asociación de labels", test_artifacts_dir)
    
    email_input = page.locator("input[type='email']")
    password_input = page.locator("input[type='password']")
    
    # Verificar que los inputs tienen atributos de accesibilidad
    email_id = email_input.get_attribute("id")
    password_id = password_input.get_attribute("id")
    
    if email_id:
        email_label = page.locator(f"label[for='{email_id}']")
        assert email_label.count() > 0, "Campo de email no tiene label asociado"
    
    if password_id:
        password_label = page.locator(f"label[for='{password_id}']")
        assert password_label.count() > 0, "Campo de contraseña no tiene label asociado"
    
    # 4. Verificar que hay texto alternativo para imágenes
    log_test_step(page, "Verificando texto alternativo de imágenes", test_artifacts_dir)
    images = page.locator("img")
    for i in range(min(images.count(), 5)):  # Verificar las primeras 5 imágenes
        img = images.nth(i)
        alt_text = img.get_attribute("alt")
        aria_label = img.get_attribute("aria-label")
        
        # Las imágenes decorativas pueden tener alt="" pero las informativas deben tener alt o aria-label
        if not alt_text and not aria_label:
            # Verificar si es decorativa (sin src o con src vacío)
            src = img.get_attribute("src")
            if src and src.strip():
                print(f"⚠️ Imagen {i} puede necesitar texto alternativo")
    
    # 5. Verificar que hay landmarks ARIA
    log_test_step(page, "Verificando landmarks ARIA", test_artifacts_dir)
    landmarks = page.locator("[role='main'], [role='navigation'], [role='banner'], [role='contentinfo']")
    assert landmarks.count() > 0, "No se encontraron landmarks ARIA en la página"