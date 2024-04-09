import { type Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      sm: "428px",
      md: "1024px",
      lg: "1366px",
      xl: "1536px",
      "2xl": "1920px",
      "3xl": "2460px",
    },
    extend: {
      keyframes: {
        loading: {
          "0%": { height: "0rem", width: "0rem" },
          "30%": { height: "0.5rem", width: "0.5rem" },
          "60%, 100%": { height: "0rem", width: "0rem" },
        },
        "collapsible-down": {
          from: { height: "0", opacity: "0" },
          to: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",
          },
        },
        "collapsible-up": {
          from: {
            height: "var(--radix-collapsible-content-height)",
            opacity: "1",
          },
          to: { height: "0", opacity: "0" },
        },
      },
      // TODO @YohanTz: Move the colors object away from the extend property once all colors are defined
      colors: {
        // primary
        "primary-source": "var(--color-primary-source)",
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

        // space-blue
        "space-blue-source": "#53ACEC",
        "space-blue-50": "#f7fbff",
        "space-blue-100": "#e9f5fe",
        "space-blue-200": "#aad3f1",
        "space-blue-300": "#83bfe9",
        "space-blue-400": "#73B9EB",
        "space-blue-500": "#4394CD",
        "space-blue-600": "#3B7CA8",
        "space-blue-700": "#306287",
        "space-blue-800": "#1e3d54",
        "space-blue-900": "#0e2230",

        // sunshine-yellow
        "sunshine-yellow-source": "#FCDA29",
        "sunshine-yellow-50": "#FFFBE8",
        "sunshine-yellow-100": "#FFF4BF",
        "sunshine-yellow-200": "#FFEF96",
        "sunshine-yellow-300": "#FFE76A",
        "sunshine-yellow-400": "#FFE24A",
        "sunshine-yellow-500": "#FCCD29",
        "sunshine-yellow-600": "#F5B722",
        "sunshine-yellow-700": "#EE941A",
        "sunshine-yellow-800": "#E77113",
        "sunshine-yellow-900": "#E04E0B",

        // mantis-green
        "mantis-green-source": "#79d06f",
        "mantis-green-50": "#ecf7ea",
        "mantis-green-100": "#E3FADE",
        "mantis-green-200": "#a3d399",
        "mantis-green-300": "#96DC89",
        "mantis-green-400": "#60ac57",
        "mantis-green-500": "#42983d",
        "mantis-green-600": "#288328",
        "mantis-green-700": "#126e18",
        "mantis-green-800": "#0D6513",
        "mantis-green-900": "#06430A",

        // playground-purple
        "playground-purple-source": "#8c62f2",
        "playground-purple-50": "#f8f0ff",
        "playground-purple-100": "#F4E9FF",
        "playground-purple-200": "#DFC3FF",
        "playground-purple-300": "#c39cff",
        "playground-purple-400": "#A774F4",
        "playground-purple-500": "#7D56E5",
        "playground-purple-600": "#754DDF",
        "playground-purple-700": "#6540C6",
        "playground-purple-800": "#5335a6",
        "playground-purple-900": "#3f287f",

        // folly-red
        "folly-red-source": "#f8545c",
        "folly-red-50": "#FFF6F5",
        "folly-red-100": "#FFEBEA",
        "folly-red-200": "#ffaba7",
        "folly-red-300": "#ff8a88",
        "folly-red-400": "#ff6a6e",
        "folly-red-500": "ED424C",
        "folly-red-600": "#d53243",
        "folly-red-700": "#b81c33",
        "folly-red-800": "#970e26",
        "folly-red-900": "#740d1d",

        // asteroid-grey
        "asteroid-grey-50": "#f1f4f7",
        "asteroid-grey-100": "#d8e1ea",
        "asteroid-grey-200": "#c0cddb",
        "asteroid-grey-300": "#a3b2c3",
        "asteroid-grey-400": "#8b9db0",
        "asteroid-grey-500": "#75889d",
        "asteroid-grey-600": "#607488",
        "asteroid-grey-700": "#4d6073",
        "asteroid-grey-800": "#374756",
        "asteroid-grey-900": "#242e37",

        // galaxy-blue
        "galaxy-blue": "#0e2230",

        // void-black
        "void-black": "#071117",
      },
      fontFamily: {
        "styrene-a": ["var(--font-styrene-a)"],
        "ark-project": ["var(--font-ark-project)"],
      },
      spacing: {
        "10.5": "2.625rem",
        "13": "3.25rem",
        "15.5": "3.875rem",
        "18": "4.5rem",
        "23": "5.75rem",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
