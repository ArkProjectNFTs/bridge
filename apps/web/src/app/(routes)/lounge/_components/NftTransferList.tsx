"use client";
import clsx from "clsx";
import { Typography } from "design-system";

import NftsEmptyState from "~/app/_components/NftsEmptyState";
import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { api } from "~/utils/api";

import NftTransferItem from "./NftTransferItem";
import NftTransferListLoadingState from "./NftTransferListLoadingState";

interface NftTransferHeaderProps {
  className?: string;
  status: "past" | "transit";
  totalCount: number;
}

function NftTransferHeader({
  className,
  status,
  totalCount,
}: NftTransferHeaderProps) {
  return (
    <div
      className={clsx(
        className,
        "grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start px-6 text-galaxy-blue dark:text-space-blue-300"
      )}
    >
      <Typography component="p" variant="button_text_l">
        Nfts {status === "past" ? "transfered" : "in transit"} ({totalCount})
      </Typography>
      <Typography className="ml-3" component="p" variant="button_text_l">
        Transfer status
      </Typography>
      <Typography className="ml-2" component="p" variant="button_text_l">
        Arrival
      </Typography>
    </div>
  );
}

interface NftTransferListProps {
  className?: string;
  showPending?: boolean;
}

export default function NftTransferList({
  className,
  showPending = true,
}: NftTransferListProps) {
  const { targetChain } = useCurrentChain();
  const { address } = useAccountFromChain(targetChain);

  const { data: bridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: address ?? "",
      },
      { enabled: address !== undefined, refetchInterval: 5000 }
    );

  if (bridgeRequests === undefined) {
    // Loading state
    return <NftTransferListLoadingState />;
  }

  if (
    bridgeRequests.inTransit.requests.length === 0 &&
    bridgeRequests.past.requests.length === 0
  ) {
    return (
      <>
        <NftsEmptyState className="mb-5 mt-14" type="collection" />
        <Typography className="my-14" component="p" variant="body_text_18">
          There is nothing there...
        </Typography>
      </>
    );
  }
  const { inTransit, past } = bridgeRequests;

  return (
    <div className={className}>
      {inTransit.requests.length > 0 && showPending && (
        <>
          <NftTransferHeader
            className="mb-5"
            status="transit"
            totalCount={inTransit.totalCount}
          />
          <div className="mb-16 flex flex-col gap-4">
            {inTransit.requests.map((bridgeRequest) => {
              return (
                <NftTransferItem
                  collectionImage={bridgeRequest.collectionImage}
                  collectionName={bridgeRequest.collectionName}
                  contractAddress={bridgeRequest.collectionSourceAddress}
                  key={bridgeRequest.statusTimestamp}
                  status={bridgeRequest.status}
                  tokenIds={bridgeRequest.tokenIds}
                  totalCount={bridgeRequest.totalCount}
                />
              );
            })}
          </div>
        </>
      )}

      {past.requests.length > 0 && (
        <>
          <Typography
            className="text-left"
            component="h3"
            variant="heading_light_s"
          >
            Your past transactions
          </Typography>
          <hr className="my-5 border-asteroid-grey-100 dark:border-space-blue-700" />

          <NftTransferHeader
            className="mb-5"
            status="past"
            totalCount={past.totalCount}
          />

          <div className="mb-5 flex flex-col gap-4">
            {past.requests.map((bridgeRequest) => {
              return (
                <NftTransferItem
                  collectionImage={bridgeRequest.collectionImage}
                  collectionName={bridgeRequest.collectionName}
                  contractAddress={bridgeRequest.collectionSourceAddress}
                  key={bridgeRequest.statusTimestamp}
                  status={bridgeRequest.status}
                  tokenIds={bridgeRequest.tokenIds}
                  totalCount={bridgeRequest.totalCount}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
