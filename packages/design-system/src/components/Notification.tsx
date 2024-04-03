import clsx from "clsx";
import { Typography } from "./Typography";

const variants = {
  mantis_green:
    "bg-mantis-green-100 dark:bg-mantis-green-300 dark:text-mantis-green-900 text-mantis-green-800",
  playground_purple:
    "bg-playground-purple-100 text-playground-purple-800 dark:bg-playground-purple-300 dark:text-playground-purple-900",
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
        "p-3 rounded-xl gap-2.5 flex items-center",
      )}
    >
      {icon}
      <Typography variant="body_text_14" component="p">
        {children}
      </Typography>
    </div>
  );
}
