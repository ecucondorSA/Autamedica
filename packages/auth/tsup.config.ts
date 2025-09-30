import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disable dts generation in tsup since we use composite
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'next', '@supabase/supabase-js', '@supabase/ssr'],
  treeshake: true,
  minify: false
})