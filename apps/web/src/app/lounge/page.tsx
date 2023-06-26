"use client";

import { Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/hooks/useCurrentChain";

import emptyCard3 from "../../../public/medias/empty_card_3.png";
import { CHAIN_LOGOS_BY_NAME } from "../helpers";
import Banner from "./components/Banner";

const empty_cards = [
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
  { alt: "empty Nft card 3", src: emptyCard3 },
];

export default function Page() {
  const { setTargetChain, targetChain } = useCurrentChain();

  return (
    <div className="flex">
      <main className="mx-auto mt-[5.875rem] w-full max-w-5xl px-4 text-center">
        <div className="mt-9 inline-flex gap-1 rounded-full border border-[#d3e2e1] bg-[#e4edec] dark:border-dark-blue-600 dark:bg-dark-blue-900">
          <button
            className={`rounded-full border-8 ${
              targetChain === "Ethereum"
                ? "border-primary-300"
                : "border-transparent"
            }`}
            onClick={() => setTargetChain("Ethereum")}
          >
            <Image
              alt="Ethereum logo"
              height={30}
              src={CHAIN_LOGOS_BY_NAME.Ethereum}
              width={30}
            />
          </button>
          <button
            className={`rounded-full border-8 ${
              targetChain === "Starknet"
                ? "border-primary-300"
                : "border-transparent"
            }`}
            onClick={() => setTargetChain("Starknet")}
          >
            <Image
              alt="Ethereum logo"
              height={30}
              src={CHAIN_LOGOS_BY_NAME.Starknet}
              width={30}
            />
          </button>
        </div>

        <Banner />

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
      </main>
    </div>
  );
}
