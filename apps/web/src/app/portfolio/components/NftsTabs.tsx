"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Typography } from "design-system";
import { useAccount as useEthereumAccount } from "wagmi";

import NftCard from "~/app/components/NftCard";
import { api } from "~/utils/api";

interface NftTabsTriggerProps {
  nftNumber: number;
  tabName: string;
  tabValue: string;
}

function NftTabsTrigger({ nftNumber, tabName, tabValue }: NftTabsTriggerProps) {
  return (
    <Tabs.Trigger
      className="group flex items-center gap-2.5 rounded-full bg-[#e4edec] py-1.5 pl-3 pr-2 data-[state=active]:bg-[#1C2F55] data-[state=active]:text-white dark:bg-dark-blue-900 dark:data-[state=active]:bg-primary-400"
      value={tabValue}
    >
      <Typography variant="button_text_s">{tabName}</Typography>
      <Typography
        className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary-300 px-1 text-white dark:text-dark-blue-900 dark:group-data-[state=active]:bg-white dark:group-data-[state=active]:text-primary-400"
        variant="button_text_xs"
      >
        {nftNumber}
      </Typography>
    </Tabs.Trigger>
  );
}

export default function NftsTabs() {
  const { address } = useEthereumAccount();

  const { data: nfts } = api.nfts.getL1NftsByCollection.useQuery(
    {
      address: address ?? "",
    },
    { enabled: address !== undefined }
  );

  if (nfts === undefined) {
    return null;
  }

  return (
    <Tabs.Root className="mt-18" defaultValue="all">
      <Tabs.List className="flex justify-center gap-4">
        <NftTabsTrigger
          nftNumber={nfts.raw.length}
          tabName="All nfts"
          tabValue="all"
        />
        <NftTabsTrigger
          nftNumber={Object.keys(nfts.byCollection).length}
          tabName="Collections"
          tabValue="collections"
        />
        <NftTabsTrigger
          nftNumber={nfts.raw.length}
          tabName="Ethereum Nfts"
          tabValue="ethereum"
        />
        <NftTabsTrigger
          nftNumber={0}
          tabName="Starknet Nfts"
          tabValue="starknet"
        />
      </Tabs.List>

      <div className="mt-10.5 ">
        <Tabs.Content className="grid grid-cols-5 gap-5" value="all">
          {nfts.raw.map((nft) => {
            return (
              <NftCard
                cardType="nft"
                chain="Ethereum"
                image={nft.image}
                isSelected={false}
                key={nft.id}
                title={nft.title}
              />
            );
          })}
        </Tabs.Content>
        <Tabs.Content className="grid grid-cols-5 gap-5" value="collections">
          {Object.entries(nfts.byCollection).map(([collectionName, nfts]) => {
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
        </Tabs.Content>
        <Tabs.Content className="grid grid-cols-5 gap-5" value="ethereum">
          {nfts.raw.map((nft) => {
            return (
              <NftCard
                cardType="nft"
                chain="Ethereum"
                image={nft.image}
                isSelected={false}
                key={nft.id}
                title={nft.title}
              />
            );
          })}
        </Tabs.Content>
        <Tabs.Content className="grid grid-cols-5 gap-5" value="starknet">
          No Starknet Nfts yet
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
