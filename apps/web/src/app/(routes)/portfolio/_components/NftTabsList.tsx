import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";

import NftTabsTrigger from "./NftTabsTrigger";

export default function NftTabsList() {
  const { totalCount: l1NftsTotalCount } = useInfiniteEthereumNfts();

  const { totalCount: l1CollectionsTotalCount } =
    useInfiniteEthereumCollections();

  const { totalCount: l2NftsTotalCount } = useInfiniteStarknetNfts();

  const { totalCount: l2CollectionsTotalCount } =
    useInfiniteStarknetCollections();

  return (
    <>
      <NftTabsTrigger
        className="ml-auto"
        tabName="All nfts"
        tabValue="all"
        totalCount={l1NftsTotalCount + l2NftsTotalCount}
      />
      <NftTabsTrigger
        tabName="Collections"
        tabValue="collections"
        totalCount={l1CollectionsTotalCount + l2CollectionsTotalCount}
      />
      <NftTabsTrigger
        tabName="Ethereum Nfts"
        tabValue="ethereum"
        totalCount={l1NftsTotalCount}
      />
      <NftTabsTrigger
        className="mr-auto"
        tabName="Starknet Nfts"
        tabValue="starknet"
        totalCount={l2NftsTotalCount}
      />
    </>
  );
}
