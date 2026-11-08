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
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          // Brand specific deep palette
          root: '#07130e',
          card: '#0d2218',
          cardHover: '#133023',
          border: '#1b402e',
          accent: '#10b981',
          mint: '#6ee7b7',
        },
        surface: {
          lightRoot: '#fcfdfa',
          lightCard: '#ffffff',
          lightCardHover: '#f4f6f1',
          lightBorder: '#e2e8f0',
          lightText: '#064e3b',
          lightMuted: '#64748b',
        }
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
