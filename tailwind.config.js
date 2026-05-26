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
        background: '#0A0F1E',
        accent: {
          DEFAULT: '#00D4AA',
          hover: '#00E8BA',
          muted: 'rgba(0, 212, 170, 0.1)',
        },
        surface: {
          DEFAULT: '#111827', // A bit lighter than background
          hover: '#1F2937',
        },
        text: '#F8FAFC',
        muted: '#94A3B8',
        danger: '#F87171',
        warning: '#FBBF24',
        success: '#34D399',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
