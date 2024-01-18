import { type Config } from "tailwindcss";
import sharedConfig from "tailwind-config/tailwind.config";

export default {
  content: sharedConfig.content,
  presets: [sharedConfig],
} satisfies Config;
