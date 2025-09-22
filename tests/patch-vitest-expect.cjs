const Module = require('module');

if (!Module.__vitestExpectPatched) {
  Module.__vitestExpectPatched = true;

  const originalDefineProperty = Object.defineProperty;
  const jestSymbol = Symbol.for('$$jest-matchers-object');

  Object.defineProperty = function patchedDefineProperty(target, property, descriptor) {
    if (property === jestSymbol) {
      const existing = Object.getOwnPropertyDescriptor(target, property);
      if (existing && existing.configurable === false) {
        return target;
      }
    }

    return originalDefineProperty(target, property, descriptor);
  };
  const originalLoad = Module._load;

  Module._load = function patchedLoad(request, parent, isMain) {
    if (
      request === '@vitest/expect' ||
      request.startsWith('@vitest/expect/') ||
      request.includes('@vitest/expect')
    ) {
      return originalLoad.call(this, '@jest/expect', parent, isMain);
    }

    return originalLoad.call(this, request, parent, isMain);
  };
}
