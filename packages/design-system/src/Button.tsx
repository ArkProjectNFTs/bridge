"use client";

import { Typography } from "./Typography";

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant: "xl" | "l" | "s" | "xs";
  // leftIcon?: React.ReactElement;
  // rightIcon?: React.ReactElement;
}

export function Button({ children, className, onClick, variant }: ButtonProps) {
  return (
    <button
      className={`bg-dark-blue-950 flex items-center justify-center rounded-full px-6 py-3.5 text-white ${className} shrink-0`}
      onClick={onClick}
    >
      <Typography variant={`button_text_${variant}`}>{children}</Typography>
    </button>
  );
}
