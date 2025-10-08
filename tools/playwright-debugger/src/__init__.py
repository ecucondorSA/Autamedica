"""
Playwright Debugger Enterprise - Autamedica
Sistema profesional de debugging con Playwright
"""
__version__ = "1.0.0"
__author__ = "Autamedica Dev Team"

from .debugger.session import DebugSession, DebugSessionData
from .screenshot.manager import ScreenshotManager
from .analyzer.engine import DataAnalyzer, AnalysisResult
from .utils.config import Config
from .utils.logger import logger

__all__ = [
    "DebugSession",
    "DebugSessionData",
    "ScreenshotManager",
    "DataAnalyzer",
    "AnalysisResult",
    "Config",
    "logger",
]
