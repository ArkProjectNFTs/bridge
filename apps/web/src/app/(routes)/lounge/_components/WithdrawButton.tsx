import { Typography } from "design-system";

import useL1Withdraw from "../_hooks/useL1Withdraw";

interface WithdrawButtonProps {
  requestContent: Array<string>;
}

export default function WithdrawButton({
  requestContent,
}: WithdrawButtonProps) {
  const { isSigning, withdraw } = useL1Withdraw();

  return (
    <button
      className="flex h-9 w-36 items-center justify-center rounded-md bg-galaxy-blue text-white hover:bg-space-blue-700 dark:bg-space-blue-400 dark:text-space-blue-900 dark:hover:bg-space-blue-200"
      onClick={() => !isSigning && withdraw(requestContent)}
    >
      {isSigning ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        <Typography variant="button_text_s">Withdraw</Typography>
      )}
    </button>
  );
}
