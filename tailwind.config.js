/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "neu-base": "#e0e5ec",   // fond
        "neu-text": "#4a5568",   // texte
        "neu-accent": "#667eea", // accent (boutons, liens)
        "neu-dark": "#a3b1c6",   // ombres / placeholders
      },
      boxShadow: {
        // surface "bombée"
        "neu-out": "9px 9px 16px #b8bec7, -9px -9px 16px #ffffff",
        // surface "enfoncée"
        "neu-in": "inset 6px 6px 12px #b8bec7, inset -6px -6px 12px #ffffff",
      },
    },
  },
  plugins: [],
};
