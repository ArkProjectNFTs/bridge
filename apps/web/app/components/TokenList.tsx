import * as Tabs from "@radix-ui/react-tabs";
import { useAccount } from "wagmi";
import { api } from "~/utils/api";

import { useState } from "react";
import NftCard from "./NftCard";
import { type Nft } from "~/server/api/routers/nfts";

interface TokenListProps {
  selectedNftIds: Array<string>;
  setSelectedNftIds: (nfts: Array<string>) => void;
}

const tabs = [
  { label: "All nfts", id: "all" },
  { label: "Collections", id: "collections" },
] as const;

// TODO @YohanTz: Take time to optimize the lists with React.memo etc.
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
      setSelectedNftIds(
        selectedNftIds.filter((selectedNftId) => selectedNftId !== nftId)
      );
      return;
    }
    setSelectedNftIds([...selectedNftIds, nftId]);
  }

  function handleCollectionClick(
    collectionNfts: Array<Nft>,
    isSelected: boolean
  ) {
    if (nfts === undefined) {
      return;
    }

    let selectedNftIdsCopy = [...selectedNftIds];

    if (isSelected) {
      selectedNftIdsCopy = selectedNftIds.filter((nftId) => {
        return !collectionNfts?.some((nft) => nftId === nft.id);
      });
    } else {
      collectionNfts?.forEach((nft) => {
        if (!selectedNftIds.includes(nft.id)) {
          selectedNftIdsCopy.push(nft.id);
        }
      });
    }

    setSelectedNftIds(selectedNftIdsCopy);
  }

  function selectAll() {
    if (nfts === undefined) {
      return;
    }
    setSelectedNftIds(nfts.raw.map((nft) => nft.id));
  }

  return (
    <>
      {/* TODO @YohanTz: Export Tabs logic to design system package ? */}
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
                  className="rounded-full bg-neutral-200 px-3 py-1 font-medium data-[state=active]:bg-sky-950 data-[state=active]:text-white "
                >
                  {tab.label}
                </Tabs.Trigger>
              );
            })}
          </div>
          <button
            className="rounded-full bg-sky-950 px-3 py-1 font-medium text-white"
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
              const isSelected = nfts.every((nft) =>
                selectedNftIds.includes(nft.id)
              );

              return (
                <NftCard
                  isSelected={isSelected}
                  cardType="collection"
                  image={nfts[0]?.image}
                  key={collectionName}
                  numberOfNfts={nfts.length}
                  onClick={() => handleCollectionClick(nfts, isSelected)}
                  title={collectionName}
                />
              );
            })}
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}
