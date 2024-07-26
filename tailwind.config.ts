import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shiny-gradient-1": "repeating-linear-gradient(45deg, #fde047, #ffffff, #eab308, #ffffff, #fde047)",
        "shiny-gradient-2": "repeating-linear-gradient(45deg, #ffffff, #fde047, #ffffff, #eab308, #ffffff)",
        "shiny-gradient-3": "repeating-linear-gradient(45deg, #ffffff, #4d4d4d, #ffffff, #4d4d4d, #ffffff)"
      },
    },
  },
  plugins: [],
};
export default config;
