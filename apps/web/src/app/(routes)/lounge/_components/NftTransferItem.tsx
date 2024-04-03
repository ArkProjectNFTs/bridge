import * as Collapsible from "@radix-ui/react-collapsible";
import { useStarkName } from "@starknet-react/core";
import clsx from "clsx";
import { MinusIcon, PlusIcon, Typography } from "design-system";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useEnsName } from "wagmi";

import Media from "~/app/_components/Media";
import { type Chain } from "~/app/_types";

import NftTransferItemContent from "./NftTransferItemContent";
import NftTransferStatus from "./NftTransferStatus";
import WithdrawButton from "./WithdrawButton";

interface NftTransferItemProps {
  arrivalAddress: string;
  arrivalChain: Chain;
  arrivalTimestamp?: number;
  collectionImage: string | undefined;
  collectionName: string;
  contractAddress: string;
  onWithdrawSuccess: () => void;
  requestContent: Array<string>;
  status:
    | "deposit_initiated_l1"
    | "deposit_initiated_l2"
    | "error"
    | "withdraw_available_l1"
    | "withdraw_completed_l1"
    | "withdraw_completed_l2";
  tokenIds: Array<string>;
  totalCount: number;
}

function getDisplayedDate(timestamp?: number) {
  if (timestamp === undefined) {
    return;
  }

  const date = new Date(timestamp * 1000);

  return `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}`;
}

export default function NftTransferItem({
  arrivalAddress,
  arrivalChain,
  arrivalTimestamp,
  collectionImage,
  collectionName,
  contractAddress,
  onWithdrawSuccess,
  requestContent,
  status,
  tokenIds,
  totalCount,
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
    <Collapsible.Root
      className="overflow-hidden"
      onOpenChange={setOpen}
      open={open}
    >
      <div
        className={clsx(
          "grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start items-center border border-asteroid-grey-100 bg-white p-6 transition-[border-radius] dark:border-space-blue-800 dark:bg-space-blue-900",
          open ? "rounded-t-2xl" : "rounded-2xl"
        )}
      >
        <div className="flex items-center gap-4">
          {collectionImage ? (
            <Media
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

        <div className="ml-2 flex flex-col items-start gap-1">
          <Typography variant="button_text_s">
            {getDisplayedDate(arrivalTimestamp)}
          </Typography>
          <div className="flex items-center gap-2">
            {arrivalChain === "Ethereum" ? (
              <Image
                alt="Ethereum"
                height={24}
                src="/logos/ethereum.svg"
                width={24}
              />
            ) : (
              <Image
                alt="Starknet"
                height={24}
                src="/logos/starknet.svg"
                width={24}
              />
            )}

            <Typography component="p" variant="button_text_s">
              {displayedArrivalAddress}
            </Typography>
          </div>
        </div>

        <div>
          {status === "withdraw_available_l1" && (
            <WithdrawButton
              onSuccess={onWithdrawSuccess}
              requestContent={requestContent}
            />
          )}
        </div>

        <Collapsible.Trigger asChild>
          <button className="flex h-9 w-9 items-center justify-center justify-self-end rounded-md border-2 border-asteroid-grey-600 text-2xl text-asteroid-grey-600 transition-colors hover:border-asteroid-grey-800 hover:text-asteroid-grey-800 dark:border-space-blue-400 dark:text-space-blue-400 dark:hover:border-space-blue-200 dark:hover:text-space-blue-200">
            {open ? <MinusIcon /> : <PlusIcon />}
          </button>
        </Collapsible.Trigger>
      </div>

      <NftTransferItemContent
        arrivalChain={arrivalChain}
        contractAddress={contractAddress}
        displayedArrivalAddress={displayedArrivalAddress}
        open={open}
        status={status}
        tokenIds={tokenIds}
      />
    </Collapsible.Root>
  );
}
