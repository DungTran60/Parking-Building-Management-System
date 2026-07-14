import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        background: "hsl(210 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        primary: { DEFAULT: "rgb(var(--theme-color-rgb, 59 130 246) / <alpha-value>)", foreground: "white" },
        success: "hsl(158 64% 38%)",
        warning: "hsl(38 92% 50%)",
        danger: "hsl(0 72% 51%)"
      }
    }
  },
  plugins: []
} satisfies Config;
