/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: {
          50: "#eff0fe",
          100: "#e2e5fd",
          200: "#cacefb",
          300: "#aaaef7",
          400: "#8987f2",
          500: "#8423d9",
          600: "#674fdc",
          700: "#5940c2",
          800: "#48369d",
          900: "#3e327d",
          950: "#251e48",
        },
        bg: {
          50: "#D3D2DD",
          100: "#C7C7D4",
          200: "#B0AFC2",
          300: "#9A98B1",
          400: "#82819F",
          500: "#605F7D",
          600: "#5A5975",
          700: "#2a2938",
          800: "#1b1b21", //17171c
          900: "#0f0f12",
          950: "#0F0F13",
        },
      },
    },
  },
  // plugins: [require("daisyui")],
};
