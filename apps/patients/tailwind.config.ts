import base from '@autamedica/tailwind-config';
import type { Config } from 'tailwindcss';

export default {
  ...base,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    ...base.theme,
    extend: {
      ...(base.theme?.extend || {}),
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
      },
      backgroundColor: {
        'base-ivory': '#FDFCF9',
      },
    },
  },
} satisfies Config;