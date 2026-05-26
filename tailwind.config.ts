import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta tipo archivo / pergamino sobrio
        ink: {
          50: "#faf8f3",
          100: "#f3eee0",
          200: "#e6dcc1",
          300: "#cdb88a",
          400: "#a8895a",
          500: "#7a5f3c",
          600: "#54422a",
          700: "#3a2d1d",
          800: "#26200f",
          900: "#1a1408",
        },
        accent: {
          gold: "#b8860b",
          rust: "#8b3a1f",
          jade: "#3e6b5a",
        },
      },
      fontFamily: {
        serif: ['"EB Garamond"', '"Garamond"', "ui-serif", "Georgia", "serif"],
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
