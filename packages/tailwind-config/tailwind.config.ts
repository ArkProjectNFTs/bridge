import { type Config } from "tailwindcss";

export default {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
      },
    },
  },
  plugins: [],
} satisfies Config;
