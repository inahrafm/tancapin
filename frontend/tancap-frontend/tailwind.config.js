/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6CC24A',      // Hijau utama Tancap
        secondary: '#59C6CF',    // Biru aksen
        brand: {
          green: '#6CC24A',
          blue: '#59C6CF',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to bottom right, #6CC24A, #59C6CF)',
      }
    },
  },
  plugins: [],
}
