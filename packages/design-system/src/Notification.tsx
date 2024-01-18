import { Typography } from "./Typography";

const variants = {
  gas_fee:
    "bg-mantis-green-100 dark:bg-mantis-green-300 dark:text-mantis-green-900 text-mantis-green-800",
};

interface NotificationsProps {
  className: string;
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
      className={`${variants[variant]} ${className} p-3 rounded-xl gap-2.5 flex `}
    >
      {icon}
      <Typography variant="body_text_14" component="p">
        {children}
      </Typography>
    </div>
  );
}
