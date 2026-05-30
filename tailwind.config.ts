import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from "tailwindcss/plugin"

const config: Config = {
  darkMode: "class",
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Syne', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(217.2 91.2% 95%)",
          100: "hsl(217.2 91.2% 90%)",
          200: "hsl(217.2 91.2% 80%)",
          300: "hsl(217.2 91.2% 70%)",
          400: "hsl(217.2 91.2% 60%)",
          500: "hsl(217.2 91.2% 59.8%)",
          600: "hsl(217.2 91.2% 50%)",
          700: "hsl(217.2 91.2% 40%)",
          800: "hsl(217.2 91.2% 30%)",
          900: "hsl(217.2 91.2% 20%)",
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
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [
    
    plugin(function ({ addBase, addComponents }) {
      addBase({
        ":root": {
          "--background": "0 0% 100%",
          "--foreground": "0 0% 3.6%",
          "--border": "214 32% 91%",
          "--input": "214 32% 91%",
          "--ring": "217.2 91.2% 59.8%",
          "--primary": "217.2 91.2% 59.8%",
          "--primary-foreground": "0 0% 100%",
          "--secondary": "212.7 26.8% 83.5%",
          "--secondary-foreground": "0 0% 3.6%",
          "--destructive": "0 84.2% 60.2%",
          "--destructive-foreground": "0 0% 100%",
          "--muted": "210 40% 96%",
          "--muted-foreground": "215.4 16.3% 46.9%",
          "--accent": "142.1 70.6% 45.3%",
          "--accent-foreground": "0 0% 100%",
          "--popover": "0 0% 100%",
          "--popover-foreground": "0 0% 3.6%",
          "--card": "0 0% 100%",
          "--card-foreground": "0 0% 3.6%",
          "--radius": "0.5rem",
        },
        ".dark": {
          "--background": "0 0% 3.6%",
          "--foreground": "0 0% 98%",
          "--border": "217.2 32.6% 17.5%",
          "--input": "217.2 32.6% 17.5%",
          "--ring": "217.2 91.2% 59.8%",
          "--primary": "217.2 91.2% 59.8%",
          "--primary-foreground": "0 0% 9%",
          "--secondary": "212.7 26.8% 23.5%",
          "--secondary-foreground": "0 0% 98%",
          "--destructive": "0 62.8% 30.6%",
          "--destructive-foreground": "0 0% 85.7%",
          "--muted": "217.2 32.6% 17.5%",
          "--muted-foreground": "215 20.2% 65.1%",
          "--accent": "142.1 70.6% 45.3%",
          "--accent-foreground": "0 0% 9%",
          "--popover": "0 0% 3.6%",
          "--popover-foreground": "0 0% 98%",
          "--card": "0 0% 3.6%",
          "--card-foreground": "0 0% 98%",
        },
      })

      addComponents({
        ".btn": {
          "@apply inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50": {},
        },
        ".btn-primary": {
          "@apply bg-primary text-primary-foreground hover:bg-primary/90": {},
        },
        ".btn-secondary": {
          "@apply bg-secondary text-secondary-foreground hover:bg-secondary/80": {},
        },
        ".btn-outline": {
          "@apply border border-input bg-background hover:bg-accent hover:text-accent-foreground": {},
        },
        ".btn-ghost": {
          "@apply hover:bg-accent hover:text-accent-foreground": {},
        },
        ".container": {
          "@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8": {},
        },
        ".glass": {
          "@apply bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10": {},
        },
        ".gradient-text": {
          "@apply bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent": {},
        },
      })
    }),
  ],
}

export default config
