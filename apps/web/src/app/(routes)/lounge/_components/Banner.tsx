"use client";
import { Typography } from "design-system";
import Image from "next/image";
import Link from "next/link";

import useCurrentChain from "~/app/_hooks/useCurrentChain";

export default function Banner() {
  const { targetChain } = useCurrentChain();

  return (
    <div className="mt-8 flex flex-col-reverse items-center gap-11 overflow-hidden rounded-3xl bg-primary-source px-6 pt-8 text-space-blue-900 md:mt-10 md:flex-row md:px-8 md:py-4">
      <div className="flex shrink-0 items-center justify-center">
        {targetChain === "Ethereum" ? (
          <Image
            alt="lounge banner illustration"
            className="relative top-[60px] -mt-[60px] md:top-0 md:mt-0"
            height={330}
            src="/medias/ethereum_lounge.svg"
            width={345}
          />
        ) : (
          <Image
            alt="lounge banner illustration"
            className="relative top-[60px] -mt-[60px] md:top-0 md:mt-0"
            height={330}
            src="/medias/starknet_lounge.svg"
            width={345}
          />
        )}
      </div>
      <div className="text-center md:text-left">
        <Typography component="h1" variant="heading_light_l">
          Welcome to
          <br />
          The {targetChain} Lounge
        </Typography>
        <Typography className="mt-6" component="p" variant="body_text_18">
          Here you can monitor the status of your assets and their smooth
          reception on {targetChain} in real time.
        </Typography>
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <Link
            className="flex items-center justify-center rounded-full bg-space-blue-900 px-6 py-3.5 text-white transition-colors hover:bg-space-blue-800"
            href="/bridge"
          >
            <Typography variant="button_text_s">Move other NFTs</Typography>
          </Link>

          {/* <a
            className="flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-space-blue-900"
            href="https://opensea.io/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Typography variant="button_text_s">List on OpenSea</Typography>
          </a> */}
        </div>
      </div>
    </div>
  );
}
