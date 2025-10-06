import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    roles: 'src/roles.ts'
  },
  format: ['esm'],
  dts: false,  // Disable DTS generation - will use tsc directly
  sourcemap: true,
  clean: true,
  tsconfig: './tsconfig.json',
  external: [
    '@autamedica/types',
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    'zod'
  ],
})