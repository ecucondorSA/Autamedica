// Design System para AutaMedica Auth App
// Mantiene consistencia visual con web-app y otros portales

export const colors = {
  // Fondo principal (coherente con web-app)
  background: {
    primary: '#0f0f10',      // Fondo principal oscuro
    secondary: '#1a1a1a',    // Fondo de tarjetas
    tertiary: '#2a2a2a',     // Fondo de elementos secundarios
    overlay: 'rgba(0, 0, 0, 0.8)', // Overlay para modales
  },

  // Texto
  text: {
    primary: '#ffffff',      // Texto principal
    secondary: '#e5e5e5',    // Texto secundario
    tertiary: '#a3a3a3',     // Texto terciario
    muted: '#737373',        // Texto silenciado
    disabled: '#525252',     // Texto deshabilitado
  },

  // Bordes y divisores
  border: {
    primary: '#333333',      // Bordes principales
    secondary: '#404040',    // Bordes secundarios
    focus: '#6366f1',        // Bordes de focus
    error: '#ef4444',        // Bordes de error
    success: '#10b981',      // Bordes de éxito
  },

  // Estados de interacción
  interactive: {
    hover: '#404040',        // Hover genérico
    active: '#525252',       // Estado activo
    disabled: '#262626',     // Estado deshabilitado
  },

  // Gradientes y acentos
  gradient: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    secondary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    tertiary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },

  // Estados semánticos
  semantic: {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    neutral: '#6b7280',
  },

  // Elementos específicos
  brand: {
    primary: '#6366f1',      // Color principal de la marca
    secondary: '#8b5cf6',    // Color secundario
    accent: '#10b981',       // Color de acento
  }
} as const;

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  '4xl': '2.5rem',  // 40px
  '5xl': '3rem',    // 48px
  '6xl': '4rem',    // 64px
} as const;

export const typography = {
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',

  // Sombras específicas para auth
  card: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  button: '0 4px 14px 0 rgba(0, 0, 0, 0.15)',
  input: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
} as const;

export const animations = {
  transition: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    slower: '500ms ease-in-out',
  },

  // Animaciones específicas
  fadeIn: 'fadeIn 200ms ease-in-out',
  slideUp: 'slideUp 300ms ease-out',
  slideDown: 'slideDown 300ms ease-out',
  scaleIn: 'scaleIn 200ms ease-out',
  spin: 'spin 1s linear infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Componentes base para mantener consistencia
export const components = {
  // Card base
  card: {
    base: `
      rounded-xl
      border
      backdrop-blur-lg
      shadow-card
      transition-all
      duration-200
    `,
    background: `bg-[${colors.background.secondary}]`,
    border: `border-[${colors.border.primary}]`,
    padding: 'p-6 md:p-8',
  },

  // Button base
  button: {
    base: `
      inline-flex
      items-center
      justify-center
      font-medium
      transition-all
      duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      focus:ring-offset-gray-900
      disabled:opacity-50
      disabled:cursor-not-allowed
    `,
    size: {
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl',
    },
    variant: {
      primary: `
        bg-gradient-to-r from-indigo-500 to-purple-600
        hover:from-indigo-600 hover:to-purple-700
        text-white
        shadow-button
        hover:shadow-lg
        hover:scale-105
      `,
      secondary: `
        bg-gray-700/50
        hover:bg-gray-600/50
        text-gray-200
        border border-gray-600/30
      `,
      outline: `
        border-2 border-gray-600/50
        hover:border-gray-500
        text-gray-300
        hover:text-white
        hover:bg-gray-800/50
      `,
      ghost: `
        text-gray-400
        hover:text-white
        hover:bg-gray-800/50
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600
        hover:from-red-600 hover:to-red-700
        text-white
      `,
    },
  },

  // Input base
  input: {
    base: `
      w-full
      px-4
      py-3
      rounded-lg
      border
      backdrop-blur-sm
      transition-all
      duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-indigo-500
      focus:border-transparent
      placeholder:text-gray-500
    `,
    background: `bg-gray-800/50`,
    border: `border-gray-600/30`,
    text: `text-gray-200`,
    states: {
      error: `
        border-red-500/50
        focus:ring-red-500
        bg-red-500/5
      `,
      success: `
        border-green-500/50
        focus:ring-green-500
        bg-green-500/5
      `,
    },
  },

  // Loading states
  loading: {
    spinner: `
      animate-spin
      rounded-full
      border-2
      border-gray-600
      border-t-indigo-500
    `,
    skeleton: `
      animate-pulse
      bg-gray-700/50
      rounded
    `,
  },
} as const;

// Utilidades helper
export const utils = {
  // Generar clases de Tailwind desde el design system
  bg: (color: string) => `bg-[${color}]`,
  text: (color: string) => `text-[${color}]`,
  border: (color: string) => `border-[${color}]`,

  // Combinaciones comunes
  glassmorphism: `
    backdrop-blur-lg
    bg-white/5
    border
    border-white/10
    shadow-xl
  `,

  // Focus ring consistente
  focusRing: `
    focus:outline-none
    focus:ring-2
    focus:ring-indigo-500
    focus:ring-offset-2
    focus:ring-offset-gray-900
  `,

  // Transiciones suaves
  smoothTransition: 'transition-all duration-200 ease-in-out',

  // Gradientes de texto
  gradientText: `
    bg-gradient-to-r
    from-white
    to-gray-300
    bg-clip-text
    text-transparent
  `,

  // Grid responsive
  responsiveGrid: `
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-6
  `,
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Components = typeof components;