"use client";
import { Button, Typography } from "design-system";
import Image from "next/image";

import useCurrentChain from "~/hooks/useCurrentChain";

export default function Banner() {
  const { targetChain } = useCurrentChain();

  return (
    // TODO @YohanTz: Padding
    <div className="mt-10 flex items-center gap-11 rounded-3xl bg-primary-300 px-8 py-4 text-dark-blue-950">
      {targetChain === "Ethereum" ? (
        <Image
          alt="lounge banner illustration"
          height={275}
          src="/medias/ethereum_lounge.svg"
          width={345}
        />
      ) : (
        <Image
          alt="lounge banner illustration"
          height={310}
          src="/medias/starknet_lounge.svg"
          width={300}
        />
      )}
      <div className="text-left">
        <Typography component="h1" variant="heading_light_l">
          Welcome to
          <br />
          The {targetChain} Lounge
        </Typography>
        <Typography className="mt-6" component="p" variant="body_text_18">
          Here you can monitor the status of your assets and their smooth
          reception on {targetChain} in real time.
        </Typography>
        <div className="mt-6 flex gap-6">
          <Button variant="s">Move other NFTs</Button>
          <Button variant="s">List on OpenSea</Button>
        </div>
      </div>
    </div>
  );
}
