/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        ink: 'var(--color-ink)',
        'ink-secondary': 'var(--color-ink-secondary)',
        brand: 'var(--color-brand)',
        'brand-secondary': 'var(--color-brand-secondary)',
        accent: 'var(--color-accent)',
        'soft-violet': 'var(--color-soft-violet)',
        'soft-cyan': 'var(--color-soft-cyan)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        'border-c': 'var(--color-border)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'Sora', 'sans-serif'],
        body: ['Inter', 'Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(17, 24, 39, 0.06)',
        elevated: '0 8px 30px rgba(17, 24, 39, 0.10)',
      },
      keyframes: {
        orbitPulse: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        },
      },
      animation: {
        'orbit-pulse': 'orbitPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
