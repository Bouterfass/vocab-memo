/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        neu: {
          base: '#e0e5ec',
          light: '#ffffff',
          dark: '#a3b1c6',
          text: '#4a5568',
          accent: '#667eea'
        }
      },
      boxShadow: {
        'neu-out': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        'neu-in': 'inset 6px 6px 10px 0 rgba(163,177,198, 0.7), inset -6px -6px 10px 0 rgba(255,255,255, 0.8)',
      }
    }
  },
  plugins: [],
};
