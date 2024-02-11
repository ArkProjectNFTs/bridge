import * as Collapsible from "@radix-ui/react-collapsible";
import { Typography } from "design-system";
import { useState } from "react";

import NftTransferItemContent from "./NftTransferItemContent";
import NftTransferStatus from "./NftTransferStatus";

interface NftTransferItemProps {
  contractAddress: string;
  tokenIds: Array<string>;
  totalCount: number;
}

export default function NftTransferItem({
  contractAddress,
  tokenIds,
  totalCount,
}: NftTransferItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root onOpenChange={setOpen} open={open}>
      <div
        className={`grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start items-center border border-asteroid-grey-100 bg-white p-6 dark:border-space-blue-700 dark:bg-space-blue-800 ${
          open ? "rounded-t-2xl" : "rounded-2xl"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16  flex-shrink-0 rounded-md bg-space-blue-700" />
          <div className="text-left">
            <Typography component="p" variant="body_text_bold_14">
              Everai Collection
            </Typography>
            <Typography component="p" variant="body_text_14">
              ID: 123121312
            </Typography>
            <Typography
              className="dark:text-space-blue-300"
              component="p"
              variant="body_text_14"
            >
              {totalCount} {totalCount > 1 ? "Nfts" : "Nft"}
            </Typography>
          </div>
        </div>

        <NftTransferStatus className="ml-3" status="withdraw_completed_l1" />

        <div className="ml-2 flex items-center gap-2">
          <Typography component="p" variant="button_text_s">
            kwiss.stark
          </Typography>
        </div>

        <div></div>

        <Collapsible.Trigger asChild>
          <button className="flex h-9 w-9 items-center justify-center justify-self-end rounded-md border-2 border-asteroid-grey-600 text-2xl text-asteroid-grey-600 dark:border-space-blue-300 dark:text-space-blue-300">
            {open ? "-" : "+"}
          </button>
        </Collapsible.Trigger>
      </div>

      <NftTransferItemContent
        contractAddress={contractAddress}
        open={open}
        tokenIds={tokenIds}
      />
    </Collapsible.Root>
  );
}
