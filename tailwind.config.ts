import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Geist",
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["Geist Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1.4" }],
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["0.9375rem", { lineHeight: "1.6" }],
        lg: ["1rem", { lineHeight: "1.6" }],
        xl: ["1.125rem", { lineHeight: "1.5" }],
        "2xl": ["1.25rem", { lineHeight: "1.4" }],
        "3xl": ["1.5rem", { lineHeight: "1.35" }],
        "4xl": ["1.875rem", { lineHeight: "1.25" }],
        "5xl": ["2.25rem", { lineHeight: "1.2" }],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease",
        "slide-up": "slideUp 200ms ease",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
