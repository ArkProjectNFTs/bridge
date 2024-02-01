import Link from "next/link";

import NftCard from "~/app/_components/NftCard/NftCard";
import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import { type Collection } from "~/server/api/types";

import useNftSelection from "../_hooks/useNftSelection";

interface CollectionGridProps {
  nftCollectionPages?: Array<{
    collections: Array<Collection>;
    totalCount: number;
  }>;
}

/*
 * TODO @YohanTz: Take time to optimize the lists with React.memo etc.
 */
export default function CollectionGrid({
  nftCollectionPages,
}: CollectionGridProps) {
  const { sourceChain } = useCurrentChain();
  const { selectedCollectionAddress } = useNftSelection();

  if (nftCollectionPages === undefined) {
    return <NftsLoadingState />;
  } else if (nftCollectionPages.length === 0) {
    return <NftsEmptyState />;
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {nftCollectionPages.map((nftCollectionPage) => {
        return nftCollectionPage.collections.map((nftCollection) => {
          return (
            <Link
              href={`/bridge/${nftCollection.contractAddress}`}
              key={nftCollection.contractAddress}
            >
              <NftCard
                isSelected={
                  nftCollection.contractAddress === selectedCollectionAddress
                }
                cardType="collection"
                chain={sourceChain}
                image={nftCollection.image}
                numberOfNfts={nftCollection.totalBalance}
                onClick={() => {}}
                title={nftCollection.name}
              />
            </Link>
          );
        });
      })}
    </div>
  );
}
