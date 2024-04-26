/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { Button, Typography } from "design-system";

import InfiniteScrollButton from "~/app/_components/InfiniteScrollButton";
import NftCard from "~/app/_components/NftCard/NftCard";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import TokenNftsEmptyState from "~/app/_components/TokenNftsEmptyState";
import useCurrentChain from "~/app/_hooks/useCurrentChain";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";
import useIsFullyConnected from "~/app/_hooks/useIsFullyConnected";
import { api } from "~/utils/api";

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

  const isFullyConnected = useIsFullyConnected();

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

  const { data: l1CollectionInfo } = api.l1Nfts.getCollectionInfo.useQuery(
    { contractAddress: nftContractAddress },
    { enabled: sourceChain === "Ethereum" }
  );

  const { data: l2CollectionInfo } = api.l2Nfts.getCollectionInfo.useQuery(
    { contractAddress: nftContractAddress },
    { enabled: sourceChain === "Starknet" }
  );

  // TODO @YohanTz: Extract to a hook
  const collectionData =
    sourceChain === "Ethereum" ? l1CollectionInfo : l2CollectionInfo;
  const nftsData = sourceChain === "Ethereum" ? l1NftsData : l2NftsData;
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

  if (nftsData?.pages[0]?.ownedNfts.length === 0 || !isFullyConnected) {
    return <TokenNftsEmptyState className="mt-20" />;
  }

  if (nftsData === undefined) {
    return <NftsLoadingState className="mt-20" type="token" />;
  }

  // const hasMoreThan100Nfts =
  //   nftsData.pages.length > 1 || (nftsData.pages.length === 1 && hasNextPage);
  const hasMoreThanMaxSelectNfts =
    (nftsData.pages[0]?.ownedNfts.length ?? 0) > MAX_SELECTED_ITEMS;

  const isAllSelected =
    (totalSelectedNfts === MAX_SELECTED_ITEMS ||
      totalSelectedNfts === nftsData.pages[0]?.ownedNfts.length) &&
    nftContractAddress === selectedCollectionAddress;

  return (
    <div className="mb-8 flex flex-col items-start">
      <div className="mb-10 flex w-full flex-wrap justify-between gap-3.5">
        <div className="flex max-w-full items-center gap-3.5">
          <Typography ellipsable variant="heading_light_s">
            {collectionData ? collectionData.name : ""} Collection
          </Typography>
          <Typography
            className="shrink-0 rounded-full bg-space-blue-100 px-2 py-1.5 text-space-blue-source dark:bg-space-blue-800 dark:text-space-blue-400"
            variant="body_text_12"
          >
            {totalCount}
            {totalCount ?? 0 > 1 ? " Nfts" : " Nft"}
          </Typography>
        </div>
        {isAllSelected ? (
          <Button
            className="flex bg-primary-source text-white hover:bg-primary-400 dark:text-galaxy-blue"
            onClick={deselectAllNfts}
            size="small"
          >
            Deselect All
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12L8 8M8 8L12 4M8 8L4 4M8 8L12 12"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Button>
        ) : (
          <Button
            onClick={() => {
              selectBatchNfts(nftsData.pages[0]?.ownedNfts ?? []);
            }}
            color="default"
            size="small"
          >
            <Typography variant="button_text_s">
              {hasMoreThanMaxSelectNfts ? "Select 30 Max" : "Select All"}
            </Typography>
          </Button>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {nftsData.pages.map((page) => {
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
                disabled={isAllSelected && !isSelected}
                isSelected={isSelected}
                key={ownedNft.tokenId}
                media={ownedNft.media}
                title={ownedNft.name}
              />
            );
          });
        })}
      </div>
      <InfiniteScrollButton
        className="mx-auto mt-14"
        fetchAuto
        fetchNextPage={() => fetchNextPage()}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
