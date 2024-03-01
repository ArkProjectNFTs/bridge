import clsx from "clsx";
import { Button, Typography } from "design-system";

import useNftSelection from "../_hooks/useNftSelection";
import useTransferStarknetNfts from "../_hooks/useTransferStarknetNfts";

export default function TransferStarknetNftsAction() {
  const { totalSelectedNfts } = useNftSelection();
  const { depositTokens, isSigning } = useTransferStarknetNfts();

  const disabled = totalSelectedNfts === 0 || isSigning;

  return (
    <Button
      className={clsx(
        "mt-8 h-12 flex-shrink-0 transition-colors",
        disabled
          ? "cursor-no-drop bg-asteroid-grey-300 text-white opacity-50 dark:bg-primary-source dark:text-galaxy-blue"
          : "bg-galaxy-blue text-white hover:bg-space-blue-700 dark:bg-primary-source dark:text-galaxy-blue dark:hover:bg-primary-400"
      )}
      onClick={() => !disabled && void depositTokens()}
      size="small"
    >
      {isSigning ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        <Typography variant="button_text_s">
          Confirm transfer to Ethereum
        </Typography>
      )}
    </Button>
  );
}
