import { type Config } from "tailwindcss";

export default {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // TODO @YohanTz: Move the colors object away from the extend property once all colors are defined
      colors: {
        "primary-50": "var(--color-primary-50)",
        "primary-100": "var(--color-primary-100)",
        "primary-200": "var(--color-primary-200)",
        "primary-300": "var(--color-primary-300)",
        "primary-400": "var(--color-primary-400)",
        "primary-500": "var(--color-primary-500)",
        "primary-600": "var(--color-primary-600)",
        "primary-700": "var(--color-primary-700)",
        "primary-800": "var(--color-primary-800)",
        "primary-900": "var(--color-primary-900)",
        "primary-950": "var(--color-primary-950)",
      },
      fontFamily: {
        "styrene-a": ["var(--font-styrene-a)"],
        "ark-project": ["var(--font-ark-project)"],
      },
      spacing: {
        "13": "3.25rem",
        "15.5": "3.875rem",
        "23": "5.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
