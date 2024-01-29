"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Button, Typography } from "design-system";
import { useAccount as useEthereumAccount } from "wagmi";

import NftCard from "~/app/_components/NftCard/NftCard";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";
import { api } from "~/utils/api";

interface NftTabsTriggerProps {
  className?: string;
  nftNumber: number;
  tabName: string;
  tabValue: string;
}

function NftTabsTrigger({
  className,
  nftNumber,
  tabName,
  tabValue,
}: NftTabsTriggerProps) {
  return (
    <Tabs.Trigger
      className={`group flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#e4edec] py-1.5 pl-3 pr-2 data-[state=active]:bg-night-blue-source data-[state=active]:text-white dark:bg-dark-blue-900 dark:data-[state=active]:bg-sunshine-yellow-400 dark:data-[state=active]:text-night-blue-source ${
        className || ""
      }`}
      value={tabValue}
    >
      <Typography variant="button_text_s">{tabName}</Typography>
      <Typography
        className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-sunshine-yellow-400 px-1 text-night-blue-source dark:text-dark-blue-900 dark:group-data-[state=active]:bg-night-blue-source dark:group-data-[state=active]:text-sunshine-yellow-400"
        variant="button_text_xs"
      >
        {nftNumber}
      </Typography>
    </Tabs.Trigger>
  );
}

export default function NftsTabs() {
  const { address: starknetAddress } = useStarknetAccount();

  const { data: l2Nfts } = api.nfts.getL2NftsByCollection.useQuery(
    {
      address: starknetAddress ?? "",
    },
    { enabled: starknetAddress !== undefined }
  );

  const {
    data: l1NftsData,
    fetchNextPage: fetchNextL1NftsPage,
    hasNextPage: hasNextL1NftsPage,
    isFetchingNextPage: isFetchingNextL1NftsPage,
    totalCount: l1NftsTotalCount,
  } = useInfiniteEthereumNfts();

  const {
    data: l1CollectionsData,
    fetchNextPage: fetchNextL1CollectionsPage,
    hasNextPage: hasNextL1CollectionsPage,
    isFetchingNextPage: isFetchingNextL1CollectionsPage,
    totalCount: l1CollectionsTotalCount,
  } = useInfiniteEthereumCollections();

  const {
    data: l2NftsData,
    fetchNextPage: fetchNextL2NftsPage,
    hasNextPage: hasNextL2NftsPage,
    isFetchingNextPage: isFetchingNextL2NftsPage,
    totalCount: l2NftsTotalCount,
  } = useInfiniteStarknetNfts();

  const {
    data: l2CollectionsData,
    fetchNextPage: fetchNextL2CollectionsPage,
    hasNextPage: hasNextL2CollectionsPage,
    isFetchingNextPage: isFetchingNextL2CollectionsPage,
    totalCount: l2CollectionsTotalCount,
  } = useInfiniteStarknetCollections();

  if (
    l1NftsData === undefined ||
    l2NftsData === undefined ||
    l1CollectionsData === undefined ||
    l2CollectionsData === undefined
  ) {
    return <NftsLoadingState className="mt-18" />;
  }

  return (
    <Tabs.Root className="mt-18" defaultValue="all">
      <Tabs.List className="flex items-center gap-4 overflow-x-scroll">
        <NftTabsTrigger
          className="ml-auto"
          nftNumber={l1NftsTotalCount + l2NftsTotalCount}
          tabName="All nfts"
          tabValue="all"
        />
        <NftTabsTrigger
          nftNumber={l1CollectionsTotalCount + l2CollectionsTotalCount}
          tabName="Collections"
          tabValue="collections"
        />
        <NftTabsTrigger
          nftNumber={l1NftsTotalCount}
          tabName="Ethereum Nfts"
          tabValue="ethereum"
        />
        <NftTabsTrigger
          className="mr-auto"
          nftNumber={l2NftsTotalCount}
          tabName="Starknet Nfts"
          tabValue="starknet"
        />
      </Tabs.List>

      <div className="mb-4 mt-10.5">
        <Tabs.Content
          className="grid grid-cols-2 gap-5 sm:grid-cols-5"
          value="all"
        >
          {/* {l1Nfts.raw.map((nft) => {
            return (
              <NftCard
                title={
                  nft.title.length > 0
                    ? nft.title
                    : `${nft.collectionName} #${nft.tokenId}`
                }
                cardType="nft"
                chain="Ethereum"
                image={nft.image}
                isSelected={false}
                key={nft.id}
              />
            );
          })}
          {l2Nfts.raw.map((nft) => {
            return (
              <NftCard
                title={
                  nft.title.length > 0
                    ? nft.title
                    : `${nft.collectionName} #${nft.tokenId}`
                }
                cardType="nft"
                chain="Starknet"
                image={nft.image}
                isSelected={false}
                key={nft.id}
              />
            );
          })} */}
        </Tabs.Content>
        <Tabs.Content value="collections">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
            {/* TODO @YohanTz: Add Starknet here */}
            {l1CollectionsData.pages.map((page) => {
              return page.contracts.map((nftContract) => {
                return (
                  <NftCard
                    cardType="collection"
                    chain="Ethereum"
                    image={nftContract.media[0]?.thumbnail}
                    isSelected={false}
                    key={nftContract.address}
                    numberOfNfts={nftContract.totalBalance}
                    title={nftContract.name ?? nftContract.symbol ?? ""}
                  />
                );
              });
            })}
          </div>
          <div className="mx-auto mt-14 flex w-full justify-center">
            {isFetchingNextL1CollectionsPage ? (
              <div>Loading...</div>
            ) : hasNextL1CollectionsPage ? (
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              <Button onClick={() => fetchNextL1CollectionsPage()} size="small">
                Load more
              </Button>
            ) : null}
          </div>

          {Object.entries(l2Nfts.byCollection).map(([collectionName, nfts]) => {
            return (
              <NftCard
                cardType="collection"
                chain="Starknet"
                image={nfts[0]?.image}
                isSelected={false}
                key={collectionName}
                numberOfNfts={nfts.length}
                title={collectionName}
              />
            );
          })}
        </Tabs.Content>
        <Tabs.Content value="ethereum">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-5">
            {l1NftsData.pages.map((page) => {
              return page.ownedNfts.map((nft) => {
                return (
                  <NftCard
                    title={
                      nft.title.length > 0
                        ? nft.title
                        : `${nft.title ?? nft.contract.name} #${nft.tokenId}`
                    }
                    cardType="nft"
                    chain="Ethereum"
                    image={nft.media[0]?.thumbnail}
                    isSelected={false}
                    key={`${nft.contract.address}-${nft.tokenId}`}
                  />
                );
              });
            })}
          </div>
          <div className="mx-auto mt-14 flex w-full justify-center">
            {isFetchingNextL1NftsPage ? (
              <div>Loading...</div>
            ) : hasNextL1NftsPage ? (
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              <Button onClick={() => fetchNextL1NftsPage()} size="small">
                Load more
              </Button>
            ) : null}
          </div>
        </Tabs.Content>
        <Tabs.Content
          className="grid grid-cols-2 gap-5 sm:grid-cols-5"
          value="starknet"
        >
          {l2NftsData.pages.map((page) => {
            return page.nfts.map((nft) => {
              return (
                <NftCard
                  title={
                    nft.metadata?.normalized?.name?.length ?? 0 > 0
                      ? nft.metadata?.normalized?.name
                      : `#${nft.token_id}`
                  }
                  cardType="nft"
                  chain="Starknet"
                  image={nft.metadata?.normalized?.image}
                  isSelected={false}
                  key={`${nft.contract_address}-${nft.token_id}`}
                />
              );
            });
          })}
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
