"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useAccount } from "wagmi";
import { api } from "~/utils/api";

import { useState } from "react";
import NftCard from "./NftCard";

type TokenListProps = {
  selectedNftIds: Array<string>;
  setSelectedNftIds: (nfts: Array<string>) => void;
};

const tabs = [
  { label: "All nfts", id: "all" },
  { label: "Collections", id: "collections" },
] as const;

export default function TokenList({
  selectedNftIds,
  setSelectedNftIds,
}: TokenListProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const { address } = useAccount();

  const { data: nfts } = api.nfts.getL1NftsByCollection.useQuery({
    address: address || "",
  });

  function handleNftClick(nftId: string) {
    if (selectedNftIds.includes(nftId)) {
      return setSelectedNftIds(
        selectedNftIds.filter((selectedNftId) => selectedNftId !== nftId)
      );
    }
    setSelectedNftIds([...selectedNftIds, nftId]);
  }

  function handleCollectionClick(collectionName: string) {}

  function selectAll() {
    if (nfts) {
      setSelectedNftIds(nfts.raw.map((nft) => nft.id));
    }
  }

  return (
    <>
      <Tabs.Root
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <Tabs.List className="mb-10 flex w-full justify-between">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              return (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-full bg-neutral-400 px-3 py-1 font-medium text-black data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                >
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </div>
          <button
            className="rounded-full bg-violet-600 px-3 py-1 font-medium"
            onClick={selectAll}
          >
            Select all
          </button>
        </Tabs.List>
        <Tabs.Content
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          value="all"
        >
          {nfts &&
            Object.values(nfts.raw).map((nft) => {
              const isSelected = selectedNftIds.includes(nft.id);

              return (
                <NftCard
                  cardType="nft"
                  image={nft.image}
                  isSelected={isSelected}
                  key={nft.id}
                  onClick={() => handleNftClick(nft.id)}
                  title={nft.title}
                />
              );
            })}
        </Tabs.Content>
        <Tabs.Content
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          value="collections"
        >
          {nfts &&
            Object.entries(nfts.byCollection).map(([collectionName, nfts]) => {
              return (
                <NftCard
                  isSelected={false}
                  cardType="collection"
                  image={nfts[0]?.image}
                  key={collectionName}
                  numberOfNfts={nfts.length}
                  onClick={() => handleCollectionClick(collectionName)}
                  title={collectionName}
                />
              );
            })}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
