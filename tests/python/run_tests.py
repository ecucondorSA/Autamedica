#!/usr/bin/env python3
"""
Script principal para ejecutar tests de Playwright para AutaMedica
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def check_services():
    """Verificar que los servicios de AutaMedica estén disponibles"""
    import requests
    
    services = {
        "Auth Service": "http://localhost:3000",
        "Doctors App": "http://localhost:3001",
        "Patients App": "http://localhost:3003",
        "Signaling Server": "http://localhost:8888"
    }
    
    print("🔍 Verificando servicios de AutaMedica...")
    all_available = True
    
    for name, url in services.items():
        try:
            response = requests.get(url, timeout=5)
            if response.status_code < 400:
                print(f"✅ {name} - Disponible")
            else:
                print(f"⚠️ {name} - Respondiendo con error {response.status_code}")
                all_available = False
        except:
            print(f"❌ {name} - No disponible")
            all_available = False
    
    return all_available

def install_dependencies():
    """Instalar dependencias de Python y Playwright"""
    print("📦 Instalando dependencias...")
    
    # Instalar dependencias de Python
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
    
    # Instalar navegadores de Playwright
    subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
    
    print("✅ Dependencias instaladas correctamente")

def run_tests(test_type="all", headless=True, verbose=False, generate_report=True):
    """Ejecutar tests de Playwright"""
    
    # Cambiar al directorio de tests
    os.chdir(Path(__file__).parent)
    
    # Construir comando pytest
    cmd = ["pytest", "-v"]
    
    if headless:
        cmd.append("--headless")
    
    if verbose:
        cmd.append("-s")
    
    if generate_report:
        cmd.extend([
            "--html=test-results/report.html",
            "--self-contained-html",
            "--junitxml=test-results/junit.xml"
        ])
    
    # Seleccionar tests específicos
    if test_type == "auth":
        cmd.append("test_e2e_autamedica_auth.py")
    elif test_type == "visual":
        cmd.append("test_visual_regression.py")
    elif test_type == "accessibility":
        cmd.append("test_accessibility.py")
    elif test_type == "performance":
        cmd.append("test_performance.py")
    elif test_type == "network":
        cmd.append("test_network_mocking.py")
    elif test_type == "all":
        cmd.append(".")
    else:
        print(f"❌ Tipo de test no válido: {test_type}")
        return False
    
    print(f"🧪 Ejecutando tests: {test_type}")
    print(f"📝 Comando: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True)
        print("✅ Tests ejecutados exitosamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests fallaron con código {e.returncode}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Ejecutar tests de Playwright para AutaMedica")
    parser.add_argument("--type", "-t", 
                       choices=["all", "auth", "visual", "accessibility", "performance", "network"],
                       default="all",
                       help="Tipo de tests a ejecutar")
    parser.add_argument("--no-headless", action="store_true",
                       help="Ejecutar en modo visual (no headless)")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Modo verbose")
    parser.add_argument("--no-report", action="store_true",
                       help="No generar reportes HTML")
    parser.add_argument("--check-services", action="store_true",
                       help="Solo verificar servicios, no ejecutar tests")
    parser.add_argument("--install", action="store_true",
                       help="Solo instalar dependencias")
    
    args = parser.parse_args()
    
    print("🧠 AutaMedica Playwright Test Runner")
    print("=" * 50)
    
    # Solo verificar servicios
    if args.check_services:
        check_services()
        return
    
    # Solo instalar dependencias
    if args.install:
        install_dependencies()
        return
    
    # Verificar servicios
    if not check_services():
        print("⚠️ Algunos servicios no están disponibles. Los tests pueden fallar.")
        response = input("¿Continuar de todos modos? (y/N): ")
        if response.lower() != 'y':
            print("❌ Ejecución cancelada")
            return
    
    # Instalar dependencias si es necesario
    if not Path("requirements.txt").exists():
        print("❌ Archivo requirements.txt no encontrado")
        return
    
    try:
        install_dependencies()
    except subprocess.CalledProcessError:
        print("❌ Error instalando dependencias")
        return
    
    # Ejecutar tests
    success = run_tests(
        test_type=args.type,
        headless=not args.no_headless,
        verbose=args.verbose,
        generate_report=not args.no_report
    )
    
    if success:
        print("\n🎉 ¡Tests completados exitosamente!")
        if not args.no_report:
            print("📊 Reportes generados en test-results/")
    else:
        print("\n💥 Tests fallaron")
        sys.exit(1)

if __name__ == "__main__":
    main()