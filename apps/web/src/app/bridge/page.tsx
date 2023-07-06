"use client";

import { Typography } from "design-system";

import useCurrentChain from "../../hooks/useCurrentChain";
import MainPageContainer from "../components/MainPageContainer";
import NftTransferDrawer from "./components/NftTransferSummary";
import TargetChainSwitch from "./components/TargetChainSwitch";
import TokenList from "./components/TokenList";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page() {
  const { targetChain } = useCurrentChain();

  return (
    <div className="flex">
      <MainPageContainer>
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
      </MainPageContainer>

      <NftTransferDrawer />
    </div>
  );
}
