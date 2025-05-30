/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0D0170",
        secondary: {
          DEFAULT: "#FF9C01",
          100: "#4C37EE",
          200: "#1A02CF",
        },
        black: {
          DEFAULT: "#000",
          100: "#1E1E2D",
          200: "#232533",
        },
        gray: {
          100: "#CDCDE0",
        },
        orange: {
          DEFAULT: "#FCCB41",
        },
        navy: {
          DEFAULT: "#01609C",
          100: "#D4E7FF",
        },
        green: {
          DEFAULT: "#2ECC71",
          100 : "#61E1B6",
        },
        purple: {
          DEFAULT: "#D36CC5",
        },
        yellow: {
          DEFAULT: "#FFEE50",
        },
        error: {
          DEFAULT: "#de3730",
        },
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
}
