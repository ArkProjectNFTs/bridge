"use client";
import { Button, Typography } from "design-system";
import Image from "next/image";

export default function Banner() {
  return (
    // TODO @YohanTz: Padding
    <div className="mt-10 flex items-center gap-11 rounded-3xl bg-primary-300 p-8 text-dark-blue-950">
      <Image
        alt="lounge banner illustration"
        height={300}
        src="/medias/lounge.svg"
        width={330}
      />
      <div className="text-left">
        <Typography component="h1" variant="heading_light_l">
          Welcome to
          <br />
          The Starknet Lounge
        </Typography>
        <Typography className="mt-6" component="p" variant="body_text_18">
          Here you can monitor the status of your assets and their smooth
          reception on Starknet in real time.
        </Typography>
        <div className="mt-6 flex gap-6">
          <Button variant="s">Move other NFTs</Button>
          <Button variant="s">List on ArkMarket</Button>
        </div>
      </div>
    </div>
  );
}
