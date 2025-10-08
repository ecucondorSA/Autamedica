import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,  // Disable DTS generation - will use tsc directly
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['@autamedica/types', '@autamedica/shared'],
});
