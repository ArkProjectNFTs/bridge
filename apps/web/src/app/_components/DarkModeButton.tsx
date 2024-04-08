"use client";

import { DarkModeIcon, LightModeIcon } from "design-system";
import { useTheme } from "next-themes";

import { useIsSSR } from "~/app/_hooks/useIsSSR";

export default function DarkModeButton() {
  const isSSR = useIsSSR();
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    if (resolvedTheme === "light") {
      setTheme("dark");
      return;
    }
    setTheme("light");
  }

  if (isSSR) {
    return null;
  }

  return (
    <button className="h-8 shrink-0 rounded-full" onClick={toggleTheme}>
      {resolvedTheme === "light" ? <LightModeIcon /> : <DarkModeIcon />}
    </button>
  );
}
