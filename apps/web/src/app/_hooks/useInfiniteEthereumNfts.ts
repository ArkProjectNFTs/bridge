import { useAccount } from "wagmi";

import { api } from "~/utils/api";

export default function useInfiniteEthereumNfts(params?: {
  contractAddress?: string;
  pageSize?: number;
}) {
  const { address: ethereumAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.l1Nfts.getOwnerNftsFromCollection.useInfiniteQuery(
      {
        contractAddress: params?.contractAddress,
        pageSize: params?.pageSize,
        userAddress: ethereumAddress ?? "",
      },
      {
        enabled: ethereumAddress !== undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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
