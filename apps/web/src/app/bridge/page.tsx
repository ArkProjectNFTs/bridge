"use client";

import { Typography } from "design-system";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";

import NftTransferDrawer from "./components/NftTransferDrawer";
import TargetChainSwitch from "./components/TargetChainSwitch";
import TokenList from "./components/TokenList";
import { type Chain } from "./helpers";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page() {
  // TODO @YohanTz: Use custom hook to manage the local storage of selected Nfts (by chain + by address)
  const [selectedNftIds, setSelectedNftIds] = useState<Array<string>>([]);
  const [targetChain, setTargetChain] = useLocalStorage<Chain>(
    "chain",
    "Ethereum"
  );

  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-7xl px-4 text-center">
        <Typography className="mt-13" component="h1" variant="heading_light_l">
          Where do you want to move
          <br />
          your digital goods?
        </Typography>
        <TargetChainSwitch
          setTargetChain={setTargetChain}
          targetChain={targetChain}
        />
        <Typography className="mb-20" component="p" variant="body_text_20">
          Select the assets you want to transfer to {targetChain}
        </Typography>
        <TokenList
          selectedNftIds={selectedNftIds}
          setSelectedNftIds={setSelectedNftIds}
        />
      </main>
      <NftTransferDrawer
        selectedNftIds={selectedNftIds}
        setSelectedNftIds={setSelectedNftIds}
        targetChain={targetChain}
      />
    </div>
  );
}
