"use client";

import clsx from "clsx";
import { Typography } from "./Typography";

const colorVariants = {
  default: {
    containerClassName: `bg-galaxy-blue rounded-full hover:bg-space-blue-700
      dark:bg-space-blue-400 dark:hover:bg-space-blue-200`,
    textClassName: "text-white dark:text-space-blue-900",
  },
  // yellow: {},
  // purple: {},
  // red: {},
};

const sizeVariants: Record<
  "large" | "small",
  {
    containerClassName: string;
    typographyVariant: React.ComponentProps<typeof Typography>["variant"];
  }
> = {
  large: {
    containerClassName: "h-15.5 py-3 px-8",
    typographyVariant: "button_text_l",
  },
  small: {
    containerClassName: "h-12 py-3 px-6",
    typographyVariant: "button_text_s",
  },
};

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  color?: keyof typeof colorVariants;
  size: keyof typeof sizeVariants;
  // leftIcon?: React.ReactElement;
  // rightIcon?: React.ReactElement;
}

export function Button({
  children,
  className,
  onClick,
  color,
  size,
}: ButtonProps) {
  return (
    <button
      className={clsx(
        className,
        color !== undefined && colorVariants[color]?.containerClassName,
        sizeVariants[size].containerClassName,
        "flex items-center justify-center rounded-full transition-colors",
      )}
      onClick={onClick}
    >
      <Typography
        component="p"
        variant={sizeVariants[size].typographyVariant}
        className={clsx(
          color !== undefined && colorVariants[color]?.textClassName,
          "flex items-center gap-1",
        )}
      >
        {children}
      </Typography>
    </button>
  );
}
