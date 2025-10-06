import preset from '@autamedica/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/auth/src/**/*.{ts,tsx}',
    '../../packages/hooks/src/**/*.{ts,tsx}'
  ],
  // Optimize for production
  future: {
    hoverOnlyWhenSupported: true,
  }
};

export default config;
