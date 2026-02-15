
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
        accent: '#000000', // Replaced Red with Black for monochrome
        paper: '#ffffff',
        muted: '#f5f5f5',
        'muted-foreground': '#666666',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        condensed: ['"Archivo Narrow"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
        'display-hero': ['8rem', { lineHeight: '0.85', letterSpacing: '-0.03em' }],
        'display-large': ['4rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
      },
      spacing: {
        gutter: '24px',
      },
      borderWidth: {
        'hairline': '1px',
      }
    },
  },
  plugins: [],
}
