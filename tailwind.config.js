/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{md,html}", "!./_site/**/*.*" , "!./node_modules/**/*"],
  theme: {
    extend: {
      gridTemplateColumns: {
        '21': 'repeat(21, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}
