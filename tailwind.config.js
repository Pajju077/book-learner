/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Lora'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        parchment: {
          50: "#fdfaf4",
          100: "#faf3e4",
          200: "#f3e5c4",
          300: "#e8d09a",
          400: "#d9b56c",
          500: "#c99a46",
          600: "#b3823a",
          700: "#956630",
          800: "#7a522c",
          900: "#654428",
        },
        ink: {
          50: "#f5f4f0",
          100: "#e8e6de",
          200: "#d1cebe",
          300: "#b4ae98",
          400: "#958e74",
          500: "#7d7560",
          600: "#655e4e",
          700: "#524c40",
          800: "#453f36",
          900: "#1c1a15",
          950: "#0e0d0a",
        },
        sage: {
          400: "#7d9b76",
          500: "#5f7a58",
          600: "#4a6044",
        },
        rust: {
          400: "#c4724a",
          500: "#a85a35",
          600: "#8c4828",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: "'Lora', Georgia, serif",
          },
        },
      },
    },
  },
  plugins: [],
};
