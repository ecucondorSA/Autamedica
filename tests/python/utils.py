# tests/python/utils.py
import json
import time
from pathlib import Path
from PIL import Image, ImageChops
import imagehash
import requests
from typing import Optional, Dict, Any

def screenshot_and_save(page, path: Path, full_page: bool = True):
    """Captura screenshot y lo guarda en la ruta especificada"""
    path.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(path), full_page=full_page)

def visual_diff(expected_path: Path, actual_path: Path, diff_path: Path, threshold_hash_diff: int = 5):
    """
    Comparación visual de imágenes usando hash perceptual
    Retorna la diferencia de hash (0 = idénticas, > threshold = diferentes)
    """
    expected = Image.open(expected_path).convert("RGB")
    actual = Image.open(actual_path).convert("RGB")
    
    # Redimensionar si es necesario
    if expected.size != actual.size:
        actual = actual.resize(expected.size)
    
    # Hash perceptual
    h1 = imagehash.phash(expected)
    h2 = imagehash.phash(actual)
    diff = h1 - h2
    
    if diff > threshold_hash_diff:
        # Guardar diff visual para inspección
        diff_img = ImageChops.difference(expected, actual)
        diff_path.parent.mkdir(parents=True, exist_ok=True)
        diff_img.save(diff_path)
    
    return diff

def wait_for_network_idle(page, timeout: int = 5000, idle_time: int = 500):
    """
    Espera a que no haya peticiones de red por idle_time ms
    """
    last_activity = time.time()
    reqs = set()

    def on_request(request):
        nonlocal last_activity
        reqs.add(request)
        last_activity = time.time()

    def on_request_finished(request):
        nonlocal last_activity
        reqs.discard(request)
        last_activity = time.time()

    page.on("request", on_request)
    page.on("requestfinished", on_request_finished)
    page.on("requestfailed", on_request_finished)

    end = time.time() + timeout/1000.0
    while time.time() < end:
        if (time.time() - last_activity) * 1000 >= idle_time:
            break
        time.sleep(0.05)

    # Detach listeners (Playwright no tiene método off, se detach automáticamente)
    # page.off("request", on_request)
    # page.off("requestfinished", on_request_finished)
    # page.off("requestfailed", on_request_finished)

def wait_for_webrtc_connection(page, timeout: int = 10000):
    """
    Espera a que se establezca una conexión WebRTC
    """
    try:
        # Verificar que hay elementos de video
        page.wait_for_selector("video", timeout=timeout)
        
        # Verificar que el video está funcionando
        video_ready = page.evaluate("""
            () => {
                const videos = document.querySelectorAll('video');
                return Array.from(videos).some(video => 
                    video.readyState >= 2 && video.videoWidth > 0
                );
            }
        """)
        
        return video_ready
    except Exception:
        return False

def inject_axe(page):
    """Inyecta axe-core para tests de accesibilidad"""
    axe_script = """
    (function() {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.6.3/axe.min.js';
        script.onload = function() {
            window.axeReady = true;
        };
        document.head.appendChild(script);
    })();
    """
    page.add_script_tag(content=axe_script)
    
    # Esperar a que axe esté listo
    page.wait_for_function("() => window.axeReady === true", timeout=10000)

def run_accessibility_audit(page) -> Dict[str, Any]:
    """Ejecuta auditoría de accesibilidad con axe-core"""
    inject_axe(page)
    
    result = page.evaluate("""
        async () => {
            if (window.axe) {
                return await window.axe.run();
            }
            return { violations: [], passes: [] };
        }
    """)
    
    return result

def mock_webrtc_permissions(page):
    """Simula permisos de WebRTC para testing"""
    page.add_init_script("""
        // Mock getUserMedia para testing
        navigator.mediaDevices.getUserMedia = async (constraints) => {
            const stream = new MediaStream();
            // Crear tracks simulados
            const videoTrack = new MediaStreamTrack();
            const audioTrack = new MediaStreamTrack();
            stream.addTrack(videoTrack);
            stream.addTrack(audioTrack);
            return stream;
        };
        
        // Mock getDisplayMedia para screen sharing
        navigator.mediaDevices.getDisplayMedia = async (constraints) => {
            const stream = new MediaStream();
            const videoTrack = new MediaStreamTrack();
            stream.addTrack(videoTrack);
            return stream;
        };
    """)

def get_performance_metrics(page) -> Dict[str, Any]:
    """Obtiene métricas de performance de la página"""
    metrics = page.evaluate("""
        () => {
            const timing = window.performance.timing;
            const navigation = window.performance.navigation;
            
            return {
                // Tiempos de carga
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstPaint: timing.responseEnd - timing.navigationStart,
                
                // Métricas de navegación
                redirectCount: navigation.redirectCount,
                type: navigation.type,
                
                // Memoria (si está disponible)
                memory: window.performance.memory ? {
                    usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                    totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit
                } : null
            };
        }
    """)
    
    return metrics

def save_test_artifacts(page, test_name: str, artifacts_dir: Path):
    """Guarda artefactos de test (screenshots, videos, traces)"""
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    
    # Screenshot
    screenshot_path = artifacts_dir / f"{test_name}_screenshot.png"
    screenshot_and_save(page, screenshot_path)
    
    # Performance metrics
    metrics = get_performance_metrics(page)
    metrics_path = artifacts_dir / f"{test_name}_metrics.json"
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    
    # Accessibility audit
    try:
        a11y_result = run_accessibility_audit(page)
        a11y_path = artifacts_dir / f"{test_name}_accessibility.json"
        with open(a11y_path, 'w') as f:
            json.dump(a11y_result, f, indent=2)
    except Exception as e:
        print(f"Error en auditoría de accesibilidad: {e}")
    
    return {
        "screenshot": screenshot_path,
        "metrics": metrics_path,
        "accessibility": a11y_path if 'a11y_path' in locals() else None
    }

def retry_on_exception(retries: int = 3, delay: float = 1.0):
    """Decorador para reintentar tests en caso de fallos"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for i in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if i < retries - 1:
                        print(f"Intento {i+1} falló: {e}. Reintentando en {delay}s...")
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

def check_autamedica_services() -> Dict[str, bool]:
    """Verifica que los servicios de AutaMedica estén disponibles"""
    services = {
        "auth": "http://localhost:3000",
        "doctors": "http://localhost:3001", 
        "patients": "http://localhost:3003",
        "signaling": "http://localhost:8888"
    }
    
    results = {}
    for service, url in services.items():
        try:
            response = requests.get(url, timeout=5)
            results[service] = response.status_code < 400
        except:
            results[service] = False
    
    return results

def log_test_step(page, step: str, artifacts_dir: Path):
    """Registra un paso del test con timestamp y screenshot"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {step}"
    print(log_entry)
    
    # Screenshot del paso
    step_screenshot = artifacts_dir / f"step_{int(time.time())}_{step.replace(' ', '_')}.png"
    screenshot_and_save(page, step_screenshot)
    
    return step_screenshot