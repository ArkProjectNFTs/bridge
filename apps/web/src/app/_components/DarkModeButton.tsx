import { DarkModeIcon, LightModeIcon } from "design-system";
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
      {theme === "light" ? <LightModeIcon /> : <DarkModeIcon />}
    </button>
  );
}
