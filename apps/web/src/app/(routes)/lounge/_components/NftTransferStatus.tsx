import clsx from "clsx";
import { Typography } from "design-system";

import { type BridgeRequestEventStatus } from "~/server/api/routers/bridgeRequest";

const variants: Record<BridgeRequestEventStatus, string> = {
  deposit_initiated_l1:
    "bg-playground-purple-50 text-playground-purple-600 dark:bg-playground-purple-200 dark:text-playground-purple-900",
  deposit_initiated_l2:
    "bg-playground-purple-50 text-playground-purple-600 dark:bg-playground-purple-200 dark:text-playground-purple-900",
  error: "bg-folly-red-50 text-folly-red-source",
  withdraw_completed_l1:
    "bg-mantis-green-50 text-mantis-green-500 dark:bg-mantis-green-200 dark:text-mantis-green-900",
  withdraw_completed_l2:
    "bg-mantis-green-50 text-mantis-green-500 dark:bg-mantis-green-200 dark:text-mantis-green-900",
};

const variantsToStatusText: Record<BridgeRequestEventStatus, string> = {
  deposit_initiated_l1: "Transfer in progress",
  deposit_initiated_l2: "Transfer in progress",
  error: "Error transfer",
  withdraw_completed_l1: "Successfully transferred",
  withdraw_completed_l2: "Successfully transferred",
};

interface NftCardStatusProps {
  className?: string;
  status: keyof typeof variants;
}

export default function NftCardStatus({
  className,
  status,
}: NftCardStatusProps) {
  return (
    <>
      <Typography
        className={clsx(
          className,
          variants[status],
          "flex items-center justify-center rounded-full px-2 py-1 text-center"
        )}
        component="p"
        variant="body_text_12"
      >
        {variantsToStatusText[status]}
        {/* <div className="ml-1 flex items-center gap-0.5">
          <div className="h-1 w-1 animate-bounce rounded-full bg-playground-purple-700" />
          <div className="h-1 w-1 animate-bounce rounded-full bg-playground-purple-700 delay-[0.5s]" />
          <div className="h-1 w-1 animate-bounce rounded-full bg-playground-purple-700" />
        </div> */}
      </Typography>
    </>
  );
}
