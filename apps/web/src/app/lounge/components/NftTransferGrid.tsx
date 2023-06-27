import { Typography } from "design-system";
import Image from "next/image";

import emptyCard3 from "../../../../public/medias/empty_card_3.png";
import NftTransferCard from "./NftTransferCard";

const empty_cards = [
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
];

function NftTransferEmptyState() {
  return (
    <>
      <div className="mt-23 grid grid-cols-2 gap-6 sm:grid-cols-5">
        {empty_cards.map((card, index) => {
          return (
            <Image
              alt={card.alt}
              className="display-none h-auto w-full"
              height={208}
              key={index}
              src={card.src}
              width={182}
            />
          );
        })}
      </div>
      <Typography className="mt-16" component="p" variant="body_text_18">
        There is nothing there...
      </Typography>
    </>
  );
}

const nftTransferData = [
  { name: "Everai #2345" },
  { name: "Everai #2346" },
  { name: "Everai #2347" },
  { name: "Everai #2348" },
];

export default function NftTransferGrid() {
  return nftTransferData.length === 0 ? (
    <NftTransferEmptyState />
  ) : (
    <div className="mb-6 mt-18">
      <div className="flex justify-between">
        <Typography variant="button_text_l">
          Nfts in transit ({nftTransferData.length})
        </Typography>
        <div>
          <button>Card</button>
          <button>List</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-5">
        {nftTransferData.map((nft) => {
          return <NftTransferCard name={nft.name} />;
        })}
      </div>
    </div>
  );
}
