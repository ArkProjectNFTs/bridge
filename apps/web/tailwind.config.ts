import { type Config } from "tailwindcss";
import sharedConfig from "tailwind-config/tailwind.config";

export default {
  content: [...sharedConfig.content, "../../packages/**/*.{js,ts,jsx,tsx}"],
  presets: [sharedConfig],
} satisfies Config;
