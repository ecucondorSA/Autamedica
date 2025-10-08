"""
DataAnalyzer: Análisis profundo de datos de debugging
"""
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from collections import Counter, defaultdict
import re

from ..debugger.session import DebugSessionData, ConsoleLog, NetworkRequest, JavaScriptError
from ..utils.config import Config
from ..utils.logger import logger


@dataclass
class AnalysisResult:
    """Resultado del análisis"""
    session_id: str
    app_name: str
    severity: str  # low, medium, high, critical
    issues_found: int
    patterns_detected: List[str] = field(default_factory=list)
    console_analysis: Dict[str, Any] = field(default_factory=dict)
    network_analysis: Dict[str, Any] = field(default_factory=dict)
    error_analysis: Dict[str, Any] = field(default_factory=dict)
    performance_issues: List[str] = field(default_factory=list)
    security_concerns: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    auto_fix_suggestions: List[Dict[str, str]] = field(default_factory=list)

    def to_dict(self) -> Dict:
        """Convertir a diccionario"""
        return {
            "session_id": self.session_id,
            "app_name": self.app_name,
            "severity": self.severity,
            "issues_found": self.issues_found,
            "patterns_detected": self.patterns_detected,
            "console_analysis": self.console_analysis,
            "network_analysis": self.network_analysis,
            "error_analysis": self.error_analysis,
            "performance_issues": self.performance_issues,
            "security_concerns": self.security_concerns,
            "recommendations": self.recommendations,
            "auto_fix_suggestions": self.auto_fix_suggestions,
        }


class DataAnalyzer:
    """
    Motor de análisis profundo de datos de debugging
    - Detección de patterns
    - Análisis de performance
    - Detección de security issues
    - Generación de recommendations
    """

    # Patterns comunes de errores
    ERROR_PATTERNS = {
        "cors": r"(CORS|Cross-Origin|Access-Control)",
        "auth": r"(401|403|Unauthorized|Forbidden|authentication|authorization)",
        "network": r"(Failed to fetch|NetworkError|net::ERR|timeout)",
        "react": r"(React|ReactDOM|useState|useEffect|Component)",
        "next": r"(Next\.js|getServerSideProps|getStaticProps)",
        "supabase": r"(Supabase|PostgrestError|AuthError)",
        "typescript": r"(TypeError|ReferenceError|undefined|null)",
    }

    # Security red flags
    SECURITY_PATTERNS = {
        "credentials_in_url": r"(password|token|secret|key)=[^&\s]+",
        "sql_injection": r"(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\s+",
        "xss": r"(<script|javascript:|onerror=|onload=)",
        "sensitive_data": r"(api_key|access_token|secret_key|private_key)",
    }

    # Performance thresholds
    PERF_THRESHOLDS = {
        "slow_request": 3000,  # ms
        "large_response": 1000000,  # bytes (1MB)
        "many_requests": 100,
        "high_error_rate": 0.1,  # 10%
    }

    def __init__(self, session_data: DebugSessionData):
        self.data = session_data
        self.result = AnalysisResult(
            session_id=session_data.session_id,
            app_name=session_data.app_name,
            severity="low",
            issues_found=0,
        )

    @classmethod
    def from_file(cls, session_file: Path) -> "DataAnalyzer":
        """Crear analyzer desde archivo de sesión"""
        with open(session_file, "r", encoding="utf-8") as f:
            data_dict = json.load(f)

        # Reconstruir DebugSessionData
        from ..debugger.session import ConsoleLog, NetworkRequest, JavaScriptError, PerformanceMetrics

        session_data = DebugSessionData(
            session_id=data_dict["session_id"],
            app_name=data_dict["app_name"],
            url=data_dict["url"],
            started_at=data_dict["started_at"],
            ended_at=data_dict.get("ended_at"),
            console_logs=[ConsoleLog(**log) for log in data_dict.get("console_logs", [])],
            network_requests=[NetworkRequest(**req) for req in data_dict.get("network_requests", [])],
            javascript_errors=[JavaScriptError(**err) for err in data_dict.get("javascript_errors", [])],
            performance_metrics=PerformanceMetrics(**data_dict["performance_metrics"]) if data_dict.get("performance_metrics") else None,
            screenshots=data_dict.get("screenshots", []),
            metadata=data_dict.get("metadata", {}),
        )

        return cls(session_data)

    def analyze(self, depth: str = None) -> AnalysisResult:
        """
        Ejecutar análisis completo

        Args:
            depth: 'quick', 'standard', 'deep' (default from config)
        """
        depth = depth or Config.ANALYSIS_DEPTH

        logger.section(f"🔬 Analizando Session: {self.data.session_id[:8]}")
        logger.info(f"Profundidad: {depth}")

        # Análisis básico (siempre)
        self._analyze_console_logs()
        self._analyze_network_requests()
        self._analyze_javascript_errors()

        # Análisis estándar
        if depth in ["standard", "deep"]:
            self._detect_patterns()
            self._analyze_performance()

        # Análisis profundo
        if depth == "deep":
            self._detect_security_concerns()
            self._generate_recommendations()
            if Config.AUTO_FIX_SUGGESTIONS:
                self._generate_auto_fix_suggestions()

        # Calcular severity
        self._calculate_severity()

        logger.success(f"Análisis completado: {self.result.issues_found} issues encontrados")
        return self.result

    def _analyze_console_logs(self):
        """Analizar console logs"""
        logs = self.data.console_logs

        # Contar por tipo
        type_counts = Counter(log.type for log in logs)

        # Detectar logs sospechosos
        warnings = [log for log in logs if log.type == "warning"]
        errors = [log for log in logs if log.type == "error"]

        self.result.console_analysis = {
            "total_logs": len(logs),
            "by_type": dict(type_counts),
            "warnings_count": len(warnings),
            "errors_count": len(errors),
            "error_messages": [err.text for err in errors[:10]],  # Primeros 10
        }

        self.result.issues_found += len(errors)

        logger.info(f"Console: {len(logs)} logs ({len(errors)} errors, {len(warnings)} warnings)")

    def _analyze_network_requests(self):
        """Analizar network requests"""
        requests = self.data.network_requests

        # Estadísticas básicas
        total = len(requests)
        failed = [req for req in requests if req.failure or (req.status and req.status >= 400)]
        success = [req for req in requests if req.status and 200 <= req.status < 300]

        # Requests por dominio
        domains = Counter(self._extract_domain(req.url) for req in requests)

        # Requests lentos (si hay timing)
        # slow_requests = [req for req in requests if req.timing and req.timing.get("duration", 0) > self.PERF_THRESHOLDS["slow_request"]]

        self.result.network_analysis = {
            "total_requests": total,
            "success_count": len(success),
            "failed_count": len(failed),
            "success_rate": len(success) / total if total > 0 else 0,
            "by_domain": dict(domains.most_common(10)),
            "failed_urls": [req.url for req in failed[:10]],
        }

        self.result.issues_found += len(failed)

        logger.info(f"Network: {total} requests ({len(failed)} failed)")

    def _analyze_javascript_errors(self):
        """Analizar JavaScript errors"""
        errors = self.data.javascript_errors

        # Agrupar por mensaje similar
        error_groups = defaultdict(list)
        for error in errors:
            # Extraer mensaje base (sin números, IDs, etc)
            base_message = re.sub(r'\d+', 'N', error.message)
            error_groups[base_message].append(error)

        self.result.error_analysis = {
            "total_errors": len(errors),
            "unique_errors": len(error_groups),
            "error_groups": {
                msg: len(errs) for msg, errs in error_groups.items()
            },
            "most_common": list(error_groups.keys())[:5],
        }

        self.result.issues_found += len(errors)

        logger.info(f"JS Errors: {len(errors)} total ({len(error_groups)} unique)")

    def _detect_patterns(self):
        """Detectar patterns en errores y logs"""
        if not Config.PATTERN_DETECTION:
            return

        all_text = ""

        # Combinar todo el texto
        for log in self.data.console_logs:
            all_text += f" {log.text}"
        for error in self.data.javascript_errors:
            all_text += f" {error.message}"
        for req in self.data.network_requests:
            all_text += f" {req.url}"

        # Buscar patterns
        detected = []
        for pattern_name, pattern_regex in self.ERROR_PATTERNS.items():
            if re.search(pattern_regex, all_text, re.IGNORECASE):
                detected.append(pattern_name)

        self.result.patterns_detected = detected

        if detected:
            logger.info(f"Patterns detectados: {', '.join(detected)}")

    def _analyze_performance(self):
        """Analizar performance"""
        issues = []

        # Network performance
        requests = self.data.network_requests
        if len(requests) > self.PERF_THRESHOLDS["many_requests"]:
            issues.append(f"Demasiados network requests: {len(requests)}")

        # Error rate
        failed = len([r for r in requests if r.failure or (r.status and r.status >= 400)])
        if requests and (failed / len(requests)) > self.PERF_THRESHOLDS["high_error_rate"]:
            issues.append(f"Alto rate de errores: {failed}/{len(requests)}")

        # Performance metrics
        if self.data.performance_metrics:
            metrics = self.data.performance_metrics
            if metrics.load and metrics.load > 5000:
                issues.append(f"Load time alto: {metrics.load}ms")
            if metrics.ttfb and metrics.ttfb > 1000:
                issues.append(f"TTFB alto: {metrics.ttfb}ms")

        self.result.performance_issues = issues

        if issues:
            logger.warning(f"Performance issues: {len(issues)}")

    def _detect_security_concerns(self):
        """Detectar security concerns"""
        concerns = []

        # Buscar en URLs y logs
        all_urls = [req.url for req in self.data.network_requests]
        all_logs = [log.text for log in self.data.console_logs]

        for concern_name, pattern_regex in self.SECURITY_PATTERNS.items():
            # Buscar en URLs
            for url in all_urls:
                if re.search(pattern_regex, url, re.IGNORECASE):
                    concerns.append(f"{concern_name} detectado en URL")
                    break

            # Buscar en logs
            for log_text in all_logs:
                if re.search(pattern_regex, log_text, re.IGNORECASE):
                    concerns.append(f"{concern_name} detectado en console logs")
                    break

        self.result.security_concerns = list(set(concerns))  # Unique

        if concerns:
            logger.warning(f"Security concerns: {len(concerns)}")

    def _generate_recommendations(self):
        """Generar recommendations basadas en el análisis"""
        recs = []

        # Console errors
        if self.result.console_analysis.get("errors_count", 0) > 0:
            recs.append("Resolver console errors antes de deployment")

        # Failed requests
        if self.result.network_analysis.get("failed_count", 0) > 5:
            recs.append("Investigar requests fallidos - posible problema de API")

        # Patterns específicos
        if "cors" in self.result.patterns_detected:
            recs.append("Configurar CORS headers correctamente en el servidor")
        if "auth" in self.result.patterns_detected:
            recs.append("Verificar configuración de autenticación")
        if "supabase" in self.result.patterns_detected:
            recs.append("Revisar configuración y queries de Supabase")

        # Performance
        if len(self.result.performance_issues) > 0:
            recs.append("Optimizar performance: reducir requests, mejorar caching")

        # Security
        if len(self.result.security_concerns) > 0:
            recs.append("URGENTE: Revisar security concerns detectados")

        self.result.recommendations = recs

    def _generate_auto_fix_suggestions(self):
        """Generar sugerencias de fixes automáticos"""
        suggestions = []

        # CORS issues
        if "cors" in self.result.patterns_detected:
            suggestions.append({
                "issue": "CORS Error",
                "fix": "Agregar headers CORS en el servidor",
                "code": """
// Next.js middleware o headers config
headers: [
  {
    key: 'Access-Control-Allow-Origin',
    value: process.env.NEXT_PUBLIC_APP_URL,
  },
]
                """.strip()
            })

        # Auth issues
        if "auth" in self.result.patterns_detected:
            suggestions.append({
                "issue": "Authentication Error",
                "fix": "Verificar Supabase client initialization",
                "code": """
// Verificar que NEXT_PUBLIC_SUPABASE_* esté configurado
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
                """.strip()
            })

        self.result.auto_fix_suggestions = suggestions

    def _calculate_severity(self):
        """Calcular severity general"""
        issues = self.result.issues_found
        security = len(self.result.security_concerns)
        perf = len(self.result.performance_issues)

        if security > 0:
            self.result.severity = "critical"
        elif issues > 20 or perf > 5:
            self.result.severity = "high"
        elif issues > 5 or perf > 2:
            self.result.severity = "medium"
        else:
            self.result.severity = "low"

    def _extract_domain(self, url: str) -> str:
        """Extraer dominio de URL"""
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except:
            return "unknown"

    def print_report(self):
        """Imprimir reporte del análisis"""
        result = self.result

        logger.section("📊 Reporte de Análisis")

        # Severity badge
        severity_colors = {
            "low": "green",
            "medium": "yellow",
            "high": "red",
            "critical": "bold red"
        }
        severity_color = severity_colors[result.severity]
        logger.console.print(f"\nSeverity: [{severity_color}]{result.severity.upper()}[/{severity_color}]")
        logger.console.print(f"Issues Found: [bold]{result.issues_found}[/bold]\n")

        # Console Analysis
        if result.console_analysis:
            logger.console.print("[bold cyan]Console Logs:[/bold cyan]")
            logger.print_json(result.console_analysis)
            print()

        # Network Analysis
        if result.network_analysis:
            logger.console.print("[bold cyan]Network Requests:[/bold cyan]")
            logger.print_json(result.network_analysis)
            print()

        # Patterns
        if result.patterns_detected:
            logger.console.print("[bold magenta]Patterns Detectados:[/bold magenta]")
            for pattern in result.patterns_detected:
                logger.console.print(f"  • {pattern}")
            print()

        # Performance Issues
        if result.performance_issues:
            logger.console.print("[bold yellow]⚠️  Performance Issues:[/bold yellow]")
            for issue in result.performance_issues:
                logger.console.print(f"  • {issue}")
            print()

        # Security Concerns
        if result.security_concerns:
            logger.console.print("[bold red]🔒 Security Concerns:[/bold red]")
            for concern in result.security_concerns:
                logger.console.print(f"  • {concern}")
            print()

        # Recommendations
        if result.recommendations:
            logger.console.print("[bold green]💡 Recommendations:[/bold green]")
            for i, rec in enumerate(result.recommendations, 1):
                logger.console.print(f"  {i}. {rec}")
            print()

        # Auto-fix Suggestions
        if result.auto_fix_suggestions:
            logger.console.print("[bold blue]🔧 Auto-fix Suggestions:[/bold blue]")
            for suggestion in result.auto_fix_suggestions:
                logger.console.print(f"\n[yellow]{suggestion['issue']}[/yellow]")
                logger.console.print(f"Fix: {suggestion['fix']}")
                logger.console.print(f"[dim]{suggestion['code']}[/dim]")
            print()

    def save_analysis(self, output_path: Optional[Path] = None) -> Path:
        """Guardar resultado del análisis"""
        if not output_path:
            output_path = Config.REPORTS_DIR / f"analysis_{self.result.session_id}.json"

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(self.result.to_dict(), f, indent=2, ensure_ascii=False)

        logger.success(f"Análisis guardado: {output_path}")
        return output_path
