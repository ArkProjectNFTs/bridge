import { type Config } from "tailwindcss";

export default {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // TODO @YohanTz: Move the colors object away from the extend property once all colors are defined
      colors: {
        // primary
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

        // dark-blue
        "dark-blue-50": "#f2f9fd",
        "dark-blue-100": "#e5f0f9",
        "dark-blue-200": "#c5e2f2",
        "dark-blue-300": "#92c9e7",
        "dark-blue-400": "#58add8",
        "dark-blue-500": "#3292c5",
        "dark-blue-600": "#2376a6",
        "dark-blue-700": "#1d5e87",
        "dark-blue-800": "#1c5070",
        "dark-blue-900": "#1c445e",
        "dark-blue-950": "#163349",
      },
      fontFamily: {
        "styrene-a": ["var(--font-styrene-a)"],
        "ark-project": ["var(--font-ark-project)"],
      },
      spacing: {
        "13": "3.25rem",
        "15.5": "3.875rem",
        "18": "4.5rem",
        "23": "5.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
