/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e40af', hover: '#1d4ed8' }
      }
    }
  },
  plugins: []
}
