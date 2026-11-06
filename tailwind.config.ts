import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: "#3B66B4",
        sunny: "#F4D03F",
        coral: "#DE7A7A",
        cream: "#FFF9E6",
        burnt: "#E65C2E",
        mint: "#2ECC71",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "Readex Pro", "sans-serif"],
        readex: ["var(--font-readex)", "Readex Pro", "Cairo", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px rgba(0,0,0,1)",
        "brutal-lg": "8px 8px 0px 0px rgba(0,0,0,1)",
        "brutal-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
      },
    },
  },
  plugins: [],
};
export default config;
