import { Typography } from "design-system";

import ConnectWalletsButton from "../_components/ConnectWalletsButton";
import MainPageContainer from "../_components/MainPageContainer";
import NftsEmptyState from "../_components/NftsEmptyState";

export default function Page() {
  return (
    <div className="flex">
      {/* TODO @YohanTz: Extract magic values like this to CSS variable (top-[5.75rem]) */}
      <MainPageContainer>
        <Typography
          className="mt-10.5 sm:mt-15.5"
          component="h1"
          variant="heading_light_l"
        >
          Connect your wallets
          <br />
          to start moving your Digital Goods
        </Typography>

        <ConnectWalletsButton />

        <NftsEmptyState />
        <Typography
          className="mt-5 sm:mt-16"
          component="p"
          variant="body_text_20"
        >
          In this space, you can explore and enjoy your digital treasures from
          any blockchain.
        </Typography>
      </MainPageContainer>
    </div>
  );
}
