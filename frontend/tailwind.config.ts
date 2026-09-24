import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dm: {
          "bg-deep": "#0B0C0A",
          "bg-surface": "#10120F",
          "bg-raised": "#151713",
          "bg-elevated": "#1B1D18",
          "bg-border": "#2A2C25",
          "bg-border-strong": "#3A3D33",
          "text-primary": "#F2F0E8",
          "text-secondary": "#AAA99F",
          "text-muted": "#74756D",
          "text-dim": "#5A5B54",
          "accent-amber": "#D8A84E",
          "accent-amber-bright": "#E8C36A",
          "accent-amber-dim": "#B88A3E",
          "success": "#78B887",
          "success-dim": "#5A9A6A",
          "warning": "#D7A34A",
          "critical": "#D85B4F",
          "critical-dim": "#B84A3F",
          "neutral": "#8B8F89",
          "focus": "#E8C36A",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        "dm-panel": "0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)",
        "dm-panel-elevated": "0 2px 6px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
        "dm-glow-amber": "0 0 20px rgba(216, 168, 78, 0.15), 0 0 40px rgba(216, 168, 78, 0.05)",
        "dm-glow-success": "0 0 20px rgba(120, 184, 135, 0.15), 0 0 40px rgba(120, 184, 135, 0.05)",
        "dm-glow-critical": "0 0 20px rgba(216, 91, 79, 0.15), 0 0 40px rgba(216, 91, 79, 0.05)",
      },
      backgroundImage: {
        "dm-grid": "linear-gradient(rgba(42, 44, 37, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 44, 37, 0.03) 1px, transparent 1px)",
        "dm-pattern": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(216, 168, 78, 0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(120, 184, 135, 0.02) 0%, transparent 50%)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "line-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "line-draw": "line-draw 1.5s ease-out forwards",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
      },
      transitionDuration: {
        "0": "0ms",
        "100": "100ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
        "700": "700ms",
        "1000": "1000ms",
      },
      transitionTimingFunction: {
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        "ease-in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [],
};
export default config;