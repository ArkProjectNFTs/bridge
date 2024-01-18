import Image from "next/image";
import { useTheme } from "next-themes";

import { useIsSSR } from "~/app/_hooks/useIsSSR";

export default function DarkModeButton() {
  const isSSR = useIsSSR();
  const { setTheme, theme } = useTheme();

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
    <button className="shrink-0" onClick={toggleTheme}>
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
