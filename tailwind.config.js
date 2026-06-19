/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
        },
        surface: "var(--color-surface)",
        line: "var(--color-line)",
        brass: "var(--color-brass)",
        pain: {
          high: "var(--color-pain-high)",
        },
        demand: {
          high: "var(--color-demand-high)",
        },
        neutral: {
          data: "var(--color-neutral-data)",
        },
        warning: "var(--color-warning)",
        // Cosmic palette additions
        'space-deep': '#000000',
        'space-black': '#030303',
        'space-darker': '#050505',
        'accent-refined-primary': '#7C6BA8',
        'accent-refined-secondary': '#9370A8',
        'accent-refined-light': '#9B8FBD',
        'accent-refined-dark': '#5E4A7D',
        'accent-refined-highlight': '#8B6BA8',
        'accent-refined-rare': '#6B4F96',
        'text-primary': '#FFFFFF',
        'text-secondary': '#D4D4D8',
        'text-muted': '#808080',
        'achievement-gold': "var(--status-achievement)",
        'success-emerald': "var(--status-success)",
        'opportunity-violet': "var(--status-opportunity-violet)",
        'alert-ember': "var(--status-alert)",
      },
      fontFamily: {
        catalogue: ['"Space Grotesk"', 'sans-serif'],
        instrument: ['Inter', '"General Sans"', 'sans-serif'],
        label: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px rgba(0,0,0,0.4)',
        'glass-dark': '0 8px 32px rgba(0,0,0,0.6)',
        'cosmic-glow': '0 0 40px rgba(139, 92, 246, 0.15)',
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, var(--bg-midnight), var(--bg-deep-space) 70%)',
        'hero-gradient': 'linear-gradient(135deg, var(--hero-neon-blue), var(--hero-neon-red))',
        'galaxy-wash': 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.08))',
      },
      backdropBlur: {
        'cosmic': '16px',
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'drift': 'driftY 40s ease-in-out infinite',
        'neon-border': 'neon-border 8s infinite alternate ease-in-out',
        'glow-pulse': 'glow-pulse 4s infinite alternate ease-in-out',
      },
    },
  },
  plugins: [],
}
