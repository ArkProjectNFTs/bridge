import { type ContractForOwner } from "alchemy-sdk";
import Link from "next/link";

import NftCard from "~/app/_components/NftCard/NftCard";
import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";

import useNftSelection from "../_hooks/useNftSelection";

interface CollectionGridProps {
  nftContracts?: Array<ContractForOwner>;
}

/*
 * TODO @YohanTz: Take time to optimize the lists with React.memo etc.
 */
export default function CollectionGrid({ nftContracts }: CollectionGridProps) {
  const { sourceChain } = useCurrentChain();
  const { selectedCollectionAddress } = useNftSelection();

  if (nftContracts === undefined) {
    return <NftsLoadingState />;
  } else if (nftContracts.length === 0) {
    return <NftsEmptyState />;
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {nftContracts.map((nftContract) => {
        return (
          <Link href={`/bridge/${nftContract.address}`}>
            <NftCard
              cardType="collection"
              chain={sourceChain}
              image={nftContract.media[0]?.thumbnail}
              isSelected={nftContract.address === selectedCollectionAddress}
              key={nftContract.address}
              numberOfNfts={nftContract.totalBalance}
              onClick={() => {}}
              title={nftContract.name ?? nftContract.symbol ?? ""}
            />
          </Link>
        );
      })}
    </div>
  );
}
