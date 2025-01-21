import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./node_modules/@shadcn/ui/**/*.js", // Incluye shadcn/ui si lo estás usando
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
