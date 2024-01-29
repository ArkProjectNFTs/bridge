import { useAccount } from "wagmi";

import { api } from "~/utils/api";

export default function useInfiniteEthereumNfts(
  params:
    | {
        contractAddress?: string;
      }
    | undefined
) {
  const { address: ethereumAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.nfts.getL1OwnerNftsFromCollection.useInfiniteQuery(
      {
        contractAddress: params?.contractAddress,
        userAddress: ethereumAddress ?? "",
      },
      {
        enabled: ethereumAddress !== undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, totalCount };
}
