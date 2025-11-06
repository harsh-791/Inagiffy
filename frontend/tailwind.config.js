/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neo Brutalism vibrant colors
        'neo-magenta': '#ec4899',
        'neo-cyan': '#22d3ee',
        'neo-yellow': '#fde047',
        'neo-yellow-bg': '#fef3c7',
      },
    },
  },
  plugins: [],
}

