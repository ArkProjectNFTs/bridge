import clsx from "clsx";
import { Typography } from "./Typography";

const variants = {
  mantis_green:
    "bg-mantis-green-100 dark:bg-mantis-green-300 dark:text-mantis-green-900 text-mantis-green-800",
  playground_purple:
    "bg-playground-purple-100 text-playground-purple-800 dark:bg-playground-purple-300 dark:text-playground-purple-900",
  space_blue:
    "bg-space-blue-100 text-space-blue-800 dark:bg-space-blue-300 dark:text-space-blue-900",
  sunshine_yellow:
    "bg-sunshine-yellow-100 text-sunshine-yellow-800 dark:bg-sunshine-yellow-300 dark:text-sunshine-yellow-900",
  folly_red:
    "bg-folly-red-100 text-folly-red-800 dark:bg-folly-red-300 dark:text-folly-red-900",
};

interface NotificationsProps {
  className?: string;
  children: React.ReactNode;
  variant: keyof typeof variants;
  icon?: React.ReactNode;
}

export function Notification({
  className,
  children,
  variant,
  icon,
}: NotificationsProps) {
  return (
    <div
      className={clsx(
        className,
        variants[variant],
        "p-3 rounded-xl gap-2.5 flex items-start",
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <Typography variant="body_text_14" component="p" className="w-full">
        {children}
      </Typography>
    </div>
  );
}
