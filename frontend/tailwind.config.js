/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pitt-blue': '#003594',
        'pitt-gold': '#FFB81C',
        'pitt-navy': '#003594',
      },
    },
  },
  plugins: [],
}
