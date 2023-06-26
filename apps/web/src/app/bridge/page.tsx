"use client";

import { Typography } from "design-system";

import useCurrentChain from "../../hooks/useCurrentChain";
import NftTransferDrawer from "./components/NftTransferDrawer";
import TargetChainSwitch from "./components/TargetChainSwitch";
import TokenList from "./components/TokenList";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page() {
  const { targetChain } = useCurrentChain();

  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-7xl px-4 text-center">
        <Typography className="mt-13" component="h1" variant="heading_light_l">
          Where do you want to move
          <br />
          your digital goods?
        </Typography>

        <TargetChainSwitch />

        <Typography className="mb-20" component="p" variant="body_text_20">
          Select the assets you want to transfer to {targetChain}
        </Typography>

        <TokenList />
      </main>

      <NftTransferDrawer />
    </div>
  );
}
