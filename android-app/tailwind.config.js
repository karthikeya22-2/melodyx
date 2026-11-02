/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          'green-light': '#1ed760',
          black: '#121212',
          'dark-base': '#000000',
          'card-bg': '#181818',
          'card-hover': '#282828',
          subtext: '#b3b3b3'
        }
      }
    }
  },
  plugins: []
};

