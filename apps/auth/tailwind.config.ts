import preset from '@autamedica/tailwind-config';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'autamedica-blue': '#1E40AF',
        'autamedica-light-blue': '#3B82F6',
        'autamedica-green': '#059669',
        'autamedica-light-green': '#10B981',
      },
    },
  },
};

export default config;
