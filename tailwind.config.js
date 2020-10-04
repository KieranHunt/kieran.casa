const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
  },
  purge: ["./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nanum: ["Nanum Pen Script", ...defaultTheme.fontFamily.sans],
        francois: ["Francois One", ...defaultTheme.fontFamily.sans],
        "source-code-pro": ["Source Code Pro", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
