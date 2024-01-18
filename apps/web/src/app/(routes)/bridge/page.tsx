"use client";

import { Typography } from "design-system";

import MainPageContainer from "../../_components/MainPageContainer";
import NftTransferSummary from "./_components/NftTransferSummary";
import TargetChainSwitch from "./_components/TargetChainSwitch";
import TokenList from "./_components/TokenList";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page() {
  return (
    <div className="flex">
      <MainPageContainer>
        <Typography className="mt-13" component="h1" variant="heading_light_l">
          Where do you want to move
          <br />
          your digital goods?
        </Typography>

        <TargetChainSwitch />

        <TokenList />
      </MainPageContainer>

      <NftTransferSummary />
    </div>
  );
}
