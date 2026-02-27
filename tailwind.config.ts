import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./node_modules/@shadcn/ui/**/*.js", // Incluye shadcn/ui si lo estás usando
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Trust Colors (Healthtech Palette - Institucional)
        medical: { // Azul Profesional Confianza (basado en blue/slate oscuro)
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Brand Primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        teal: { // Verde Quirúrgico Calmante
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Accent
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981', // Success / Verification
          600: '#059669',
        },
      }
    },
  },
  plugins: [],
};

export default config;
