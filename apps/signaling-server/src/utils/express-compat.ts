/**
 * Express compatibility shim for path-to-regexp v6.
 *
 * pnpm fuerza la versión ^6 de `path-to-regexp` para resolver CVEs recientes.
 * Express 4 todavía espera la exportación por defecto en forma de función,
 * por lo que ajustamos el módulo en el require cache antes de que Express lo cargue.
 */

import { createRequire } from 'node:module';

const localRequire = createRequire(import.meta.url);
const expressEntry = localRequire.resolve('express');
const expressRequire = createRequire(expressEntry);

const pathToRegexpPath = expressRequire.resolve('path-to-regexp');
const pathToRegexpModule = expressRequire('path-to-regexp') as any;

if (typeof pathToRegexpModule !== 'function' && typeof pathToRegexpModule?.pathToRegexp === 'function') {
  // Reutilizamos la implementación v6 pero exponemos la función esperada por Express 4
  const compatExport = Object.assign(pathToRegexpModule.pathToRegexp, pathToRegexpModule);
  compatExport.pathToRegexp = pathToRegexpModule.pathToRegexp;

  const cacheEntry = expressRequire.cache?.[pathToRegexpPath];
  if (cacheEntry) {
    cacheEntry.exports = compatExport;
  }
}
