import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    threads: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.d.ts']
    }
  }
});
