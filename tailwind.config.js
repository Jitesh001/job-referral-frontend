// tailwind.config.js
export default {
  darkMode: "class", // REQUIRED to activate `dark:` variants
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}",
    "./libs/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
