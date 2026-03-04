import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Fontes ─────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },

      // ── Escala tipográfica aumentada (base 18px) ───────────────
      fontSize: {
        '2xs':  ['0.75rem',    { lineHeight: '1.3' }],   // 12px
        'xs':   ['0.8125rem',  { lineHeight: '1.45' }],  // 13px
        'sm':   ['0.9375rem',  { lineHeight: '1.5' }],   // 15px
        'base': ['1.125rem',   { lineHeight: '1.65' }],  // 18px ← corpo
        'lg':   ['1.25rem',    { lineHeight: '1.55' }],  // 20px
        'xl':   ['1.5rem',     { lineHeight: '1.35' }],  // 24px
        '2xl':  ['1.75rem',    { lineHeight: '1.3' }],   // 28px
        '3xl':  ['2.25rem',    { lineHeight: '1.2' }],   // 36px
        '4xl':  ['2.75rem',    { lineHeight: '1.1' }],   // 44px
      },

      // ── Line heights ───────────────────────────────────────────
      lineHeight: {
        'tight':   '1.3',
        'snug':    '1.45',
        'normal':  '1.65',
        'relaxed': '1.8',
        'loose':   '2.0',
      },

      // ── Letter spacing ─────────────────────────────────────────
      letterSpacing: {
        'tighter':  '-0.01em',
        'tight':    '0',
        'normal':   '0.01em',
        'wide':     '0.03em',
        'wider':    '0.06em',
        'widest':   '0.12em',
      },

      // ── Cores estendidas — WCAG AA ─────────────────────────────
      colors: {
        sgo: {
          // Fundos
          'bg-base':     '#0d1117',
          'bg-surface':  '#0f1623',
          'bg-elevated': '#0a0f1a',
          'bg-hover':    '#111827',

          // Bordas
          'border':      '#1a2540',
          'border-mid':  '#2a3f5f',
          'border-hi':   '#3d5a80',

          // Texto — verificado WCAG AA contra #0d1117
          'text-1': '#f1f5f9',   // ~16:1 ✓✓
          'text-2': '#cbd5e1',   // ~9.5:1 ✓✓
          'text-3': '#94a3b8',   // ~5.5:1 ✓
          'text-4': '#718096',   // ~4.6:1 ✓ (mínimo AA)

          // Accent
          'blue':    '#60a5fa',  // ~5.8:1 ✓
          'green':   '#4ade80',  // ~7.2:1 ✓✓
          'amber':   '#fbbf24',  // ~8.1:1 ✓✓
          'red':     '#fc8181',  // ~5.1:1 ✓
          'sky':     '#7dd3fc',  // ~6.4:1 ✓✓
        },
      },

      // ── Espaçamento aumentado ──────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      // ── Border radius ──────────────────────────────────────────
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // ── Tamanhos mínimos acessíveis ────────────────────────────
      minHeight: {
        'touch': '48px',   // WCAG 2.5.5 — alvo mínimo de toque
      },

      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}

export default config
