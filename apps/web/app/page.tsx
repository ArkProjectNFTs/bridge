"use client";

import { useState } from "react";
import TargetChainSwitch from "./components/TargetChainSwitch";
import TokenList from "./components/TokenList";
import NftTransferDrawer from "./components/NftTransferDrawer";

// TODO @YohanTz: Refactor
export default function Page() {
  const [selectedNftIds, setSelectedNftIds] = useState<Array<string>>([]);

  return (
    <div className="flex">
      <main className="mx-auto mt-[112px] w-full max-w-7xl px-4 text-center">
        <h2 className="text-5xl">Where do you want to move?</h2>
        <TargetChainSwitch />
        <p className="mb-10 text-xl">
          Select the assets you want to transfer to Starknet
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
