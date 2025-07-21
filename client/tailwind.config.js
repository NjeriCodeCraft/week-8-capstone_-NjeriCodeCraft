/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f6fa', // soft gray
        card: '#ffffff', // clean white
        accent: {
          500: '#ff6f61', // vibrant coral
        },
        blue: {
          DEFAULT: '#19376d', // deep blue
          hover: '#0b2447',   // blue on hover
        },
        heading: '#1a2238', // bold, dark for headings
        text: {
          main: '#111827', // Main text
          subtle: '#6B7280', // Cool gray
        },
        hover: {
          blue: '#2563EB', // Blue on hover
          coral: '#FF6F61', // Coral on hover
        },
        danger: '#EF4444', // Red for danger
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} 