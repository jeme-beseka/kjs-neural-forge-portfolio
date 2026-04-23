/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   'var(--color-primary)',
        accent:    'var(--color-accent)',
        'bg-dark': 'var(--color-bg-dark)',
        'bg-light':'var(--color-bg-light)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        /* ── Float ─────────────────────────────────────────────── */
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-15px) rotate(2deg)' },
          '66%':      { transform: 'translateY(-8px) rotate(-1deg)' },
        },

        /* ── Pulse Glow ─────────────────────────────────────────── */
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px var(--color-primary), 0 0 10px var(--color-primary), 0 0 20px var(--color-primary)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 20px var(--color-primary), 0 0 40px var(--color-primary), 0 0 60px var(--color-primary)',
            opacity: '0.8',
          },
        },
        'pulse-glow-text': {
          '0%, 100%': {
            textShadow: '0 0 4px var(--color-primary), 0 0 8px var(--color-primary)',
          },
          '50%': {
            textShadow: '0 0 12px var(--color-primary), 0 0 24px var(--color-primary), 0 0 48px var(--color-primary)',
          },
        },

        /* ── Shimmer ────────────────────────────────────────────── */
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },

        /* ── Matrix Rain ─────────────────────────────────────────── */
        'matrix-rain': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },

        /* ── Glitch ─────────────────────────────────────────────── */
        glitch: {
          '0%':  { clipPath: 'inset(40% 0 61% 0)', transform: 'translate(-2px, -2px)' },
          '20%': { clipPath: 'inset(92% 0 1% 0)',  transform: 'translate(1px, 3px)' },
          '40%': { clipPath: 'inset(43% 0 1% 0)',  transform: 'translate(-1px, -1px)' },
          '60%': { clipPath: 'inset(25% 0 58% 0)', transform: 'translate(2px, 2px)' },
          '80%': { clipPath: 'inset(54% 0 7% 0)',  transform: 'translate(-2px, 1px)' },
          '100%':{ clipPath: 'inset(58% 0 43% 0)', transform: 'translate(0px, 0px)' },
        },

        /* ── Fade Slide Up ─────────────────────────────────────── */
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },

        /* ── Scan Line ─────────────────────────────────────────── */
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },

        /* ── Spin Slow ─────────────────────────────────────────── */
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },

        /* ── Typewriter Blink ──────────────────────────────────── */
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },

        /* ── Progress Bar Fill ─────────────────────────────────── */
        'fill-bar': {
          from: { width: '0%' },
          to:   { width: 'var(--fill-width, 80%)' },
        },

        /* ── Plasma Morph ──────────────────────────────────────── */
        'plasma-morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },

        /* ── Draw Trace ────────────────────────────────────────── */
        'draw-trace': {
          from: { strokeDashoffset: '1000' },
          to:   { strokeDashoffset: '0' },
        },
      },

      animation: {
        float:           'float 6s ease-in-out infinite',
        'float-slow':    'float-slow 8s ease-in-out infinite',
        'pulse-glow':    'pulse-glow 2s ease-in-out infinite',
        'pulse-glow-slow':'pulse-glow 4s ease-in-out infinite',
        'pulse-glow-text':'pulse-glow-text 2.5s ease-in-out infinite',
        shimmer:         'shimmer 3s linear infinite',
        'matrix-rain':   'matrix-rain 3s linear infinite',
        glitch:          'glitch 0.5s steps(1) infinite',
        'fade-up':       'fade-up 0.6s ease-out forwards',
        'fade-in':       'fade-in 0.4s ease-out forwards',
        scanline:        'scanline 8s linear infinite',
        'spin-slow':     'spin-slow 20s linear infinite',
        blink:           'blink 1s step-end infinite',
        'fill-bar':      'fill-bar 1.2s ease-out forwards',
        'plasma-morph':  'plasma-morph 8s ease-in-out infinite',
        'draw-trace':    'draw-trace 3s ease-in-out forwards',
      },

      boxShadow: {
        'glow-sm':  '0 0 8px  var(--color-primary)',
        'glow':     '0 0 16px var(--color-primary)',
        'glow-lg':  '0 0 32px var(--color-primary)',
        'glow-xl':  '0 0 64px var(--color-primary)',
        'glow-accent-sm': '0 0 8px  var(--color-accent)',
        'glow-accent':    '0 0 16px var(--color-accent)',
        glass:      '0 8px 32px rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5)',
      },

      backdropBlur: {
        xs: '2px',
      },

      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
      },

      zIndex: {
        background: '-10',
        behind:     '-1',
        canvas:     '0',
        base:       '10',
        nav:        '50',
        modal:      '100',
        toast:      '200',
        tooltip:    '300',
      },

      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};
