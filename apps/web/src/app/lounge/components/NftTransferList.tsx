"use client";

import * as Toolbar from "@radix-ui/react-toolbar";
import { Button, Typography } from "design-system";
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
      <div className="mt-9 grid grid-cols-2 gap-6 sm:mt-23 sm:grid-cols-5">
        {empty_cards.map((card, index) => {
          return (
            <Image
              alt={card.alt}
              className="display-none h-auto w-full last:hidden sm:last:block"
              height={208}
              key={index}
              src={card.src}
              width={182}
            />
          );
        })}
      </div>
      <Typography
        className="mt-5 sm:mt-16"
        component="p"
        variant="body_text_18"
      >
        There is nothing there...
      </Typography>
    </>
  );
}

const nftTransferData: Array<{
  collectionName: string;
  image: string;
  name: string;
}> = [
  // {
  //   collectionName: "Mekaverse",
  //   image:
  //     "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/c7d56728cd014a242e514b7e5678ac8c",
  //   name: "Meka #1946",
  // },
  // {
  //   collectionName: "Mekaverse",
  //   image:
  //     "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/6a4518d6b802eb23f4bf9814b0886996",
  //   name: "Meka #6521",
  // },
  // {
  //   collectionName: "MekaBot",
  //   image:
  //     "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/58c0df0adf91e4899d9ae9fa352c24bf",
  //   name: "MekaBot #775",
  // },
  // {
  //   collectionName: "Look Up",
  //   image:
  //     "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/413c13070c7327df7f57e1eb1a62e6e1",
  //   name: "Look Up",
  // },
];

export default function NftTransferList() {
  const [displayOption, setDisplayOption] = useState("card");

  return nftTransferData.length === 0 ? (
    <NftTransferEmptyState />
  ) : (
    <div className="mb-6 mt-9 sm:mt-18">
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
            className="hidden overflow-hidden rounded-md border border-[#d3e2e1] dark:border-dark-blue-600 sm:flex"
            type="single"
            value={displayOption}
          >
            <Toolbar.ToggleItem
              className="group grid place-items-center border-r border-[#d3e2e1] px-2 py-1.5 data-[state=on]:bg-[#e4edec] dark:border-dark-blue-600  dark:data-[state=on]:bg-dark-blue-900"
              value="card"
            >
              <svg
                className="stroke-[#3c607c] dark:stroke-dark-blue-600 dark:group-data-[state=on]:stroke-dark-blue-300"
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
                    strokeWidth="1.25"
                    width="5.625"
                    x="2.5"
                    y="2.5"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5594"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="2.5"
                    y="11.875"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5593"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="11.875"
                    y="2.5"
                  />
                  <rect
                    height="5.625"
                    id="Rectangle 5595"
                    rx="1.25"
                    strokeWidth="1.25"
                    width="5.625"
                    x="11.875"
                    y="11.875"
                  />
                </g>
              </svg>
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              className="group grid place-items-center px-2 py-1.5 data-[state=on]:bg-[#e4edec] dark:data-[state=on]:bg-dark-blue-900"
              value="list"
            >
              <svg
                className="fill-[#3c607c] stroke-[#3c607c] dark:fill-dark-blue-600 dark:stroke-dark-blue-600 dark:group-data-[state=on]:fill-dark-blue-300 dark:group-data-[state=on]:stroke-dark-blue-300"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="ArkIcons_small">
                  <rect
                    height="2.5"
                    id="Rectangle 5593"
                    rx="0.625"
                    stroke="none"
                    width="2.5"
                    x="1.25"
                    y="15"
                  />
                  <rect
                    height="2.5"
                    id="Rectangle 5594"
                    rx="0.625"
                    stroke="none"
                    width="2.5"
                    x="1.25"
                    y="8.75"
                  />
                  <rect
                    height="2.5"
                    id="Rectangle 5595"
                    rx="0.625"
                    stroke="none"
                    width="2.5"
                    x="1.25"
                    y="2.5"
                  />
                  <path
                    d="M6.25 3.75H18.125"
                    fill="none"
                    id="Line 587"
                    strokeLinecap="round"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M6.25 10H18.125"
                    fill="none"
                    id="Line 588"
                    strokeLinecap="round"
                    strokeWidth="1.25"
                  />
                  <path
                    d="M6.25 16.25H18.125"
                    fill="none"
                    id="Line 589"
                    strokeLinecap="round"
                    strokeWidth="1.25"
                  />
                </g>
              </svg>
            </Toolbar.ToggleItem>
          </Toolbar.ToggleGroup>
        </Toolbar.Root>
      </div>

      {displayOption === "card" ? (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-5">
          {nftTransferData.map((nft, index) => {
            return (
              <NftTransferCard
                arrivalDate="10/09/2023 - 2.43pm"
                image={nft.image}
                key={index}
                name={nft.name}
                status="error"
              />
            );
          })}
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <Typography
                className="pb-5 pl-6"
                component="th"
                variant="button_text_l"
              >
                Nfts in transit ({nftTransferData.length})
              </Typography>
              <Typography
                className="pb-5"
                component="th"
                variant="button_text_l"
              >
                Transfer status
              </Typography>
              <Typography
                className="pb-5"
                component="th"
                variant="button_text_l"
              >
                Arrival
              </Typography>
              <Typography
                className=" pb-5 pr-6 text-right"
                component="th"
                variant="button_text_l"
              >
                Grid options
              </Typography>
            </tr>
          </thead>

          <tbody className="rounded-3xl">
            {nftTransferData.map((nft, index) => {
              return (
                <tr className="group" key={index}>
                  <td
                    className={`bg-white pb-4 pl-6 group-first:rounded-ss-3xl group-first:pt-6 group-last:rounded-es-3xl`}
                  >
                    <div className="flex gap-4 ">
                      <Image
                        alt="nft image"
                        className="rounded-lg"
                        height={52}
                        src={nft.image}
                        width={52}
                      />
                      <div className="flex flex-col gap-1.5">
                        <Typography variant="body_text_14">
                          {nft.collectionName}
                        </Typography>
                        <Typography variant="body_text_bold_14">
                          {nft.name}
                        </Typography>
                      </div>
                    </div>
                  </td>

                  <td className="bg-white pb-4 group-first:pt-6">
                    {/* TODO @YohanTz: Extract this badge to its own component (used in cards also) */}
                    <Typography
                      className="mt-3 rounded-full bg-red-100 px-2 py-1 text-center"
                      variant="button_text_xs"
                    >
                      Transfer in progress ...
                    </Typography>
                  </td>
                  <td className=" bg-white pb-4 group-first:pt-6">
                    <div className="flex gap-10">
                      <div className="flex flex-col">
                        <Typography
                          className="text-[#686c73]"
                          variant="body_text_12"
                        >
                          Estimated arrival
                        </Typography>
                        <Typography variant="button_text_s">
                          10/09/2023 - 2:43pm
                        </Typography>
                      </div>
                      <Button variant="s">Stop transfer</Button>
                    </div>
                  </td>
                  <td className="bg-white pb-4 pr-6 text-right group-first:rounded-se-3xl group-first:pt-6 group-last:rounded-ee-3xl">
                    +
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
