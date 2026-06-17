/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rose: {
          50: "#FDF6F6",
          100: "#FBE9EA",
          200: "#F5D5D7",
          300: "#EDB9BC",
          400: "#E8B4B8",
          500: "#D98C91",
          600: "#C46B72",
          700: "#A4545B",
          800: "#87444A",
          900: "#6D373C",
        },
        gold: {
          50: "#FBF7F1",
          100: "#F5ECD9",
          200: "#EAD6B0",
          300: "#DEBF86",
          400: "#D4A574",
          500: "#C48E5A",
          600: "#A97449",
          700: "#8A5C3C",
          800: "#6E4932",
          900: "#593B29",
        },
        cream: {
          50: "#FDFCF9",
          100: "#FDF8F5",
          200: "#FAF2EC",
          300: "#F5EAEA",
          400: "#EEDFD7",
        },
        brown: {
          50: "#F7F3F3",
          100: "#EDE4E5",
          200: "#C7B8BA",
          300: "#9C888B",
          400: "#7A6567",
          500: "#5D4A4D",
          600: "#4A3A3C",
          700: "#3D2C2E",
          800: "#2E2022",
          900: "#1F1517",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"Source Han Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(232, 180, 184, 0.15)",
        card: "0 4px 20px rgba(61, 44, 46, 0.06)",
        hover: "0 8px 30px rgba(232, 180, 184, 0.25)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        breathe: "breathe 2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
