/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'kelly-green': '#22c55e',
        'kelly-dark': '#15803d',
      },
    },
  },
  plugins: [],
}
