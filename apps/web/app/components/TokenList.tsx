"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useAccount } from "wagmi";
import { api } from "~/utils/api";

import Image from "next/image";
import { useState } from "react";
import NftCard from "./NftCard";

export default function TokenList() {
  const [activeTab, setActiveTab] = useState("all");
  const { address } = useAccount();

  const { data: nftsByCollection } = api.nfts.getL1NftsByCollection.useQuery({
    address: address || "",
  });

  const [selectedNfts, setSelectedNfts] = useState([]);

  return (
    <div>
      <Tabs.Root
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <Tabs.List className="mb-10 flex w-full justify-between">
          <div className="flex gap-4">
            <Tabs.Trigger
              value="all"
              className="rounded-full bg-gray-400 px-3 py-1 font-medium text-black data-[state=active]:bg-violet-500 data-[state=active]:text-white"
            >
              All nfts
            </Tabs.Trigger>
            <Tabs.Trigger
              value="collections"
              className="rounded-full bg-gray-400 px-3 py-1 font-medium text-black data-[state=active]:bg-violet-500 data-[state=active]:text-white"
            >
              Collections
            </Tabs.Trigger>
          </div>
          <button className="rounded-full bg-violet-500 px-3 py-1 font-medium">
            Select all
          </button>
        </Tabs.List>
        <Tabs.Content
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          value="all"
        >
          {nftsByCollection &&
            Object.values(nftsByCollection).map((nfts) => {
              return nfts.map((nft) => {
                return (
                  <NftCard
                    key={`${nft.title}-${nft.tokenId}`}
                    title={nft.title}
                    image={nft.image}
                    cardType="nft"
                  />
                );
              });
            })}
        </Tabs.Content>
        <Tabs.Content
          className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          value="collections"
        >
          {nftsByCollection &&
            Object.entries(nftsByCollection).map(([collectionName, nfts]) => {
              return (
                <NftCard
                  key={collectionName}
                  image={nfts[0]?.image}
                  title={collectionName}
                  cardType="collection"
                  numberOfNfts={nfts.length}
                />
              );
            })}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
