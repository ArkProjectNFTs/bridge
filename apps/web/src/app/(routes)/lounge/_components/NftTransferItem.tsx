import * as Collapsible from "@radix-ui/react-collapsible";
import clsx from "clsx";
import { Typography } from "design-system";
import Image from "next/image";
import { useMemo, useState } from "react";

import NftTransferItemContent from "./NftTransferItemContent";
import NftTransferStatus from "./NftTransferStatus";
import { useStarkName } from "@starknet-react/core";
import { useEnsName } from "wagmi";

interface NftTransferItemProps {
  collectionImage: string | undefined;
  collectionName: string;
  contractAddress: string;
  status:
    | "deposit_initiated_l1"
    | "deposit_initiated_l2"
    | "error"
    | "withdraw_completed_l1"
    | "withdraw_completed_l2";
  tokenIds: Array<string>;
  totalCount: number;
  arrivalAddress: string;
}

export default function NftTransferItem({
  collectionImage,
  collectionName,
  contractAddress,
  status,
  tokenIds,
  totalCount,
  arrivalAddress,
}: NftTransferItemProps) {
  const [open, setOpen] = useState(false);

  const arrivalShortAddress = useMemo(() => {
    return arrivalAddress
      ? `${arrivalAddress.slice(0, 8)}...${arrivalAddress.slice(-6)}`
      : "";
  }, [arrivalAddress]);

  const { data: starkName } = useStarkName({ address: arrivalAddress });
  const { data: ens } = useEnsName({
    address: arrivalAddress as `0x${string}`,
  });

  const displayedArrivalAddress = starkName ?? ens ?? arrivalShortAddress;

  return (
    <Collapsible.Root onOpenChange={setOpen} open={open}>
      <div
        className={clsx(
          "grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start items-center border border-asteroid-grey-100 bg-white p-6 dark:border-space-blue-800 dark:bg-space-blue-900",
          open ? "rounded-t-2xl" : "rounded-2xl"
        )}
      >
        <div className="flex items-center gap-4">
          {collectionImage ? (
            <Image
              alt="nft"
              className="rounded-lg"
              height={62}
              src={collectionImage}
              width={62}
            />
          ) : (
            <>
              <Image
                alt="empty Nft image"
                className="hidden aspect-square rounded-lg object-cover dark:block"
                height={62}
                src={`/medias/dark/empty_nft.png`}
                width={62}
              />
              <Image
                alt="empty Nft image"
                className="aspect-square rounded-lg object-cover dark:hidden"
                height={62}
                src={`/medias/empty_nft.png`}
                width={62}
              />
            </>
          )}
          <div className="text-left">
            <Typography component="p" variant="body_text_bold_14">
              {collectionName} Collection
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

        <NftTransferStatus className="ml-3" status={status} />

        <div className="ml-2 flex items-center gap-2">
          <Typography component="p" variant="button_text_s">
            {displayedArrivalAddress}
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
        status={status}
        tokenIds={tokenIds}
        displayedArrivalAddress={displayedArrivalAddress}
      />
    </Collapsible.Root>
  );
}
