#!/usr/bin/env python3
"""
Fix monorepo dependencies - Build packages in correct order
"""

import subprocess
import json
from pathlib import Path
from collections import defaultdict, deque


class MonorepoDependencyFixer:
    def __init__(self, base_path='/home/edu/Autamedica'):
        self.base_path = Path(base_path)
        self.packages = {}
        self.dependency_graph = defaultdict(list)

    def discover_packages(self):
        """Descubre todos los packages en el monorepo."""
        print("🔍 Descubriendo packages...")

        packages_dir = self.base_path / 'packages'
        for pkg_dir in packages_dir.iterdir():
            if pkg_dir.is_dir() and (pkg_dir / 'package.json').exists():
                with open(pkg_dir / 'package.json', 'r') as f:
                    pkg_json = json.load(f)
                    name = pkg_json.get('name')
                    if name and name.startswith('@autamedica/'):
                        self.packages[name] = {
                            'path': pkg_dir,
                            'package_json': pkg_json,
                            'dependencies': []
                        }
                        print(f"  ✓ {name}")

        print(f"\n📦 Total packages: {len(self.packages)}")

    def build_dependency_graph(self):
        """Construye el grafo de dependencias."""
        print("\n🔗 Construyendo grafo de dependencias...")

        for name, pkg_info in self.packages.items():
            deps = pkg_info['package_json'].get('dependencies', {})
            for dep_name in deps.keys():
                if dep_name.startswith('@autamedica/'):
                    self.dependency_graph[dep_name].append(name)
                    pkg_info['dependencies'].append(dep_name)
                    print(f"  {dep_name} ← {name}")

    def topological_sort(self):
        """Ordena packages por dependencias (topological sort)."""
        print("\n📊 Ordenando packages por dependencias...")

        # Calcular in-degree (número de dependencias)
        in_degree = {name: 0 for name in self.packages.keys()}
        for name, pkg_info in self.packages.items():
            for dep in pkg_info['dependencies']:
                if dep in self.packages:
                    in_degree[name] += 1

        # Queue con packages sin dependencias
        queue = deque([name for name, degree in in_degree.items() if degree == 0])
        sorted_packages = []

        while queue:
            pkg_name = queue.popleft()
            sorted_packages.append(pkg_name)

            # Reducir in-degree de packages dependientes
            for dependent in self.dependency_graph.get(pkg_name, []):
                if dependent in in_degree:
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        queue.append(dependent)

        if len(sorted_packages) != len(self.packages):
            print("⚠️  Circular dependency detected!")
            return list(self.packages.keys())

        return sorted_packages

    def build_packages(self, build_order):
        """Construye packages en el orden correcto."""
        print("\n🏗️  Construyendo packages...")
        print("="*60)

        for i, pkg_name in enumerate(build_order, 1):
            print(f"\n[{i}/{len(build_order)}] Building {pkg_name}...")

            pkg_path = self.packages[pkg_name]['path']

            # Check si tiene script build
            pkg_json = self.packages[pkg_name]['package_json']
            if 'build' not in pkg_json.get('scripts', {}):
                print(f"  ⚠️  No build script, skipping")
                continue

            try:
                result = subprocess.run(
                    ['pnpm', 'build'],
                    cwd=pkg_path,
                    capture_output=True,
                    text=True,
                    timeout=300
                )

                if result.returncode == 0:
                    print(f"  ✅ Build successful")
                else:
                    print(f"  ❌ Build failed:")
                    print(f"     {result.stderr[:200]}")

            except subprocess.TimeoutExpired:
                print(f"  ⏱️  Build timeout (>5min)")
            except Exception as e:
                print(f"  ❌ Error: {e}")

    def check_missing_builds(self):
        """Verifica packages sin dist folder."""
        print("\n🔍 Verificando builds faltantes...")

        missing = []
        for name, pkg_info in self.packages.items():
            dist_path = pkg_info['path'] / 'dist'
            if not dist_path.exists():
                missing.append(name)
                print(f"  ❌ {name} - dist/ no existe")
            else:
                print(f"  ✅ {name}")

        return missing

    def run(self):
        """Ejecuta el proceso completo."""
        print("="*60)
        print("🔧 MONOREPO DEPENDENCY FIXER")
        print("="*60)

        self.discover_packages()
        self.build_dependency_graph()
        build_order = self.topological_sort()

        print("\n📋 Orden de build:")
        for i, pkg in enumerate(build_order, 1):
            print(f"  {i}. {pkg}")

        missing_before = self.check_missing_builds()

        if missing_before:
            print(f"\n⚠️  {len(missing_before)} packages necesitan build")
            self.build_packages(build_order)

            missing_after = self.check_missing_builds()

            if missing_after:
                print(f"\n❌ {len(missing_after)} packages aún faltan:")
                for pkg in missing_after:
                    print(f"  • {pkg}")
            else:
                print("\n✅ Todos los packages buildeados correctamente!")
        else:
            print("\n✅ Todos los packages ya están buildeados!")


if __name__ == '__main__':
    fixer = MonorepoDependencyFixer()
    fixer.run()
