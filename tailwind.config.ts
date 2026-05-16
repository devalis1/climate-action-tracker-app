import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-bg": "#00001f",
        "brand-bg-deep": "#01012d",
        "brand-surface": "#14275f",
        "brand-black": "#090909",
        "brand-blue": "#2352dc",
        "brand-accent": "#62f58a",
        "brand-muted": "#758696",
        "brand-border": "#c2c2c2",
        "brand-glass": "#ffffff1a",
        "brand-shadow": "#00000040",
        "brand-green-soft": "#cde6a5",
        "brand-cyan-soft": "#86e3ce"
      },
      boxShadow: {
        brand: "7px 7px 15px #00000040",
        glow: "0 0 32px #62f58a55"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
