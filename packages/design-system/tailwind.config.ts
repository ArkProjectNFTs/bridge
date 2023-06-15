import { type Config } from "tailwindcss";
import sharedConfig from "tailwind-config/tailwind.config";

export default {
  content: sharedConfig.content,
  prefix: "ds-",
  presets: [sharedConfig],
} satisfies Config;
