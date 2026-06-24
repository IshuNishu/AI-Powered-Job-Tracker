/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        base: 'var(--bg-base)',
        accent: 'var(--accent)',
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
      },
      animation: {
        'fade-up':    'fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':    'fadeIn 0.3s ease both',
        'slide-down': 'slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'spin-slow':  'spinSlow 1s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'bounce-in':  'bounceIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
