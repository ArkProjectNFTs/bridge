import { Typography } from "design-system";
import Image from "next/image";

import emptyCard1 from "../../public/medias/empty_card_1.png";
import emptyCard2 from "../../public/medias/empty_card_2.png";
import emptyCard3 from "../../public/medias/empty_card_3.png";
import emptyCard4 from "../../public/medias/empty_card_4.png";
import emptyCard5 from "../../public/medias/empty_card_5.png";
import ConnectWalletsButton from "./components/ConnectWalletsButton";
import MainPageContainer from "./components/MainPageContainer";

const empty_cards = [
  { alt: "empty Nft card 1", src: emptyCard1 },
  { alt: "empty Nft card 2", src: emptyCard2 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 4", src: emptyCard4 },
  { alt: "empty Nft card 5", src: emptyCard5 },
];

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

        <div className="rounded-3xl bg-white p-6 dark:bg-dark-blue-900">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            {empty_cards.map((card) => {
              return (
                <Image
                  alt={card.alt}
                  className="h-auto w-full last:hidden sm:last:block"
                  height={208}
                  key={card.alt}
                  src={card.src}
                  width={182}
                />
              );
            })}
          </div>
          <Typography
            className="mt-5 sm:mt-16"
            component="p"
            variant="body_text_20"
          >
            In this space, you can explore and enjoy your digital treasures from
            any blockchain.
          </Typography>
        </div>
      </MainPageContainer>
    </div>
  );
}
