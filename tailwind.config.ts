import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f5",
          100: "#d5ede6",
          200: "#aed9cc",
          300: "#7bc0ad",
          400: "#4fa68f",
          500: "#358f77",
          600: "#287560",
          700: "#225e4e",
          800: "#1e4c40",
          900: "#1a3f36",
          950: "#0d2420",
        },
        accent: {
          gold: "#c9a227",
          sand: "#f5f0e6",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,36,32,0.06), 0 8px 24px rgba(15,36,32,0.08)",
        "card-hover": "0 4px 12px rgba(15,36,32,0.1), 0 16px 40px rgba(15,36,32,0.12)",
        glow: "0 0 40px rgba(53,143,119,0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.45s ease-out forwards",
        shimmer: "shimmer 1.5s infinite",
        "progress-indeterminate": "progressIndeterminate 1.2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        progressIndeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(53,143,119,0.18), transparent), linear-gradient(180deg, #f8faf9 0%, #eef8f5 100%)",
        "mesh-portal":
          "radial-gradient(at 0% 0%, rgba(53,143,119,0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(201,162,39,0.06) 0, transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
