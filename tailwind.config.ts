import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#ffffff",
        paper: "#ffffff",
        pine: "#2d5a49",
        moss: "#60726b",
        terracotta: "#254739",
        ink: "#14231d"
      },
      fontFamily: {
        brand: ["Times New Roman", "Times", "serif"],
        serif: ["Times New Roman", "Times", "serif"],
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
