import clsx from "clsx";
import { Typography } from "design-system";

import { type BridgeRequestEventStatus } from "~/server/api/routers/bridgeRequest";

const variants: Record<BridgeRequestEventStatus, string> = {
  deposit_initiated_l1:
    "bg-playground-purple-50 text-playground-purple-600 dark:bg-playground-purple-200 dark:text-playground-purple-900",
  deposit_initiated_l2:
    "bg-playground-purple-50 text-playground-purple-600 dark:bg-playground-purple-200 dark:text-playground-purple-900",
  error: "bg-folly-red-50 text-folly-red-source",
  withdraw_available_l1:
    "bg-space-blue-100 text-space-blue-source dark:bg-space-blue-800 dark:text-space-blue-400",
  withdraw_completed_l1:
    "bg-mantis-green-50 text-mantis-green-500 dark:bg-mantis-green-200 dark:text-mantis-green-900",
  withdraw_completed_l2:
    "bg-mantis-green-50 text-mantis-green-500 dark:bg-mantis-green-200 dark:text-mantis-green-900",
};

const variantsToStatusText: Record<BridgeRequestEventStatus, string> = {
  deposit_initiated_l1: "Transfer in progress",
  deposit_initiated_l2: "Transfer in progress",
  error: "Error transfer",
  withdraw_available_l1: "Ready for withdrawal",
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
    <div
      className={clsx(
        className,
        variants[status],
        "flex items-center justify-center gap-2 rounded-full px-2 py-1 text-center"
      )}
    >
      <Typography component="p" variant="body_text_12">
        {variantsToStatusText[status]}
      </Typography>
      {(status === "deposit_initiated_l1" ||
        status === "deposit_initiated_l2") && (
        <div className="flex items-center justify-between">
          <div className="flex w-2 justify-center">
            <div className="h-0 w-0 animate-[loading_1.5s_linear_infinite] rounded-full bg-current" />
          </div>
          <div className="flex w-2 justify-center">
            <div className="h-0 w-0 animate-[loading_1.5s_linear_0.25s_infinite] rounded-full bg-current" />
          </div>
          <div className="flex w-2 justify-center">
            <div className="h-0 w-0 animate-[loading_1.5s_linear_0.5s_infinite] rounded-full bg-current" />
          </div>
        </div>
      )}
    </div>
  );
}
