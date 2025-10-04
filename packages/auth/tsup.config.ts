import { defineConfig } from 'tsup'
import { glob } from 'glob'

const entries = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.test.tsx']
})

export default defineConfig({
  entry: entries,
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: ['react', 'next', '@supabase/supabase-js', '@supabase/ssr'],
  treeshake: false,
  minify: false,
  bundle: false, // Compile each file separately
  outExtension() {
    return {
      js: '.mjs'
    }
  }
})