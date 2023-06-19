"use client";

import { useState } from "react";
import TargetChainSwitch from "./components/TargetChainSwitch";
import TokenList from "./components/TokenList";
import NftTransferDrawer from "./components/NftTransferDrawer";
import { type Chain } from "./helpers";
import { useLocalStorage } from "usehooks-ts";
import { Typography } from "design-system";

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
      <main className="mx-auto mt-[8.125rem] w-full max-w-7xl px-4 text-center">
        <Typography component="h1" className="mb-8" variant="heading_light_l">
          Where do you want to move
          <br />
          your digital goods?
        </Typography>
        <TargetChainSwitch
          targetChain={targetChain}
          setTargetChain={setTargetChain}
        />
        {/* <p className="mb-10 text-xl">
          Select the assets you want to transfer to {targetChain}
        </p> */}
        <Typography component="p" variant="body_text_20" className="mb-10">
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
