"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { useAccount as useEthereumAccount } from "wagmi";

import NftCard from "~/app/_components/NftCard/NftCard";
import NftsLoadingState from "~/app/_components/NftsLoadingState";
import useInfiniteEthereumCollections from "~/app/_hooks/useInfiniteEthereumCollections";
import useInfiniteEthereumNfts from "~/app/_hooks/useInfiniteEthereumNfts";
import useInfiniteStarknetCollections from "~/app/_hooks/useInfiniteStarknetCollections";
import useInfiniteStarknetNfts from "~/app/_hooks/useInfiniteStarknetNfts";
import { api } from "~/utils/api";

import NftTabsContent from "./NftTabsContent";
import NftTabsList from "./NftTabsList";

export default function NftsTabs() {
  const { address: starknetAddress } = useStarknetAccount();

  const { data: l2Nfts } = api.nfts.getL2NftsByCollection.useQuery(
    {
      address: starknetAddress ?? "",
    },
    { enabled: starknetAddress !== undefined }
  );

  return (
    <Tabs.Root className="mt-18" defaultValue="all">
      <Tabs.List className="flex items-center gap-4 overflow-x-scroll">
        <NftTabsList />
      </Tabs.List>

      <NftTabsContent />
    </Tabs.Root>
  );
}
