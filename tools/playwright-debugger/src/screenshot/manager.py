"""
ScreenshotManager: Gestión avanzada de screenshots con auto-open
"""
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from dataclasses import dataclass

from PIL import Image, ImageDraw, ImageFont

from ..utils.config import Config
from ..utils.logger import logger


@dataclass
class ScreenshotMetadata:
    """Metadata de un screenshot"""
    filepath: Path
    timestamp: str
    app_name: str
    session_id: str
    width: int
    height: int
    size_kb: int
    annotations: List[str] = None


class ScreenshotManager:
    """
    Gestor profesional de screenshots
    - Captura y almacenamiento
    - Apertura automática con visor Ubuntu
    - Anotaciones y marcas
    - Comparaciones visuales
    """

    VIEWERS = {
        "eog": ["eog"],  # Eye of GNOME (default Ubuntu)
        "feh": ["feh", "--scale-down", "--auto-zoom"],
        "gpicview": ["gpicview"],
        "nomacs": ["nomacs"],
        "gthumb": ["gthumb"],
    }

    def __init__(self, session_id: str, app_name: str):
        self.session_id = session_id
        self.app_name = app_name
        self.screenshots: List[ScreenshotMetadata] = []
        self._ensure_viewer_available()

    def _ensure_viewer_available(self):
        """Verificar que el visor configurado esté disponible"""
        viewer = Config.SCREENSHOT_VIEWER
        if viewer not in self.VIEWERS:
            logger.warning(f"Visor '{viewer}' no reconocido, usando 'eog' por defecto")
            Config.SCREENSHOT_VIEWER = "eog"
            return

        viewer_cmd = self.VIEWERS[viewer][0]
        if not shutil.which(viewer_cmd):
            logger.warning(f"Visor '{viewer}' no instalado, buscando alternativa...")
            # Buscar visor alternativo disponible
            for alt_viewer, alt_cmd in self.VIEWERS.items():
                if shutil.which(alt_cmd[0]):
                    logger.info(f"Usando visor alternativo: {alt_viewer}")
                    Config.SCREENSHOT_VIEWER = alt_viewer
                    return

            logger.error("No se encontró ningún visor de imágenes disponible")

    def create_screenshot_path(self, name: Optional[str] = None, suffix: str = "") -> Path:
        """Crear path para screenshot"""
        if not name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            name = f"{self.app_name}_{timestamp}{suffix}.{Config.SCREENSHOT_FORMAT}"

        return Config.SCREENSHOTS_DIR / name

    def save_screenshot_metadata(self, filepath: Path) -> ScreenshotMetadata:
        """Guardar metadata del screenshot"""
        try:
            with Image.open(filepath) as img:
                width, height = img.size

            metadata = ScreenshotMetadata(
                filepath=filepath,
                timestamp=datetime.now().isoformat(),
                app_name=self.app_name,
                session_id=self.session_id,
                width=width,
                height=height,
                size_kb=filepath.stat().st_size // 1024,
            )

            self.screenshots.append(metadata)
            return metadata

        except Exception as e:
            logger.error(f"Error guardando metadata: {str(e)}")
            return None

    def open_screenshot(self, filepath: Path, background: bool = True) -> bool:
        """
        Abrir screenshot con visor de Ubuntu

        Args:
            filepath: Path al screenshot
            background: Abrir en background (no bloquea)

        Returns:
            True si se abrió correctamente
        """
        if not Config.AUTO_OPEN_SCREENSHOTS:
            return False

        if not filepath.exists():
            logger.error(f"Screenshot no encontrado: {filepath}")
            return False

        viewer = Config.SCREENSHOT_VIEWER
        cmd = self.VIEWERS.get(viewer, self.VIEWERS["eog"])

        try:
            if background:
                # Abrir en background sin bloquear
                subprocess.Popen(
                    cmd + [str(filepath)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
            else:
                # Abrir y esperar
                subprocess.run(cmd + [str(filepath)], check=True)

            logger.success(f"Screenshot abierto con {viewer}: {filepath.name}")
            return True

        except subprocess.CalledProcessError as e:
            logger.error(f"Error abriendo screenshot: {e}")
            return False
        except FileNotFoundError:
            logger.error(f"Visor '{viewer}' no encontrado")
            return False

    def annotate_screenshot(
        self,
        filepath: Path,
        annotations: List[str],
        output_path: Optional[Path] = None
    ) -> Optional[Path]:
        """
        Agregar anotaciones a un screenshot

        Args:
            filepath: Screenshot original
            annotations: Lista de textos a agregar
            output_path: Path de salida (opcional)

        Returns:
            Path del screenshot anotado
        """
        if not filepath.exists():
            logger.error(f"Screenshot no encontrado: {filepath}")
            return None

        try:
            with Image.open(filepath) as img:
                # Convertir a RGB si es necesario
                if img.mode != "RGB":
                    img = img.convert("RGB")

                draw = ImageDraw.Draw(img)

                # Intentar cargar fuente, usar default si falla
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
                except:
                    font = ImageFont.load_default()

                # Dibujar cada anotación
                y_offset = 10
                for annotation in annotations:
                    # Fondo semi-transparente
                    bbox = draw.textbbox((10, y_offset), annotation, font=font)
                    draw.rectangle(
                        [(bbox[0]-5, bbox[1]-5), (bbox[2]+5, bbox[3]+5)],
                        fill=(0, 0, 0, 180)
                    )
                    # Texto en blanco
                    draw.text((10, y_offset), annotation, fill=(255, 255, 255), font=font)
                    y_offset += 30

                # Guardar screenshot anotado
                if not output_path:
                    output_path = self.create_screenshot_path(
                        filepath.stem,
                        suffix="_annotated"
                    )

                img.save(output_path)
                logger.success(f"Screenshot anotado guardado: {output_path}")
                return output_path

        except Exception as e:
            logger.error(f"Error anotando screenshot: {str(e)}")
            return None

    def compare_screenshots(
        self,
        img1_path: Path,
        img2_path: Path,
        output_path: Optional[Path] = None
    ) -> Optional[Path]:
        """
        Crear comparación visual entre dos screenshots (side-by-side)

        Args:
            img1_path: Primer screenshot
            img2_path: Segundo screenshot
            output_path: Path de salida

        Returns:
            Path de la imagen comparativa
        """
        if not img1_path.exists() or not img2_path.exists():
            logger.error("Uno o ambos screenshots no encontrados")
            return None

        try:
            with Image.open(img1_path) as img1, Image.open(img2_path) as img2:
                # Redimensionar a la misma altura si es necesario
                if img1.height != img2.height:
                    target_height = max(img1.height, img2.height)
                    img1 = img1.resize((int(img1.width * target_height / img1.height), target_height))
                    img2 = img2.resize((int(img2.width * target_height / img2.height), target_height))

                # Crear imagen combinada
                total_width = img1.width + img2.width
                combined = Image.new("RGB", (total_width, img1.height))
                combined.paste(img1, (0, 0))
                combined.paste(img2, (img1.width, 0))

                # Guardar
                if not output_path:
                    output_path = self.create_screenshot_path(suffix="_comparison")

                combined.save(output_path)
                logger.success(f"Comparación guardada: {output_path}")
                return output_path

        except Exception as e:
            logger.error(f"Error comparando screenshots: {str(e)}")
            return None

    def get_all_screenshots(self) -> List[ScreenshotMetadata]:
        """Obtener todos los screenshots de la sesión"""
        return self.screenshots

    def get_latest_screenshot(self) -> Optional[ScreenshotMetadata]:
        """Obtener el screenshot más reciente"""
        return self.screenshots[-1] if self.screenshots else None

    def cleanup_old_screenshots(self, days: int = None):
        """Limpiar screenshots antiguos"""
        days = days or Config.SESSION_RETENTION_DAYS
        cutoff = datetime.now().timestamp() - (days * 24 * 60 * 60)

        cleaned = 0
        for screenshot_file in Config.SCREENSHOTS_DIR.glob("*.png"):
            if screenshot_file.stat().st_mtime < cutoff:
                screenshot_file.unlink()
                cleaned += 1

        if cleaned > 0:
            logger.info(f"Limpiados {cleaned} screenshots antiguos")

    def print_summary(self):
        """Imprimir resumen de screenshots"""
        if not self.screenshots:
            logger.info("No hay screenshots capturados")
            return

        logger.section("📸 Screenshots Capturados")

        table = logger.print_table(
            title=f"Session {self.session_id[:8]}",
            show_header=True,
            header_style="bold cyan"
        )
        table.add_column("Filename", style="cyan")
        table.add_column("Tamaño", style="green")
        table.add_column("Dimensiones", style="yellow")

        for screenshot in self.screenshots:
            table.add_row(
                screenshot.filepath.name,
                f"{screenshot.size_kb} KB",
                f"{screenshot.width}x{screenshot.height}"
            )

        logger.console.print(table)
