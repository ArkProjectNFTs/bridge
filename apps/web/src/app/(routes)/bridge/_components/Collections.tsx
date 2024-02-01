import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";

import CollectionGrid from "./CollectionGrid";
import CollectionHeader from "./CollectionHeader";

export default function Collections() {
  const { sourceChain } = useCurrentChain();

  const { data: l1CollectionsData, totalCount: l1CollectionsTotalCount } =
    useInfiniteEthereumCollections();
  const { data: l2CollectionsData, totalCount: l2CollectionsTotalCount } =
    useInfiniteStarknetCollections();

  const pages =
    sourceChain === "Ethereum"
      ? l1CollectionsData?.pages
      : l2CollectionsData?.pages;

  const totalCount =
    sourceChain === "Ethereum"
      ? l1CollectionsTotalCount
      : l2CollectionsTotalCount;

  return (
    <>
      <CollectionHeader collectionTotalCount={totalCount} />
      <CollectionGrid nftCollectionPages={pages} />
    </>
  );
}
