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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        store: "var(--store)",
        "store-dark": "var(--store-dark)",
        "store-light": "var(--store-light)",
        "store-muted": "var(--store-muted)",
        "store-gold": "var(--store-gold)",
        "store-gold-light": "var(--store-gold-light)",
        "store-gold-muted": "var(--store-gold-muted)",
        "store-black": "var(--store-black)",
      },
      fontFamily: {
        cairo: "var(--font-cairo)",
        tajawal: "var(--font-tajawal)",
      },
    },
  },
  plugins: [],
};

export default config;
