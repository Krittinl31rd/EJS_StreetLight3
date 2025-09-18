/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./views/**/*.ejs",
    // './src/**/*.{html,js,ejs,ts,jsx,tsx}',
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          primary: "#ffffff",
          secondary: "#f4f4f5",
          background: "#f8fafc",
          text: "#171717",
        },
        dark: {
          primary: "#171717",
          secondary: "#141615",
          background: "#000000",
          text: "#f8fafc",
        },
      },
      spacing: {
        128: "32rem",
        144: "36rem",
        16: "16px",
      },
      borderRadius: {
        "4xl": "16px",
      },
      keyframes: {
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        zoomIn: {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        slideInRight: "slideInRight 0.5s ease-out",
        slideOutRight: "slideOutRight 0.5s ease-out",
        "fade-in-down": "fadeInDown 0.5s ease-out",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
  darkMode: "class",
};
