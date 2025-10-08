"""
Configuración centralizada para Playwright Debugger
"""
import os
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración centralizada del debugger"""

    # Directorios base
    ROOT_DIR = Path(__file__).parent.parent.parent
    SCREENSHOTS_DIR = ROOT_DIR / "screenshots"
    REPORTS_DIR = ROOT_DIR / "reports"
    LOGS_DIR = ROOT_DIR / "logs"
    DATA_DIR = ROOT_DIR / "data"

    # URLs de apps Autamedica
    APPS = {
        "web-app": os.getenv("WEB_APP_URL", "http://localhost:3000"),
        "doctors": os.getenv("DOCTORS_URL", "http://localhost:3001"),
        "patients": os.getenv("PATIENTS_URL", "http://localhost:3002"),
        "companies": os.getenv("COMPANIES_URL", "http://localhost:3003"),
        "admin": os.getenv("ADMIN_URL", "http://localhost:3004"),
        "auth": os.getenv("AUTH_URL", "http://localhost:3005"),
    }

    # Screenshot settings
    SCREENSHOT_VIEWER = os.getenv("SCREENSHOT_VIEWER", "eog")
    AUTO_OPEN_SCREENSHOTS = os.getenv("AUTO_OPEN_SCREENSHOTS", "true").lower() == "true"
    SCREENSHOT_FORMAT = os.getenv("SCREENSHOT_FORMAT", "png")
    SCREENSHOT_QUALITY = int(os.getenv("SCREENSHOT_QUALITY", "95"))

    # Browser settings
    HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"
    SLOW_MO = int(os.getenv("SLOW_MO", "100"))
    TIMEOUT = int(os.getenv("TIMEOUT", "30000"))
    VIEWPORT = {
        "width": int(os.getenv("VIEWPORT_WIDTH", "1920")),
        "height": int(os.getenv("VIEWPORT_HEIGHT", "1080"))
    }

    # Debug settings
    CAPTURE_CONSOLE = os.getenv("CAPTURE_CONSOLE", "true").lower() == "true"
    CAPTURE_NETWORK = os.getenv("CAPTURE_NETWORK", "true").lower() == "true"
    CAPTURE_ERRORS = os.getenv("CAPTURE_ERRORS", "true").lower() == "true"
    CAPTURE_PERFORMANCE = os.getenv("CAPTURE_PERFORMANCE", "true").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

    # MCP settings
    MCP_ENABLED = os.getenv("MCP_ENABLED", "true").lower() == "true"
    MCP_HOST = os.getenv("MCP_HOST", "localhost")
    MCP_PORT = int(os.getenv("MCP_PORT", "8765"))

    # Analysis settings
    AUTO_ANALYZE = os.getenv("AUTO_ANALYZE", "true").lower() == "true"
    AUTO_FIX_SUGGESTIONS = os.getenv("AUTO_FIX_SUGGESTIONS", "true").lower() == "true"
    ANALYSIS_DEPTH = os.getenv("ANALYSIS_DEPTH", "deep")
    PATTERN_DETECTION = os.getenv("PATTERN_DETECTION", "true").lower() == "true"

    # Report settings
    REPORT_FORMATS = os.getenv("REPORT_FORMAT", "html,json,md").split(",")
    AUTO_GENERATE_REPORTS = os.getenv("AUTO_GENERATE_REPORTS", "true").lower() == "true"

    # Monitor settings
    MONITOR_INTERVAL = int(os.getenv("MONITOR_INTERVAL", "30"))
    MAX_SESSIONS = int(os.getenv("MAX_SESSIONS", "100"))
    SESSION_RETENTION_DAYS = int(os.getenv("SESSION_RETENTION_DAYS", "7"))

    # Database settings
    DB_ENABLED = os.getenv("DB_ENABLED", "false").lower() == "true"
    DB_PATH = ROOT_DIR / os.getenv("DB_PATH", "data/debugger.db")

    @classmethod
    def ensure_directories(cls):
        """Crear directorios necesarios"""
        for directory in [cls.SCREENSHOTS_DIR, cls.REPORTS_DIR, cls.LOGS_DIR, cls.DATA_DIR]:
            directory.mkdir(parents=True, exist_ok=True)

    @classmethod
    def get_app_url(cls, app_name: str) -> str:
        """Obtener URL de una app"""
        return cls.APPS.get(app_name, "")

    @classmethod
    def to_dict(cls) -> Dict[str, Any]:
        """Convertir configuración a diccionario"""
        return {
            "apps": cls.APPS,
            "screenshot_viewer": cls.SCREENSHOT_VIEWER,
            "auto_open_screenshots": cls.AUTO_OPEN_SCREENSHOTS,
            "headless": cls.HEADLESS,
            "slow_mo": cls.SLOW_MO,
            "timeout": cls.TIMEOUT,
            "viewport": cls.VIEWPORT,
            "capture_console": cls.CAPTURE_CONSOLE,
            "capture_network": cls.CAPTURE_NETWORK,
            "capture_errors": cls.CAPTURE_ERRORS,
            "capture_performance": cls.CAPTURE_PERFORMANCE,
            "mcp_enabled": cls.MCP_ENABLED,
            "auto_analyze": cls.AUTO_ANALYZE,
            "auto_fix_suggestions": cls.AUTO_FIX_SUGGESTIONS,
        }

# Asegurar que los directorios existan
Config.ensure_directories()
