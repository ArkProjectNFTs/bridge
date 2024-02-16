"use client";

import clsx from "clsx";

interface IconButtonProps {
  className?: string;
  icon: React.ReactElement;
  onClick: () => void;
}

export function IconButton({ className, icon, onClick }: IconButtonProps) {
  return (
    <button
      className={clsx(
        className,
        "flex h-8 w-8 items-center justify-center rounded-full border-2 border-asteroid-grey-600 bg-transparent text-asteroid-grey-600 transition-[border_color] hover:border-asteroid-grey-800 hover:text-asteroid-grey-800 dark:border-space-blue-400 dark:text-space-blue-400 dark:hover:border-space-blue-200 dark:hover:text-space-blue-200",
      )}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
