/** @type {import('tailwindcss').Config} */

/*
 * ────────────────────────────────────────────────────────────────
 *  FundForge Design System
 * ────────────────────────────────────────────────────────────────
 *  "The Campaign Press" — editorial first, fintech second. A
 *  disciplined two-ink system (+ neutrals): every campaign reads
 *  like a hand-set broadsheet, every number reads like a clean
 *  ledger. Loud on brand surfaces, calm on the money tools.
 *  See DESIGN.md for the full system + named rules.
 *
 *  PALETTE
 *    brand  → Electric Teal   the single hero/action colour.
 *                             CTAs, links, focus, progress, money,
 *                             "growth" signals. Pulls the eye toward
 *                             the action that matters: backing a project.
 *    navy   → Deep Navy       depth + trust. Dark surfaces (sidebar,
 *                             landing, footers), display headings,
 *                             structural contrast.
 *    slate  → Neutral         (Tailwind default) text, borders, fills.
 *
 *  TYPE
 *    font-display → Sora             headings / numbers / brand
 *    font-sans    → DM Sans          body + UI
 *    font-serif   → Instrument Serif editorial italic accent
 *
 *  RHYTHM        4px base grid (Tailwind spacing). Section padding
 *               leans on the `18 / 22 / 30` tokens added below.
 *  ELEVATION     shadow-soft → shadow-card → shadow-lift → shadow-glow
 *  MOTION        200–300ms, ease-out / ease-premium for lifts.
 * ────────────────────────────────────────────────────────────────
 */

const easePremium = 'cubic-bezier(.23,1,.32,1)';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Sora', 'DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      colors: {
        // ── Hero / action: Electric Teal ──
        brand: {
          50:  '#f0fdfa',
          100: '#cbfbef',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf', // electric teal — highlights, accents
          500: '#14b8a6', // core brand
          600: '#0d9488', // primary buttons / money figures
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2c',
        },
        // ── Depth / trust: Deep Navy ──
        navy: {
          50:  '#f0f5fb',
          100: '#dde8f4',
          200: '#bdd1e8',
          300: '#90b1d6',
          400: '#5c87bd',
          500: '#3a679f',
          600: '#2b4e80',
          700: '#243f68',
          800: '#1a2f4d',
          900: '#0e1c33',
          950: '#070f1f',
        },
      },

      // Consistent vertical rhythm beyond the default 4px scale
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },

      borderRadius: {
        '4xl': '2rem',
      },

      fontSize: {
        // Display scale for headings — paired with font-display (Sora)
        'display-sm': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '700' }],
        'display':    ['2.5rem',   { lineHeight: '1.1',  letterSpacing: '-0.025em', fontWeight: '800' }],
        'display-lg': ['3.5rem',   { lineHeight: '1.05', letterSpacing: '-0.03em',  fontWeight: '800' }],
        // Poster scale — fluid hero headlines on brand surfaces only
        'poster':     ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.035em', fontWeight: '800' }],
        'poster-sm':  ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1',    letterSpacing: '-0.03em',  fontWeight: '800' }],
      },

      boxShadow: {
        // Soft, layered elevation — no harsh default shadows
        soft:  '0 1px 2px rgba(14,28,51,0.04), 0 2px 8px rgba(14,28,51,0.04)',
        card:  '0 1px 3px rgba(14,28,51,0.05), 0 8px 24px -8px rgba(14,28,51,0.10)',
        lift:  '0 12px 32px -10px rgba(14,28,51,0.22), 0 4px 12px -6px rgba(14,28,51,0.10)',
        glow:  '0 10px 30px -8px rgba(13,148,136,0.45)',
        'glow-sm': '0 4px 14px -2px rgba(13,148,136,0.40)',
        'inner-soft': 'inset 0 1px 2px rgba(14,28,51,0.05)',
      },

      transitionTimingFunction: {
        premium: easePremium,
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-300% center' },
          '100%': { backgroundPosition: '300% center' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(20,184,166,0.5)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(20,184,166,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(20,184,166,0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },

      animation: {
        'fade-up':   `fade-up .5s ${easePremium} both`,
        'fade-in':   'fade-in .35s ease-out both',
        'scale-in':  `scale-in .25s ${easePremium} both`,
        shimmer:     'shimmer 5.5s linear infinite',
        'pulse-ring':'pulse-ring 2.4s ease-out infinite',
        float:       'float 4s ease-in-out infinite',
        marquee:     'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
}
