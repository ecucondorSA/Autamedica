import base from '@autamedica/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...base,
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ]
};

export default config;
