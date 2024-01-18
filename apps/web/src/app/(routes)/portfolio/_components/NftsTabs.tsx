"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import { useAccount as useEthereumAccount } from "wagmi";

import NftCard from "~/app/_components/NftCard/NftCard";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
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
  const { address: ethereumAddress } = useEthereumAccount();
  const { address: starknetAddress } = useStarknetAccount();

  const { data: l1Nfts } = api.nfts.getL1NftsByCollection.useQuery(
    {
      address: ethereumAddress ?? "",
    },
    { enabled: ethereumAddress !== undefined }
  );

  const { data: l2Nfts } = api.nfts.getL2NftsByCollection.useQuery(
    {
      address: starknetAddress ?? "",
    },
    { enabled: starknetAddress !== undefined }
  );

  if (l1Nfts === undefined || l2Nfts === undefined) {
    return <NftsLoadingState className="mt-18" />;
  }

  return (
    <Tabs.Root className="mt-18" defaultValue="all">
      <Tabs.List className="flex items-center gap-4 overflow-x-scroll">
        <NftTabsTrigger
          className="ml-auto"
          nftNumber={l1Nfts.raw.length + l2Nfts.raw.length}
          tabName="All nfts"
          tabValue="all"
        />
        <NftTabsTrigger
          // TODO @YohanTz: Wrap in useMemo
          nftNumber={
            Object.keys(l1Nfts.byCollection).length +
            Object.keys(l2Nfts.byCollection).length
          }
          tabName="Collections"
          tabValue="collections"
        />
        <NftTabsTrigger
          nftNumber={l1Nfts.raw.length}
          tabName="Ethereum Nfts"
          tabValue="ethereum"
        />
        <NftTabsTrigger
          className="mr-auto"
          nftNumber={l2Nfts.raw.length}
          tabName="Starknet Nfts"
          tabValue="starknet"
        />
      </Tabs.List>

      <div className="mt-10.5 ">
        <Tabs.Content
          className="grid grid-cols-2 gap-5 sm:grid-cols-5"
          value="all"
        >
          {l1Nfts.raw.map((nft) => {
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
          })}
        </Tabs.Content>
        <Tabs.Content
          className="grid grid-cols-2 gap-5 sm:grid-cols-5"
          value="collections"
        >
          {/* TODO @YohanTz: Add Starknet here */}
          {Object.entries(l1Nfts.byCollection).map(([collectionName, nfts]) => {
            return (
              <NftCard
                cardType="collection"
                chain="Ethereum"
                image={nfts[0]?.image}
                isSelected={false}
                key={collectionName}
                numberOfNfts={nfts.length}
                title={collectionName}
              />
            );
          })}
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
        <Tabs.Content
          className="grid grid-cols-2 gap-5 sm:grid-cols-5"
          value="ethereum"
        >
          {l1Nfts.raw.map((nft) => {
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
        </Tabs.Content>
        <Tabs.Content
          className="grid grid-cols-2 gap-5 sm:grid-cols-5"
          value="starknet"
        >
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
          })}
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
