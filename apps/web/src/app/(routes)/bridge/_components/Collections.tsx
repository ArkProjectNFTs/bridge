import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";

import CollectionGrid from "./CollectionGrid";
import CollectionHeader from "./CollectionHeader";

export default function Collections() {
  const { sourceChain } = useCurrentChain();

  const {
    data: l1CollectionsData,
    fetchNextPage: l1FetchNextPage,
    hasNextPage: l1HasNextPage,
    isFetchingNextPage: l1IsFetchingNextPage,
    totalCount: l1CollectionsTotalCount,
  } = useInfiniteEthereumCollections();
  const {
    data: l2CollectionsData,
    fetchNextPage: l2FetchNextPage,
    hasNextPage: l2HasNextPage,
    isFetchingNextPage: l2IsFetchingNextPage,
    totalCount: l2CollectionsTotalCount,
  } = useInfiniteStarknetCollections();

  const pages =
    sourceChain === "Ethereum"
      ? l1CollectionsData?.pages
      : l2CollectionsData?.pages;
  const totalCount =
    sourceChain === "Ethereum"
      ? l1CollectionsTotalCount
      : l2CollectionsTotalCount;
  const hasNextPage =
    sourceChain === "Ethereum" ? l1HasNextPage : l2HasNextPage;
  const fetchNextPage =
    sourceChain === "Ethereum" ? l1FetchNextPage : l2FetchNextPage;
  const isFetchingNextPage =
    sourceChain === "Ethereum" ? l1IsFetchingNextPage : l2IsFetchingNextPage;

  return (
    <>
      <CollectionHeader collectionTotalCount={totalCount} />
      <CollectionGrid
        fetchNextPage={() => void fetchNextPage()}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        nftCollectionPages={pages}
      />
    </>
  );
}
