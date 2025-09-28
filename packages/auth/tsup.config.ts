import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disabled due to middleware type issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'next', '@supabase/supabase-js', '@supabase/ssr'],
  treeshake: true,
  minify: false
})