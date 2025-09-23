/* eslint-env node */
module.exports = {
  options: {
    tsConfig: { fileName: "tsconfig.eslint.json" },
    doNotFollow: { path: ["node_modules", "\.next", "dist", "build"] },
    includeOnly: "^((apps|packages|scripts)/)",
    exclude: { path: ["(\\.next/|/dist/|/build/|\\.open-next/)", "\.d\.ts$"] },
    preserveSymlinks: false,
    reporterOptions: { dot: { collapsePattern: "node_modules/[^/]+" } }
  },
  forbidden: [
    // Ciclos
    { name: "no-circular", severity: "error", comment: "No se permiten ciclos", from: {}, to: { circular: true } },
    // Dependencias no resueltas
    { name: "no-unresolved", severity: "error", from: {}, to: { couldNotResolve: true } },
    // Paquetes no declarados
    { name: "no-dev-outside-tests", severity: "error", from: { pathNot: "\.test\.(ts|tsx|js)$" }, to: { dependencyTypes: ["npm-dev"] } },
    // Apps→apps prohibido
    { name: "apps-no-cross-web", severity: "error", from: { path: "^apps/web-app/" }, to: { path: "^apps/[^/]+", pathNot: "^apps/web-app/" } },
    { name: "apps-no-cross-patients", severity: "error", from: { path: "^apps/patients/" }, to: { path: "^apps/[^/]+", pathNot: "^apps/patients/" } },
    { name: "apps-no-cross-doctors", severity: "error", from: { path: "^apps/doctors/" }, to: { path: "^apps/[^/]+", pathNot: "^apps/doctors/" } },
    { name: "apps-no-cross-companies", severity: "error", from: { path: "^apps/companies/" }, to: { path: "^apps/[^/]+", pathNot: "^apps/companies/" } },
    // packages/types no depende de nadie
    { name: "types-is-leaf", severity: "error", from: { path: "^packages/types/" }, to: { pathNot: "^packages/types/" } },
    // Deep-imports prohibidos EXTERNOS a @autamedica/* (no dentro del mismo package)
    {
      name: "no-external-deep-imports",
      severity: "error",
      comment: "No importar archivos internos de otros packages",
      from: { path: "^(?!packages/([^/]+)).*" },
      to: { path: "packages/[^/]+/(src|dist)/" }
    }
  ]
};
