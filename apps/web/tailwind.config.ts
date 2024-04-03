import sharedConfig from "tailwind-config/tailwind.config";
import { type Config } from "tailwindcss";

export default {
  content: [...sharedConfig.content, "../../packages/**/*.{js,ts,jsx,tsx}"],
  presets: [sharedConfig],
} satisfies Config;
