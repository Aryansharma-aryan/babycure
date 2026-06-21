/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter Tight', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#0757a8',
          green: '#08a04b',
        },
      },
      boxShadow: {
        soft: '0 22px 70px rgba(7, 87, 168, 0.09)',
        premium: '0 26px 85px rgba(7, 87, 168, 0.13)',
      },
    },
  },
  plugins: [],
}
