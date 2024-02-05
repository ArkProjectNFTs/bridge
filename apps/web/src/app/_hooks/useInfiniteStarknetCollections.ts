import { useAccount } from "@starknet-react/core";

import { api } from "~/utils/api";

export default function useInfiniteStarknetCollections() {
  const { address: starknetAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.nfts.getL2NftCollectionsByWallet.useInfiniteQuery(
      {
        address: starknetAddress ?? "",
      },
      {
        enabled: starknetAddress !== undefined,
        // getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  // TODO @YohanTz: Get totalCount from the api when implemented
  const totalCount = data?.pages[0]?.collections?.length ?? 0;

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    totalCount,
  };
}
