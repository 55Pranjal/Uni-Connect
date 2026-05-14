/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Bricolage Grotesque",
          "Inter Tight",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Fraunces",
          "Cormorant Garamond",
          "Georgia",
          "serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      colors: {
        paper: {
          50: "#fbf8f2",
          100: "#f6f1e7",
          200: "#ede4d1",
          300: "#e0d3b6",
          400: "#cdbb95",
        },
        ink: {
          50: "#f4f1ec",
          100: "#e6e1d8",
          200: "#c8c0b1",
          300: "#9a907f",
          400: "#6d6557",
          500: "#4d473c",
          600: "#3a352c",
          700: "#2a2620",
          800: "#1b1812",
          900: "#0e0c08",
        },
        rust: {
          50: "#fdf3ec",
          100: "#fadfcd",
          200: "#f3b58e",
          300: "#e98a56",
          400: "#d96a32",
          500: "#b8542a",
          600: "#923f1f",
          700: "#6f2f16",
          800: "#4d2010",
          900: "#2d1308",
        },
      },
      letterSpacing: {
        tightest: "-0.045em",
        mono: "0.06em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "marquee-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-y": {
          "0%, 18%": { transform: "translateY(0)" },
          "20%, 38%": { transform: "translateY(-100%)" },
          "40%, 58%": { transform: "translateY(-200%)" },
          "60%, 78%": { transform: "translateY(-300%)" },
          "80%, 98%": { transform: "translateY(-400%)" },
          "100%": { transform: "translateY(-500%)" },
        },
        "highlight-sweep": {
          "0%": { backgroundSize: "0% 100%" },
          "100%": { backgroundSize: "100% 100%" },
        },
        "blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        "spin-slow": "spin-slow 18s linear infinite",
        "marquee-x": "marquee-x 28s linear infinite",
        "marquee-y": "marquee-y 12s steps(5, end) infinite",
        "highlight-sweep":
          "highlight-sweep 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both",
        blink: "blink 1s steps(2) infinite",
      },
    },
  },
  plugins: [],
};
