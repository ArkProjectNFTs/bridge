import clsx from "clsx";
import { Button, Typography } from "design-system";

import useNftSelection from "../_hooks/useNftSelection";
import useTransferStarknetNfts from "../_hooks/useTransferStarknetNfts";

export default function TransferStarknetNftsAction() {
  const { totalSelectedNfts } = useNftSelection();
  const { depositTokens } = useTransferStarknetNfts();

  return (
    <Button
      className={clsx(
        "mt-8",
        totalSelectedNfts === 0
          ? "cursor-no-drop bg-asteroid-grey-300 text-white opacity-50 dark:bg-primary-source dark:text-galaxy-blue"
          : "bg-galaxy-blue text-white hover:bg-space-blue-700 dark:bg-primary-source dark:text-galaxy-blue dark:hover:bg-primary-400"
      )}
      onClick={depositTokens}
      size="small"
    >
      <Typography variant="button_text_s">
        Confirm transfer to Ethereum
      </Typography>
    </Button>
  );
}
