"""
DebugSession: Sesión de debugging con captura completa de datos
"""
import asyncio
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field, asdict
from uuid import uuid4

from playwright.async_api import async_playwright, Page, Browser, BrowserContext, ConsoleMessage, Request, Response

from ..utils.config import Config
from ..utils.logger import logger


@dataclass
class ConsoleLog:
    """Log de consola capturado"""
    timestamp: str
    type: str  # log, error, warning, info, debug
    text: str
    location: Optional[str] = None
    stack_trace: Optional[str] = None


@dataclass
class NetworkRequest:
    """Request de red capturado"""
    timestamp: str
    method: str
    url: str
    status: Optional[int] = None
    status_text: Optional[str] = None
    timing: Optional[Dict] = None
    headers: Optional[Dict] = None
    response_headers: Optional[Dict] = None
    failure: Optional[str] = None
    resource_type: Optional[str] = None


@dataclass
class JavaScriptError:
    """Error de JavaScript capturado"""
    timestamp: str
    message: str
    stack: Optional[str] = None
    source: Optional[str] = None
    line: Optional[int] = None
    column: Optional[int] = None


@dataclass
class PerformanceMetrics:
    """Métricas de performance"""
    timestamp: str
    lcp: Optional[float] = None  # Largest Contentful Paint
    fid: Optional[float] = None  # First Input Delay
    cls: Optional[float] = None  # Cumulative Layout Shift
    ttfb: Optional[float] = None  # Time to First Byte
    dom_content_loaded: Optional[float] = None
    load: Optional[float] = None


@dataclass
class DebugSessionData:
    """Datos capturados en una sesión de debugging"""
    session_id: str
    app_name: str
    url: str
    started_at: str
    ended_at: Optional[str] = None
    console_logs: List[ConsoleLog] = field(default_factory=list)
    network_requests: List[NetworkRequest] = field(default_factory=list)
    javascript_errors: List[JavaScriptError] = field(default_factory=list)
    performance_metrics: Optional[PerformanceMetrics] = None
    screenshots: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict:
        """Convertir a diccionario serializable"""
        return asdict(self)

    def to_json(self) -> str:
        """Convertir a JSON"""
        return json.dumps(self.to_dict(), indent=2, ensure_ascii=False)


class DebugSession:
    """
    Sesión de debugging con Playwright
    Captura completa de console, network, errors, performance
    """

    def __init__(
        self,
        url: str,
        app_name: str = "unknown",
        headless: bool = None,
        slow_mo: int = None,
    ):
        self.url = url
        self.app_name = app_name
        self.session_id = str(uuid4())
        self.headless = headless if headless is not None else Config.HEADLESS
        self.slow_mo = slow_mo if slow_mo is not None else Config.SLOW_MO

        # Data storage
        self.data = DebugSessionData(
            session_id=self.session_id,
            app_name=app_name,
            url=url,
            started_at=datetime.now().isoformat(),
        )

        # Playwright objects
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None

    async def __aenter__(self):
        """Context manager entry"""
        await self.start()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.close()

    async def start(self):
        """Iniciar sesión de debugging"""
        logger.section(f"🚀 Iniciando Debug Session: {self.app_name}")
        logger.info(f"Session ID: [bold]{self.session_id}[/bold]")
        logger.info(f"URL: [bold]{self.url}[/bold]")

        # Iniciar Playwright
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=self.headless,
            slow_mo=self.slow_mo,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ]
        )

        # Crear contexto con viewport
        self.context = await self.browser.new_context(
            viewport=Config.VIEWPORT,
            user_agent="Mozilla/5.0 (X11; Linux x86_64) Playwright Debugger Autamedica",
            ignore_https_errors=True,
        )

        # Crear página
        self.page = await self.context.new_page()

        # Configurar listeners
        self._setup_listeners()

        logger.success("Navegador iniciado correctamente")

    def _setup_listeners(self):
        """Configurar listeners para captura de datos"""
        if not self.page:
            return

        # Console logs
        if Config.CAPTURE_CONSOLE:
            self.page.on("console", self._on_console_message)

        # Network requests
        if Config.CAPTURE_NETWORK:
            self.page.on("request", self._on_request)
            self.page.on("response", self._on_response)
            self.page.on("requestfailed", self._on_request_failed)

        # Errors
        if Config.CAPTURE_ERRORS:
            self.page.on("pageerror", self._on_page_error)

        logger.debug("Listeners configurados")

    def _on_console_message(self, msg: ConsoleMessage):
        """Capturar mensaje de consola"""
        console_log = ConsoleLog(
            timestamp=datetime.now().isoformat(),
            type=msg.type,
            text=msg.text,
            location=str(msg.location) if msg.location else None,
        )
        self.data.console_logs.append(console_log)

        # Log en consola con color según tipo
        color_map = {
            "error": "error",
            "warning": "warning",
            "info": "info",
            "debug": "debug",
        }
        style = color_map.get(msg.type, "info")
        logger.info(f"[{msg.type.upper()}] {msg.text}", style=style)

    def _on_request(self, request: Request):
        """Capturar request de red"""
        network_request = NetworkRequest(
            timestamp=datetime.now().isoformat(),
            method=request.method,
            url=request.url,
            headers=request.headers,
            resource_type=request.resource_type,
        )
        self.data.network_requests.append(network_request)
        logger.debug(f"Request: {request.method} {request.url}")

    def _on_response(self, response: Response):
        """Capturar response de red"""
        # Buscar el request correspondiente
        for req in reversed(self.data.network_requests):
            if req.url == response.url and req.status is None:
                req.status = response.status
                req.status_text = response.status_text
                req.response_headers = response.headers
                break

        # Log de status codes problemáticos
        if response.status >= 400:
            logger.warning(f"Response Error: {response.status} {response.url}")

    def _on_request_failed(self, request: Request):
        """Capturar request fallido"""
        for req in reversed(self.data.network_requests):
            if req.url == request.url and req.failure is None:
                req.failure = request.failure
                break

        logger.error(f"Request Failed: {request.url} - {request.failure}")

    def _on_page_error(self, error: Exception):
        """Capturar error de página"""
        js_error = JavaScriptError(
            timestamp=datetime.now().isoformat(),
            message=str(error),
            stack=getattr(error, "stack", None),
        )
        self.data.javascript_errors.append(js_error)
        logger.error(f"JavaScript Error: {str(error)}")

    async def navigate(self, wait_until: str = "networkidle") -> bool:
        """Navegar a la URL"""
        logger.info(f"Navegando a: {self.url}")
        try:
            response = await self.page.goto(self.url, wait_until=wait_until, timeout=Config.TIMEOUT)
            if response and response.ok:
                logger.success(f"Navegación exitosa: {response.status}")
                return True
            else:
                logger.warning(f"Navegación con advertencias: {response.status if response else 'No response'}")
                return False
        except Exception as e:
            logger.error(f"Error navegando: {str(e)}")
            return False

    async def wait_for(self, selector: str, timeout: int = None):
        """Esperar por elemento"""
        timeout = timeout or Config.TIMEOUT
        try:
            await self.page.wait_for_selector(selector, timeout=timeout)
            logger.debug(f"Elemento encontrado: {selector}")
        except Exception as e:
            logger.warning(f"Timeout esperando: {selector}")

    async def click(self, selector: str):
        """Click en elemento"""
        try:
            await self.page.click(selector)
            logger.info(f"Click en: {selector}")
        except Exception as e:
            logger.error(f"Error haciendo click: {str(e)}")

    async def fill(self, selector: str, value: str):
        """Llenar campo"""
        try:
            await self.page.fill(selector, value)
            logger.info(f"Llenado: {selector}")
        except Exception as e:
            logger.error(f"Error llenando campo: {str(e)}")

    async def screenshot(self, name: str = None, full_page: bool = True) -> Optional[Path]:
        """Tomar screenshot"""
        if not name:
            name = f"{self.app_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{Config.SCREENSHOT_FORMAT}"

        screenshot_path = Config.SCREENSHOTS_DIR / name

        try:
            await self.page.screenshot(
                path=str(screenshot_path),
                full_page=full_page,
                type=Config.SCREENSHOT_FORMAT,
            )
            self.data.screenshots.append(str(screenshot_path))
            logger.success(f"Screenshot guardado: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            logger.error(f"Error tomando screenshot: {str(e)}")
            return None

    async def capture_performance_metrics(self):
        """Capturar métricas de performance"""
        if not Config.CAPTURE_PERFORMANCE:
            return

        try:
            # Web Vitals usando Performance API
            metrics = await self.page.evaluate("""
                () => {
                    return {
                        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                        load: performance.timing.loadEventEnd - performance.timing.navigationStart,
                        ttfb: performance.timing.responseStart - performance.timing.navigationStart,
                    }
                }
            """)

            self.data.performance_metrics = PerformanceMetrics(
                timestamp=datetime.now().isoformat(),
                dom_content_loaded=metrics.get("domContentLoaded"),
                load=metrics.get("load"),
                ttfb=metrics.get("ttfb"),
            )

            logger.info(f"Performance Metrics capturadas")
        except Exception as e:
            logger.debug(f"No se pudieron capturar métricas: {str(e)}")

    async def get_html(self) -> str:
        """Obtener HTML de la página"""
        return await self.page.content()

    async def get_title(self) -> str:
        """Obtener título de la página"""
        return await self.page.title()

    def get_console_logs(self) -> List[ConsoleLog]:
        """Obtener logs de consola capturados"""
        return self.data.console_logs

    def get_network_requests(self) -> List[NetworkRequest]:
        """Obtener requests de red capturados"""
        return self.data.network_requests

    def get_errors(self) -> List[JavaScriptError]:
        """Obtener errores JavaScript capturados"""
        return self.data.javascript_errors

    def get_failed_requests(self) -> List[NetworkRequest]:
        """Obtener solo los requests fallidos"""
        return [req for req in self.data.network_requests if req.failure or (req.status and req.status >= 400)]

    async def save_session_data(self) -> Path:
        """Guardar datos de la sesión"""
        self.data.ended_at = datetime.now().isoformat()
        session_file = Config.DATA_DIR / f"session_{self.session_id}.json"

        with open(session_file, "w", encoding="utf-8") as f:
            f.write(self.data.to_json())

        logger.success(f"Datos de sesión guardados: {session_file}")
        return session_file

    async def close(self):
        """Cerrar sesión de debugging"""
        logger.info("Cerrando sesión de debugging...")

        # Guardar datos antes de cerrar
        await self.save_session_data()

        # Cerrar Playwright
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

        logger.success("Sesión cerrada correctamente")

    def print_summary(self):
        """Imprimir resumen de la sesión"""
        logger.section("📊 Resumen de Sesión")

        table = logger.print_table(
            title=f"Session {self.session_id[:8]}",
            show_header=True,
            header_style="bold cyan"
        )
        table.add_column("Métrica", style="cyan")
        table.add_column("Valor", style="green")

        table.add_row("App", self.app_name)
        table.add_row("URL", self.url)
        table.add_row("Console Logs", str(len(self.data.console_logs)))
        table.add_row("Network Requests", str(len(self.data.network_requests)))
        table.add_row("JavaScript Errors", str(len(self.data.javascript_errors)))
        table.add_row("Screenshots", str(len(self.data.screenshots)))
        table.add_row("Failed Requests", str(len(self.get_failed_requests())))

        logger.console.print(table)

        # Mostrar errores si hay
        if self.data.javascript_errors:
            logger.console.print("\n[bold red]❌ JavaScript Errors:[/bold red]")
            for error in self.data.javascript_errors:
                logger.console.print(f"  • {error.message}")

        # Mostrar requests fallidos
        failed = self.get_failed_requests()
        if failed:
            logger.console.print("\n[bold yellow]⚠️  Failed Requests:[/bold yellow]")
            for req in failed[:5]:  # Mostrar solo primeros 5
                logger.console.print(f"  • {req.method} {req.url} ({req.status or req.failure})")
