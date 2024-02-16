import clsx from "clsx";
import Link from "next/link";

import ConditionalWrapper from "~/app/_components/ConditionalWrapper";
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

  console.log(nftCollectionPages);

  if (nftCollectionPages === undefined) {
    return <NftsLoadingState type="collection" />;
  } else if (nftCollectionPages[0]?.collections.length === 0) {
    return <NftsEmptyState type="collection" />;
  }

  return (
    <div className="mb-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {nftCollectionPages.map((nftCollectionPage) => {
        return nftCollectionPage.collections.map((nftCollection) => {
          return (
            <ConditionalWrapper
              wrapper={(children) =>
                nftCollection.isBridgeable ? (
                  <Link
                    href={`/bridge/${nftCollection.contractAddress}`}
                    key={nftCollection.contractAddress}
                  >
                    {children}
                  </Link>
                ) : (
                  <>{children}</>
                )
              }
            >
              <NftCard
                isSelected={
                  nftCollection.contractAddress === selectedCollectionAddress
                }
                cardType="collection"
                chain={sourceChain}
                className={clsx(!nftCollection.isBridgeable && "opacity-40")}
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
