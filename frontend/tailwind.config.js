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
        background: {
          DEFAULT: '#0B0F19',
          elevated: '#111827',
          surface: '#1E293B',
        },
        brand: {
          50: '#ECFDF5',
          500: '#10B981',
          600: '#059669',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        cyan: {
          500: '#06B6D4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
