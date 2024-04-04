import * as Tabs from "@radix-ui/react-tabs";

import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";

import NftTabsTrigger from "./NftTabsTrigger";

export default function NftTabsList() {
  const { isLoading: isl1NftsLoading, totalCount: l1NftsTotalCount } =
    useInfiniteEthereumNfts();

  const {
    isLoading: isl1CollectionsLoading,
    totalCount: l1CollectionsTotalCount,
  } = useInfiniteEthereumCollections();

  const { isLoading: isl2NftsLoading, totalCount: l2NftsTotalCount } =
    useInfiniteStarknetNfts();

  const {
    isLoading: isl2CollectionsLoading,
    totalCount: l2CollectionsTotalCount,
  } = useInfiniteStarknetCollections();

  return (
    <Tabs.List className="flex items-center gap-4 overflow-x-auto">
      <NftTabsTrigger
        totalCount={
          l1CollectionsTotalCount === undefined ||
          l2CollectionsTotalCount === undefined
            ? undefined
            : (l1NftsTotalCount ?? 0) + (l2NftsTotalCount ?? 0)
        }
        className="ml-auto"
        isLoading={isl1NftsLoading || isl2NftsLoading}
        tabName="All nfts"
        tabValue="all"
      />
      <NftTabsTrigger
        totalCount={
          l1CollectionsTotalCount === undefined ||
          l2CollectionsTotalCount === undefined
            ? undefined
            : (l1CollectionsTotalCount ?? 0) + (l2CollectionsTotalCount ?? 0)
        }
        isLoading={isl1CollectionsLoading || isl2CollectionsLoading}
        tabName="Collections"
        tabValue="collections"
      />
      <NftTabsTrigger
        isLoading={isl1NftsLoading}
        tabName="Ethereum Nfts"
        tabValue="ethereum"
        totalCount={l1NftsTotalCount}
      />
      <NftTabsTrigger
        className="mr-auto"
        isLoading={isl2NftsLoading}
        tabName="Starknet Nfts"
        tabValue="starknet"
        totalCount={l2NftsTotalCount}
      />
    </Tabs.List>
  );
}
