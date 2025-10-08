"""
Setup para Playwright Debugger Enterprise
"""
from setuptools import setup, find_packages
from pathlib import Path

# Leer README
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# Leer requirements
requirements_file = Path(__file__).parent / "requirements.txt"
requirements = []
if requirements_file.exists():
    requirements = [
        line.strip()
        for line in requirements_file.read_text().splitlines()
        if line.strip() and not line.startswith("#")
    ]

setup(
    name="playwright-debugger-autamedica",
    version="1.0.0",
    description="Sistema enterprise de debugging persistente con Playwright para Autamedica",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Autamedica Dev Team",
    author_email="dev@autamedica.com",
    url="https://github.com/autamedica/playwright-debugger",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "autamedica-monitor=src.cli:cli",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Testing",
        "Topic :: Software Development :: Debuggers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.11",
    include_package_data=True,
    zip_safe=False,
)
