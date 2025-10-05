# tests/python/conftest.py
import pytest
from playwright.sync_api import sync_playwright
import os
import time
from pathlib import Path

# Configuración de AutaMedica
AUTAMEDICA_CONFIG = {
    "base_url": "http://localhost:3000",
    "auth_url": "http://localhost:3000/auth",
    "doctors_url": "http://localhost:3001", 
    "patients_url": "http://localhost:3003",
    "signaling_url": "ws://localhost:8888",
    "doctor_email": "doctor.demo@autamedica.com",
    "doctor_password": "Demo1234",
    "patient_id": "patient_001",
    "patient_name": "Juan Pérez"
}

@pytest.fixture(scope="session")
def playwright_instance():
    """Instancia de Playwright para toda la sesión de tests"""
    with sync_playwright() as p:
        yield p

@pytest.fixture(scope="session")
def browser(playwright_instance):
    """Navegador Chromium configurado para AutaMedica"""
    browser = playwright_instance.chromium.launch(
        headless=True,  # Cambiar a False para debugging visual
        args=[
            "--disable-dev-shm-usage",
            "--no-sandbox", 
            "--disable-setuid-sandbox",
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            "--allow-running-insecure-content",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
            "--enable-features=WebRTC",
            "--autoplay-policy=no-user-gesture-required",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding"
        ]
    )
    yield browser
    browser.close()

@pytest.fixture(scope="function")
def context(browser, tmp_path_factory):
    """Contexto por prueba para aislar cookies/localStorage"""
    user_data_dir = tmp_path_factory.mktemp("autamedica_profile")
    
    # Configuración específica para AutaMedica
    ctx = browser.new_context(
        viewport={"width": 1280, "height": 800},
        record_video_dir=str(user_data_dir / "videos"),
        bypass_csp=True,
        permissions=["camera", "microphone", "geolocation"],
        geolocation={"latitude": -0.2299, "longitude": -78.5249},  # Quito, Ecuador
        timezone_id="America/Guayaquil",
        locale="es-EC",
        user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    
    yield ctx
    
    # Cleanup
    try:
        ctx.close()
    except Exception:
        pass

@pytest.fixture(scope="function")
def page(context):
    """Página por prueba con configuración para AutaMedica"""
    page = context.new_page()
    
    # Configurar headers para AutaMedica
    page.set_extra_http_headers({
        "Accept-Language": "es-EC,es;q=0.9,en;q=0.8",
    })
    
    yield page
    
    # Cleanup
    try:
        page.close()
    except Exception:
        pass

@pytest.fixture(scope="function")
def autamedica_config():
    """Configuración de AutaMedica para los tests"""
    return AUTAMEDICA_CONFIG

@pytest.fixture(scope="function")
def mock_supabase_auth(page):
    """Mock de autenticación Supabase para tests"""
    def handle_auth(route, request):
        if "/auth/v1/token" in request.url and request.method == "POST":
            # Mock de login exitoso
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body='{"access_token": "fake-jwt-token-123", "refresh_token": "fake-refresh-token", "user": {"id": "doctor-123", "email": "doctor.demo@autamedica.com", "role": "doctor"}}'
            )
        elif "/auth/v1/user" in request.url:
            # Mock de datos de usuario
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body='{"id": "doctor-123", "email": "doctor.demo@autamedica.com", "user_metadata": {"role": "doctor", "first_name": "Dr. Demo", "last_name": "Test"}}'
            )
        else:
            route.continue_()
    
    page.route("**/auth/v1/**", handle_auth)
    return handle_auth

@pytest.fixture(scope="function")
def mock_webrtc_signaling(page):
    """Mock del servidor de señalización WebRTC"""
    def handle_signaling(route, request):
        if "/signaling" in request.url:
            # Mock de respuesta del signaling server
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body='{"status": "connected", "room_id": "doctor_patient_001", "users": ["doctor-123", "patient-001"]}'
            )
        else:
            route.continue_()
    
    page.route("**/signaling**", handle_signaling)
    return handle_signaling

@pytest.fixture(scope="function")
def mock_patient_data(page):
    """Mock de datos de pacientes"""
    def handle_patients(route, request):
        if "/api/patients" in request.url:
            route.fulfill(
                status=200,
                headers={"content-type": "application/json"},
                body='{"patients": [{"id": "patient_001", "name": "Juan Pérez", "age": 45, "status": "available"}]}'
            )
        else:
            route.continue_()
    
    page.route("**/api/patients**", handle_patients)
    return handle_patients

@pytest.fixture(scope="function")
def test_artifacts_dir(tmp_path):
    """Directorio para artefactos de test (screenshots, videos, etc.)"""
    artifacts_dir = tmp_path / "artifacts"
    artifacts_dir.mkdir(exist_ok=True)
    return artifacts_dir