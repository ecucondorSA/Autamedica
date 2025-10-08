#!/usr/bin/env -S deno run --allow-read --allow-net --allow-write

/**
 * 🔐 AutaMedica Authentication Security Auditor
 *
 * Audita el sistema de autenticación de AutaMedica basado en Supabase
 * Analiza configuración, código, y comportamiento en runtime
 */

import { basename, join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.208.0/fs/walk.ts";
import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";

// =====================================================================
// TIPOS Y INTERFACES
// =====================================================================

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
type Category = "AUTH" | "CONFIG" | "CODE" | "PERMISSION" | "RUNTIME";

interface SecurityIssue {
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  location: string;
  recommendation: string;
  codeSnippet?: string;
}

interface AuditReport {
  timestamp: string;
  projectPath: string;
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  issues: SecurityIssue[];
  summary: {
    byCategory: Record<Category, number>;
    bySeverity: Record<Severity, number>;
  };
}

// =====================================================================
// CONFIGURACIÓN
// =====================================================================

const CONFIG = {
  projectRoot: "/home/edu/Autamedica",
  appsDir: "/home/edu/Autamedica/apps",
  packagesDir: "/home/edu/Autamedica/packages",
  authPackage: "/home/edu/Autamedica/packages/auth",
  apps: {
    "web-app": "http://localhost:3000",
    "doctors": "http://localhost:3001",
    "patients": "http://localhost:3002",
    "companies": "http://localhost:3003",
  },
};

// =====================================================================
// AUDITOR PRINCIPAL
// =====================================================================

class AuthSecurityAuditor {
  private issues: SecurityIssue[] = [];

  constructor(private verbose = false) {}

  // =================================================================
  // AUDITORÍA DE CÓDIGO FUENTE
  // =================================================================

  async auditSourceCode(): Promise<void> {
    console.log("\n🔍 Auditando código fuente...\n");

    await this.auditAuthPackage();
    await this.auditEnvFiles();
    await this.auditAppsImplementation();
  }

  private async auditAuthPackage(): Promise<void> {
    console.log("📦 Auditando @autamedica/auth package...");

    const authDir = CONFIG.authPackage;

    try {
      const dirInfo = await Deno.stat(authDir);
      if (!dirInfo.isDirectory) {
        this.addIssue({
          severity: "CRITICAL",
          category: "CONFIG",
          title: "Auth package no encontrado",
          description: `El directorio ${authDir} no existe o no es accesible`,
          location: authDir,
          recommendation: "Verificar que el package @autamedica/auth esté correctamente configurado",
        });
        return;
      }
    } catch (error) {
      this.addIssue({
        severity: "CRITICAL",
        category: "CONFIG",
        title: "Auth package inaccesible",
        description: `Error al acceder a ${authDir}: ${error.message}`,
        location: authDir,
        recommendation: "Verificar permisos y estructura del proyecto",
      });
      return;
    }

    // Auditar archivos TypeScript en auth package
    for await (const entry of walk(authDir, { exts: [".ts", ".tsx"] })) {
      if (entry.isFile) {
        await this.auditAuthFile(entry.path);
      }
    }
  }

  private async auditAuthFile(filePath: string): Promise<void> {
    const content = await Deno.readTextFile(filePath);
    const fileName = basename(filePath);

    // 1. Verificar configuración de Supabase
    if (fileName.includes("config")) {
      this.auditSupabaseConfig(content, filePath);
    }

    // 2. Verificar gestión de sesiones
    if (fileName.includes("session")) {
      this.auditSessionManagement(content, filePath);
    }

    // 3. Verificar sistema de roles
    if (fileName.includes("role")) {
      this.auditRoleSystem(content, filePath);
    }

    // 4. Verificar middleware
    if (fileName.includes("middleware")) {
      this.auditMiddleware(content, filePath);
    }

    // 5. Patrones de seguridad generales
    this.auditSecurityPatterns(content, filePath);
  }

  private auditSupabaseConfig(content: string, location: string): void {
    // Verificar acceso directo a process.env sin validación
    if (content.includes("process.env") && !content.includes("ensureEnv")) {
      const lines = content.split("\n");
      const lineNumber = lines.findIndex(line =>
        line.includes("process.env") && !line.includes("ensureEnv")
      );

      this.addIssue({
        severity: "MEDIUM",
        category: "CODE",
        title: "Acceso directo a process.env sin validación",
        description: "Variables de entorno accedidas sin validación en config",
        location: `${location}:${lineNumber + 1}`,
        recommendation: "Usar ensureEnv() o getEnvOrDefault() para validar variables",
        codeSnippet: lines[lineNumber]?.trim(),
      });
    }

    // Verificar URLs hardcodeadas
    const urlPattern = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const urls = content.match(urlPattern);
    if (urls && urls.length > 0) {
      this.addIssue({
        severity: "LOW",
        category: "CONFIG",
        title: "URLs hardcodeadas en código",
        description: `Encontradas ${urls.length} URLs hardcodeadas`,
        location: location,
        recommendation: "Mover URLs a variables de entorno",
      });
    }
  }

  private auditSessionManagement(content: string, location: string): void {
    // Verificar configuración de expiración
    if (!content.includes("maxAge") && !content.includes("expires")) {
      this.addIssue({
        severity: "HIGH",
        category: "AUTH",
        title: "No se detectó configuración de expiración de sesión",
        description: "Las sesiones podrían no expirar correctamente",
        location: location,
        recommendation: "Configurar maxAge o expires para sesiones (ej: 24h)",
      });
    }

    // Verificar configuración de cookies seguras
    if (content.includes("cookie")) {
      const hasSecure = content.includes("secure: true");
      const hasHttpOnly = content.includes("httpOnly: true");
      const hasSameSite = content.includes("sameSite");

      if (!hasSecure || !hasHttpOnly || !hasSameSite) {
        const missing = [];
        if (!hasSecure) missing.push("secure: true");
        if (!hasHttpOnly) missing.push("httpOnly: true");
        if (!hasSameSite) missing.push("sameSite");

        this.addIssue({
          severity: "HIGH",
          category: "AUTH",
          title: "Cookies sin configuración de seguridad completa",
          description: `Faltan flags de seguridad: ${missing.join(", ")}`,
          location: location,
          recommendation: "Configurar cookies con: secure: true, httpOnly: true, sameSite: 'lax'",
        });
      }
    }
  }

  private auditRoleSystem(content: string, location: string): void {
    // Verificar definición de roles médicos
    const hasPatientRole = /patient/i.test(content);
    const hasDoctorRole = /doctor/i.test(content);
    const hasCompanyRole = /company/i.test(content);

    if (!hasPatientRole || !hasDoctorRole || !hasCompanyRole) {
      const missing = [];
      if (!hasPatientRole) missing.push("patient");
      if (!hasDoctorRole) missing.push("doctor");
      if (!hasCompanyRole) missing.push("company");

      this.addIssue({
        severity: "MEDIUM",
        category: "AUTH",
        title: "Roles médicos incompletos",
        description: `Roles no encontrados: ${missing.join(", ")}`,
        location: location,
        recommendation: "Definir todos los roles necesarios para AutaMedica",
      });
    }

    // Verificar validación de roles
    const hasValidation = /validate|check|require|ensure/i.test(content);
    if (content.includes("role") && !hasValidation) {
      this.addIssue({
        severity: "MEDIUM",
        category: "AUTH",
        title: "Posible falta de validación de roles",
        description: "No se detecta validación explícita de roles",
        location: location,
        recommendation: "Implementar validación de roles antes de operaciones críticas",
      });
    }
  }

  private auditMiddleware(content: string, location: string): void {
    // Verificar redirección en fallo de auth
    if (!content.includes("redirect")) {
      this.addIssue({
        severity: "MEDIUM",
        category: "AUTH",
        title: "Middleware sin redirección en fallo de auth",
        description: "No se detecta redirección cuando la autenticación falla",
        location: location,
        recommendation: "Redirigir a /auth/login cuando la autenticación falle",
      });
    }

    // Verificar configuración de rutas públicas
    const hasPublicRoutes = /public|unprotected|allow/i.test(content);
    if (!hasPublicRoutes) {
      this.addIssue({
        severity: "LOW",
        category: "AUTH",
        title: "No se detectan rutas públicas explícitas",
        description: "El middleware no define rutas públicas claramente",
        location: location,
        recommendation: "Definir explícitamente qué rutas son públicas vs protegidas",
      });
    }
  }

  private auditSecurityPatterns(content: string, location: string): void {
    // Detectar console.log con información sensible
    const consoleLogPattern = /console\.(log|info|debug)\([^)]*(?:password|token|secret|key)[^)]*\)/gi;
    if (consoleLogPattern.test(content)) {
      this.addIssue({
        severity: "HIGH",
        category: "CODE",
        title: "Posible logging de información sensible",
        description: "Se detectó console.log con palabras clave sensibles",
        location: location,
        recommendation: "Nunca loguear passwords, tokens o secrets. Usar logger apropiado.",
      });
    }

    // Detectar uso de eval() o Function()
    if (/\beval\(|new Function\(/.test(content)) {
      this.addIssue({
        severity: "CRITICAL",
        category: "CODE",
        title: "Uso de eval() o Function() detectado",
        description: "Código dinámico puede ser un vector de ataque",
        location: location,
        recommendation: "Evitar eval() y new Function(). Usar alternativas seguras.",
      });
    }
  }

  private async auditEnvFiles(): Promise<void> {
    console.log("\n🔐 Auditando archivos de configuración...");

    const envFiles = [];
    for await (const entry of Deno.readDir(CONFIG.projectRoot)) {
      if (entry.isFile && entry.name.startsWith(".env")) {
        envFiles.push(entry.name);
      }
    }

    for (const envFile of envFiles) {
      // Skip examples y templates
      if (envFile.includes("example") || envFile.includes("template")) {
        continue;
      }

      const filePath = join(CONFIG.projectRoot, envFile);
      await this.auditEnvFile(filePath);
    }
  }

  private async auditEnvFile(filePath: string): Promise<void> {
    try {
      const content = await Deno.readTextFile(filePath);
      const fileName = basename(filePath);

      // Verificar secrets expuestos
      if (content.includes("SERVICE_ROLE_KEY") && content.length > 200) {
        // Probablemente tiene un secret real
        this.addIssue({
          severity: "CRITICAL",
          category: "CONFIG",
          title: `Service Role Key en ${fileName}`,
          description: "Archivo .env contiene SERVICE_ROLE_KEY",
          location: filePath,
          recommendation: "NUNCA commitear .env con secrets. Usar .env.example",
        });
      }

      // Verificar NEXT_PUBLIC_ con secrets
      const publicSecretsPattern = /NEXT_PUBLIC_.*(?:SECRET|KEY|TOKEN|PASSWORD)=/gi;
      const publicSecrets = content.match(publicSecretsPattern);
      if (publicSecrets) {
        this.addIssue({
          severity: "HIGH",
          category: "CONFIG",
          title: "Secrets marcados como públicos",
          description: `${publicSecrets.length} variables sensibles con NEXT_PUBLIC_`,
          location: filePath,
          recommendation: "No usar NEXT_PUBLIC_ para secrets (se exponen al cliente)",
        });
      }

    } catch (error) {
      if (this.verbose) {
        console.log(`  ⚠️  Error leyendo ${filePath}: ${error.message}`);
      }
    }
  }

  private async auditAppsImplementation(): Promise<void> {
    console.log("\n📱 Auditando implementación en apps...");

    const apps = ["web-app", "doctors", "patients", "companies"];

    for (const appName of apps) {
      const appDir = join(CONFIG.appsDir, appName);

      try {
        await Deno.stat(appDir);
        await this.auditApp(appName, appDir);
      } catch {
        if (this.verbose) {
          console.log(`  ⚠️  App ${appName} no encontrada`);
        }
      }
    }
  }

  private async auditApp(appName: string, appDir: string): Promise<void> {
    console.log(`  📂 Auditando ${appName}...`);

    // Verificar middleware.ts
    const middlewarePath = join(appDir, "src", "middleware.ts");
    try {
      const content = await Deno.readTextFile(middlewarePath);

      if (!content.includes("matcher") && !content.includes("config")) {
        this.addIssue({
          severity: "MEDIUM",
          category: "AUTH",
          title: `Middleware sin configuración de rutas (${appName})`,
          description: "El middleware no define qué rutas proteger",
          location: middlewarePath,
          recommendation: "Configurar matcher o config para rutas protegidas",
        });
      }
    } catch {
      this.addIssue({
        severity: "HIGH",
        category: "AUTH",
        title: `App sin middleware (${appName})`,
        description: `No se encontró middleware.ts en ${appName}`,
        location: join(appDir, "src"),
        recommendation: "Crear middleware.ts para proteger rutas",
      });
    }

    // Verificar layout.tsx
    const layoutPath = join(appDir, "src", "app", "layout.tsx");
    try {
      const content = await Deno.readTextFile(layoutPath);

      if (!content.includes("getSession") && !content.includes("requireSession")) {
        this.addIssue({
          severity: "MEDIUM",
          category: "AUTH",
          title: `Layout sin verificación de sesión (${appName})`,
          description: "El layout raíz no verifica la sesión",
          location: layoutPath,
          recommendation: "Usar getSession() o requireSession() en layout.tsx",
        });
      }
    } catch {
      // Layout no encontrado - no es crítico
    }
  }

  // =================================================================
  // AUDITORÍA DE RUNTIME (HTTP)
  // =================================================================

  async auditRuntime(): Promise<void> {
    console.log("\n🌐 Auditando comportamiento en runtime...\n");

    for (const [appName, url] of Object.entries(CONFIG.apps)) {
      await this.auditAppRuntime(appName, url);
    }
  }

  private async auditAppRuntime(appName: string, url: string): Promise<void> {
    console.log(`🔗 Testeando ${appName} (${url})...`);

    try {
      const response = await fetch(url, {
        redirect: "manual", // No seguir redirects automáticamente
      });

      const finalUrl = response.url || url;

      // Verificar headers de seguridad
      this.auditSecurityHeaders(response, appName, url);

      // Verificar redirección a login
      if (appName !== "web-app") {
        if (response.status === 200 && !finalUrl.includes("/auth/login")) {
          this.addIssue({
            severity: "HIGH",
            category: "RUNTIME",
            title: `App ${appName} accesible sin autenticación`,
            description: `${url} respondió 200 sin redirigir a /auth/login`,
            location: url,
            recommendation: "Configurar middleware para redirigir usuarios no autenticados",
          });
        }
      }

    } catch (error) {
      this.addIssue({
        severity: "INFO",
        category: "RUNTIME",
        title: `No se pudo conectar a ${appName}`,
        description: `Error: ${error.message}`,
        location: url,
        recommendation: "Verificar que el servidor esté corriendo",
      });
    }
  }

  private auditSecurityHeaders(response: Response, appName: string, url: string): void {
    const headers = response.headers;

    // Headers de seguridad recomendados
    const requiredHeaders = {
      "x-frame-options": "SAMEORIGIN o DENY",
      "x-content-type-options": "nosniff",
      "strict-transport-security": "max-age=31536000",
    };

    for (const [header, recommended] of Object.entries(requiredHeaders)) {
      if (!headers.has(header)) {
        this.addIssue({
          severity: "MEDIUM",
          category: "RUNTIME",
          title: `Header de seguridad faltante (${appName})`,
          description: `Falta header ${header}`,
          location: url,
          recommendation: `Agregar header: ${header}: ${recommended}`,
        });
      }
    }
  }

  // =================================================================
  // UTILIDADES
  // =================================================================

  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  getIssues(): SecurityIssue[] {
    return this.issues;
  }

  // =================================================================
  // GENERACIÓN DE REPORTE
  // =================================================================

  generateReport(): AuditReport {
    const critical = this.issues.filter(i => i.severity === "CRITICAL").length;
    const high = this.issues.filter(i => i.severity === "HIGH").length;
    const medium = this.issues.filter(i => i.severity === "MEDIUM").length;
    const low = this.issues.filter(i => i.severity === "LOW").length;
    const info = this.issues.filter(i => i.severity === "INFO").length;

    const byCategory: Record<Category, number> = {
      AUTH: 0,
      CONFIG: 0,
      CODE: 0,
      PERMISSION: 0,
      RUNTIME: 0,
    };

    const bySeverity: Record<Severity, number> = {
      CRITICAL: critical,
      HIGH: high,
      MEDIUM: medium,
      LOW: low,
      INFO: info,
    };

    for (const issue of this.issues) {
      byCategory[issue.category]++;
    }

    return {
      timestamp: new Date().toISOString(),
      projectPath: CONFIG.projectRoot,
      totalIssues: this.issues.length,
      critical,
      high,
      medium,
      low,
      info,
      issues: this.issues,
      summary: {
        byCategory,
        bySeverity,
      },
    };
  }
}

// =====================================================================
// GENERADOR DE REPORTES
// =====================================================================

class ReportGenerator {
  static printConsoleReport(report: AuditReport): void {
    console.log("\n" + "=".repeat(70));
    console.log("📊 REPORTE DE AUDITORÍA DE AUTENTICACIÓN - AUTAMEDICA");
    console.log("=".repeat(70));
    console.log(`🕐 Timestamp: ${report.timestamp}`);
    console.log(`📁 Proyecto: ${report.projectPath}`);
    console.log(`📋 Total issues: ${report.totalIssues}`);
    console.log(`🔴 Críticos: ${report.critical}`);
    console.log(`🟠 Altos: ${report.high}`);
    console.log(`🟡 Medios: ${report.medium}`);
    console.log(`🟢 Bajos: ${report.low}`);
    console.log(`ℹ️  Info: ${report.info}`);

    console.log("\n📈 Por Categoría:");
    for (const [category, count] of Object.entries(report.summary.byCategory)) {
      if (count > 0) {
        console.log(`   ${category}: ${count}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("🔍 ISSUES DETALLADOS");
    console.log("=".repeat(70));

    // Ordenar por severidad
    const severityOrder: Record<Severity, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
      INFO: 4,
    };

    const sorted = [...report.issues].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    for (let i = 0; i < sorted.length; i++) {
      const issue = sorted[i];
      const emoji = {
        CRITICAL: "🔴",
        HIGH: "🟠",
        MEDIUM: "🟡",
        LOW: "🟢",
        INFO: "ℹ️ ",
      }[issue.severity];

      console.log(`\n${i + 1}. ${emoji} [${issue.severity}] ${issue.title}`);
      console.log(`   Categoría: ${issue.category}`);
      console.log(`   📝 ${issue.description}`);
      console.log(`   📍 ${issue.location}`);
      console.log(`   ✅ ${issue.recommendation}`);

      if (issue.codeSnippet) {
        console.log(`   💻 ${issue.codeSnippet}`);
      }
    }

    console.log("\n" + "=".repeat(70));
    if (report.critical > 0) {
      console.log("🚨 ACCIÓN REQUERIDA: Issues críticos encontrados");
    } else if (report.high > 0) {
      console.log("⚠️  ATENCIÓN: Issues de alta severidad encontrados");
    } else if (report.totalIssues > 0) {
      console.log("ℹ️  Mejoras recomendadas encontradas");
    } else {
      console.log("✅ No se encontraron problemas de seguridad");
    }
  }

  static async saveJsonReport(report: AuditReport, filePath: string): Promise<void> {
    const json = JSON.stringify(report, null, 2);
    await Deno.writeTextFile(filePath, json);
    console.log(`\n💾 Reporte JSON guardado en: ${filePath}`);
  }
}

// =====================================================================
// MAIN
// =====================================================================

async function main() {
  const args = parse(Deno.args, {
    boolean: ["verbose", "help", "json-only"],
    string: ["output"],
    default: {
      verbose: false,
      "json-only": false,
      output: "",
    },
  });

  if (args.help) {
    console.log(`
🔐 AutaMedica Authentication Security Auditor

Uso:
  deno run --allow-read --allow-net --allow-write auth-auditor.ts [opciones]

Opciones:
  --verbose      Mostrar información detallada
  --json-only    Solo generar reporte JSON (sin output consola)
  --output PATH  Guardar reporte JSON en PATH
  --help         Mostrar esta ayuda

Ejemplos:
  # Auditoría básica
  deno run --allow-read --allow-net --allow-write auth-auditor.ts

  # Con output JSON
  deno run --allow-read --allow-net --allow-write auth-auditor.ts --output report.json

  # Verbose mode
  deno run --allow-read --allow-net --allow-write auth-auditor.ts --verbose
`);
    Deno.exit(0);
  }

  console.log("🔐 AUDITOR DE AUTENTICACIÓN - AUTAMEDICA");
  console.log("=".repeat(70));

  const auditor = new AuthSecurityAuditor(args.verbose);

  // Ejecutar auditorías
  await auditor.auditSourceCode();
  await auditor.auditRuntime();

  // Generar reporte
  const report = auditor.generateReport();

  // Mostrar en consola (a menos que sea json-only)
  if (!args["json-only"]) {
    ReportGenerator.printConsoleReport(report);
  }

  // Guardar JSON si se especificó output
  if (args.output) {
    await ReportGenerator.saveJsonReport(report, args.output as string);
  } else {
    // Guardar con timestamp por defecto
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const defaultPath = `autamedica-auth-audit-${timestamp}.json`;
    await ReportGenerator.saveJsonReport(report, defaultPath);
  }

  // Exit code basado en severidad
  if (report.critical > 0) {
    Deno.exit(2); // Critical issues
  } else if (report.high > 0) {
    Deno.exit(1); // High issues
  } else {
    Deno.exit(0); // Success
  }
}

// Ejecutar
if (import.meta.main) {
  main();
}
