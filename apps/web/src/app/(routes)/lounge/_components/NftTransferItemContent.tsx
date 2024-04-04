import * as Collapsible from "@radix-ui/react-collapsible";
import { Typography } from "design-system";
import Image from "next/image";

import Media from "~/app/_components/Media";
import { type Chain } from "~/app/_types";
import { api } from "~/utils/api";

import NftTransferStatus from "./NftTransferStatus";

interface NftTransferItemContentProps {
  arrivalChain: Chain;
  contractAddress: string;
  displayedArrivalAddress: string;
  open: boolean;
  status:
    | "deposit_initiated_l1"
    | "deposit_initiated_l2"
    | "error"
    | "withdraw_available_l1"
    | "withdraw_completed_l1"
    | "withdraw_completed_l2";
  tokenIds: Array<string>;
}

interface NftTransferItemContentLoadingStateProps {
  totalCount: number;
}

function NftTransferItemContentLoadingState({
  totalCount,
}: NftTransferItemContentLoadingStateProps) {
  return (
    <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-[collapsible-up_300ms_ease] data-[state=open]:animate-[collapsible-down_300ms_ease]">
      <div className="flex overflow-hidden rounded-b-2xl border-x border-b border-asteroid-grey-100 bg-white px-6 py-8 dark:border-space-blue-800 dark:bg-space-blue-900">
        <div className="mr-4 w-0.5 rounded-full bg-asteroid-grey-100 dark:bg-space-blue-800" />
        <div className="flex w-full flex-col gap-4">
          {Array(totalCount)
            .fill(0)
            .map((_, index) => {
              return (
                <div className="flex items-center gap-4" key={index}>
                  <div className="h-13 w-13 rounded-[0.25rem] bg-asteroid-grey-100 dark:bg-space-blue-800" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-44 rounded-full bg-asteroid-grey-100 dark:bg-space-blue-800" />
                    <div className="h-4 w-18 rounded-full bg-asteroid-grey-100 dark:bg-space-blue-800" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </Collapsible.Content>
  );
}

export default function NftTransferItemContent({
  arrivalChain,
  contractAddress,
  displayedArrivalAddress,
  open,
  status,
  tokenIds,
}: NftTransferItemContentProps) {
  const { data: l1Nfts } = api.l1Nfts.getNftMetadataBatch.useQuery(
    {
      contractAddress,
      tokenIds,
    },
    {
      enabled: open && arrivalChain === "Starknet",
    }
  );
  const { data: l2Nfts } = api.l2Nfts.getNftMetadataBatch.useQuery(
    {
      contractAddress,
      tokenIds,
    },
    {
      enabled: open && arrivalChain === "Ethereum",
    }
  );

  const nfts = arrivalChain === "Starknet" ? l1Nfts : l2Nfts;

  if (nfts === undefined) {
    return <NftTransferItemContentLoadingState totalCount={tokenIds.length} />;
  }

  return (
    <Collapsible.Content className="data-[state=closed]:animate-[collapsible-up_150ms_ease] data-[state=open]:animate-[collapsible-down_150ms_ease]">
      <div className="flex overflow-hidden rounded-b-2xl border-x border-b border-asteroid-grey-100 bg-white px-6 py-8  dark:border-space-blue-800 dark:bg-space-blue-900">
        <div className="mr-4 w-0.5 rounded-full bg-asteroid-grey-100 dark:bg-space-blue-800" />
        <div className="flex w-full flex-col gap-4 ">
          {nfts.map((nft) => {
            return (
              <div key={nft.tokenName}>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start items-center">
                  <div className="flex items-center gap-4">
                    <Media
                      alt="nft"
                      className="flex-shrink-0 rounded-md"
                      height={52}
                      media={nft.media}
                      width={52}
                    />
                    <div className="text-left">
                      <Typography component="p" variant="body_text_14">
                        {nft.collectionName}
                      </Typography>
                      <Typography component="p" variant="body_text_bold_14">
                        {nft.tokenName}
                      </Typography>
                    </div>
                  </div>
                  <NftTransferStatus status={status} />

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
              </div>
            );
          })}
        </div>
      </div>
    </Collapsible.Content>
  );
}
