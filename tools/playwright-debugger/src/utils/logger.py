"""
Sistema de logging profesional con Rich
"""
import logging
import sys
from pathlib import Path
from datetime import datetime
from rich.console import Console
from rich.logging import RichHandler
from rich.theme import Theme

from .config import Config

# Tema personalizado Autamedica
AUTAMEDICA_THEME = Theme({
    "info": "cyan",
    "warning": "yellow",
    "error": "bold red",
    "success": "bold green",
    "debug": "dim",
    "highlight": "magenta",
})

# Console con tema personalizado
console = Console(theme=AUTAMEDICA_THEME)


class DebuggerLogger:
    """Logger profesional para el debugger"""

    def __init__(self, name: str = "playwright-debugger"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, Config.LOG_LEVEL))
        self.console = console

        # Evitar duplicar handlers
        if not self.logger.handlers:
            self._setup_handlers()

    def _setup_handlers(self):
        """Configurar handlers de logging"""
        # Handler para consola con Rich
        rich_handler = RichHandler(
            console=self.console,
            show_time=True,
            show_path=False,
            markup=True,
            rich_tracebacks=True,
            tracebacks_show_locals=True,
        )
        rich_handler.setFormatter(logging.Formatter("%(message)s"))
        self.logger.addHandler(rich_handler)

        # Handler para archivo
        log_file = Config.LOGS_DIR / f"debugger_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s | %(name)s | %(levelname)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S"
            )
        )
        self.logger.addHandler(file_handler)

    def info(self, message: str, **kwargs):
        """Log info message"""
        self.logger.info(message, extra=kwargs)

    def success(self, message: str):
        """Log success message"""
        self.console.print(f"✅ {message}", style="success")

    def warning(self, message: str, **kwargs):
        """Log warning message"""
        self.logger.warning(message, extra=kwargs)

    def error(self, message: str, **kwargs):
        """Log error message"""
        self.logger.error(message, extra=kwargs)

    def debug(self, message: str, **kwargs):
        """Log debug message"""
        self.logger.debug(message, extra=kwargs)

    def exception(self, message: str):
        """Log exception with traceback"""
        self.logger.exception(message)

    def section(self, title: str):
        """Print section header"""
        self.console.rule(f"[bold cyan]{title}[/bold cyan]")

    def print_table(self, *args, **kwargs):
        """Print table with Rich"""
        from rich.table import Table
        table = Table(*args, **kwargs)
        return table

    def print_json(self, data: dict):
        """Print JSON con highlighting"""
        from rich.json import JSON
        self.console.print(JSON.from_data(data))

    def print_tree(self, *args, **kwargs):
        """Print tree structure"""
        from rich.tree import Tree
        tree = Tree(*args, **kwargs)
        return tree

    def progress(self, *args, **kwargs):
        """Create progress bar"""
        from rich.progress import Progress
        return Progress(*args, **kwargs, console=self.console)

    def status(self, message: str):
        """Create status spinner"""
        return self.console.status(f"[bold cyan]{message}[/bold cyan]")


# Logger global
logger = DebuggerLogger()
