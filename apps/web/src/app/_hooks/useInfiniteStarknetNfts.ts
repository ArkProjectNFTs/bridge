import { useAccount } from "@starknet-react/core";

import { api } from "~/utils/api";

export default function useInfiniteStarknetNfts(params?: {
  contractAddress?: string;
}) {
  const { address: starknetAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.nfts.getL2OwnerNftsFromCollection.useInfiniteQuery(
      {
        contractAddress: params?.contractAddress,
        userAddress: starknetAddress ?? "",
      },
      {
        enabled: starknetAddress !== undefined,
        // getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  // TODO @YohanTz: Get totalCount from the api when implemented
  const totalCount = data?.pages[0]?.ownedNfts.length ?? 0;

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    totalCount,
  };
}
