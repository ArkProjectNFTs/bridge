import { useAccount } from "wagmi";

import { api } from "~/utils/api";

export default function useInfiniteEthereumCollections() {
  const { address: ethereumAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.nfts.getL1NftCollectionsByWallet.useInfiniteQuery(
      {
        address: ethereumAddress ?? "",
      },
      {
        enabled: ethereumAddress !== undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  // We can take pages[0] because totalCount is the same accross all different pages
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, totalCount };
}
