import Image from "next/image";
import { useTheme } from "next-themes";

import { useIsSSR } from "~/app/hooks/useIsSSR";

export default function DarkModeButton() {
  const isSSR = useIsSSR();
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    if (theme === "light") {
      setTheme("dark");
      return;
    }
    setTheme("light");
  }

  if (isSSR) {
    return null;
  }

  return (
    <button onClick={toggleTheme}>
      <Image
        src={
          theme === "light" ? "/icons/light_mode.svg" : "/icons/dark_mode.svg"
        }
        alt="light mode icon"
        height={32}
        width={32}
      />
    </button>
  );
}
