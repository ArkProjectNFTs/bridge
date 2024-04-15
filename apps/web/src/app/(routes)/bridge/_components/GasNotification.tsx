import {
  HighFeesIcon,
  LowFeesIcon,
  MediumFeesIcon,
  Notification,
} from "design-system";
import { type ComponentProps } from "react";

import { api } from "~/utils/api";

interface GasNotificationProps {
  className?: string;
}

function getFeesIcon(gasPrice: number): {
  icon?: React.ReactNode;
  text: string;
  variant: ComponentProps<typeof Notification>["variant"];
} {
  if (gasPrice >= 45) {
    return { icon: <HighFeesIcon />, text: "HIGH", variant: "folly_red" };
  } else if (gasPrice >= 25) {
    return {
      icon: <MediumFeesIcon />,
      text: "MID",
      variant: "sunshine_yellow",
    };
  }
  return { icon: <LowFeesIcon />, text: "LOW", variant: "mantis_green" };
}

export default function GasNotification({ className }: GasNotificationProps) {
  const { data: gasPrice } = api.gasInfo.getCurrentGasPrice.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );

  if (gasPrice === undefined) {
    return null;
  }

  const { icon, text, variant } = getFeesIcon(gasPrice);

  return (
    <Notification className={className} icon={icon} variant={variant}>
      <div className="mt-1.5 flex w-full items-center justify-between">
        <p className="text-asteroid-grey-800 dark:text-asteroid-grey-900">
          Estimated Gas fees
        </p>
        <b>{text}</b>
      </div>
    </Notification>
  );
}
