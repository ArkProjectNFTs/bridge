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
        "mt-8 h-12 flex-shrink-0 bg-galaxy-blue text-white transition-colors dark:bg-primary-source dark:text-galaxy-blue",
        disabled
          ? "cursor-no-drop opacity-50"
          : "hover:bg-space-blue-700 dark:hover:bg-primary-400"
      )}
      onClick={() => !disabled && void depositTokens()}
      size="small"
    >
      {isSigning ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          <Typography variant="button_text_s">
            Confirm in your wallet
          </Typography>
        </div>
      ) : (
        <Typography variant="button_text_s">
          Confirm transfer to Ethereum
        </Typography>
      )}
    </Button>
  );
}
