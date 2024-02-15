import { useAccount } from "@starknet-react/core";

import { api } from "~/utils/api";

export default function useInfiniteStarknetCollections() {
  const { address: starknetAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.l2Nfts.getNftCollectionsByWallet.useInfiniteQuery(
      {
        address: starknetAddress ?? "",
      },
      {
        enabled: starknetAddress !== undefined,
        // getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    totalCount,
  };
}
