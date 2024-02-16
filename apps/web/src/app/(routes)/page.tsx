import { Typography } from "design-system";
import Image from "next/image";

import ConnectWalletsButton from "../_components/ConnectWalletsButton";
import Footer from "../_components/Footer";

export default function Page() {
  return (
    <>
      <div className="flex">
        <main className="mx-auto mt-[5.75rem] flex w-full text-center">
          <div className="flex h-[calc(100vh-12.875rem)] w-full flex-col items-center justify-center gap-8">
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
        </main>
      </div>
      <Footer />
    </>
  );
}
