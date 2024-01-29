import { useAccount } from "@starknet-react/core";

import { api } from "~/utils/api";

export default function useInfiniteStarknetNfts() {
  const { address: starknetAddress } = useAccount();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.nfts.getL2OwnerNftsFromCollection.useInfiniteQuery(
      {
        userAddress: starknetAddress ?? "",
      },
      {
        enabled: starknetAddress !== undefined,
        // getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }
    );

  // TODO @YohanTz: Get totalCount from the api when implemented
  const totalCount = data?.pages[0]?.nfts?.length ?? 0;

  return { data, fetchNextPage, hasNextPage, isFetchingNextPage, totalCount };
}
