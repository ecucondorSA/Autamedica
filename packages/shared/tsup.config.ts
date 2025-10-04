import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    roles: 'src/roles.ts'
  },
  format: ['esm'],
  dts: true,
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