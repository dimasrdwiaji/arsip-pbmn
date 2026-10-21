/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        japandi: {
          bg: "#FAF9F5",
          surface: "#FFFFFF",
          muted: "#F5F4EE",
          border: "#E7E5DF",
          text: "#2D323A",
          subtext: "#6C727E",
        },
        pu: {
          blue: "#3B82F6",
          blueSoft: "#EFF6FF",
          blueBorder: "#BFDBFE",
          yellow: "#F59E0B",
          yellowSoft: "#FEF3C7",
          yellowBorder: "#FDE68A",
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif"
        ]
      }
    },
  },
  plugins: [],
}
