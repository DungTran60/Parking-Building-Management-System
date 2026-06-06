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
        primary: { DEFAULT: "hsl(214 84% 48%)", foreground: "white" },
        success: "hsl(158 64% 38%)",
        warning: "hsl(38 92% 50%)",
        danger: "hsl(0 72% 51%)"
      }
    }
  },
  plugins: []
} satisfies Config;
