import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4CAF82",
          dark: "#388E63",
          light: "#E8F5EE",
        },
        secondary: {
          DEFAULT: "#3B8ED0",
          dark: "#2A6FAD",
          light: "#E3F0FB",
        },
        accent: {
          DEFAULT: "#FF6B6B",
          light: "#FFE8E8",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
        purple: {
          DEFAULT: "#8B5CF6",
          light: "#EDE9FE",
        },
        orange: {
          DEFAULT: "#F97316",
          light: "#FFF0E5",
        },
        teal: {
          DEFAULT: "#14B8A6",
          light: "#CCFBF1",
        },
        pink: {
          DEFAULT: "#EC4899",
          light: "#FCE7F3",
        },
        background: "#F7F9FC",
        card: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
