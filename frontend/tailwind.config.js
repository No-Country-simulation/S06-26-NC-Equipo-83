/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:  "#5F27CD",   // Violeta Intenso
          cta:      "#FF8C00",   // Naranja Enérgico
          trust:    "#00A8A8",   // Turquesa
          surface:  "#FAFAFA",   // Off-white
        },
      },
    },
  },
  plugins: [],
};
