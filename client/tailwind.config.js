/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        editorial: ['"Plus Jakarta Sans"', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#4AA6D9',
          green: '#7CC576',
          ink: '#17324D',
          mist: '#F3FBFF',
          leaf: '#F5FFF3',
        },
      },
      boxShadow: {
        soft: '0 22px 70px rgba(74, 166, 217, 0.12)',
        premium: '0 30px 90px rgba(74, 166, 217, 0.18)',
      },
    },
  },
  plugins: [],
}
