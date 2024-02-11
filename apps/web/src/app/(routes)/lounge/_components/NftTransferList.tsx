import { Typography } from "design-system";

import useAccountFromChain from "~/app/_hooks/useAccountFromChain";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { api } from "~/utils/api";

import NftTransferItem from "./NftTransferItem";

interface NftTransferHeaderProps {
  className?: string;
}

function NftTransferHeader({ className }: NftTransferHeaderProps) {
  return (
    <div
      className={`${className} grid grid-cols-[1fr_1fr_1fr_1fr_2.25rem] place-items-start px-6 text-galaxy-blue dark:text-space-blue-300`}
    >
      <Typography component="p" variant="button_text_l">
        Nfts transfered (8)
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
}

export default function NftTransferListt({ className }: NftTransferListProps) {
  const { targetChain } = useCurrentChain();
  const { address } = useAccountFromChain(targetChain);

  const { data: bridgeRequests } =
    api.bridgeRequest.getBridgeRequestsFromAddress.useQuery(
      {
        address: address ?? "",
      },
      { enabled: address !== undefined, refetchInterval: 3000 }
    );

  if (bridgeRequests === undefined) {
    // Loading state
    return <></>;
  }

  if (bridgeRequests.length === 0) {
    // Empty state
    return <></>;
  }

  return (
    <div className={className}>
      <Typography
        className="text-left"
        component="h3"
        variant="heading_light_s"
      >
        Your past transactions
      </Typography>
      <hr className="my-5 border-asteroid-grey-100 dark:border-space-blue-700" />

      <NftTransferHeader className="mb-5" />

      <div className="flex flex-col gap-4">
        {bridgeRequests.map((bridgeRequest) => {
          return (
            <NftTransferItem
              contractAddress={bridgeRequest.collectionSourceAddress}
              tokenIds={bridgeRequest.tokenIds}
              totalCount={bridgeRequest.totalCount}
            />
          );
        })}
      </div>
    </div>
  );
}
