/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1B1E23', 700: '#2A2E36', 500: '#5B6570' },
        paper: { DEFAULT: '#EFEAE0', 100: '#F7F4ED', 300: '#E4DDCE' },
        stamp: { DEFAULT: '#B33A2E', 700: '#8F2E24' },
        signal: { DEFAULT: '#3D7A5C', 700: '#2E5D46' },
        amber: { DEFAULT: '#C08A2E', 700: '#96692050' },
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
