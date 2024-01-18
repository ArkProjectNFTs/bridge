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
  withdraw_completed_l1: "Successfully transfered",
  withdraw_completed_l2: "Successfully transfered",
};

interface NftCardStatusProps {
  status: keyof typeof variants;
}

export default function NftCardStatus({ status }: NftCardStatusProps) {
  return (
    <>
      <Typography
        className={`${variants[status]} mt-3 rounded-full px-2 py-1 text-center`}
        component="p"
        variant="body_text_12"
      >
        {variantsToStatusText[status]}
      </Typography>
    </>
  );
}
