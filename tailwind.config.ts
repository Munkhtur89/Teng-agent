import type { Config } from "tailwindcss";
import svgToDataUri from "mini-svg-data-uri";
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        defaultWidth: "1110px",
        mdl: "900px",
        maxScreen: "1300px",
        "w-400": "400px",
        "w-500": "500px",
        "w-560": "560px",
      },
      maxWidth: {
        defaultMaxW: "1110px",
        maxW900: "900px",
      },
      colors: {
        primary: "#272A74",
        secondary: "#ffaa00",
        inactive: "#aeb1b7",
        danger: "#D31515",
        info: "#275499",
        waterblue: "#e4f7fd",
        txt: "#061938",
        success: "#5EB14E",
        lightGrey: "#DFE1E6",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
      },
    },
  },
  plugins: [
    addVariablesForColors,
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-dot-thick": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};

// Энэ plugin нь Tailwind-ийн өнгө бүрийг CSS variable болгон нэмнэ, жишээ нь: var(--gray-200)
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config;

// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "gradient-conic":
//           "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
//       },
//       screens: {
//         defaultWidth: "1110px",
//         mdl: "900px",
//         maxScreen: "1300px",
//         "w-400": "400px",
//         "w-500": "500px",
//         "w-560": "560px",
//       },
//       maxWidth: {
//         defaultMaxW: "1110px",
//         maxW900: "900px",
//       },
//       colors: {
//         primary: "#272A74",
//         secondary: "#ffaa00",
//         inactive: "#aeb1b7",
//         danger: "#D31515",
//         info: "#275499",
//         waterblue: "#e4f7fd",
//         txt: "#061938",
//         success: "#5EB14E",
//         lightGrey: "#DFE1E6",
//       },
//       keyframes: {
//         fadeIn: {
//           "0%": { opacity: "0" },
//           "100%": { opacity: "1" },
//         },
//         slideUp: {
//           "0%": { transform: "translateY(100px)", opacity: "0" },
//           "100%": { transform: "translateY(0)", opacity: "1" },
//         },
//       },
//       animation: {
//         "fade-in": "fadeIn 1s ease-in forwards",
//         "slide-up": "slideUp 0.8s ease-out forwards",
//       },
//     },
//   },
//   plugins: [],
// };
// export default config;
