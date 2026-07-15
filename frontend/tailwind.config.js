/** @type {import('tailwindcss').Config} */

/**
 * TAILWIND CONFIG — VisualizationDSA
 *
 * Tailwind được cấu hình để tham chiếu Design Tokens từ src/styles/theme.css.
 * Điều này cho phép dùng class Tailwind như `text-accent`, `bg-surface`
 * mà vẫn nhận được màu từ CSS variables (hỗ trợ multi-theme switching).
 *
 * Quy tắc: Khi thêm màu mới, thêm vào theme.css TRƯỚC, sau đó expose ở đây.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ── FONT FAMILIES ── */
      fontFamily: {
        display: ['var(--font-display)'],
        sans:    ['var(--font-sans)'],
        mono:    ['var(--font-mono)'],
      },

      /* ── COLORS (references CSS variables from theme.css) ── */
      colors: {
        /* Backgrounds */
        'bg-primary':   'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-surface':   'var(--color-bg-surface)',
        'bg-hover':     'var(--color-bg-hover)',
        'bg-active':    'var(--color-bg-active)',

        /* Text */
        'text-primary':   'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted':     'var(--color-text-muted)',
        'text-disabled':  'var(--color-text-disabled)',

        /* Accent colors */
        'accent':         'var(--color-accent-primary)',
        'accent-light':   'var(--color-accent-primary-light)',
        'accent-dark':    'var(--color-accent-primary-dark)',
        'accent-green':   'var(--color-accent-green)',
        'accent-blue':    'var(--color-accent-blue)',
        'accent-red':     'var(--color-accent-red)',
        'accent-yellow':  'var(--color-accent-yellow)',
        'accent-cyan':    'var(--color-accent-cyan)',
        'accent-purple':  'var(--color-accent-purple)',

        /* Borders */
        'border-subtle':  'var(--color-border-subtle)',
        'border-default': 'var(--color-border-default)',
        'border-strong':  'var(--color-border-strong)',
        'border-accent':  'var(--color-border-accent)',
      },

      /* ── BORDER RADIUS ── */
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm':   'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        'md':   'var(--radius-md)',
        'lg':   'var(--radius-lg)',
        'xl':   'var(--radius-xl)',
        '2xl':  'var(--radius-2xl)',
      },

      /* ── BOX SHADOWS ── */
      boxShadow: {
        'sm':     'var(--shadow-sm)',
        DEFAULT:  'var(--shadow-md)',
        'md':     'var(--shadow-md)',
        'lg':     'var(--shadow-lg)',
        'xl':     'var(--shadow-xl)',
        'accent': 'var(--shadow-accent)',
        'cyan':   'var(--shadow-cyan)',
      },

      /* ── TRANSITION ── */
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
