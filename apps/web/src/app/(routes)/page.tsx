import { Typography } from "design-system";
import Image from "next/image";

import emptyCard1 from "../../../public/medias/empty_card_1.png";
import emptyCard2 from "../../../public/medias/empty_card_2.png";
import emptyCard3 from "../../../public/medias/empty_card_3.png";
import emptyCard4 from "../../../public/medias/empty_card_4.png";
import emptyCard5 from "../../../public/medias/empty_card_5.png";
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
