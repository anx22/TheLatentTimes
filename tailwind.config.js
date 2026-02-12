
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#000000',
        accent: '#d00000',
        muted: '#f2f2f2',
        'muted-foreground': '#666666',
      },
      fontFamily: {
        display: ['"Didot"', '"Playfair Display"', 'serif'],
        sans: ['"Helvetica Neue"', '"Inter"', 'sans-serif'],
      },
      spacing: {
        gutter: '32px',
        margin: '80px',
      },
      fontSize: {
        '2xs': '10px',
      }
    },
  },
  plugins: [],
}
