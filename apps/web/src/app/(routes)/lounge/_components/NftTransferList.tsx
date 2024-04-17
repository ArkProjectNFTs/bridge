"use client";
import clsx from "clsx";
import { Typography } from "design-system";

import CollectionNftsEmptyState from "~/app/_components/CollectionNftsEmptyState";
import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";
import { api } from "~/utils/api";

import MarketplacesList from "./MarketplacesList";
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
        Nfts {status === "past" ? "transferred" : "in transit"} ({totalCount})
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
  variant?: "lounge";
}

export default function NftTransferList({
  className,
  variant,
}: NftTransferListProps) {
  const { sourceChain, targetChain } = useCurrentChain();
  const { address: targetAddress } = useAccountFromChain(targetChain);
  const { address: sourceAddress } = useAccountFromChain(sourceChain);
  const isFullyConnected = useIsFullyConnected();

  const { data: targetBridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: targetAddress ?? "",
      },
      { enabled: isFullyConnected, refetchInterval: 10000 }
    );

  const { data: sourceBridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: sourceAddress ?? "",
      },
      { enabled: isFullyConnected, refetchInterval: 10000 }
    );

  if (
    targetBridgeRequests === undefined ||
    !isFullyConnected ||
    sourceBridgeRequests === undefined
  ) {
    return <NftTransferListLoadingState />;
  }

  if (
    targetBridgeRequests.inTransit.requests.length === 0 &&
    targetBridgeRequests.past.requests.length === 0 &&
    (variant !== "lounge" ||
      (sourceBridgeRequests.inTransit.requests.length === 0 &&
        sourceBridgeRequests.past.requests.length === 0))
  ) {
    return variant !== "lounge" ? (
      <>
        <Typography className="mb-5 mt-14" component="p" variant="body_text_18">
          There is nothing there...
        </Typography>
        <CollectionNftsEmptyState className="my-14" />
      </>
    ) : (
      <></>
    );
  }

  const inTransitRequests = targetBridgeRequests.inTransit.requests;
  const inTransitTotalCount = targetBridgeRequests.inTransit.totalCount;
  const pastRequests =
    variant === "lounge"
      ? [
          ...targetBridgeRequests.past.requests,
          ...sourceBridgeRequests?.past.requests,
        ]
      : targetBridgeRequests.past.requests;

  const pastRequestsTotalCount =
    variant === "lounge"
      ? targetBridgeRequests.past.totalCount +
        sourceBridgeRequests.past.totalCount
      : targetBridgeRequests.past.totalCount;

  const showMarketplacesLinks =
    variant === "lounge" || targetChain === "Starknet";

  return (
    <div className={className}>
      {inTransitRequests.length > 0 && variant !== "lounge" && (
        <>
          <NftTransferHeader
            className="mb-5"
            status="transit"
            totalCount={inTransitTotalCount}
          />
          <div className="mb-20 flex flex-col gap-4">
            {inTransitRequests.map((bridgeRequest, index) => {
              return (
                <NftTransferItem
                  arrivalAddress={bridgeRequest.arrivalAddress}
                  arrivalChain={bridgeRequest.arrivalChain}
                  collectionMedia={bridgeRequest.collectionMedia}
                  collectionName={bridgeRequest.collectionName}
                  contractAddress={bridgeRequest.collectionSourceAddress}
                  key={`${bridgeRequest.statusTimestamp}-$${bridgeRequest.collectionName}-${index}}`}
                  requestContent={bridgeRequest.requestContent}
                  status={bridgeRequest.status}
                  tokenIds={bridgeRequest.tokenIds}
                  totalCount={bridgeRequest.totalCount}
                  txHash={bridgeRequest.txHash}
                />
              );
            })}
          </div>
        </>
      )}

      {showMarketplacesLinks && <MarketplacesList />}

      {pastRequests.length > 0 && (
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
            totalCount={pastRequestsTotalCount}
          />

          <div className="mb-20 flex flex-col gap-4">
            {pastRequests.map((bridgeRequest, index) => {
              return (
                <NftTransferItem
                  arrivalAddress={bridgeRequest.arrivalAddress}
                  arrivalChain={bridgeRequest.arrivalChain}
                  arrivalTimestamp={bridgeRequest.arrivalTimestamp}
                  collectionMedia={bridgeRequest.collectionMedia}
                  collectionName={bridgeRequest.collectionName}
                  contractAddress={bridgeRequest.collectionSourceAddress}
                  key={`${bridgeRequest.statusTimestamp}-${index}`}
                  requestContent={bridgeRequest.requestContent}
                  status={bridgeRequest.status}
                  tokenIds={bridgeRequest.tokenIds}
                  totalCount={bridgeRequest.totalCount}
                  txHash={bridgeRequest.txHash}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
