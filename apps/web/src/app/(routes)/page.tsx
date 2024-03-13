"use client";

import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { Typography } from "design-system";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount as useEthereumAccount } from "wagmi";

import ConnectWalletsButton from "../_components/ConnectWalletsButton";
import Footer from "../_components/Footer";

export default function Page() {
  const { address: starknetAddress } = useStarknetAccount();
  const { address: ethereumAddress } = useEthereumAccount();

  const router = useRouter();

  useEffect(() => {
    if (starknetAddress !== undefined && ethereumAddress !== undefined) {
      void router.push("/bridge");
    }
  }, [starknetAddress, ethereumAddress, router]);

  return (
    <>
      <div className="flex">
        <main className="mx-auto mt-[5.75rem] flex h-[calc(100vh-12.875rem)] w-full justify-center overflow-hidden text-center">
          <Image
            alt="Everai"
            className="-mr-8 mt-8 h-full w-auto"
            height={580}
            src="/medias/everai_samourai_1.png"
            width={549}
          />
          <div className="flex w-full min-w-[35.125rem] flex-col items-center justify-center gap-8">
            <Image
              alt="background"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
              height={674}
              src="/medias/home_background.png"
              width={1510}
            />
            <div className="flex items-center gap-2 rounded-full bg-void-black px-3 py-2 text-white">
              <Typography
                className="rounded-full bg-space-blue-source px-1.5 py-0.5"
                variant="button_text_xs"
              >
                New
              </Typography>
              <Typography component="p" variant="body_text_14">
                Bridging is an ArkProject Quest
              </Typography>
              <a className="" href="/">
                <Typography
                  className="text-space-blue-source underline"
                  variant="body_text_14"
                >
                  See more quests
                </Typography>
              </a>
            </div>

            <Typography
              className="text-white"
              component="h1"
              variant="heading_light_l"
            >
              Start moving your Everai
              <br />
              on Starknet
            </Typography>

            <Typography
              className="text-asteroid-grey-200"
              component="p"
              variant="body_text_16"
            >
              Bridge your Everai NFTs and complete your first
              <br />
              ArkProject quests.
            </Typography>
            <ConnectWalletsButton />
          </div>
          <Image
            alt="Everai"
            className="-ml-8 mt-8 h-full w-auto"
            height={580}
            src="/medias/everai_samourai_2.png"
            width={549}
          />
        </main>
      </div>
      <Footer />
    </>
  );
}
