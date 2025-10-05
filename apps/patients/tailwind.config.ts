import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FDFCF9',
          50: '#FEFEFE',
          100: '#FDFCF9',
          200: '#FAF8F4',
          300: '#F5F2EC',
          400: '#EDE9E0',
          500: '#E3DDD0',
        },
        // AutaMedica Brand Colors
        "autamedica-ivory": "#FDFCF9",
        "autamedica-beige": "#F5F2EC",
        "autamedica-negro": "#1a1a1a",
        "autamedica-blanco": "#FFFFFF",
        "autamedica-primary": "#2563eb",
        "autamedica-secondary": "#64748b",
      },
      backgroundColor: {
        'base-ivory': '#FDFCF9',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
