import { useAccount } from "wagmi";

import { api } from "~/utils/api";

export default function useInfiniteEthereumCollections(params?: {
  pageSize?: number;
}) {
  const { address: ethereumAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.l1Nfts.getNftCollectionsByWallet.useInfiniteQuery(
      {
        address: ethereumAddress ?? "",
        pageSize: params?.pageSize,
      },
      {
        enabled: ethereumAddress !== undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  // We can take pages[0] because totalCount is the same accross all different pages
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
