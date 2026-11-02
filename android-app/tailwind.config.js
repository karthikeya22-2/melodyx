/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#090909',
          surface: '#151515',
          card: '#1D1D1D',
          'card-hover': '#262626',
          border: '#282828',
          accent: '#E50914',
          'accent-dark': '#B20710',
          'accent-hover': '#F40612',
          text: '#FFFFFF',
          muted: '#A3A3A3',
          subtle: '#666666'
        }
      }
    }
  },
  plugins: []
};
