import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        tierra: {
          50: 'var(--color-tierra-50)',
          100: 'var(--color-tierra-100)',
          200: 'var(--color-tierra-200)',
          400: 'var(--color-tierra-400)',
          600: 'var(--color-tierra-600)',
          800: 'var(--color-tierra-800)',
          900: 'var(--color-tierra-900)',
        },
        campo: {
          50: 'var(--color-campo-50)',
          100: 'var(--color-campo-100)',
          300: 'var(--color-campo-300)',
          500: 'var(--color-campo-500)',
          700: 'var(--color-campo-700)',
          900: 'var(--color-campo-900)',
        },
        alerta: {
          400: 'var(--color-alerta-400)',
          600: 'var(--color-alerta-600)',
        },
        critico: {
          400: 'var(--color-critico-400)',
          600: 'var(--color-critico-600)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
        },
        border: 'var(--color-border)',
        'text-1': 'var(--color-text-1)',
        'text-2': 'var(--color-text-2)',
        'text-3': 'var(--color-text-3)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
};

export default config;
