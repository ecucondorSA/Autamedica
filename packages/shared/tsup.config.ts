import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    roles: 'src/roles.ts'
  },
  format: ['esm'],
  dts: true, // Generate DTS without resolving (use installed types)
  sourcemap: true,
  clean: true,
  external: [
    '@autamedica/types',
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'zod'
  ],
})