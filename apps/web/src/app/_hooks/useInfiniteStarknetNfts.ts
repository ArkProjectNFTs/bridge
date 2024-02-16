import { useAccount } from "@starknet-react/core";

import { api } from "~/utils/api";

export default function useInfiniteStarknetNfts(params?: {
  contractAddress?: string;
}) {
  const { address: starknetAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.l2Nfts.getOwnerNftsFromCollection.useInfiniteQuery(
      {
        contractAddress: params?.contractAddress,
        userAddress: starknetAddress ?? "",
      },
      {
        enabled: starknetAddress !== undefined,
        // getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  const totalCount = data?.pages[0]?.totalCount;

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    totalCount,
  };
}
