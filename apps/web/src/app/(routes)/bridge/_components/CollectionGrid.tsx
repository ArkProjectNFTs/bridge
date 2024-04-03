import Link from "next/link";

import CollectionNftsEmptyState from "~/app/_components/CollectionNftsEmptyState";
import ConditionalWrapper from "~/app/_components/ConditionalWrapper";
import NftCard from "~/app/_components/NftCard/NftCard";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";
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
  const isFullyConnected = useIsFullyConnected();

  if (nftCollectionPages?.[0]?.collections.length === 0 || !isFullyConnected) {
    return <CollectionNftsEmptyState />;
  }

  if (nftCollectionPages === undefined) {
    return <NftsLoadingState type="collection" />;
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {nftCollectionPages?.map((nftCollectionPage) => {
        return nftCollectionPage.collections.map((nftCollection) => {
          return (
            <ConditionalWrapper
              wrapper={(children) =>
                nftCollection.isBridgeable ? (
                  <Link
                    className="pb-2.5 pl-2.5"
                    href={`/bridge/${nftCollection.contractAddress}`}
                  >
                    {children}
                  </Link>
                ) : (
                  <div className="pb-2.5 pl-2.5">{children}</div>
                )
              }
              key={nftCollection.contractAddress}
            >
              <NftCard
                isSelected={
                  nftCollection.contractAddress === selectedCollectionAddress
                }
                cardType="collection"
                chain={sourceChain}
                disabled={!nftCollection.isBridgeable}
                image={nftCollection.image}
                isBridgeable={nftCollection.isBridgeable}
                numberOfNfts={nftCollection.totalBalance}
                onClick={() => {}}
                title={nftCollection.name}
              />
            </ConditionalWrapper>
          );
        });
      })}
    </div>
  );
}
