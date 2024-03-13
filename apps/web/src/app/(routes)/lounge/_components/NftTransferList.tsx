"use client";
import clsx from "clsx";
import { Typography } from "design-system";
import { useState } from "react";

import CollectionNftsEmptyState from "~/app/_components/CollectionNftsEmptyState";
import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";
import { api } from "~/utils/api";

import NftTransferItem from "./NftTransferItem";
import NftTransferListLoadingState from "./NftTransferListLoadingState";
import SuccessWithdrawModal from "./SuccessWithdrawModal.tsx";

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
  showPending?: boolean;
}

export default function NftTransferList({
  className,
  showPending = true,
}: NftTransferListProps) {
  const { targetChain } = useCurrentChain();
  const { address } = useAccountFromChain(targetChain);
  const isFullyConnected = useIsFullyConnected();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const { data: bridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: address ?? "",
      },
      { enabled: isFullyConnected, refetchInterval: 10000 }
    );

  if (bridgeRequests === undefined || !isFullyConnected) {
    return <NftTransferListLoadingState />;
  }

  if (
    bridgeRequests.inTransit.requests.length === 0 &&
    bridgeRequests.past.requests.length === 0
  ) {
    return showPending ? (
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
          <div className="mb-20 flex flex-col gap-4">
            {inTransit.requests.map((bridgeRequest) => {
              return (
                <NftTransferItem
                  arrivalAddress={bridgeRequest.arrivalAddress}
                  collectionImage={bridgeRequest.collectionImage}
                  collectionName={bridgeRequest.collectionName}
                  contractAddress={bridgeRequest.collectionSourceAddress}
                  key={`${bridgeRequest.statusTimestamp}-$${bridgeRequest.collectionName}}`}
                  onWithdrawSuccess={() => setWithdrawModalOpen(true)}
                  requestContent={bridgeRequest.requestContent}
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

          <div className="mb-20 flex flex-col gap-4">
            {past.requests.map((bridgeRequest) => {
              return (
                <NftTransferItem
                  arrivalAddress={bridgeRequest.arrivalAddress}
                  arrivalTimestamp={bridgeRequest.arrivalTimestamp}
                  collectionImage={bridgeRequest.collectionImage}
                  collectionName={bridgeRequest.collectionName}
                  contractAddress={bridgeRequest.collectionSourceAddress}
                  key={bridgeRequest.statusTimestamp}
                  onWithdrawSuccess={() => setWithdrawModalOpen(true)}
                  requestContent={bridgeRequest.requestContent}
                  status={bridgeRequest.status}
                  tokenIds={bridgeRequest.tokenIds}
                  totalCount={bridgeRequest.totalCount}
                />
              );
            })}
          </div>
        </>
      )}
      <SuccessWithdrawModal
        onOpenChange={setWithdrawModalOpen}
        open={withdrawModalOpen}
      />
    </div>
  );
}
