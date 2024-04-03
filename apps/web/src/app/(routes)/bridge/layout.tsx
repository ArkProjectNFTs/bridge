"use client";

import { Typography } from "design-system";

import MainPageContainer from "../../_components/MainPageContainer";
import TargetChainSwitch from "./_components/TargetChainSwitch";
import TransferNftsSummary from "./_components/TransferNftsSummary";

// TODO @YohanTz: Refactor when the UX is finalized
export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <MainPageContainer>
        <Typography className="mt-13" component="h1" variant="heading_light_l">
          {/* Where do you want to move
          <br />
          your digital goods? */}
          Where do you want to move <br />
          your Everai?
        </Typography>

        <TargetChainSwitch />

        {children}
      </MainPageContainer>

      <TransferNftsSummary />
    </div>
  );
}
