import { Typography } from "design-system";

import ConnectWalletsButton from "../_components/ConnectWalletsButton";
import Footer from "../_components/Footer";
import MainPageContainer from "../_components/MainPageContainer";

export default function Page() {
  return (
    <>
      <div className="flex">
        {/* TODO @YohanTz: Extract magic values like this to CSS variable (top-[5.75rem]) */}
        <MainPageContainer>
          <div className="flex h-[calc(100vh-12.875rem)] flex-col items-center justify-center gap-8">
            <div className="flex items-center gap-2 rounded-full bg-void-black px-3 py-2 text-white">
              <Typography
                className="rounded-full bg-space-blue-source px-1.5 py-0.5"
                variant="button_text_xs"
              >
                New
              </Typography>
              <Typography component="p" variant="body_text_14">
                ArkProject Missions opened!
              </Typography>
            </div>

            <Typography component="h1" variant="heading_light_l">
              Start moving your Everai
              <br />
              on Starknet
            </Typography>

            <Typography component="p" variant="body_text_20">
              Bridge Everai NFTs and enter the competition by
              <br />
              completing the ArkProject missions.
            </Typography>
            <ConnectWalletsButton />
          </div>
        </MainPageContainer>
      </div>
      <Footer />
    </>
  );
}
