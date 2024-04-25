"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { useStarkName } from "@starknet-react/core";
import clsx from "clsx";
import { MinusIcon, PlusIcon, Typography } from "design-system";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useEnsName } from "wagmi";

import Media from "~/app/_components/Media";
import { type Chain } from "~/app/_types";
import { type NftMedia } from "~/server/api/types";

import NftTransferItemContent from "./NftTransferItemContent";
import NftTransferStatus from "./NftTransferStatus";
import SuccessWithdrawModal from "./SuccessWithdrawModal.tsx";
import WithdrawButton from "./WithdrawButton";

interface NftTransferItemProps {
  arrivalAddress: string;
  arrivalChain: Chain;
  arrivalTimestamp?: number;
  collectionMedia: NftMedia;
  collectionName: string;
  contractAddress: string;
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
  txHash?: string;
}

function getDisplayedDate(timestamp?: number) {
  if (timestamp === undefined) {
    return;
  }

  const date = new Date(timestamp * 1000);

  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${month}/${day}/${year} - ${hours}:${minutes}`;
}

export default function NftTransferItem({
  arrivalAddress,
  arrivalChain,
  arrivalTimestamp,
  collectionMedia,
  collectionName,
  contractAddress,
  requestContent,
  status,
  tokenIds,
  totalCount,
  txHash,
}: NftTransferItemProps) {
  const [open, setOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

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
    <>
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
            <Media
              alt="nft"
              className="rounded-lg"
              height={62}
              media={collectionMedia}
              width={62}
            />
            <div className="text-left">
              <Typography component="p" variant="body_text_bold_14">
                {tokenIds.length === 1
                  ? `${collectionName} #${tokenIds[0]}`
                  : `${collectionName} Collection`}
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
            {arrivalTimestamp !== undefined && (
              <Typography variant="button_text_s">
                {getDisplayedDate(arrivalTimestamp)}
              </Typography>
            )}
            {status === "deposit_initiated_l1" ? (
              <Typography
                className="text-asteroid-grey-400"
                variant="body_text_14"
              >
                Transfer can take few minutes
              </Typography>
            ) : status === "deposit_initiated_l2" ? (
              <Typography
                className="text-asteroid-grey-400"
                variant="body_text_14"
              >
                Transfer can take up to 12 hours
              </Typography>
            ) : null}
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
            {status === "withdraw_available_l1" ? (
              <WithdrawButton
                onSuccess={() => setWithdrawModalOpen(true)}
                requestContent={requestContent}
              />
            ) : status === "withdraw_completed_l1" ||
              status === "withdraw_completed_l2" ? (
              <div className="text-left text-space-blue-source">
                {arrivalChain === "Ethereum" ? (
                  <a href={`https://etherscan.io/tx/${txHash}`}>
                    <Typography
                      className="underline"
                      component="p"
                      variant="body_text_14"
                    >
                      View on Etherscan
                    </Typography>
                  </a>
                ) : (
                  <>
                    <a
                      href={`https://voyager.online/tx/${txHash}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Typography
                        className="underline"
                        component="p"
                        variant="body_text_14"
                      >
                        View on Voyager
                      </Typography>
                    </a>
                    <a
                      href={`https://starkscan.co/tx/${txHash}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Typography
                        className="underline"
                        component="p"
                        variant="body_text_14"
                      >
                        View on Starkscan
                      </Typography>
                    </a>
                  </>
                )}
              </div>
            ) : null}
          </div>

          {totalCount > 1 && (
            <Collapsible.Trigger asChild>
              <button className="flex h-9 w-9 items-center justify-center justify-self-end rounded-md border-2 border-asteroid-grey-600 text-2xl text-asteroid-grey-600 transition-colors hover:border-asteroid-grey-800 hover:text-asteroid-grey-800 dark:border-space-blue-400 dark:text-space-blue-400 dark:hover:border-space-blue-200 dark:hover:text-space-blue-200">
                {open ? <MinusIcon /> : <PlusIcon />}
              </button>
            </Collapsible.Trigger>
          )}
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
      <SuccessWithdrawModal
        collectionMedia={collectionMedia}
        collectionName={collectionName}
        onOpenChange={setWithdrawModalOpen}
        open={withdrawModalOpen}
      />
    </>
  );
}
