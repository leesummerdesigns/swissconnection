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
          50: "#e6f7f7",
          100: "#ccefef",
          200: "#99dfdf",
          300: "#66cfcf",
          400: "#33bfbf",
          500: "#008489",
          600: "#006a6e",
          700: "#004f53",
          800: "#003537",
          900: "#001a1c",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F7F7F7",
          border: "#EBEBEB",
          hover: "#F0F0F0",
        },
        text: {
          primary: "#222222",
          secondary: "#717171",
          tertiary: "#B0B0B0",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "12px",
        button: "8px",
        input: "8px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 24px rgba(0, 0, 0, 0.12)",
        nav: "0 2px 8px rgba(0, 0, 0, 0.06)",
        modal: "0 8px 32px rgba(0, 0, 0, 0.16)",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
