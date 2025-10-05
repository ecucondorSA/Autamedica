# tests/python/test_visual_regression.py
from pathlib import Path
from utils import screenshot_and_save, visual_diff
import pytest

def test_autamedica_login_page_visual_regression(page, autamedica_config, test_artifacts_dir):
    """Test de regresión visual para la página de login de AutaMedica"""
    
    # 1. Navegar a la página de login
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 2. Esperar a que la página se cargue completamente
    page.wait_for_load_state("networkidle")
    
    # 3. Configurar directorios
    baseline_dir = Path("tests/python/baselines")
    expected = baseline_dir / "login_page_doctor.png"
    actual = test_artifacts_dir / "login_page_actual.png"
    diff = test_artifacts_dir / "login_page_diff.png"
    
    # 4. Capturar screenshot
    screenshot_and_save(page, actual)
    
    # 5. Comparar con baseline
    if not expected.exists():
        # Si no existe baseline, crearla
        baseline_dir.mkdir(parents=True, exist_ok=True)
        actual.replace(expected)
        pytest.skip("Baseline no existía: se ha creado. Re-ejecuta la prueba para validar.")
    else:
        # Comparar con baseline existente
        diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=6)
        assert diff_score <= 6, f"Regresión visual detectada. Hash diff: {diff_score}. Ver diff en: {diff}"

def test_autamedica_doctors_dashboard_visual_regression(page, autamedica_config, mock_supabase_auth, test_artifacts_dir):
    """Test de regresión visual para el dashboard de doctores"""
    
    # 1. Login como doctor
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    # 2. Navegar al dashboard
    page.goto(autamedica_config['doctors_url'])
    page.wait_for_load_state("networkidle")
    
    # 3. Configurar directorios
    baseline_dir = Path("tests/python/baselines")
    expected = baseline_dir / "doctors_dashboard.png"
    actual = test_artifacts_dir / "doctors_dashboard_actual.png"
    diff = test_artifacts_dir / "doctors_dashboard_diff.png"
    
    # 4. Capturar screenshot
    screenshot_and_save(page, actual)
    
    # 5. Comparar con baseline
    if not expected.exists():
        baseline_dir.mkdir(parents=True, exist_ok=True)
        actual.replace(expected)
        pytest.skip("Baseline no existía: se ha creado. Re-ejecuta la prueba para validar.")
    else:
        diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=8)
        assert diff_score <= 8, f"Regresión visual detectada. Hash diff: {diff_score}. Ver diff en: {diff}"

def test_autamedica_video_call_interface_visual_regression(page, autamedica_config, mock_supabase_auth, mock_webrtc_signaling, test_artifacts_dir):
    """Test de regresión visual para la interfaz de videollamada"""
    
    # 1. Login y navegar a videollamada
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.fill("input[type='email']", autamedica_config['doctor_email'])
    page.fill("input[type='password']", autamedica_config['doctor_password'])
    page.click("button[type='submit']")
    page.wait_for_url("**/doctors**", timeout=15000)
    
    # 2. Navegar al dashboard y buscar videollamada
    page.goto(autamedica_config['doctors_url'])
    page.wait_for_load_state("networkidle")
    
    # 3. Buscar botón de videollamada y hacer clic
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
    
    # 4. Configurar directorios
    baseline_dir = Path("tests/python/baselines")
    expected = baseline_dir / "video_call_interface.png"
    actual = test_artifacts_dir / "video_call_interface_actual.png"
    diff = test_artifacts_dir / "video_call_interface_diff.png"
    
    # 5. Capturar screenshot
    screenshot_and_save(page, actual)
    
    # 6. Comparar con baseline
    if not expected.exists():
        baseline_dir.mkdir(parents=True, exist_ok=True)
        actual.replace(expected)
        pytest.skip("Baseline no existía: se ha creado. Re-ejecuta la prueba para validar.")
    else:
        diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=10)
        assert diff_score <= 10, f"Regresión visual detectada. Hash diff: {diff_score}. Ver diff en: {diff}"

def test_autamedica_patients_app_visual_regression(page, autamedica_config, test_artifacts_dir):
    """Test de regresión visual para la app de pacientes"""
    
    # 1. Navegar a la app de pacientes
    page.goto(autamedica_config['patients_url'])
    page.wait_for_load_state("networkidle")
    
    # 2. Configurar directorios
    baseline_dir = Path("tests/python/baselines")
    expected = baseline_dir / "patients_app.png"
    actual = test_artifacts_dir / "patients_app_actual.png"
    diff = test_artifacts_dir / "patients_app_diff.png"
    
    # 3. Capturar screenshot
    screenshot_and_save(page, actual)
    
    # 4. Comparar con baseline
    if not expected.exists():
        baseline_dir.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(actual, expected)
        pytest.skip("Baseline no existía: se ha creado. Re-ejecuta la prueba para validar.")
    else:
        diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=6)
        assert diff_score <= 6, f"Regresión visual detectada. Hash diff: {diff_score}. Ver diff en: {diff}"

def test_autamedica_mobile_responsive_visual_regression(page, autamedica_config, test_artifacts_dir):
    """Test de regresión visual para vista móvil"""
    
    # 1. Configurar viewport móvil
    page.set_viewport_size({"width": 375, "height": 667})  # iPhone SE
    
    # 2. Navegar a la página de login
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 3. Configurar directorios
    baseline_dir = Path("tests/python/baselines")
    expected = baseline_dir / "login_page_mobile.png"
    actual = test_artifacts_dir / "login_page_mobile_actual.png"
    diff = test_artifacts_dir / "login_page_mobile_diff.png"
    
    # 4. Capturar screenshot
    screenshot_and_save(page, actual)
    
    # 5. Comparar con baseline
    if not expected.exists():
        baseline_dir.mkdir(parents=True, exist_ok=True)
        actual.replace(expected)
        pytest.skip("Baseline móvil no existía: se ha creado. Re-ejecuta la prueba para validar.")
    else:
        diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=8)
        assert diff_score <= 8, f"Regresión visual móvil detectada. Hash diff: {diff_score}. Ver diff en: {diff}"

def test_autamedica_dark_mode_visual_regression(page, autamedica_config, test_artifacts_dir):
    """Test de regresión visual para modo oscuro (si está disponible)"""
    
    # 1. Navegar a la página de login
    page.goto(f"{autamedica_config['auth_url']}/login?role=doctor")
    page.wait_for_selector("form", timeout=10000)
    
    # 2. Intentar activar modo oscuro si está disponible
    try:
        # Buscar toggle de modo oscuro
        dark_mode_toggle = page.locator("[data-testid='dark-mode-toggle'], .dark-mode-toggle, button:has-text('Dark'), button:has-text('Oscuro')")
        if dark_mode_toggle.is_visible():
            dark_mode_toggle.click()
            page.wait_for_timeout(1000)  # Esperar transición
    except:
        # Si no hay toggle, continuar sin modo oscuro
        pass
    
    # 3. Configurar directorios
    baseline_dir = Path("tests/python/baselines")
    expected = baseline_dir / "login_page_dark_mode.png"
    actual = test_artifacts_dir / "login_page_dark_mode_actual.png"
    diff = test_artifacts_dir / "login_page_dark_mode_diff.png"
    
    # 4. Capturar screenshot
    screenshot_and_save(page, actual)
    
    # 5. Comparar con baseline
    if not expected.exists():
        baseline_dir.mkdir(parents=True, exist_ok=True)
        actual.replace(expected)
        pytest.skip("Baseline de modo oscuro no existía: se ha creado. Re-ejecuta la prueba para validar.")
    else:
        diff_score = visual_diff(expected, actual, diff, threshold_hash_diff=8)
        assert diff_score <= 8, f"Regresión visual de modo oscuro detectada. Hash diff: {diff_score}. Ver diff en: {diff}"