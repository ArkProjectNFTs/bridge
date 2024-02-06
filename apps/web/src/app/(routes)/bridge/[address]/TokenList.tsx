/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { Button, Typography } from "design-system";

import InfiniteScrollButton from "~/app/_components/InfiniteScrollButton";
import NftCard from "~/app/_components/NftCard/NftCard";
import NftsEmptyState from "~/app/_components/NftsEmptyState";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";

import useNftSelection, { MAX_SELECTED_ITEMS } from "../_hooks/useNftSelection";

interface TokenListProps {
  nftContractAddress: string;
}

export default function TokenList({ nftContractAddress }: TokenListProps) {
  const { sourceChain } = useCurrentChain();

  const {
    deselectAllNfts,
    isNftSelected,
    selectBatchNfts,
    selectedCollectionAddress,
    toggleNftSelection,
    totalSelectedNfts,
  } = useNftSelection();

  const {
    data: l1NftsData,
    fetchNextPage: fetchNextl1NftsPage,
    hasNextPage: hasNextl1NftsPage,
    isFetchingNextPage: isFetchingNextl1NftsPage,
    totalCount: l1NftsTotalCount,
  } = useInfiniteEthereumNfts({ contractAddress: nftContractAddress });

  const {
    data: l2NftsData,
    fetchNextPage: fetchNextl2NftsPage,
    hasNextPage: hasNextl2NftsPage,
    isFetchingNextPage: isFetchingNextl2NftsPage,
    totalCount: l2NftsTotalCount,
  } = useInfiniteStarknetNfts({ contractAddress: nftContractAddress });

  // TODO @YohanTz: Extract to a hook
  const data = sourceChain === "Ethereum" ? l1NftsData : l2NftsData;
  const fetchNextPage =
    sourceChain === "Ethereum" ? fetchNextl1NftsPage : fetchNextl2NftsPage;
  const hasNextPage =
    sourceChain === "Ethereum" ? hasNextl1NftsPage : hasNextl2NftsPage;
  const isFetchingNextPage =
    sourceChain === "Ethereum"
      ? isFetchingNextl1NftsPage
      : isFetchingNextl2NftsPage;
  const totalCount =
    sourceChain === "Ethereum" ? l1NftsTotalCount : l2NftsTotalCount;

  if (data === undefined) {
    return <NftsLoadingState className="mt-20" />;
  }

  if (data.pages[0]?.ownedNfts.length === 0) {
    return <NftsEmptyState className="mt-20" />;
  }

  const hasMoreThan100Nfts =
    data.pages.length > 1 || (data.pages.length === 1 && hasNextPage);

  const isAllSelected =
    (totalSelectedNfts === MAX_SELECTED_ITEMS ||
      totalSelectedNfts === data.pages[0]?.ownedNfts.length) &&
    nftContractAddress === selectedCollectionAddress;

  return (
    <div className="mb-4 flex flex-col items-start">
      <div className="mb-10 flex w-full flex-wrap justify-between gap-3.5">
        <div className="flex max-w-full items-center gap-3.5">
          <Typography ellipsable variant="heading_light_s">
            {/* {data.pages[0]?.ownedNfts[0]?.contract.name ??
              data.pages[0]?.ownedNfts[0]?.contract.symbol}{" "} */}
            Collection
          </Typography>
          <Typography
            className="shrink-0 rounded-full bg-primary-source px-2 py-1.5 text-white"
            variant="body_text_12"
          >
            {totalCount}
            {totalCount > 1 ? " Nfts" : " Nft"}
          </Typography>
        </div>
        {isAllSelected ? (
          <Button color="default" onClick={deselectAllNfts} size="small">
            Deselect All
          </Button>
        ) : (
          <Button
            onClick={() => {
              selectBatchNfts(data.pages[0]?.ownedNfts ?? []);
            }}
            color="default"
            size="small"
          >
            <Typography variant="button_text_s">
              {hasMoreThan100Nfts ? "Select 100 Max" : "Select All"}
            </Typography>
          </Button>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {data.pages.map((page) => {
          return page.ownedNfts.map((ownedNft) => {
            const isSelected = isNftSelected(
              ownedNft.tokenId,
              ownedNft.contractAddress
            );

            return (
              <NftCard
                onClick={() =>
                  toggleNftSelection(ownedNft.tokenId, ownedNft.contractAddress)
                }
                cardType="nft"
                chain={sourceChain}
                image={ownedNft.image}
                isSelected={isSelected}
                key={ownedNft.tokenId}
                title={ownedNft.name}
              />
            );
          });
        })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14"
        fetchNextPage={() => fetchNextPage()}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
