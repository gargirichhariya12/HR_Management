/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f6f8f5',
          100: '#e8ece5',
          200: '#d2dcd0',
          300: '#b3c4b0',
          400: '#8da588',
          500: '#6b8564',
          600: '#536c4c',
          700: '#41563b',
          800: '#33442e',
          900: '#253322',
          950: '#141c12'
        },
        primary: {
          DEFAULT: '#41563b',
          hover: '#33442e',
          light: '#e8ece5',
          glow: 'rgba(65, 86, 59, 0.2)'
        },
        accent: {
          DEFAULT: '#6b8564',
          light: '#f0f4ef'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}

