import * as Toolbar from "@radix-ui/react-toolbar";
import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

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
  const [displayOption, setDisplayOption] = useState("list");

  return nftTransferData.length === 0 ? (
    <NftTransferEmptyState />
  ) : (
    <div className="mb-6 mt-18">
      <div className="flex justify-between">
        <Typography variant="button_text_l">
          Nfts in transit ({nftTransferData.length})
        </Typography>
        <Toolbar.Root>
          <Toolbar.ToggleGroup
            onValueChange={(value) => {
              if (value) {
                setDisplayOption(value);
              }
            }}
            aria-label="Display options"
            className="flex overflow-hidden rounded-md border border-[#d3e2e1] dark:border-dark-blue-600"
            type="single"
            value={displayOption}
          >
            <Toolbar.ToggleItem
              className="grid place-items-center border-r border-[#d3e2e1] stroke-[#3c607c] px-2 py-1.5 data-[state=on]:bg-[#e4edec] dark:border-dark-blue-600 dark:stroke-dark-blue-600 dark:data-[state=on]:bg-dark-blue-900 dark:data-[state=on]:stroke-dark-blue-300"
              value="card"
            >
              <svg
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="ArkIcons_small">
                  <rect
                    height="5.625"
                    id="Rectangle 5592"
                    rx="1.25"
                    stroke-width="1.25"
                    width="5.625"
                    x="2.5"
                    y="2.5"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5594"
                    rx="1.25"
                    stroke-width="1.25"
                    width="5.625"
                    x="2.5"
                    y="11.875"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5593"
                    rx="1.25"
                    stroke-width="1.25"
                    width="5.625"
                    x="11.875"
                    y="2.5"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5595"
                    rx="1.25"
                    stroke-width="1.25"
                    width="5.625"
                    x="11.875"
                    y="11.875"
                  />
                </g>
              </svg>
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              className="grid place-items-center fill-[#3c607c] stroke-[#3c607c]  px-2 py-1.5 data-[state=on]:bg-[#e4edec] dark:fill-dark-blue-600 dark:stroke-dark-blue-600 dark:data-[state=on]:bg-dark-blue-900 dark:data-[state=on]:fill-dark-blue-300 dark:data-[state=on]:stroke-dark-blue-300"
              value="list"
            >
              <svg
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="ArkIcons_small">
                  <rect
                    fill="#3C607C"
                    height="2.5"
                    id="Rectangle 5593"
                    rx="0.625"
                    width="2.5"
                    x="1.25"
                    y="15"
                  />
                  <rect
                    fill="#3C607C"
                    height="2.5"
                    id="Rectangle 5594"
                    rx="0.625"
                    width="2.5"
                    x="1.25"
                    y="8.75"
                  />
                  <rect
                    fill="#3C607C"
                    height="2.5"
                    id="Rectangle 5595"
                    rx="0.625"
                    width="2.5"
                    x="1.25"
                    y="2.5"
                  />
                  <path
                    d="M6.25 3.75H18.125"
                    id="Line 587"
                    stroke="#3C607C"
                    stroke-linecap="round"
                    stroke-width="1.25"
                  />
                  <path
                    d="M6.25 10H18.125"
                    id="Line 588"
                    stroke="#3C607C"
                    stroke-linecap="round"
                    stroke-width="1.25"
                  />
                  <path
                    d="M6.25 16.25H18.125"
                    id="Line 589"
                    stroke="#3C607C"
                    stroke-linecap="round"
                    stroke-width="1.25"
                  />
                </g>
              </svg>
            </Toolbar.ToggleItem>
          </Toolbar.ToggleGroup>
        </Toolbar.Root>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-5">
        {nftTransferData.map((nft) => {
          return (
            <NftTransferCard
              arrivalDate="10/09/2023 - 2.43pm"
              image=""
              name={nft.name}
              status="error"
            />
          );
        })}
      </div>
    </div>
  );
}
