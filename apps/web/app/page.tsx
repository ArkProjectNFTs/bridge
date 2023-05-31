"use client";

import { useState } from "react";
import TargetChainSwitch, { Chain } from "./components/TargetChainSwitch";
import TokenList from "./components/TokenList";
import NftTransferDrawer from "./components/NftTransferDrawer";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page() {
  const [selectedNftIds, setSelectedNftIds] = useState<Array<string>>([]);
  const [targetChain, setTargetChain] = useState<Chain>("Ethereum");

  return (
    <div className="flex">
      <main className="mx-auto mt-[112px] w-full max-w-7xl px-4 text-center">
        <h2 className="text-5xl">Where do you want to move?</h2>
        <TargetChainSwitch
          targetChain={targetChain}
          setTargetChain={setTargetChain}
        />
        <p className="mb-10 text-xl">
          Select the assets you want to transfer to {targetChain}
        </p>
        <TokenList
          selectedNftIds={selectedNftIds}
          setSelectedNftIds={setSelectedNftIds}
        />
      </main>
      {selectedNftIds.length && (
        <NftTransferDrawer selectedNftIds={selectedNftIds} />
      )}
    </div>
  );
}
