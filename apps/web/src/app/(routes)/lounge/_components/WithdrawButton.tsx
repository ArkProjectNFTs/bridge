import { Typography } from "design-system";

import useL1Withdraw from "../_hooks/useL1Withdraw";

interface WithdrawButtonProps {
  onSuccess: () => void;
  requestContent: Array<string>;
}

export default function WithdrawButton({
  onSuccess,
  requestContent,
}: WithdrawButtonProps) {
  const { isSigning, isWithdrawLoading, withdraw } = useL1Withdraw({
    onSuccess,
  });

  const disabled = isSigning || isWithdrawLoading;

  return (
    <button
      className="flex h-9 w-36 items-center justify-center rounded-md bg-galaxy-blue text-white transition-colors hover:bg-space-blue-700 disabled:pointer-events-none dark:bg-white dark:text-space-blue-900 dark:hover:bg-space-blue-200"
      disabled={disabled}
      onClick={() => !disabled && withdraw(requestContent)}
    >
      {isSigning || isWithdrawLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        <Typography variant="button_text_s">Withdraw</Typography>
      )}
    </button>
  );
}
