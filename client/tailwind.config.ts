import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        sand: "#f7f3ea",
        moss: "#7a8b5b",
        rust: "#b65c3a",
      },
      fontFamily: {
        sans: ["Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
